import { useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

export default function DataWajahPage() {
  const [activeMenu, setActiveMenu] = useState('wajah')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeran, setSelectedPeran] = useState('semua')
  const [selectedProdi, setSelectedProdi] = useState('semua')
  const [selectedStatus, setSelectedStatus] = useState('semua')

  // Modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedRowData, setSelectedRowData] = useState(null)
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [currentStep, setCurrentStep] = useState('upload')

  const peranList = ['Semua Peran', 'Mahasiswa', 'Dosen']
  const prodiList = ['Semua Prodi', 'Teknik Informatika', 'Sistem Informasi', 'Teknologi Informasi']
  const statusList = ['Semua Status', 'Terdaftar', 'Belum Terdaftar']

  const dataWajahStats = [
    {
      label: 'Total Data',
      value: 3,
      icon: '👤',
    },
    {
      label: 'Terdaftar',
      value: 2,
      icon: '📷',
    },
    {
      label: 'Belum Terdaftar',
      value: 1,
      icon: '📷',
    },
  ]

  const dataWajahTable = [
    {
      id: 1,
      nama: 'Harmda Allah',
      nim: '29/2134656/TK/12345',
      prodi: 'Teknologi Informasi',
      peran: 'Mahasiswa',
      status: 'Terdaftar',
      updateTerakhir: '2024-12-01',
    },
    {
      id: 2,
      nama: 'Harmda Allah',
      nim: '29/2134656/TK/12345',
      prodi: 'Teknologi Informasi',
      peran: 'Mahasiswa',
      status: 'Belum Terdaftar',
      updateTerakhir: '2024-12-01',
    },
    {
      id: 3,
      nama: 'Harmda Allah',
      nim: '29/2134656/TK/12345',
      prodi: 'Teknologi Informasi',
      peran: 'Dosen',
      status: 'Terdaftar',
      updateTerakhir: '2024-12-01',
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terdaftar':
        return '#4CAF50'
      case 'Belum Terdaftar':
        return '#FFC107'
      default:
        return '#6BAAAF'
    }
  }

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Terdaftar':
        return '#d1fae5'
      case 'Belum Terdaftar':
        return '#fef3c7'
      default:
        return '#e0f2f1'
    }
  }

  const handleRefresh = () => {
    console.log('Refresh data wajah')
  }

  const openUpdateModal = (row) => {
    setSelectedRowData(row)
    setUploadedPhoto(null)
    setCurrentStep('upload')
    setIsUpdateModalOpen(true)
  }

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false)
    setSelectedRowData(null)
    setUploadedPhoto(null)
    setCurrentStep('upload')
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedPhoto(event.target?.result)
        setCurrentStep('deteksi')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    // TODO: Implement camera functionality
    console.log('Open camera')
  }

  const handleSaveUpdate = () => {
    console.log('Save update dengan foto:', uploadedPhoto)
    closeUpdateModal()
  }

  const goToStep = (step) => {
    setCurrentStep(step)
  }

  return (
    <div className="admin-layout">
      <Navbar userName="Ahmad Nasikun" />

      <div className="admin-container">
        <Sidebar activeMenu={activeMenu} isAdmin={true} />

        <main className="admin-content">
          <section className="report-header">
            <div>
              <h1>Data Wajah</h1>
              <p className="report-subtitle">Kelola data face recognition mahasiswa & dosen</p>
            </div>
            <button className="btn-refresh" onClick={handleRefresh}>
              🔄 Refresh
            </button>
          </section>

          {/* Stats Cards */}
          <div className="stats-grid-small">
            {dataWajahStats.map((stat, idx) => (
              <div key={idx} className="stat-card-small">
                <div className="stat-icon-small">{stat.icon}</div>
                <div className="stat-content-small">
                  <p className="stat-label-small">{stat.label}</p>
                  <p className="stat-value-small">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Card variant="section">
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
                  value={selectedPeran}
                  onChange={(e) => setSelectedPeran(e.target.value)}
                  className="filter-select"
                >
                  {peranList.map((peran, idx) => (
                    <option key={idx} value={peran}>
                      {peran}
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
            <div className="table-responsive">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>NIM</th>
                    <th>Prodi</th>
                    <th>Peran</th>
                    <th>Status</th>
                    <th>Update Terakhir</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dataWajahTable.map((row) => (
                    <tr key={row.id}>
                      <td>{row.nama}</td>
                      <td className="nim-text">{row.nim}</td>
                      <td>{row.prodi}</td>
                      <td>{row.peran}</td>
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
                      <td>{row.updateTerakhir}</td>
                      <td className="aksi-cell">
                        <div className="aksi-buttons">
                          <button
                            className="aksi-btn update-btn"
                            title="Update"
                            onClick={() => openUpdateModal(row)}
                          >
                            ✏️
                          </button>
                          <button className="aksi-btn delete-btn" title="Hapus">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Update Modal */}
          {isUpdateModalOpen && selectedRowData && (
            <div className="modal-overlay" onClick={closeUpdateModal}>
              <div className="modal-content modal-wajah" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title-wajah">
                  👤 Update Data Wajah
                </h2>

                <div className="modal-student-info-wajah">
                  <p>
                    <strong>{selectedRowData.nama}</strong> — {selectedRowData.nim}
                  </p>
                </div>

                {/* Steps */}
                <div className="wajah-steps">
                  <div className={`step ${currentStep === 'upload' ? 'active' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-label">Upload</span>
                  </div>
                  <div className={`step ${currentStep === 'deteksi' ? 'active' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-label">Deteksi</span>
                  </div>
                  <div className={`step ${currentStep === 'mapping' ? 'active' : ''}`}>
                    <span className="step-number">3</span>
                    <span className="step-label">Mapping</span>
                  </div>
                  <div className={`step ${currentStep === 'seleksi' ? 'active' : ''}`}>
                    <span className="step-number">4</span>
                    <span className="step-label">Seleksi</span>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="wajah-upload-area">
                  {uploadedPhoto ? (
                    <>
                      <img src={uploadedPhoto} alt="Uploaded" className="wajah-preview" />
                      <p className="wajah-upload-text">Foto berhasil diunggah</p>
                    </>
                  ) : (
                    <>
                      <div className="wajah-camera-icon">📷</div>
                      <p className="wajah-upload-text">Upload foto atau ambil langsung untuk memulai scan</p>
                    </>
                  )}
                </div>

                {/* Upload Buttons */}
                <div className="wajah-buttons-group">
                  <label htmlFor="wajah-file-input" className="btn-upload-foto">
                    ⬇️ Upload Foto
                  </label>
                  <input
                    id="wajah-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <button className="btn-buka-kamera" onClick={handleCameraCapture}>
                    📷 Buka Kamera
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="modal-actions-wajah">
                  <button className="btn-cancel-wajah" onClick={closeUpdateModal}>
                    Cancel
                  </button>
                  <button className="btn-save-wajah" onClick={handleSaveUpdate} disabled={!uploadedPhoto}>
                    Save
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
