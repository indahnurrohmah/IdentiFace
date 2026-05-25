const studentRepository = require("../repositories/studentRepository");
const attendanceRepository = require("../repositories/attendanceRepository");
const aiService = require("../services/aiService");
const fs = require("fs");

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const getStudentTodaySessions = async (req, res, next) => {
  try {
    const student = await studentRepository.findByIdAkun(req.user.id_akun);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Profil tidak ditemukan." });

    const schedule = await studentRepository.getTodaySchedule(student.nim);
    res.json({
      success: true,
      message: "Jadwal hari ini diambil.",
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance history timeline
 */
const getAttendanceHistory = async (req, res, next) => {
  try {
    const student = await studentRepository.findByIdAkun(req.user.id_akun);
    const history = await attendanceRepository.getHistoryByNim(student.nim);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance summary stats
 */
const getAttendanceSummary = async (req, res, next) => {
  try {
    const student = await studentRepository.findByIdAkun(req.user.id_akun);
    const summary = await attendanceRepository.getSummaryByNim(student.nim);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

/**
 * Scan face for attendance
 * Endpoint: POST /api/student/attendance/scan
 */
const scanAttendance = async (req, res, next) => {
  try {
    const { latitude, longitude, id_sesi } = req.body;
    const id_akun = req.user.id_akun;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Foto wajah wajib diunggah." });
    }

    if (!id_sesi) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada sesi aktif. Silakan presensi melalui dashboard.",
      });
    }

    // 1.5 Cek sesi dan validasi lokasi
    const classRepository = require("../repositories/classRepository");
    const sessionDetails = await classRepository.getSessionById(id_sesi);
    if (!sessionDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Sesi kelas tidak ditemukan." });
    }
    if (!sessionDetails.is_active) {
      return res
        .status(400)
        .json({ success: false, message: "Sesi kelas belum aktif." });
    }
    if (sessionDetails.tipe_sesi === "offline") {
      const distance = haversineDistance(
        parseFloat(sessionDetails.latitude_dosen),
        parseFloat(sessionDetails.longitude_dosen),
        parseFloat(latitude),
        parseFloat(longitude),
      );
      if (distance > 150) {
        return res.status(400).json({
          success: false,
          message: `Kamu terlalu jauh dari lokasi kelas (${Math.round(distance)}m). Maksimal 150m.`,
        });
      }
    }

    const student = await studentRepository.findByIdAkun(id_akun);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Profil mahasiswa tidak ditemukan." });
    }

    // 2. Call AI service for face recognition
    const aiResponse = await aiService.verifyFace(
      req.file.path,
      latitude,
      longitude,
    );

    try {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    } catch (err) {}

    if (!aiResponse.success) {
      return res.status(400).json({
        success: false,
        message: aiResponse.message || "Wajah tidak dikenali.",
      });
    }

    const attendance = await attendanceRepository.upsertAttendance({
      id_sesi,
      nim: student.nim,
      status: "hadir",
      waktu_scan: new Date(),
      similarity: aiResponse.similarity,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    res.json({
      success: true,
      message: "Presensi berhasil dicatat!",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentDashboardSummary = async (req, res, next) => {
  try {
    const student = await studentRepository.findByIdAkun(req.user.id_akun);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Profil tidak ditemukan." });
    const summary = await studentRepository.getDashboardSummary(student.nim);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
/**
 * Get logged-in student profile (NIM, Nama, Prodi)
 * Endpoint: GET /api/student/profile
 */
const getStudentProfile = async (req, res, next) => {
  try {
    const student = await studentRepository.findByIdAkun(req.user.id_akun);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Profil tidak ditemukan." });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentTodaySessions,
  getAttendanceHistory,
  getAttendanceSummary,
  scanAttendance,
  getStudentDashboardSummary,
  getStudentProfile,
};
