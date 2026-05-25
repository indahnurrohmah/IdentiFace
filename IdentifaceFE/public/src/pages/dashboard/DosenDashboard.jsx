import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { MdOutlineClass } from "react-icons/md";
import { LuUsers, LuUserRoundCheck, LuUserRoundX } from "react-icons/lu";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Fungsi getToken() DIHAPUS karena token sekarang aman di dalam Cookie

// ─── GLOBAL FETCH HELPER DENGAN CREDENTIALS ────────────────────────────────
async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 
  });

  if (res.status === 401) {
    // Token di Cookie expired/invalid → paksa logout
    localStorage.removeItem("user"); // Hanya perlu hapus profil user
    window.location.href = "/";
    return null;
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Request gagal.");
  return json.data;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function formatTime(timeStr) {
  if (!timeStr) return "";
  return timeStr.slice(0, 5).replace(":", ".");
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Pagi";
  if (hour < 15) return "Siang";
  if (hour < 18) return "Sore";
  return "Malam";
}

function formatDateID(date = new Date()) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function DosenDashboard() {
  const navigate = useNavigate();

  // Ambil data user dari localStorage (hanya data profil, tanpa token)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = user?.nama?.split(" ")[0] || "Dosen";

  // ── State ──────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [sessionsError, setSessionsError] = useState(null);

  // ── Fetch Functions ────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await apiFetch("/lecturer/dashboard/summary");
      if (data) setStats(data);
    } catch (err) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const data = await apiFetch("/lecturer/sessions/today");
      if (data) setSessions(data);
    } catch (err) {
      setSessionsError(err.message);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchSessions();
  }, [fetchStats, fetchSessions]);

  // ── Stat Cards Config ──────────────────────────────────────────────────
  const statCards = [
    {
      title: "Sesi Hari ini",
      value: statsLoading ? "..." : (stats?.sesi_hari_ini ?? "0"),
      icon: <MdOutlineClass size={64} />,
    },
    {
      title: "Total Mahasiswa",
      value: statsLoading ? "..." : (stats?.total_mahasiswa ?? "0"),
      icon: <LuUsers size={64} />,
    },
    {
      title: "Kehadiran",
      value: statsLoading
        ? "..."
        : stats
        ? `${Math.round(
            (stats.hadir / Math.max(stats.total_mahasiswa, 1)) * 100
          )}%`
        : "0%",
      icon: <LuUserRoundCheck size={64} />,
    },
    {
      title: "Tidak Hadir",
      value: statsLoading ? "..." : (stats?.tidak_hadir ?? "0"),
      icon: <LuUserRoundX size={64} />,
    },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleLogout = async () => {
    // 3️⃣ Opsional tapi direkomendasikan: Panggil endpoint backend untuk menghapus Cookie token
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.log("Logout request failed, proceeding to clear local state.");
    }

    // Hapus data profil di sisi frontend lalu kembali ke halaman login
    localStorage.removeItem("user");
    navigate("/");
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5">
        <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{user?.nama || "Dosen"}</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D] bg-[#6BAAAF] flex items-center justify-center text-white font-bold text-lg">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="flex-1 px-10 pb-10 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Dosen</h2>
          <nav className="space-y-3">
            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
              Dashboard
            </button>
            <button
              onClick={() => navigate("/dosen/schedule")}
              className="w-full h-10 rounded border border-white text-black font-semibold hover:bg-[#5a9499] transition-colors"
            >
              Jadwal Sesi
            </button>
            <button
              onClick={() => navigate("/dosen/monitor")}
              className="w-full h-10 rounded border border-white text-black font-semibold hover:bg-[#5a9499] transition-colors"
            >
              Monitor Kehadiran
            </button>
          </nav>
          <button
            onClick={handleLogout}
            className="mt-auto w-full h-10 rounded bg-[#B82410] text-white font-semibold hover:bg-[#9a1d0d] transition-colors"
          >
            Keluar
          </button>
        </aside>

        {/* Content */}
        <section className="flex-1">
          {/* Greeting */}
          <div className="mb-5">
            <h1 className="text-3xl font-bold">
              Selamat {getGreeting()}, {firstName}!
            </h1>
            <p className="text-sm text-gray-600">
              {formatDateID()} — Semester Genap 2025/2026
            </p>
          </div>

          {/* Error banner stats */}
          {statsError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm flex justify-between">
              <span>Gagal memuat statistik: {statsError}</span>
              <button onClick={fetchStats} className="underline font-semibold">Coba lagi</button>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
            {statCards.map(({ title, value, icon }) => (
              <div
                key={title}
                className="bg-[#6BAAAF] rounded-2xl shadow-md px-5 py-4 h-24 relative overflow-hidden"
              >
                <div className="absolute -right-3 -bottom-3 text-white opacity-20">
                  {icon}
                </div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <h2 className="text-4xl font-bold text-white mt-1">{value}</h2>
              </div>
            ))}
          </div>

          {/* Panels */}
          <div className="grid grid-cols-2 gap-6">
            <SessionsPanel
              sessions={sessions}
              loading={sessionsLoading}
              error={sessionsError}
              onRetry={fetchSessions}
              navigate={navigate}
            />
            <ActivityPanel sessions={sessions} loading={sessionsLoading} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#74B5BD] py-5 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />
          <p className="font-semibold">Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </div>
  );
}

