import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import { LuUserRoundCheck, LuUserRoundX, LuUserRoundSearch } from "react-icons/lu";
import { MdOutlineSick, MdEditSquare } from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
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

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function MonitorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id_sesi = searchParams.get("sesi");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [modalTambah, setModalTambah] = useState(null);
  const [formTambah, setFormTambah] = useState({
    status: "hadir",
    alasan: "",
  });

  const [selectedStudents, setSelectedStudents] = useState({});
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectAll = students.length > 0 && students.every((s) => selectedStudents[s.nim]);

  // ── Fetch Data ─────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiFetch("/lecturer/profile");
      setProfile(data);
    } catch (err) {
      console.log("Gagal memuat profil dosen:", err);
    }
  }, []);

  const fetchAttendance = useCallback(async (isRefresh = false) => {
    if (!id_sesi) {
      setLoading(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await apiFetch(`/lecturer/session/${id_sesi}/attendance`);
      setStudents(data || []);
      setSelectedStudents({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id_sesi]);

  useEffect(() => {
    fetchProfile();
    fetchAttendance();
  }, [fetchProfile, fetchAttendance]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleCheckboxChange = (nim) => {
    setSelectedStudents((prev) => ({ ...prev, [nim]: !prev[nim] }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents({});
    } else {
      const all = {};
      students.forEach((s) => (all[s.nim] = true));
      setSelectedStudents(all);
    }
  };

  const handleTambahHadir = (student) => {
    setModalTambah(student);
    setFormTambah({ 
      status: student.status ? student.status.toLowerCase() : "hadir", 
      alasan: "" 
    });
  };

  // Submit Update Status Manual Dosen (JSON Tanpa File Bukti)
  const handleSaveTambah = async () => {
    const selectedNims = Object.entries(selectedStudents)
      .filter(([, checked]) => checked)
      .map(([nim]) => nim);

    const targetNims = selectedNims.length > 0 ? selectedNims : [modalTambah.nim];

    setIsSaving(true);
    try {
      // Loop update menggunakan JSON payload
      await Promise.all(
        targetNims.map(async (nim) => {
          await fetch(`${API_BASE}/lecturer/session/${id_sesi}/attendance`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              nim: nim,
              status: formTambah.status,
              alasan: formTambah.alasan
            }),
          });
        })
      );

      setToast(
        targetNims.length > 1
          ? `${targetNims.length} mahasiswa berhasil diperbarui!`
          : "Data kehadiran berhasil diperbarui!"
      );
      
      setModalTambah(null);
      fetchAttendance(); // Reload data dari server
      
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      alert("Terjadi kesalahan saat memperbarui data.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Stats Calculation ──────────────────────────────────────────────────
  const countStatus = (statusGroup) => {
    if (statusGroup.includes("alpha")) {
       // Menghitung mahasiswa yang statusnya null/kosong sebagai Alpha
       return students.filter((s) => !s.status || statusGroup.includes(s.status?.toLowerCase())).length;
    }
    return students.filter((s) => statusGroup.includes(s.status?.toLowerCase())).length;
  };

  const summaryStats = [
    {
      label: "Hadir",
      value: countStatus(["hadir"]),
      className: "bg-green-400",
      icon: <LuUserRoundCheck size={64} />,
    },
    {
      label: "Terlambat",
      value: countStatus(["terlambat"]),
      className: "bg-yellow-400",
      icon: <LuUserRoundSearch size={64} />,
    },
    {
      label: "Tidak Hadir",
      value: countStatus(["alpha", "tidak hadir"]),
      className: "bg-red-400",
      icon: <LuUserRoundX size={64} />,
    },
    {
      label: "Izin/Sakit",
      value: countStatus(["izin", "sakit"]),
      className: "bg-[#6BAAAF]",
      icon: <MdOutlineSick size={64} />,
    },
  ];

  const statusStyle = {
    hadir: "bg-green-100 text-green-700 border border-green-300",
    terlambat: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    alpha: "bg-red-100 text-red-700 border border-red-300",
    "tidak hadir": "bg-red-100 text-red-700 border border-red-300",
    izin: "bg-blue-100 text-blue-700 border border-blue-300",
    sakit: "bg-blue-100 text-blue-700 border border-blue-300",
  };

  // ── Data Nama Dinamis ──────────────────────────────────────────────────
  const displayName = profile?.nama || user?.nama || "Dosen";
  const displayFirstName = displayName.split(" ")[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF] relative">
      {toast && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-[#123B5D] text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{displayName}</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D] bg-[#6BAAAF] flex items-center justify-center text-white font-bold text-lg">
            {displayFirstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="flex-1 px-10 pb-10 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Dosen</h2>
          <nav className="space-y-3">
            <button onClick={() => navigate("/dosen/dashboard")} className="w-full h-10 rounded border border-white text-black font-semibold hover:bg-[#5a9499] transition-colors">
              Dashboard
            </button>
            <button onClick={() => navigate("/dosen/schedule")} className="w-full h-10 rounded border border-white text-black font-semibold hover:bg-[#5a9499] transition-colors">
              Jadwal Sesi
            </button>
            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
              Monitor Kehadiran
            </button>
          </nav>
          <button
            onClick={async () => {
              try { await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }); } catch(e){}
              localStorage.removeItem("user");
              navigate("/");
            }}
            className="mt-auto w-full h-10 rounded bg-[#B82410] text-white font-semibold hover:bg-[#9a1d0d]"
          >
            Keluar
          </button>
        </aside>

        {/* Content */}
        <section className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Monitoring Kehadiran</h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => fetchAttendance(true)}
              disabled={refreshing || !id_sesi}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all
                ${refreshing || !id_sesi ? "bg-[#123B5D]/60 cursor-not-allowed" : "bg-[#123B5D] hover:bg-[#0d2a3f] hover:shadow-md active:scale-95"}`}
            >
              <FiRefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Memperbarui..." : "Refresh"}
            </button>
          </div>

          {!id_sesi ? (
            <div className="bg-white rounded-xl shadow-md p-10 text-center flex-1 flex flex-col items-center justify-center">
              <LuUserRoundSearch size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">Tidak ada sesi yang dipilih</h3>
              <p className="text-gray-500 mt-2">Silakan kembali ke Dashboard dan pilih salah satu Sesi Perkuliahan Hari Ini.</p>
              <button onClick={() => navigate("/dosen/dashboard")} className="mt-6 px-6 py-2 bg-[#123B5D] text-white rounded-lg font-semibold">
                Kembali ke Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Statistik Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
                {summaryStats.map((stat) => (
                  <div key={stat.label} className={`${stat.className} rounded-2xl shadow-md px-5 py-4 h-24 relative overflow-hidden`}>
                    <div className="absolute -right-3 -bottom-3 text-white opacity-20">{stat.icon}</div>
                    <p className="text-sm font-semibold text-white">{stat.label}</p>
                    <h2 className="text-4xl font-bold text-white mt-1">{loading ? "-" : stat.value}</h2>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
              )}

              {/* Tabel */}
              <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-xl shadow-md overflow-hidden flex-1">
                <div className="bg-[#6BAAAF] text-white px-5 py-3 font-semibold flex items-center justify-between">
                  <span>Daftar Mahasiswa</span>
                  <span className="text-sm font-normal opacity-70">
                    {Object.values(selectedStudents).filter(Boolean).length} dipilih
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full bg-white min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-[#6BAAAF]">
                        <th className="px-4 py-3 w-12">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="w-4 h-4 accent-[#123B5D] cursor-pointer"
                          />
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">NIM</th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Nama Mahasiswa</th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Waktu Scan</th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Status</th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-gray-400">Memuat data...</td>
                        </tr>
                      ) : students.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-gray-400">Tidak ada mahasiswa terdaftar di kelas ini.</td>
                        </tr>
                      ) : (
                        students.map((student, index) => (
                          <tr
                            key={student.nim}
                            className={`border-b transition-colors duration-150 ${
                              selectedStudents[student.nim] ? "bg-blue-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            } hover:bg-[#f0f9fa]`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedStudents[student.nim] || false}
                                onChange={() => handleCheckboxChange(student.nim)}
                                className="w-4 h-4 accent-[#123B5D] cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.nim}</td>
                            <td className="px-4 py-3 font-medium text-sm text-gray-800">{student.nama}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {student.waktu_scan
                                ? new Date(student.waktu_scan).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
                                : "-"}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${statusStyle[student.status?.toLowerCase()] || statusStyle.alpha}`}>
                                {student.status || "Alpha"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleTambahHadir(student)}
                                className="flex items-center gap-1 bg-[#123B5D] hover:bg-[#0d2a3f] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                              >
                                <MdEditSquare size={13} /> Perbarui
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Modal Tambah/Edit */}
      {modalTambah && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-[#EFE6D3] rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#123B5D] mb-0.5">Perbarui Kehadiran</h2>
            <p className="text-sm text-[#123B5D] font-medium mb-5">
              {Object.values(selectedStudents).filter(Boolean).length > 1
                ? `${Object.values(selectedStudents).filter(Boolean).length} mahasiswa dipilih`
                : `${modalTambah.nama} (${modalTambah.nim})`}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Status Baru</label>
              <select
                value={formTambah.status}
                onChange={(e) => setFormTambah((prev) => ({ ...prev, status: e.target.value }))}
                disabled={isSaving}
                className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#123B5D]/30 disabled:bg-gray-100"
              >
                <option value="hadir">Hadir</option>
                <option value="terlambat">Terlambat</option>
                <option value="alpha">Tidak Hadir (Alpha)</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Alasan / Keterangan</label>
              <textarea
                value={formTambah.alasan}
                onChange={(e) => setFormTambah((prev) => ({ ...prev, alasan: e.target.value }))}
                disabled={isSaving}
                placeholder="Tuliskan alasan perubahan kehadiran (opsional)..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#123B5D]/30 disabled:bg-gray-100"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                disabled={isSaving}
                onClick={() => setModalTambah(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-400 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                disabled={isSaving}
                onClick={handleSaveTambah}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#123B5D] hover:bg-[#0d2a3f] text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#74B5BD] py-5 text-center mt-auto">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />
        </div>
        <p className="font-semibold text-[#123B5D]">Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  );
}