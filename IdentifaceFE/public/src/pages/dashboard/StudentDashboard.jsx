import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { IoCalendar } from "react-icons/io5";
import { GiBookshelf } from "react-icons/gi";
import { LuUserRoundCheck, LuUserRoundX } from "react-icons/lu";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // WAJIB untuk mengirim Cookie
  });

  if (res.status === 401) {
    localStorage.removeItem("user");
    window.location.href = "/";
    return null;
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Request gagal.");
  return json.data;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function formatTime(timeStr) {
  if (!timeStr) return "";
  return timeStr.slice(0, 5).replace(":", ".");
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Pagi";
  if (hour < 15) return "Siang";
  if (hour < 18) return "Sore";
  return "Malam";
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  
  // Ambil profil dasar dari localStorage (sebagai fallback sementara loading)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fallbackFirstName = user?.nama?.split(" ")[0] || "Mahasiswa";

  // ── State ──────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null); // State baru untuk menyimpan profil (NIM, Prodi)
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // ── Fetch Data ─────────────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    // 0. Fetch Profile (NIM & Prodi)
    apiFetch("/student/profile")
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));

    // 1. Fetch Summary Stats
    apiFetch("/student/dashboard/summary")
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));

    // 2. Fetch Today's Sessions
    apiFetch("/student/sessions/today")
      .then((data) => setSessions(data || []))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false));

    // 3. Fetch Recent History
    apiFetch("/student/attendance/history")
      .then((data) => setHistory(data || []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {
      // ignore network errors on logout
    }
    localStorage.removeItem("user");
    navigate("/");
  };

  // ── Stat Cards Config ──────────────────────────────────────────────────
  const statCards = [
    {
      title: "Jadwal Hari ini",
      value: loadingStats ? "..." : (stats?.jadwal_hari_ini ?? "0"),
      icon: <IoCalendar size={64} />,
    },
    {
      title: "Total Matakuliah",
      value: loadingStats ? "..." : (stats?.total_matkul ?? "0"),
      icon: <GiBookshelf size={64} />,
    },
    {
      title: "Kehadiran",
      value: loadingStats ? "..." : `${stats?.persentase_kehadiran ?? 0}%`,
      icon: <LuUserRoundCheck size={64} />,
    },
    {
      title: "Tidak Hadir",
      value: loadingStats ? "..." : (stats?.total_absen ?? "0"),
      icon: <LuUserRoundX size={64} />,
    },
  ];

  // Variabel turunan untuk nama dinamis
  const displayName = profile?.nama_lengkap || user?.nama || "Mahasiswa";
  const displayFirstName = displayName.split(" ")[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      <header className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{displayName}</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D] bg-[#6BAAAF] flex items-center justify-center text-white font-bold text-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="flex-1 px-10 pb-10 flex gap-8">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Mahasiswa</h2>
          <nav className="space-y-3">
            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
              Dashboard
            </button>
            <button
              onClick={() => navigate("/student/scan")}
              className="w-full h-10 rounded border border-white text-black font-semibold hover:bg-[#5a9499] transition-colors"
            >
              Scan Wajah
            </button>
            <button
              onClick={() => navigate("/student/riwayat")}
              className="w-full h-10 rounded border border-white text-black font-semibold hover:bg-[#5a9499] transition-colors"
            >
              Riwayat Presensi
            </button>
          </nav>
          <button
            onClick={handleLogout}
            className="mt-auto w-full h-10 rounded bg-[#B82410] text-white font-semibold hover:bg-[#9a1d0d] transition-colors"
          >
            Keluar
          </button>
        </aside>

        {/* CONTENT */}
        <section className="flex-1">
          <div className="mb-5">
            <h1 className="text-3xl font-bold">Selamat {getGreeting()}, {displayFirstName}!</h1>
            {/* Tampilkan NIM dan Prodi dari API Profil di Sini */}
            <p className="text-sm text-gray-600 font-medium">
               {profile ? `${profile.nim} / ${profile.prodi}` : "NIM / Prodi"} — Semester Genap 2025/2026
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
            {statCards.map(({ title, value, icon }) => (
              <div
                key={title}
                className="bg-[#6BAAAF] rounded-2xl shadow-md px-5 py-4 h-24 relative overflow-hidden"
              >
                <div className="absolute -right-3 -bottom-3 text-white opacity-20">
                  {icon}
                </div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <h2 className="text-4xl font-bold text-white mt-1">{value}</h2>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <TodaySessionsPanel sessions={sessions} loading={loadingSessions} navigate={navigate} />
            <HistoryPanel history={history} loading={loadingHistory} />
          </div>
        </section>
      </main>

      <footer className="bg-[#74B5BD] py-5 text-center mt-auto">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />
        </div>
        <p className="font-semibold text-[#123B5D]">Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  );
}

// ─── PANEL JADWAL HARI INI ────────────────────────────────────────────────
function TodaySessionsPanel({ sessions, loading, navigate }) {
  // PENGAMAN: Pastikan sessions selalu berbentuk array, meskipun backend error / mengirim format lain
  const safeSessions = Array.isArray(sessions) ? sessions : [];

  return (
    <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-lg shadow-md p-4 min-h-[320px]">
      <h2 className="font-bold mb-3">Jadwal Hari Ini</h2>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Memuat jadwal...</div>
      ) : safeSessions.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Tidak ada jadwal perkuliahan hari ini.</div>
      ) : (
        safeSessions.map((sesi) => (
          <div key={sesi.id_sesi} className="bg-white border border-[#6BAAAF] rounded-md shadow mb-4 p-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">{sesi.nama_mk}</h3>
                <p className="text-xs text-gray-600">{sesi.kode_mk}</p>
                <p className="text-xs text-gray-600">
                  {formatTime(sesi.waktu_mulai)} - {formatTime(sesi.waktu_selesai)} WIB
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className={`px-4 py-1 rounded text-xs font-semibold ${sesi.is_active ? "bg-green-300 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                  {sesi.is_active ? "Berlangsung" : "Belum Mulai"}
                </span>
                {sesi.is_active && (
                  <button 
                    onClick={() => navigate(`/student/scan?sesi=${sesi.id_sesi}`)}
                    className="text-[10px] bg-[#123B5D] text-white px-2 py-1 rounded hover:bg-[#0d2a3f] transition-colors"
                  >
                    Presensi Sekarang
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── PANEL RIWAYAT PRESENSI ───────────────────────────────────────────────
function HistoryPanel({ history, loading }) {
  // PENGAMAN: Pastikan history selalu berbentuk array
  const safeHistory = Array.isArray(history) ? history : [];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "hadir": return "bg-green-200 text-green-800";
      case "terlambat": return "bg-yellow-200 text-yellow-800";
      case "izin":
      case "sakit": return "bg-blue-200 text-blue-800";
      default: return "bg-red-200 text-red-800"; // Alpha / Tidak Hadir
    }
  };

  return (
    <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-lg shadow-md p-4 min-h-[320px]">
      <h2 className="font-bold mb-3">Riwayat Presensi Terbaru</h2>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Memuat riwayat...</div>
      ) : safeHistory.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Belum ada riwayat presensi.</div>
      ) : (
        safeHistory.slice(0, 4).map((item, index) => (
          <div key={index} className="bg-white border border-[#6BAAAF] rounded-md shadow mb-4 p-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">{item.nama_mk || "Mata Kuliah"}</h3>
                <p className="text-xs text-gray-600">
                  {item.tanggal || item.waktu_scan 
                    ? new Date(item.tanggal || item.waktu_scan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    : "-"}
                </p>
                <p className="text-xs text-gray-600">
                  {item.waktu_scan 
                    ? `Waktu Scan: ${new Date(item.waktu_scan).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` 
                    : "Waktu Scan: -"}
                </p>
              </div>
              <span className={`${getStatusColor(item.status)} px-3 py-1 rounded text-xs font-semibold capitalize`}>
                {item.status || "Alpha"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}