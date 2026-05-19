import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import StudentLayout from './components/layout/StudentLayout'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import ScanWajahPage from './pages/dashboard/ScanWajahPage'
import RiwayatKehadiranPage from './pages/dashboard/RiwayatKehadiranPage'
import DosenDashboard from './pages/dashboard/DosenDashboard'
import SchedulePage from './pages/dashboard/SchedulePage'
import MonitorKehadiranPage from './pages/dashboard/MonitorKehadiranPage'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDE2CD' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>👤</div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Montserrat', color: '#133951', marginBottom: '8px' }}>
          IdentiFace
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '40px' }}>
          Pilih Role untuk Melanjutkan
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/student/dashboard')}
            style={{
              padding: '16px 32px',
              fontSize: '1rem',
              fontWeight: '600',
              background: '#6BAAAF',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#5a9499')}
            onMouseLeave={(e) => (e.target.style.background = '#6BAAAF')}
          >
             Login sebagai Mahasiswa
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '16px 32px',
              fontSize: '1rem',
              fontWeight: '600',
              background: '#133951',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#0d2a3f')}
            onMouseLeave={(e) => (e.target.style.background = '#133951')}
          >
             Login sebagai Dosen
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Home - Role Selection */}
        <Route path="/" element={<HomePage />} />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/scan" element={<ScanWajahPage />} />
          <Route path="/student/riwayat" element={<RiwayatKehadiranPage />} />

        {/* Dosen Routes */}
        <Route path="/dosen/dashboard" element={<DosenDashboard />} />
        <Route path="/dosen/schedule" element={<SchedulePage />} />
        <Route path="/dosen/monitor" element={<MonitorKehadiranPage />} />
        
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
