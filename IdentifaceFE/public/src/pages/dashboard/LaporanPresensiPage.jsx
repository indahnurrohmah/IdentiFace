import { useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

export default function LaporanPresensiPage() {
  const [activeMenu, setActiveMenu] = useState('laporan')
  const [activeTab, setActiveTab] = useState('mahasiswa')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDosen, setSelectedDosen] = useState('semua')
  const [selectedProdi, setSelectedProdi] = useState('semua')
  const [selectedTanggal, setSelectedTanggal] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('semua')

  // Mata Kuliah tab states
  const [searchMataKuliah, setSearchMataKuliah] = useState('')
  const [selectedProdiMK, setSelectedProdiMK] = useState('semua')
  const [selectedDosenMK, setSelectedDosenMK] = useState('semua')
  const [selectedKelasMK, setSelectedKelasMK] = useState('semua')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState(null) // 'view', 'add', 'delete'
  const [selectedRow, setSelectedRow] = useState(null)
  const [formData, setFormData] = useState({
    statusBaru: 'Hadir',
    alasan: '',
    file: null,
  })

  const dosenList = [
    'Semua Dosen',
    'Dr. Ahmad Nasikun',
    'Prof. Budi Santoso',
    'Ir. Siti Nurhaliza',
  ]

  const prodiList = [
    'Semua Prodi',
    'Teknik Informatika',
    'Sistem Informasi',
    'Teknologi Informasi',
  ]

  const statusList = ['Semua Status', 'Hadir', 'Izin', 'Alfa']

  const kelasList = ['Semua Kelas', 'A', 'B', 'C', 'D']

  const mahasiswaData = [
    {
      id: 1,
      nama: 'Harmda Allah',
      nim: '29/2134656/TK/12345',
      prodi: 'Teknologi Informasi',
      mataKuliah: 'Kecerdasan Buatan',
      tanggal: '16 Aug 2026',
      status: 'Hadir',
    },
    {
      id: 2,
      nama: 'Harmda Allah',
      nim: '29/2134656/TK/12345',
      prodi: 'Teknologi Informasi',
      mataKuliah: 'Kecerdasan Buatan',
      tanggal: '16 Aug 2026',
      status: 'Izin',
    },
    {
      id: 3,
      nama: 'Harmda Allah',
      nim: '29/2134656/TK/12345',
      prodi: 'Teknologi Informasi',
      mataKuliah: 'Kecerdasan Buatan',
      tanggal: '16 Aug 2026',
      status: 'Alfa',
    },
  ]

  const mataKuliahData = [
    {
      id: 1,
      mataKuliah: 'Proyek Senior Teknologi Informasi',
      kode: 'TIF23241',
      sks: 7,
      kelas: 'B',
      dosen: 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D.',
      pertemuanTerlaksana: 8,
    },
    {
      id: 2,
      mataKuliah: 'Proyek Perancangan Teknologi Informasi I',
      kode: 'TIF23241',
      sks: 4,
      kelas: 'A',
      dosen: 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D.',
      pertemuanTerlaksana: 7,
    },
    {
      id: 3,
      mataKuliah: 'Keamanan Komputer',
      kode: 'TIF23241',
      sks: 2,
      kelas: 'C',
      dosen: 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D.',
      pertemuanTerlaksana: 5,
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hadir':
        return '#4CAF50'
      case 'Izin':
        return '#FFC107'
      case 'Alfa':
        return '#F44336'
      default:
        return '#6BAAAF'
    }
  }

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Hadir':
        return '#d1fae5'
      case 'Izin':
        return '#fef3c7'
      case 'Alfa':
        return '#fee2e2'
      default:
        return '#e0f2f1'
    }
  }

  const openModal = (action, row) => {
    setModalAction(action)
    setSelectedRow(row)
    setFormData({
      statusBaru: 'Hadir',
      alasan: '',
      file: null,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalAction(null)
    setSelectedRow(null)
    setFormData({
      statusBaru: 'Hadir',
      alasan: '',
      file: null,
    })
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    setFormData((prev) => ({
      ...prev,
      file: file,
    }))
  }

  const handleSaveModal = () => {
    // Handle save logic based on modalAction
    console.log('Saving:', { modalAction, selectedRow, formData })
    closeModal()
  }

  return (
    <div className="admin-layout">
      <Navbar userName="Username" />

      <div className="admin-container">
        <Sidebar activeMenu={activeMenu} isAdmin={true} />

        <main className="admin-content">
          <section className="report-header">
            <div>
              <h1>Laporan Absensi</h1>
              <p className="report-subtitle">Kelola dan monitor kehadiran mahasiswa & dosen</p>
            </div>
          </section>

          <Card variant="section">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button
                className={`tab-button ${activeTab === 'mahasiswa' ? 'active' : ''}`}
                onClick={() => setActiveTab('mahasiswa')}
              >
                👥 Mahasiswa
              </button>
              <button
                className={`tab-button ${activeTab === 'matakuliah' ? 'active' : ''}`}
                onClick={() => setActiveTab('matakuliah')}
              >
                📚 Mata Kuliah
              </button>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Cari nama atau NIM"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-controls">
                <select
                  value={selectedDosen}
                  onChange={(e) => setSelectedDosen(e.target.value)}
                  className="filter-select"
                >
                  {dosenList.map((dosen, idx) => (
                    <option key={idx} value={dosen}>
                      {dosen}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedProdi}
                  onChange={(e) => setSelectedProdi(e.target.value)}
                  className="filter-select"
                >
                  {prodiList.map((prodi, idx) => (
                    <option key={idx} value={prodi}>
                      {prodi}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={selectedTanggal}
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                  className="filter-select"
                />

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  {statusList.map((status, idx) => (
                    <option key={idx} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            {activeTab === 'mahasiswa' && (
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>NIM</th>
                      <th>Prodi</th>
                      <th>Mata Kuliah</th>
                      <th>Tanggal</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mahasiswaData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.nama}</td>
                        <td className="nim-text">{row.nim}</td>
                        <td>{row.prodi}</td>
                        <td>{row.mataKuliah}</td>
                        <td>{row.tanggal}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: getStatusBgColor(row.status),
                              color: getStatusColor(row.status),
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="aksi-cell">
                          <div className="aksi-buttons">
                            <button
                              className="aksi-btn view-btn"
                              title="Lihat"
                              onClick={() => openModal('view', row)}
                            >
                              👁️
                            </button>
                            <button
                              className="aksi-btn add-btn"
                              title="Tambah"
                              onClick={() => openModal('add', row)}
                            >
                              ➕
                            </button>
                            <button
                              className="aksi-btn delete-btn"
                              title="Hapus"
                              onClick={() => openModal('delete', row)}
                            >
                              ➖
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'matakuliah' && (
              <>
                {/* Filter Section */}
                <div className="filter-section">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Cari mata kuliah"
                      value={searchMataKuliah}
                      onChange={(e) => setSearchMataKuliah(e.target.value)}
                      className="search-input"
                    />
                  </div>

                  <div className="filter-controls">
                    <select
                      value={selectedProdiMK}
                      onChange={(e) => setSelectedProdiMK(e.target.value)}
                      className="filter-select"
                    >
                      {prodiList.map((prodi, idx) => (
                        <option key={idx} value={prodi}>
                          {prodi}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedDosenMK}
                      onChange={(e) => setSelectedDosenMK(e.target.value)}
                      className="filter-select"
                    >
                      {dosenList.map((dosen, idx) => (
                        <option key={idx} value={dosen}>
                          {dosen}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedKelasMK}
                      onChange={(e) => setSelectedKelasMK(e.target.value)}
                      className="filter-select"
                    >
                      {kelasList.map((kelas, idx) => (
                        <option key={idx} value={kelas}>
                          {kelas}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Mata Kuliah</th>
                        <th>Kode</th>
                        <th>SKS</th>
                        <th>Kelas</th>
                        <th>Dosen</th>
                        <th>Pertemuan Terlaksana</th>
                        <th>Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mataKuliahData.map((row, idx) => (
                        <tr key={row.id}>
                          <td>{idx + 1}</td>
                          <td>{row.mataKuliah}</td>
                          <td>{row.kode}</td>
                          <td>{row.sks}</td>
                          <td>{row.kelas}</td>
                          <td>{row.dosen}</td>
                          <td>{row.pertemuanTerlaksana}</td>
                          <td className="aksi-cell">
                            <button
                              className="aksi-btn view-btn"
                              title="Lihat"
                              onClick={() => openModal('view', row)}
                            >
                              👁️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>

          {/* Modal */}
          {isModalOpen && selectedRow && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                  {modalAction === 'view'
                    ? 'Detail Kehadiran'
                    : modalAction === 'add'
                      ? 'Tambah Kehadiran'
                      : 'Hapus Kehadiran'}
                </h2>

                <div className="modal-student-info">
                  <p>
                    <strong>{selectedRow.nama}</strong> — <span>{selectedRow.mataKuliah}</span>
                  </p>
                </div>

                {(modalAction === 'add' || modalAction === 'view') && (
                  <>
                    <div className="modal-form-group">
                      <label>Status Baru</label>
                      <select
                        name="statusBaru"
                        value={formData.statusBaru}
                        onChange={handleFormChange}
                        className="modal-select"
                        disabled={modalAction === 'view'}
                      >
                        <option value="Hadir">Hadir</option>
                        <option value="Izin">Izin</option>
                        <option value="Alfa">Alfa</option>
                      </select>
                    </div>

                    <div className="modal-form-group">
                      <label>Alasan</label>
                      <textarea
                        name="alasan"
                        value={formData.alasan}
                        onChange={handleFormChange}
                        placeholder="Tuliskan alasan perubahan kehadiran..."
                        className="modal-textarea"
                        disabled={modalAction === 'view'}
                      />
                    </div>

                    {modalAction === 'add' && (
                      <div className="modal-form-group">
                        <label>Bukti Konfirmasi</label>
                        <div className="file-upload">
                          <input
                            type="file"
                            id="file-input"
                            onChange={handleFileChange}
                            className="file-input"
                          />
                          <label htmlFor="file-input" className="file-label">
                            🗂️ Choose File {formData.file && `- ${formData.file.name}`}
                          </label>
                          <p className="file-hint">Upload surat izin, bukti sakit, atau dokumen lainnya</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {modalAction === 'delete' && (
                  <div className="modal-warning">
                    <p>Apakah Anda yakin ingin menghapus data kehadiran ini?</p>
                  </div>
                )}

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn-save" onClick={handleSaveModal}>
                    {modalAction === 'delete' ? 'Hapus' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
