import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { FiRefreshCw } from "react-icons/fi";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // WAJIB ada agar cookie dikirim ke backend
  });

  if (res.status === 401) {
    localStorage.removeItem("user");
    window.location.href = "/";
    return null;
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Request gagal.");
  return json; // Return full json to get message for toast
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function formatTime(timeStr) {
  if (!timeStr) return "";
  return timeStr.slice(0, 5).replace(":", ".");
}

function formatDateID(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function SchedulePage() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = user?.nama?.split(" ")[0] || "Dosen";

  // ── State ──────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [processingId, setProcessingId] = useState(null); // Mencegah double-click pada tombol Mulai/Akhiri

  const [filters, setFilters] = useState({
    mataKuliah: "",
    kelas: "",
    tanggalAwal: "",
    tanggalAkhir: "",
  });

  // ── Fetch Data ─────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/lecturer/sessions/today");
      setSessions(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleToggleStatus = async (id_sesi, currentStatus) => {
    setProcessingId(id_sesi);
    try {
      const response = await apiFetch(`/lecturer/session/${id_sesi}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      // Munculkan notifikasi sukses
      setToast(response.message);
      setTimeout(() => setToast(null), 3000);

      // Refresh tabel jadwal
      fetchSessions();
    } catch (err) {
      alert("Gagal mengubah status sesi: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {
      // Abaikan jika error network
    }
    localStorage.removeItem("user");
    navigate("/");
  };

  // Mock function untuk fitur Laporan (karena endpoint laporan belum ada)
  const handleExport = () => {
    alert("Fitur Export Laporan sedang dalam pengembangan oleh tim Backend.");
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF] relative">
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-[#123B5D] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{user?.nama || "Dosen"}</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D] bg-[#6BAAAF] flex items-center justify-center text-white font-bold text-lg">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 px-10 pb-10 flex gap-8">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Dosen</h2>
          <nav className="space-y-3">
            <button
              onClick={() => navigate("/dosen/dashboard")}
              className="w-full h-10 rounded border border-white text-black font-semibold hover:bg-[#5a9499] transition-colors"
            >
              Dashboard
            </button>
            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
              Jadwal Sesi
            </button>
            <button
              onClick={() => navigate("/dosen/monitor")}
              className="w-full h-10 rounded border border-white text-black font-semibold hover:bg-[#5a9499] transition-colors"
            >
              Monitor Kehadiran
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
        <section className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold">Jadwal Perkuliahan</h1>
            <button
              onClick={fetchSessions}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-[#123B5D] border border-[#123B5D] hover:bg-[#123B5D] hover:text-white transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Refresh Jadwal
            </button>
          </div>

          {error && (
             <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
               Error memuat jadwal: {error}
             </div>
          )}

          {/* TABLE */}
          <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-[#6BAAAF] text-white px-5 py-3 font-semibold">
              Jadwal Perkuliahan Hari Ini
            </div>
            <div className="overflow-x-auto">
              <table className="w-full bg-white min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-[#6BAAAF]">
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Mata Kuliah</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Kode MK</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Tanggal</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Waktu</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400">Memuat jadwal...</td>
                    </tr>
                  ) : sessions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400">Tidak ada jadwal perkuliahan hari ini.</td>
                    </tr>
                  ) : (
                    sessions.map((row, index) => (
                      <tr
                        key={row.id_sesi}
                        className={`border-b transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#f0f9fa]`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{row.nama_mk}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.kode_mk}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDateID(row.tanggal)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatTime(row.waktu_mulai)} - {formatTime(row.waktu_selesai)} WIB
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {row.is_active ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold text-xs">Berlangsung</span>
                          ) : (
                            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded font-semibold text-xs">Ditutup</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {/* Tombol Mulai (Disabled jika sedang aktif) */}
                            <button 
                              onClick={() => handleToggleStatus(row.id_sesi, row.is_active)}
                              disabled={row.is_active || processingId === row.id_sesi}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                row.is_active 
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                  : "bg-green-100 hover:bg-green-200 text-green-700"
                              }`}
                            >
                              {processingId === row.id_sesi && !row.is_active ? "Memproses..." : "Mulai"}
                            </button>
                            
                            {/* Tombol Akhiri (Disabled jika sudah tertutup) */}
                            <button 
                              onClick={() => handleToggleStatus(row.id_sesi, row.is_active)}
                              disabled={!row.is_active || processingId === row.id_sesi}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                !row.is_active 
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                  : "bg-red-100 hover:bg-red-200 text-red-700"
                              }`}
                            >
                               {processingId === row.id_sesi && row.is_active ? "Memproses..." : "Akhiri"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* LAPORAN (Bagian Bawah) */}
          <div className="mt-auto">
            <div className="flex items-end gap-3 mb-3">
              <h2 className="text-3xl font-bold">Laporan Akhir</h2>
              <p className="text-sm text-gray-600 mb-1">
                 Mencetak laporan rekapitulasi kehadiran (Semester Genap 2025/2026)
              </p>
            </div>

            <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-lg shadow-md p-3">
              <div className="bg-[#6BAAAF] text-white px-4 py-2 rounded-t font-semibold">
                Filter Laporan
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 py-5">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Mata Kuliah</label>
                  <input
                    value={filters.mataKuliah}
                    onChange={(e) => setFilters({ ...filters, mataKuliah: e.target.value })}
                    placeholder="Contoh: Kecerdasan Buatan"
                    className="w-full h-10 border border-[#6BAAAF] rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#123B5D]"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Kelas</label>
                  <input
                    value={filters.kelas}
                    onChange={(e) => setFilters({ ...filters, kelas: e.target.value })}
                    placeholder="Contoh: TI-A"
                    className="w-full h-10 border border-[#6BAAAF] rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#123B5D]"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Tanggal Perkuliahan</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={filters.tanggalAwal}
                      onChange={(e) => setFilters({ ...filters, tanggalAwal: e.target.value })}
                      className="w-full h-10 border border-[#6BAAAF] rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#123B5D]"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="date"
                      value={filters.tanggalAkhir}
                      onChange={(e) => setFilters({ ...filters, tanggalAkhir: e.target.value })}
                      className="w-full h-10 border border-[#6BAAAF] rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#123B5D]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 px-4 pb-2">
                <button 
                  onClick={handleExport}
                  className="bg-[#123B5D] hover:bg-[#0d2a3f] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                >
                  Export CSV / PDF
                </button>
                <button 
                  onClick={() => setFilters({ mataKuliah: "", kelas: "", tanggalAwal: "", tanggalAkhir: "" })}
                  className="border border-[#123B5D] text-[#123B5D] hover:bg-gray-50 px-6 py-2 rounded font-semibold text-sm transition-colors bg-white"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#74B5BD] py-5 text-center mt-auto">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />
        </div>
        <p className="font-semibold text-[#123B5D]">Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  );
}