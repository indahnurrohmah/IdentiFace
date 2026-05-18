import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function StudentLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const getActiveMenu = () => {
    const path = location.pathname
    if (path.includes('scan')) return 'scan'
    if (path.includes('riwayat')) return 'riwayat'
    return 'dashboard'
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'scan', label: 'Scan Wajah', icon: '📷' },
    { id: 'riwayat', label: 'Riwayat Presensi', icon: '📋' },
  ]

  const handleMenuClick = (menuId) => {
    const routes = {
      'dashboard': '/student/dashboard',
      'scan': '/student/scan',
      'riwayat': '/student/riwayat',
    }
    navigate(routes[menuId])
  }

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <Navbar userName="Bambang Pamungkas" />
      <div className="admin-container">
        <Sidebar 
          activeMenu={getActiveMenu()} 
          menuItems={menuItems}
          isStudent={true}
          onMenuClick={handleMenuClick}
          onLogout={handleLogout}
        />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
