import { useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Card from '../../components/ui/Card'

export default function DosenDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard')

  const stats = [
    { label: 'Sesi Hari ini', value: '3', icon: '📋' },
    { label: 'Total Mahasiswa', value: '50', icon: '👥' },
    { label: 'Kehadiran', value: '80%', icon: '📊' },
    { label: 'Tidak Hadir', value: '3', icon: '❌' },
  ]

  const sessionData = [
    {
      id: 1,
      title: 'Kecerdasan Buatan',
      class: 'TI - 3A - SGLC L1 7B1',
      time: '07:30 - 10:00 WIB',
      status: 'Berlangsung',
      statusColor: 'success',
    },
    {
      id: 2,
      title: 'Kecerdasan Buatan',
      class: 'TI - 3A - SGLC L1 7B1',
      time: '07:30 - 10:00 WIB',
      status: 'Berlangsung',
      statusColor: 'success',
    },
    {
      id: 3,
      title: 'Kecerdasan Buatan',
      class: 'TI - 3A - SGLC L1 7B1',
      time: '07:30 - 10:00 WIB',
      status: 'Berlangsung',
      statusColor: 'success',
    },
  ]

  const activityData = [
    {
      id: 1,
      name: 'Budi Pekerti',
      class: 'TI - 3A - SGLC L1 7B1',
      time: '07:30 - 10:00 WIB',
      status: 'Hadir',
      statusColor: 'success',
    },
    {
      id: 2,
      name: 'Anissa',
      class: 'TI - 3A - SGLC L1 7B1',
      time: '07:30 - 10:00 WIB',
      status: 'Tidak Hadir',
      statusColor: 'danger',
    },
  ]

  return (
    <div className="admin-layout">
      <Navbar userName="Ahmad Nasikun" />

      <div className="admin-container">
        <Sidebar activeMenu={activeMenu} />

        <main className="admin-content">
          <section className="dashboard-header">
            <div>
              <h1>Selamat Pagi, Ahmad !</h1>
              <p className="dashboard-date">Senin, 16 Maret 2026 - Semester Genap 2025/2026</p>
            </div>
          </section>

          <section className="stats-grid">
            {stats.map((stat) => (
              <Card key={stat.label} variant="stat">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value">{stat.value}</p>
                </div>
              </Card>
            ))}
          </section>

          <section className="dashboard-grid">
            <Card variant="section">
              <h2>Sesi Perkuliahan Hari Ini</h2>
              <div className="session-list">
                {sessionData.map((session) => (
                  <div key={session.id} className="session-item">
                    <div className="session-info">
                      <h4>{session.title}</h4>
                      <p className="session-class">{session.class}</p>
                      <p className="session-time">🕐 {session.time}</p>
                    </div>
                    <span className={`session-badge badge-${session.statusColor}`}>
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="section">
              <h2>Aktivitas Terkini</h2>
              <div className="activity-list">
                {activityData.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-info">
                      <h4>{activity.name}</h4>
                      <p className="activity-class">{activity.class}</p>
                      <p className="activity-time">🕐 {activity.time}</p>
                    </div>
                    <span className={`activity-badge badge-${activity.statusColor}`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
