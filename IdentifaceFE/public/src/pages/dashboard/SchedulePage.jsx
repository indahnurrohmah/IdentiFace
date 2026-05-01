import { useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function SchedulePage() {
  const [activeMenu, setActiveMenu] = useState('jadwal')
  const [filters, setFilters] = useState({
    mataPelajaran: '',
    kelas: '',
    tanggalAwal: '',
    tanggalAkhir: '',
  })

  const scheduleData = [
    {
      id: 1,
      mataPelajaran: 'Pemrograman Dasar',
      kelas: 'TI - 3',
      tanggal: '10/03/2026',
      waktu: '07:30 - 10:00 WIB',
      ruangan: 'Ruangan 204',
      aksi: ['Mulai', 'Akhiri'],
    },
    {
      id: 2,
      mataPelajaran: 'Pemrograman Dasar',
      kelas: 'TI - 3',
      tanggal: '10/03/2026',
      waktu: '07:30 - 10:00 WIB',
      ruangan: 'Ruangan 204',
      aksi: ['Mulai', 'Akhiri'],
    },
    {
      id: 3,
      mataPelajaran: 'Pemrograman Dasar',
      kelas: 'TI - 3',
      tanggal: '10/03/2026',
      waktu: '07:30 - 10:00 WIB',
      ruangan: 'Ruangan 204',
      aksi: ['Mulai', 'Akhiri'],
    },
    {
      id: 4,
      mataPelajaran: 'Pemrograman Dasar',
      kelas: 'TI - 3',
      tanggal: '10/03/2026',
      waktu: '07:30 - 10:00 WIB',
      ruangan: 'Ruangan 204',
      aksi: ['Mulai', 'Akhiri'],
    },
  ]

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    setFilters({
      mataPelajaran: '',
      kelas: '',
      tanggalAwal: '',
      tanggalAkhir: '',
    })
  }

  const handleExport = () => {
    alert('Export functionality (mock)')
  }

  return (
    <div className="admin-layout">
      <Navbar userName="Ahmad Nasikun" />

      <div className="admin-container">
        <Sidebar activeMenu={activeMenu} />

        <main className="admin-content">
          <section className="schedule-section">
            <h1 className="schedule-title">Jadwal Perkuliahan</h1>

            <Card variant="section">
              <div className="table-wrapper">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Mata Kuliah</th>
                      <th>Kelas</th>
                      <th>Tanggal</th>
                      <th>Waktu</th>
                      <th>Ruangan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.mataPelajaran}</td>
                        <td>{row.kelas}</td>
                        <td>{row.tanggal}</td>
                        <td>{row.waktu}</td>
                        <td>{row.ruangan}</td>
                        <td>
                          <div className="action-badges">
                            {row.aksi.map((action, idx) => (
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
            </Card>
          </section>

          <section className="report-section">
            <h2 className="report-title">
              Laporan Akhir <span className="report-date">Senin, 16 Maret 2026 - Semester Genap 2025/2026</span>
            </h2>

            <Card variant="section">
              <div className="filter-header">
                <h3>Filter Laporan</h3>
              </div>

              <div className="filter-grid">
                <Input
                  label="Mata Kuliah"
                  name="mataPelajaran"
                  placeholder="Pilih mata kuliah"
                  value={filters.mataPelajaran}
                  onChange={(e) => handleFilterChange('mataPelajaran', e.target.value)}
                />

                <Input
                  label="Kelas"
                  name="kelas"
                  placeholder="Pilih kelas"
                  value={filters.kelas}
                  onChange={(e) => handleFilterChange('kelas', e.target.value)}
                />

                <div>
                  <label className="input-label">Tanggal Perkuliahan</label>
                  <div className="date-range">
                    <Input
                      name="tanggalAwal"
                      type="date"
                      value={filters.tanggalAwal}
                      onChange={(e) => handleFilterChange('tanggalAwal', e.target.value)}
                    />
                    <span className="date-separator">-</span>
                    <Input
                      name="tanggalAkhir"
                      type="date"
                      value={filters.tanggalAkhir}
                      onChange={(e) => handleFilterChange('tanggalAkhir', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="filter-actions">
                <Button variant="primary" onClick={() => alert('Apply filters (mock)')}>  
                  Simpan
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  Reset
                </Button>
                <Button variant="primary" onClick={handleExport}>
                  ⬇️ Export
                </Button>
              </div>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
