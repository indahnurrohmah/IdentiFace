import { useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Card from '../../components/ui/Card'

export default function ScanWajahPage() {
  const [activeMenu, setActiveMenu] = useState('scan')
  const [isScanning, setIsScanning] = useState(true)

  const handleStartScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      alert('Face scan completed! (mock)')
    }, 3000)
  }

  return (
    <div className="admin-layout">
      <Navbar userName="Bambang Pamungkas" />

      <div className="admin-container">
        <Sidebar activeMenu={activeMenu} isStudent={true} />

        <main className="admin-content">
          <section className="scan-section">
            <div className="scan-header">
              <div className="scan-title-group">
                <h1>👤 Scan Wajah</h1>
                <p className="scan-student-info">Bambang Pamungkas — 29/12345656/SA321</p>
              </div>
            </div>

            <Card variant="scan">
              <div className="scan-container">
                <div className="face-detection-box">
                  <div className="face-corner face-corner-tl"></div>
                  <div className="face-corner face-corner-tr"></div>
                  <div className="face-corner face-corner-bl"></div>
                  <div className="face-corner face-corner-br"></div>

                  <div className="face-scanner-icon">
                    <div className={`scanner-loader ${isScanning ? 'scanning' : ''}`}>
                      <svg
                        viewBox="0 0 100 100"
                        width="60"
                        height="60"
                        fill="none"
                        stroke="#6BAAAF"
                        strokeWidth="2"
                      >
                        <circle cx="50" cy="50" r="40" />
                        <path d="M50 20 Q70 20 70 40" strokeLinecap="round" />
                        <path d="M50 80 Q70 80 70 60" strokeLinecap="round" />
                        <path d="M50 20 Q30 20 30 40" strokeLinecap="round" />
                        <path d="M50 80 Q30 80 30 60" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
