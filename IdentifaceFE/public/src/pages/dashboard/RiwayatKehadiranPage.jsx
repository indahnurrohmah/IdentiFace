import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'

export default function RiwayatKehadiranPage() {
  const navigate = useNavigate()
  const [selectedSemester, setSelectedSemester] = useState('Semester Genap 2025/2026')

  const attendanceData = [
    ['Proyek Senior Teknologi Informasi', 'TIF213241', 7, 'B', 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D. Adkario Risky Pratama, S.T., M.Eng., Ph.D. Dr. Guntur Dharma Putra, S.T., M.Sc.', 8, '88%'],
    ['Proyek Perancangan Teknologi Informasi 1', 'TIF213241', 4, 'A', 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D. Adkario Risky Pratama, S.T., M.Eng., Ph.D. Dr. Guntur Dharma Putra, S.T., M.Sc.', 7, '78%'],
    ['Keamanan Komputer', 'TIF213241', 2, 'C', 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D. Adkario Risky Pratama, S.T., M.Eng., Ph.D. Dr. Guntur Dharma Putra, S.T., M.Sc.', 5, '53%'],
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      <header className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="IdentiFace Logo"
            className="w-40 h-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Bambang Pamungkas</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D]" />
        </div>
      </header>

      <main className="flex-1 px-10 pb-10 flex gap-8">
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Mahasiswa</h2>

          <nav className="space-y-3">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate('/student/scan')}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Scan Wajah
            </button>

            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
              Riwayat Presensi
            </button>
          </nav>

          <button
            onClick={() => navigate('/')}
            className="mt-auto w-full h-10 rounded bg-[#B82410] text-white font-semibold"
          >
            Keluar
          </button>
        </aside>

        <section className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">Riwayat Presensi</h1>
              <p className="text-sm text-gray-600 mt-2">
                29/12345656/SA321 - {selectedSemester}
              </p>
            </div>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="h-10 border border-[#6BAAAF] rounded px-4 bg-white text-sm"
            >
              <option>Semester Genap 2025/2026</option>
              <option>Semester Ganjil 2024/2025</option>
              <option>Semester Genap 2024/2025</option>
            </select>
          </div>

          <div className="bg-[#EFE6D3] border border-[#123B5D] rounded-lg shadow-md p-4 min-h-[430px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-500">
                  <th className="text-left py-3 px-2">No</th>
                  <th className="text-left py-3 px-2">Mata Kuliah</th>
                  <th className="text-left py-3 px-2">Kode</th>
                  <th className="text-left py-3 px-2">SKS</th>
                  <th className="text-left py-3 px-2">Kelas</th>
                  <th className="text-left py-3 px-2">Dosen</th>
                  <th className="text-left py-3 px-2">Pertemuan Terlaksana</th>
                  <th className="text-left py-3 px-2">Kehadiran</th>
                </tr>
              </thead>

              <tbody>
                {attendanceData.map((row, index) => (
                  <tr key={index} className="align-top">
                    <td className="py-5 px-2">{index + 1}</td>
                    <td className="py-5 px-2 font-medium">{row[0]}</td>
                    <td className="py-5 px-2">{row[1]}</td>
                    <td className="py-5 px-2">{row[2]}</td>
                    <td className="py-5 px-2">{row[3]}</td>
                    <td className="py-5 px-2 max-w-[280px]">{row[4]}</td>
                    <td className="py-5 px-2 text-center">{row[5]}</td>
                    <td className="py-5 px-2 font-semibold">{row[6]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="bg-[#74B5BD] py-5 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img
            src={logo}
            alt="IdentiFace Logo"
            className="w-40 h-auto object-contain"
          />
        </div>
          
        <p className="font-semibold">
          Privacy Policy | Terms of Service
        </p>
      </footer>
    </div>
  )
}