import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import StudentLayout from "./components/layout/StudentLayout";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import ScanWajahPage from "./pages/dashboard/ScanWajahPage";
import RiwayatKehadiranPage from "./pages/dashboard/RiwayatKehadiranPage";
import DosenDashboard from "./pages/dashboard/DosenDashboard";
import SchedulePage from "./pages/dashboard/SchedulePage";
import MonitorKehadiranPage from "./pages/dashboard/MonitorKehadiranPage";
import LaporanPresensiPage from "./pages/dashboard/LaporanPresensiPage";
import DataWajahPage from "./pages/dashboard/DataWajahPage";
import logo from "./assets/logo.png";
import { LuGraduationCap, LuBookOpen, LuShieldCheck } from "react-icons/lu";

function HomePage() {
  const navigate = useNavigate();

  const roles = [
    {
      key: "mahasiswa",
      label: "Mahasiswa",
      desc: "Absensi & pantau kehadiran kuliah",
      icon: <LuGraduationCap size={40} />,
      bg: "#AD2810",
      hover: "#8f2010",
      path: "/login",
    },
    {
      key: "dosen",
      label: "Dosen",
      desc: "Kelola sesi & monitor kehadiran",
      icon: <LuBookOpen size={30} />,
      bg: "#123B5D",
      hover: "#0d2a3f",
      path: "/login",
    },
    {
      key: "admin",
      label: "Admin",
      desc: "Manajemen data & laporan presensi",
      icon: <LuShieldCheck size={35} />,
      bg: "#6BAAAF",
      hover: "#5a9499",
      path: "/login",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6"
      style={{ background: "#ECE7DF" }}
    >
      <style>{`
        @keyframes floatBg {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .role-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: fadeUp 0.5s ease-out forwards;
          opacity: 0;
        }
        .role-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.18);
        }
        .role-card:active {
          transform: translateY(-2px);
        }
      `}</style>

      {/* Background decoration */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-20 -top-24 -left-24"
        style={{
          background: "#6BAAAF",
          animation: "floatBg 7s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full opacity-10 -bottom-16 -right-16"
        style={{
          background: "#123B5D",
          animation: "floatBg 9s ease-in-out infinite reverse",
        }}
      />

      {/* Logo */}
      <div
        className="relative z-10 mb-6"
        style={{ animation: "fadeUp 0.4s ease-out forwards" }}
      >
        <img
          src={logo}
          alt="IdentiFace Logo"
          className="w-48 h-auto object-contain"
        />
      </div>

      {/* Title */}
      <div
        className="relative z-10 text-center mb-10"
        style={{ animation: "fadeUp 0.5s ease-out 0.1s forwards", opacity: 0 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-[#123B5D] mb-2">
          Selamat Datang
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Pilih role untuk melanjutkan
        </p>
      </div>

      {/* Role Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
        {roles.map((role, i) => (
          <button
            key={role.key}
            onClick={() => navigate(role.path, { state: { role: role.key } })}
            className="role-card flex flex-col items-center gap-3 sm:gap-4 rounded-2xl px-5 py-5 sm:px-6 sm:py-8 text-white shadow-lg cursor-pointer border-0"
            style={{
              background: role.bg,
              animationDelay: `${0.15 + i * 0.1}s`,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = role.hover)
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = role.bg)}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center">
              {role.icon}
            </div>
            <div className="text-center">
              <p className="text-base sm:text-xl font-bold">{role.label}</p>
              <p className="text-xs mt-1 opacity-80">{role.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer text */}
      <p
        className="relative z-10 mt-10 text-xs text-gray-400"
        style={{ animation: "fadeUp 0.5s ease-out 0.5s forwards", opacity: 0 }}
      >
        Privacy Policy | Terms of Service
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
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

        {/* Admin Routes */}
        <Route path="/admin/presensi" element={<LaporanPresensiPage />} />
        <Route path="/admin/data-wajah" element={<DataWajahPage />} />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
