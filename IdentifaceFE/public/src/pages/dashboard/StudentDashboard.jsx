import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'

export default function StudentDashboard() {
  const navigate = useNavigate()

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
            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
              Dashboard
            </button>

            <button
              onClick={() => navigate('/student/scan')}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Scan Wajah
            </button>

            <button
              onClick={() => navigate('/student/riwayat')}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
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
          <div className="mb-5">
            <h1 className="text-3xl font-bold">Selamat Pagi, Bambang!</h1>
            <p className="text-sm text-gray-600">
              29/12345656/SA321 - Semester Genap 2025/2026
            </p>
          </div>

          <div className="grid grid-cols-4 gap-5 mb-8">
            {[
              ['Jadwal Hari ini', '3'],
              ['Total Matakuliah', '9'],
              ['Kehadiran', '80%'],
              ['Tidak Hadir', '3'],
            ].map(([title, value]) => (
              <div key={title} className="bg-[#6BAAAF] rounded shadow-md px-5 py-4 h-24">
                <p className="font-semibold">{title}</p>
                <h2 className="text-4xl font-bold text-center mt-2">{value}</h2>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Panel title="Jadwal Hari Ini" />
            <HistoryPanel />
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

function Panel({ title }) {
  return (
    <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-lg shadow-md p-4 min-h-[320px]">
      <h2 className="font-bold mb-3">{title}</h2>

      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-white border border-[#6BAAAF] rounded-md shadow mb-4 p-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">Kecerdasan Buatan</h3>
              <p className="text-xs text-gray-600">TI - 3A - SGCL Lt. 7B1</p>
              <p className="text-xs text-gray-600">07.30 - 10.00 WIB</p>
            </div>

            <span className="bg-green-300 px-4 py-1 rounded text-xs font-semibold">
              Berlangsung
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function HistoryPanel() {
  const data = [
    ['Metode Numeris', 'Hadir', 'bg-green-300'],
    ['Kalkulus Variabel Jamak', 'Tidak Hadir', 'bg-red-300'],
  ]

  return (
    <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-lg shadow-md p-4 min-h-[320px]">
      <h2 className="font-bold mb-3">Riwayat Presensi</h2>

      {data.map(([name, status, color]) => (
        <div key={name} className="bg-white border border-[#6BAAAF] rounded-md shadow mb-4 p-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">{name}</h3>
              <p className="text-xs text-gray-600">TI - 3A - SGCL Lt. 7B1</p>
              <p className="text-xs text-gray-600">07.30 - 10.00 WIB</p>
            </div>

            <span className={`${color} px-4 py-1 rounded text-xs font-semibold`}>
              {status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}