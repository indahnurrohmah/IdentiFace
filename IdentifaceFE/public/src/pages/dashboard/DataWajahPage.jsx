import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'

export default function DataWajahPage() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [videoRef, setVideoRef] = useState(null)

  const dataWajahTable = [
    ['Hamba Allah', '29/123456/TK/12345', 'Teknologi Informasi', 'Mahasiswa', 'Terdaftar', '2024-12-01'],
    ['Hamba Allah', '29/123456/TK/12345', 'Teknologi Informasi', 'Mahasiswa', 'Belum', '2024-12-01'],
    ['Hamba Allah', '29/123456/TK/12345', 'Teknologi Informasi', 'Dosen', 'Terdaftar', '2024-12-01'],
  ]

  const statusClass = {
    Terdaftar: 'bg-green-300',
    Belum: 'bg-red-300',
  }

  const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })

    if (videoRef) {
      videoRef.srcObject = stream
      videoRef.play()
    }

    setCameraOn(true)
      } catch (error) {
        alert('Kamera tidak bisa dibuka')
        console.error(error)
      }
    }

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      <header className="flex items-center justify-between px-10 py-5">
        <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />

        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Username</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D]" />
        </div>
      </header>

      <main className="flex-1 px-10 pb-10 flex gap-8">
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Admin</h2>

          <nav className="space-y-3">
            <button
              onClick={() => navigate('/admin/presensi')}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Laporan Presensi
            </button>

            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
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
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-3xl font-bold">Data Wajah</h1>
              <p className="text-sm text-gray-600">
                Kelola data face recognition mahasiswa & dosen
              </p>
            </div>

            <button className="bg-[#123B5D] text-white px-6 py-2 rounded font-semibold">
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-5">
            {[
              ['3', 'Total Data'],
              ['2', 'Terdaftar'],
              ['1', 'Belum Terdaftar'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-lg shadow-md px-6 py-4"
              >
                <h2 className="text-3xl font-bold">{value}</h2>
                <p className="text-sm text-gray-600">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#EFE6D3] border border-[#123B5D] rounded-lg shadow-md p-3 mb-5">
            <div className="grid grid-cols-4 gap-4">
              <input
                placeholder="Cari nama atau NIM..."
                className="h-8 rounded px-3 text-sm border border-[#6BAAAF]"
              />

              <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]">
                <option>Semua Peran</option>
                <option>Mahasiswa</option>
                <option>Dosen</option>
              </select>

              <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]">
                <option>Semua Prodi</option>
              </select>

              <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]">
                <option>Semua Status</option>
                <option>Terdaftar</option>
                <option>Belum Terdaftar</option>
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
                  <th className="text-left py-3">Peran</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Update Terakhir</th>
                  <th className="text-left py-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {dataWajahTable.map((row, index) => (
                  <tr key={index}>
                    <td className="py-3">{row[0]}</td>
                    <td className="py-3">{row[1]}</td>
                    <td className="py-3">{row[2]}</td>
                    <td className="py-3">
                      <span className="px-3 py-1 rounded-full border border-[#6BAAAF] text-xs">
                        {row[3]}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`${statusClass[row[4]]} px-3 py-1 rounded text-xs font-semibold`}>
                        {row[4]}
                      </span>
                    </td>
                    <td className="py-3">{row[5]}</td>
                    <td className="py-3">
                      <button
                        onClick={() => {
                          setSelectedRow(row)
                          setIsModalOpen(true)
                        }}
                        className="mr-2 text-[#123B5D] font-semibold"
                      >
                        Update
                      </button>
                      <button className="text-red-500 font-bold">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {isModalOpen && selectedRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#EFE6D3] w-[560px] rounded-2xl border border-[#123B5D] shadow-lg p-7">
            <h2 className="text-2xl font-bold mb-1">
              Update Data Wajah
            </h2>

            <p className="text-sm font-semibold mb-5">
              {selectedRow[0]} — {selectedRow[1]}
            </p>

            <div className="bg-white rounded-2xl h-60 flex flex-col items-center justify-center relative mb-4">
              <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-[#123B5D] rounded-tl-xl"></div>
              <div className="absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 border-[#123B5D] rounded-tr-xl"></div>
              <div className="absolute bottom-5 left-5 w-10 h-10 border-b-2 border-l-2 border-[#123B5D] rounded-bl-xl"></div>
              <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-[#123B5D] rounded-br-xl"></div>

              {cameraOn ? (
                <video
                  ref={(ref) => setVideoRef(ref)}
                  autoPlay
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl mb-3">
                    👤
                  </div>

                  <p className="text-sm font-semibold">
                    Upload foto atau ambil langsung untuk memulai scan
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4 text-xs font-semibold text-center">
              <div className="bg-[#EFE6D3] rounded-full py-1">Upload</div>
              <div className="bg-[#EFE6D3] rounded-full py-1">Deteksi</div>
              <div className="bg-[#EFE6D3] rounded-full py-1">Mapping</div>
              <div className="bg-[#EFE6D3] rounded-full py-1">Selesai</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <label className="bg-yellow-400 border border-[#123B5D] rounded-lg py-2 font-semibold text-center cursor-pointer">
                Upload Foto

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </label>

              <button
                onClick={startCamera}
                className="bg-[#6BAAAF] border border-[#123B5D] rounded-lg py-2 font-semibold"
              >
                Buka Kamera
              </button>
            </div>

            {selectedFile && (
              <p className="text-sm text-center mt-2">
                File dipilih: <strong>{selectedFile.name}</strong>
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded border border-[#123B5D] bg-white font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded bg-[#123B5D] text-white font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#74B5BD] py-5 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img src={logo} alt="IdentiFace Logo" className="w-24 h-auto object-contain" />
        </div>
        <p className="font-semibold">Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  )
}