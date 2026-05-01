import { useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

export default function MonitorKehadiranPage() {
  const [activeMenu, setActiveMenu] = useState('monitor')
  const [selectedStudents, setSelectedStudents] = useState({})

  const summaryStats = [
    { label: 'Hadir', value: '50', bgColor: '#86efac' },
    { label: 'Terlambat', value: '4', bgColor: '#fcd34d' },
    { label: 'Tidak Hadir', value: '0', bgColor: '#f87171' },
    { label: 'Izin/Sakit', value: '3', bgColor: '#6BAAAF' },
  ]

  const studentData = [
    {
      id: 1,
      nama: 'Annisaa',
      tanggal: '16/03/2026',
      waktu: '08:30 WIB',
      status: 'Hadir',
      aksi: ['Tambah', 'Hapus'],
    },
    {
      id: 2,
      nama: 'Annisaa',
      tanggal: '16/03/2026',
      waktu: '08:30 WIB',
      status: 'Hadir',
      aksi: ['Tambah', 'Hapus'],
    },
    {
      id: 3,
      nama: 'Annisaa',
      tanggal: '16/03/2026',
      waktu: '08:30 WIB',
      status: 'Hadir',
      aksi: ['Tambah', 'Hapus'],
    },
    {
      id: 4,
      nama: 'Annisaa',
      tanggal: '16/03/2026',
      waktu: '08:30 WIB',
      status: 'Hadir',
      aksi: ['Tambah', 'Hapus'],
    },
  ]

  const handleCheckboxChange = (id) => {
    setSelectedStudents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleSave = () => {
    alert('Data kehadiran disimpan (mock)')
  }

  const handleRefresh = () => {
    alert('Data diperbarui (mock)')
  }

  return (
    <div className="admin-layout">
      <Navbar userName="Ahmad Nasikun" />

      <div className="admin-container">
        <Sidebar activeMenu={activeMenu} />

        <main className="admin-content">
          <section className="monitoring-header">
            <div>
              <h1>Monitoring Kehadiran</h1>
              <p className="monitoring-date">Senin, 16 Maret 2026 - Semester Genap 2025/2026</p>
            </div>
            <Button variant="primary" onClick={handleRefresh}>
              🔄 Refresh
            </Button>
          </section>

          <section className="summary-cards">
            {summaryStats.map((stat) => (
              <div key={stat.label} className="summary-card" style={{ backgroundColor: stat.bgColor }}>
                <h3>{stat.label}</h3>
                <p className="summary-value">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="student-section">
            <Card variant="section">
              <div className="student-header">
                <h2>Daftar Mahasiswa</h2>
              </div>

              <div className="table-wrapper">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input type="checkbox" className="table-checkbox" />
                      </th>
                      <th>Nama Mahasiswa</th>
                      <th>Tanggal</th>
                      <th>Waktu</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentData.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="table-checkbox"
                            checked={selectedStudents[student.id] || false}
                            onChange={() => handleCheckboxChange(student.id)}
                          />
                        </td>
                        <td>{student.nama}</td>
                        <td>{student.tanggal}</td>
                        <td>{student.waktu}</td>
                        <td>
                          <span className="status-badge">{student.status}</span>
                        </td>
                        <td>
                          <div className="action-badges">
                            {student.aksi.map((action, idx) => (
                              <span
                                key={idx}
                                className={`action-badge badge-${action.toLowerCase()}`}
                              >
                                {action}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="student-footer">
                <Button variant="primary" fullWidth onClick={handleSave}>
                  Simpan
                </Button>
              </div>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
