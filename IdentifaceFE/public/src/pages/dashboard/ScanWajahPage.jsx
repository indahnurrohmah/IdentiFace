import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ScanWajahPage() {
  const navigate = useNavigate()
  const [isScanning, setIsScanning] = useState(true)

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      <header className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#123B5D] text-white flex items-center justify-center font-bold">
            IF
          </div>
          <h1 className="text-3xl font-bold">IdentiFace</h1>
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

            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
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

        <section className="flex-1 flex justify-center items-center">
          <div className="w-[520px] min-h-[420px] border border-[#123B5D] rounded-2xl bg-[#EFE6D3] px-8 py-7">
            <div className="mb-8">
              <h1 className="text-2xl font-bold">Scan Wajah</h1>
              <p className="text-sm text-gray-600">
                Bambang Pamungkas — 29/12345656/SA321
              </p>
            </div>

            <div className="bg-white rounded-2xl h-56 flex items-center justify-center relative">
              <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-[#123B5D] rounded-tl-xl"></div>
              <div className="absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 border-[#123B5D] rounded-tr-xl"></div>
              <div className="absolute bottom-5 left-5 w-10 h-10 border-b-2 border-l-2 border-[#123B5D] rounded-bl-xl"></div>
              <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-[#123B5D] rounded-br-xl"></div>

              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
                👤
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#74B5BD] py-5 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#123B5D] text-white flex items-center justify-center text-xs">
            IF
          </div>
          <span className="font-semibold">IdentiFace</span>
        </div>

        <p className="font-semibold">Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  )
}