import { useState } from 'react'
import Card from '../../components/ui/Card'

export default function RiwayatKehadiranPage() {
  const [selectedSemester, setSelectedSemester] = useState('Semester Genap 2025/2026')

  const attendanceData = [
    {
      id: 1,
      mataKuliah: 'Proyek Senior Teknologi Informasi',
      kode: 'TIF213241',
      sks: 7,
      kelas: 'B',
      dosen: 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D, Adkario Risky Pratama, S.T., M.Eng., Ph.D., Dr. Gusmur Dharma Putra, S.T., M.Sc.',
      pertemuanTerlaksana: 8,
      kehadiran: '88%',
    },
    {
      id: 2,
      mataKuliah: 'Proyek Perancangan Teknologi Informasi 1',
      kode: 'TIF213241',
      sks: 4,
      kelas: 'A',
      dosen: 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D, Adkario Risky Pratama, S.T., M.Eng., Ph.D., Dr. Gusmur Dharma Putra, S.T., M.Sc.',
      pertemuanTerlaksana: 7,
      kehadiran: '78%',
    },
    {
      id: 3,
      mataKuliah: 'Keamanan Komputer',
      kode: 'TIF213241',
      sks: 2,
      kelas: 'C',
      dosen: 'Syukron Abu Ishaq Alfarozi, S.T., Ph.D, Adkario Risky Pratama, S.T., M.Eng., Ph.D., Dr. Gusmur Dharma Putra, S.T., M.Sc.',
      pertemuanTerlaksana: 5,
      kehadiran: '53%',
    },
  ]

  const getKehadiranColor = (kehadiran) => {
    const nilai = parseInt(kehadiran)
    if (nilai >= 80) return '#4CAF50'
    if (nilai >= 60) return '#FFC107'
    return '#F44336'
  }

  return (
    <>
      <section className="riwayat-header">
        <div>
          <h1>Riwayat Presensi</h1>
          <p className="dashboard-date">29/12345656/SA321 - {selectedSemester}</p>
        </div>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="semester-selector"
        >
          <option>Semester Genap 2025/2026</option>
          <option>Semester Ganjil 2024/2025</option>
          <option>Semester Genap 2024/2025</option>
        </select>
      </section>

      <Card variant="section">
        <div className="table-responsive">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Mata Kuliah</th>
                <th>Kode</th>
                <th>SKS</th>
                <th>Kelas</th>
                <th>Dosen</th>
                <th>Pertemuan Terlaksana</th>
                <th>Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((row, index) => (
                <tr key={row.id}>
                  <td className="text-center">{index + 1}</td>
                  <td>{row.mataKuliah}</td>
                  <td className="text-center">{row.kode}</td>
                  <td className="text-center">{row.sks}</td>
                  <td className="text-center">{row.kelas}</td>
                  <td className="text-small">{row.dosen}</td>
                  <td className="text-center">{row.pertemuanTerlaksana}</td>
                  <td className="text-center">
                    <span
                      className="attendance-badge"
                      style={{
                        backgroundColor: getKehadiranColor(row.kehadiran),
                        padding: '4px 12px',
                        borderRadius: '4px',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      {row.kehadiran}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card variant="info">
        <p style={{ margin: '0' }}>
          📌 <strong>Informasi:</strong> Kehadiran minimum untuk lulus adalah 75%. Silakan hubungi dosen jika ada ketidaksesuaian data.
        </p>
      </Card>
    </>
  )
}
