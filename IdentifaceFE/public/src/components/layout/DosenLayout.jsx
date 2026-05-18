import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function DosenLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState(getActiveMenu(location.pathname))

  function getActiveMenu(pathname) {
    if (pathname.includes('/dosen/dashboard')) return 'dashboard'
    if (pathname.includes('/dosen/schedule')) return 'schedule'
    if (pathname.includes('/dosen/monitor')) return 'monitor'
    if (pathname.includes('/dosen/laporan')) return 'laporan'
    return 'dashboard'
  }

  function handleMenuClick(menuId) {
    setActiveMenu(menuId)
    const routes = {
      dashboard: '/dosen/dashboard',
      schedule: '/dosen/schedule',
      monitor: '/dosen/monitor',
      laporan: '/dosen/laporan',
    }
    navigate(routes[menuId])
  }

  function handleLogout() {
    navigate('/')
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'schedule', label: 'Jadwal', icon: '📅' },
    { id: 'monitor', label: 'Monitor', icon: '👥' },
    { id: 'laporan', label: 'Laporan', icon: '📈' },
  ]

  return (
    <div className="layout-wrapper">
      <Navbar userName="Dr. Ahmad" />
      <div className="layout-container">
        <Sidebar
          activeMenu={activeMenu}
          menuItems={menuItems}
          onMenuClick={handleMenuClick}
          onLogout={handleLogout}
        />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
