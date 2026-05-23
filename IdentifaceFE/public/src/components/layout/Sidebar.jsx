import Button from '../ui/Button'

export default function Sidebar({ activeMenu = 'dashboard', menuItems = null, isStudent = false, isAdmin = false, onMenuClick, onLogout }) {
  const defaultMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'jadwal', label: 'Jadwal Sesi', icon: '📅' },
    { id: 'monitor', label: 'Monitor Kehadiran', icon: '📱' },
  ]

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'scan', label: 'Scan Wajah', icon: '📷' },
    { id: 'riwayat', label: 'Riwayat Presensi', icon: '📋' },
  ]

  const adminMenuItems = [
    { id: 'laporan', label: 'Laporan Presensi', icon: '📋' },
    { id: 'jadwal', label: 'Manajemen Jadwal', icon: '📅' },
    { id: 'wajah', label: 'Data Wajah', icon: '👤' },
  ]

  const items = menuItems || (isAdmin ? adminMenuItems : isStudent ? studentMenuItems : defaultMenuItems)

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>{isAdmin ? 'Menu Admin' : isStudent ? 'Menu Mahasiswa' : 'Menu Dosen'}</h3>
      </div>

      <nav className="sidebar-menu">
        {items.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onMenuClick && onMenuClick(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Button variant="danger" fullWidth onClick={onLogout}>
          🚪 Keluar
        </Button>
      </div>
    </aside>
  )
}