// ─── SESSIONS PANEL ─────────────────────────────────────────────────────────
function SessionsPanel({ sessions, loading, error, onRetry, navigate }) {
  if (loading) {
    return (
      <PanelWrapper title="Sesi Perkuliahan Hari Ini">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#6BAAAF] rounded-md shadow mb-4 p-3 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </PanelWrapper>
    );
  }

  if (error) {
    return (
      <PanelWrapper title="Sesi Perkuliahan Hari Ini">
        <div className="text-center py-8 text-red-500 text-sm">
          <p className="mb-2">{error}</p>
          <button onClick={onRetry} className="underline">Coba lagi</button>
        </div>
      </PanelWrapper>
    );
  }

  if (sessions.length === 0) {
    return (
      <PanelWrapper title="Sesi Perkuliahan Hari Ini">
        <div className="text-center py-10 text-gray-400 text-sm">
          Tidak ada sesi hari ini.
        </div>
      </PanelWrapper>
    );
  }

  return (
    <PanelWrapper title="Sesi Perkuliahan Hari Ini">
      {sessions.map((sesi) => (
        <div
          key={sesi.id_sesi}
          className="bg-white border border-[#6BAAAF] rounded-md shadow mb-4 p-3 cursor-pointer hover:bg-[#f0f9f9] transition-colors"
          onClick={() => navigate(`/dosen/monitor?sesi=${sesi.id_sesi}`)}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">{sesi.nama_mk}</h3>
              <p className="text-xs text-gray-600">{sesi.kode_mk}</p>
              <p className="text-xs text-gray-600">
                {formatTime(sesi.waktu_mulai)} - {formatTime(sesi.waktu_selesai)} WIB
              </p>
            </div>
            <span
              className={`px-4 py-1 rounded text-xs font-semibold ${
                sesi.is_active
                  ? "bg-green-300 text-green-800"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {sesi.is_active ? "Berlangsung" : "Belum Mulai"}
            </span>
          </div>
        </div>
      ))}
    </PanelWrapper>
  );
}

// ─── ACTIVITY PANEL ─────────────────────────────────────────────────────────
// Menampilkan sesi aktif sebagai ringkasan kehadiran
function ActivityPanel({ sessions, loading }) {
  const activeSessions = sessions.filter((s) => s.is_active);

  if (loading) {
    return (
      <PanelWrapper title="Aktivitas Terkini">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-[#6BAAAF] rounded-md shadow mb-4 p-3 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </PanelWrapper>
    );
  }

  if (activeSessions.length === 0) {
    return (
      <PanelWrapper title="Aktivitas Terkini">
        <div className="text-center py-10 text-gray-400 text-sm">
          Belum ada sesi aktif saat ini.
        </div>
      </PanelWrapper>
    );
  }

  return (
    <PanelWrapper title="Aktivitas Terkini">
      {activeSessions.map((sesi) => (
        <LiveAttendanceCard key={sesi.id_sesi} sesi={sesi} />
      ))}
    </PanelWrapper>
  );
}

// ─── LIVE ATTENDANCE CARD ───────────────────────────────────────────────────
// Fetch live presensi per sesi aktif
function LiveAttendanceCard({ sesi }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await apiFetch(`/lecturer/session/${sesi.id_sesi}/attendance`);
        if (data) setAttendees(data.slice(0, 3)); // tampilkan 3 terbaru
      } catch {
        // silent fail pada activity panel
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
    // Auto-refresh setiap 15 detik saat sesi aktif
    const interval = setInterval(fetchAttendance, 15000);
    return () => clearInterval(interval);
  }, [sesi.id_sesi]);

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        {sesi.nama_mk} · {formatTime(sesi.waktu_mulai)} WIB
      </p>

      {loading ? (
        <div className="bg-white border border-[#6BAAAF] rounded-md p-3 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ) : attendees.length === 0 ? (
        <div className="bg-white border border-[#6BAAAF] rounded-md p-3 text-xs text-gray-400">
          Belum ada presensi masuk.
        </div>
      ) : (
        attendees.map((a) => (
          <div
            key={a.nim}
            className="bg-white border border-[#6BAAAF] rounded-md shadow mb-2 p-3"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">{a.nama}</h3>
                <p className="text-xs text-gray-600">{a.nim}</p>
                <p className="text-xs text-gray-600">
                  {a.waktu_scan
                    ? new Date(a.waktu_scan).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) + " WIB"
                    : "—"}
                </p>
              </div>
              <span
                className={`px-4 py-1 rounded text-xs font-semibold ${
                  a.status === "hadir"
                    ? "bg-green-300 text-green-800"
                    : a.status === "izin"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-300 text-red-800"
                }`}
              >
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── PANEL WRAPPER ──────────────────────────────────────────────────────────
function PanelWrapper({ title, children }) {
  return (
    <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-lg shadow-md p-4 min-h-[320px]">
      <h2 className="font-bold mb-3">{title}</h2>
      {children}
    </div>
  );
}