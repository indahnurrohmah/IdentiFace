import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'

export default function LaporanPresensiPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('mahasiswa')

  const mahasiswaData = [
    ['Hamba Allah', '29/123456/TK/12345', 'Teknologi Informasi', 'Kecerdasan Buatan', '16 Aug 2026', 'Hadir'],
    ['Hamba Allah', '29/123456/TK/12345', 'Teknologi Informasi', 'Kecerdasan Buatan', '16 Aug 2026', 'Izin'],
    ['Hamba Allah', '29/123456/TK/12345', 'Teknologi Informasi', 'Kecerdasan Buatan', '16 Aug 2026', 'Alfa'],
  ]

  const statusClass = {
    Hadir: 'bg-green-300',
    Izin: 'bg-yellow-300',
    Alfa: 'bg-red-300',
  }

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
          <h2 className="text-2xl font-bold">Username</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D]" />
        </div>
      </header>

      <main className="flex-1 px-10 pb-10 flex gap-8">
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Admin</h2>

          <nav className="space-y-3">
            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
              Laporan Presensi
            </button>

            <button
              onClick={() => navigate('/admin/data-wajah')}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Daftar Wajah
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
          <div className="mb-2">
            <h1 className="text-3xl font-bold">Laporan Absensi</h1>
            <p className="text-sm text-gray-600">
              Kelola dan monitor kehadiran mahasiswa & dosen
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <div className="w-[420px] border border-[#123B5D] rounded-full overflow-hidden flex">
              <button
                onClick={() => setActiveTab('mahasiswa')}
                className={`w-1/2 py-1 text-sm font-semibold ${
                  activeTab === 'mahasiswa' ? 'bg-[#6BAAAF] text-white' : 'bg-[#EFE6D3]'
                }`}
              >
                Mahasiswa
              </button>

              <button
                onClick={() => setActiveTab('matakuliah')}
                className={`w-1/2 py-1 text-sm font-semibold ${
                  activeTab === 'matakuliah' ? 'bg-[#6BAAAF] text-white' : 'bg-[#EFE6D3]'
                }`}
              >
                Mata Kuliah
              </button>
            </div>
          </div>

          <div className="bg-[#EFE6D3] border border-[#123B5D] rounded-lg shadow-md p-3 mb-5">
            <div className="grid grid-cols-5 gap-4">
              <input
                placeholder="Cari nama atau NIM..."
                className="h-8 rounded px-3 text-sm border border-[#6BAAAF]"
              />

              <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]">
                <option>Semua Prodi</option>
              </select>

              <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]">
                <option>Semua Dosen</option>
              </select>

              <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]">
                <option>Tanggal</option>
              </select>

              <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]">
                <option>Status</option>
              </select>
            </div>
          </div>

          <div className="bg-[#EFE6D3] border border-[#123B5D] rounded-lg shadow-md p-4 min-h-[360px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-500">
                  <th className="text-left py-3">Nama</th>
                  <th className="text-left py-3">NIM</th>
                  <th className="text-left py-3">Prodi</th>
                  <th className="text-left py-3">Mata Kuliah</th>
                  <th className="text-left py-3">Tanggal</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {mahasiswaData.map((row, index) => (
                  <tr key={index}>
                    <td className="py-3">{row[0]}</td>
                    <td className="py-3">{row[1]}</td>
                    <td className="py-3">{row[2]}</td>
                    <td className="py-3">{row[3]}</td>
                    <td className="py-3">{row[4]}</td>
                    <td className="py-3">
                      <span className={`${statusClass[row[5]]} px-3 py-1 rounded text-xs font-semibold`}>
                        {row[5]}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="mr-2">👁</span>
                      <span className="mr-2">＋</span>
                      <span>−</span>
                    </td>
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
          
          <p className="font-semibold">
            Privacy Policy | Terms of Service
          </p>
        </div>
      </footer>
    </div>
  )
}