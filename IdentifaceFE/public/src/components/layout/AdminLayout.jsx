import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const getActiveMenu = () => {
    const path = location.pathname

    if (path.includes('/admin/dashboard')) return 'dashboard'
    if (path.includes('/admin/jadwal')) return 'jadwal'
    if (path.includes('/admin/monitor')) return 'monitor'
    if (path.includes('/admin/laporan')) return 'laporan'
    if (path.includes('/admin/presensi')) return 'presensi'
    if (path.includes('/admin/manajemen-jadwal')) return 'manajemen'
    if (path.includes('/admin/data-wajah')) return 'wajah'

    return 'dashboard'
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'jadwal', label: 'Jadwal Sesi', icon: '📝' },
    { id: 'monitor', label: 'Monitor Kehadiran', icon: '📉' },
    { id: 'laporan', label: 'Laporan', icon: '📄' },

    // menu admin tambahan
    { id: 'presensi', label: 'Laporan Presensi', icon: '📋' },
    { id: 'manajemen', label: 'Manajemen Jadwal', icon: '📅' },
    { id: 'wajah', label: 'Data Wajah', icon: '🔄' },
  ]

  const handleMenuClick = (menuId) => {
    const routes = {
      dashboard: '/admin/dashboard',
      jadwal: '/admin/jadwal',
      monitor: '/admin/monitor',
      laporan: '/admin/laporan',
      presensi: '/admin/presensi',
      manajemen: '/admin/manajemen-jadwal',
      wajah: '/admin/data-wajah',
    }

    navigate(routes[menuId])
  }

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      {/* Navbar */}
      <Navbar userName="Username" />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          activeMenu={getActiveMenu()}
          menuItems={menuItems}
          isAdmin={true}
          onMenuClick={handleMenuClick}
          onLogout={handleLogout}
        />

        {/* Isi halaman */}
        <main className="flex-1 p-10">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#74B5BD] py-5 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#123B5D] text-white flex items-center justify-center text-xs font-bold">
            IF
          </div>
          <span className="font-semibold">IdentiFace</span>
        </div>

        <p className="font-semibold">
          Privacy Policy | Terms of Service
        </p>
      </footer>
    </div>
  )
}