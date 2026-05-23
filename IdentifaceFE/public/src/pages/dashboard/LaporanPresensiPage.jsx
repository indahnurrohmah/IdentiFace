import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'

export default function LaporanPresensiPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('mahasiswa')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)
  const [formData, setFormData] = useState({
    statusBaru: 'Hadir',
    alasan: '',
    file: null,
  })

  const mahasiswaData = [
    ['Hamba Allah', '29/123456/TK/12345', 'Teknologi Informasi', 'Kecerdasan Buatan', '16 Aug 2026', 'Hadir'],
    ['Hamba Allah', '29/123456/TK/12345', 'Teknologi Informasi', 'Kecerdasan Buatan', '16 Aug 2026', 'Izin'],
    ['Hamba Allah', '29/123456/TK/12345', 'Teknologi Informasi', 'Kecerdasan Buatan', '16 Aug 2026', 'Alfa'],
  ]

  const mataKuliahData = [
    ['Proyek Senior Teknologi Informasi', 7, 'B', 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D. Azkario Rizky Pratama, S.T., M.Eng., Ph.D. Dr. Guntur Dharma Putra, S.T., M.Sc.', 8],
    ['Proyek Perancangan Teknologi Informasi 1', 4, 'A', 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D. Azkario Rizky Pratama, S.T., M.Eng., Ph.D. Dr. Guntur Dharma Putra, S.T., M.Sc.', 7],
    ['Keamanan Komputer', 2, 'C', 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D. Azkario Rizky Pratama, S.T., M.Eng., Ph.D. Dr. Guntur Dharma Putra, S.T., M.Sc.', 5],
  ]

  const statusClass = {
    Hadir: 'bg-green-300',
    Izin: 'bg-yellow-300',
    Alfa: 'bg-red-300',
  }

  const openModal = (action, row) => {
    setModalAction(action)
    setSelectedRow(row)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalAction('')
    setSelectedRow(null)
  }

  const handleSaveModal = () => {
    alert(`${modalAction} berhasil disimpan`)
    closeModal()
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
            {activeTab === 'mahasiswa' ? (
              <div className="grid grid-cols-5 gap-4">
                <input placeholder="Cari nama atau NIM..." className="h-8 rounded px-3 text-sm border border-[#6BAAAF]" />
                <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]"><option>Semua Prodi</option></select>
                <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]"><option>Semua Dosen</option></select>
                <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]"><option>Tanggal</option></select>
                <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]"><option>Status</option></select>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                <input placeholder="Cari nama atau kode mata kuliah..." className="h-8 rounded px-3 text-sm border border-[#6BAAAF]" />
                <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]"><option>Semua Prodi</option></select>
                <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]"><option>Semua Dosen</option></select>
                <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]"><option>Kelas</option></select>
              </div>
            )}
          </div>

          <div className="bg-[#EFE6D3] border border-[#123B5D] rounded-lg shadow-md p-4 min-h-[360px]">
            {activeTab === 'mahasiswa' ? (
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
                        <button onClick={() => openModal('lihat', row)} className="mr-2">👁</button>
                        <button onClick={() => openModal('tambah', row)} className="mr-2 text-[#6BAAAF] font-bold">＋</button>
                        <button onClick={() => openModal('kurang', row)} className="text-red-500 font-bold">−</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-500">
                    <th className="text-left py-3">No</th>
                    <th className="text-left py-3">Mata Kuliah</th>
                    <th className="text-left py-3">SKS</th>
                    <th className="text-left py-3">Kelas</th>
                    <th className="text-left py-3">Dosen</th>
                    <th className="text-left py-3">Pertemuan Terlaksana</th>
                    <th className="text-left py-3">Detail</th>
                  </tr>
                </thead>

                <tbody>
                  {mataKuliahData.map((row, index) => (
                    <tr key={index} className="align-top">
                      <td className="py-3">{index + 1}</td>
                      <td className="py-3">{row[0]}</td>
                      <td className="py-3">{row[1]}</td>
                      <td className="py-3">{row[2]}</td>
                      <td className="py-3 max-w-[360px]">{row[3]}</td>
                      <td className="py-3 text-center">{row[4]}</td>
                      <td className="py-3">
                        <button onClick={() => openModal('lihat', row)}>👁</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {isModalOpen && selectedRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#EFE6D3] w-[520px] rounded-2xl border border-[#123B5D] shadow-lg p-7">
            <h2 className="text-2xl font-bold mb-1">
              {modalAction === 'lihat'
                ? 'Detail Kehadiran'
                : modalAction === 'tambah'
                  ? 'Tambah Kehadiran'
                  : 'Kurangi Kehadiran'}
            </h2>

            <p className="text-sm font-semibold mb-5">
              {activeTab === 'mahasiswa'
                ? `${selectedRow[0]} — ${selectedRow[3]}`
                : selectedRow[0]}
            </p>

            {activeTab === 'mahasiswa' && (
              <>
                <label className="block font-semibold mb-2">Status Baru</label>
                <select
                  value={formData.statusBaru}
                  onChange={(e) => setFormData({ ...formData, statusBaru: e.target.value })}
                  disabled={modalAction === 'lihat'}
                  className="w-full h-10 rounded px-3 mb-4 bg-white"
                >
                  <option>Hadir</option>
                  <option>Izin</option>
                  <option>Alfa</option>
                </select>

                <label className="block font-semibold mb-2">Alasan</label>
                <textarea
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  disabled={modalAction === 'lihat'}
                  placeholder="Tuliskan alasan perubahan kehadiran..."
                  className="w-full h-28 rounded px-3 py-2 mb-4 bg-white"
                />

                {modalAction !== 'lihat' && (
                  <>
                    <label className="block font-semibold mb-2">Bukti Konfirmasi</label>
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                      className="w-full bg-white rounded mb-5"
                    />
                  </>
                )}
              </>
            )}

            {activeTab === 'matakuliah' && (
              <div className="space-y-2 text-sm">
                <p><strong>Mata Kuliah:</strong> {selectedRow[0]}</p>
                <p><strong>SKS:</strong> {selectedRow[1]}</p>
                <p><strong>Kelas:</strong> {selectedRow[2]}</p>
                <p><strong>Dosen:</strong> {selectedRow[3]}</p>
                <p><strong>Pertemuan Terlaksana:</strong> {selectedRow[4]}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded border border-[#123B5D] bg-white font-semibold"
              >
                Cancel
              </button>

              {modalAction !== 'lihat' && (
                <button
                  onClick={handleSaveModal}
                  className="px-6 py-2 rounded bg-[#123B5D] text-white font-semibold"
                >
                  Save
                </button>
              )}
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