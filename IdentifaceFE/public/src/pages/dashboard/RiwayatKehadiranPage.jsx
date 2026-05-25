import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", 
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

export default function RiwayatKehadiranPage() {
  const navigate = useNavigate()
  
  // ── State ──────────────────────────────────────────────────────────────
  const [selectedSemester, setSelectedSemester] = useState('Semester Genap 2025/2026')
  const [profile, setProfile] = useState(null) // State baru untuk menyimpan profil
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Fetch Data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profil dan rekapitulasi presensi secara bersamaan (Paralel) agar lebih cepat
      const [profileData, summaryData] = await Promise.all([
        apiFetch("/student/profile"),
        apiFetch("/student/attendance/summary")
      ]);
      
      setProfile(profileData);
      setAttendanceData(Array.isArray(summaryData) ? summaryData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {}
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />
        </div>

        <div className="flex items-center gap-4">
          {/* Tampilkan Nama Mahasiswa dari API */}
          <h2 className="text-2xl font-bold">{profile?.nama_lengkap || "Mahasiswa"}</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D] bg-[#6BAAAF] flex items-center justify-center text-white font-bold text-lg">
            {profile?.nama_lengkap ? profile.nama_lengkap.charAt(0).toUpperCase() : "M"}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 px-10 pb-10 flex gap-8">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Mahasiswa</h2>
          <nav className="space-y-3">
            <button onClick={() => navigate('/student/dashboard')} className="w-full h-10 rounded border border-white text-black font-semibold hover:bg-[#5a9499] transition-colors">
              Dashboard
            </button>
            <button onClick={() => navigate('/student/scan')} className="w-full h-10 rounded border border-white text-black font-semibold hover:bg-[#5a9499] transition-colors">
              Scan Wajah
            </button>
            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
              Riwayat Presensi
            </button>
          </nav>
          <button onClick={handleLogout} className="mt-auto w-full h-10 rounded bg-[#B82410] text-white font-semibold hover:bg-[#9a1d0d] transition-colors">
            Keluar
          </button>
        </aside>

        {/* CONTENT */}
        <section className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">Riwayat Presensi</h1>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                 {/* Tampilkan NIM dan Prodi dari API */}
                 {profile ? `${profile.nim} / ${profile.prodi}` : "NIM / Prodi"} - {selectedSemester}
              </p>
            </div>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="h-10 border border-[#6BAAAF] rounded px-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#123B5D]/30"
            >
              <option>Semester Genap 2025/2026</option>
              <option>Semester Ganjil 2024/2025</option>
              <option>Semester Genap 2024/2025</option>
            </select>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              Error memuat data: {error}
            </div>
          )}

          <div className="bg-[#EFE6D3] border border-[#123B5D] rounded-lg shadow-md p-4 flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                {/* ... (Bagian thead dan tbody sama persis seperti kode sebelumnya) ... */}
                <thead>
                  <tr className="border-b-2 border-gray-400">
                    <th className="text-left py-3 px-2 font-bold text-gray-700 w-12">No</th>
                    <th className="text-left py-3 px-2 font-bold text-gray-700">Mata Kuliah</th>
                    <th className="text-left py-3 px-2 font-bold text-gray-700">Kode</th>
                    <th className="text-left py-3 px-2 font-bold text-gray-700 text-center">SKS</th>
                    <th className="text-left py-3 px-2 font-bold text-gray-700">Kelas</th>
                    <th className="text-left py-3 px-2 font-bold text-gray-700">Dosen</th>
                    <th className="text-left py-3 px-2 font-bold text-gray-700 text-center">Pertemuan Terlaksana</th>
                    <th className="text-left py-3 px-2 font-bold text-gray-700 text-center">Kehadiran</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-gray-500 font-medium">Memuat data rekapitulasi...</td>
                    </tr>
                  ) : attendanceData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-gray-500 font-medium">Belum ada data riwayat presensi di semester ini.</td>
                    </tr>
                  ) : (
                    attendanceData.map((row, index) => (
                      <tr key={index} className={`align-top border-b border-gray-300 ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/30'} hover:bg-[#f0f9fa] transition-colors`}>
                        <td className="py-4 px-2">{index + 1}</td>
                        <td className="py-4 px-2 font-semibold text-gray-800">{row.nama_mk || '-'}</td>
                        <td className="py-4 px-2">{row.kode_mk || '-'}</td>
                        <td className="py-4 px-2 text-center">{row.sks || '-'}</td>
                        <td className="py-4 px-2">{row.kelas || '-'}</td>
                        <td className="py-4 px-2 max-w-[250px] leading-relaxed">{row.nama_dosen || '-'}</td>
                        <td className="py-4 px-2 text-center font-medium">{row.pertemuan_terlaksana || 0}</td>
                        <td className="py-4 px-2 text-center">
                          <span className={`px-3 py-1 rounded font-bold text-xs ${
                            parseInt(row.persentase || 0) >= 75 ? 'bg-green-200 text-green-800' 
                            : parseInt(row.persentase || 0) >= 50 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {row.persentase || '0'}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
  )
}