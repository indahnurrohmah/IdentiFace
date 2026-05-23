import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { MdOutlineClass } from "react-icons/md";
import { LuUsers, LuUserRoundCheck, LuUserRoundX } from "react-icons/lu";

export default function DosenDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      <header className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="IdentiFace Logo"
            className="w-40 h-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Ahmad Nasikun</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D]" />
        </div>
      </header>

      <main className="flex-1 px-10 pb-10 flex gap-8">
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Dosen</h2>

          <nav className="space-y-3">
            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
              Dashboard
            </button>
            <button
              onClick={() => navigate("/dosen/schedule")}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Jadwal Sesi
            </button>
            <button
              onClick={() => navigate("/dosen/monitor")}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Monitor Kehadiran
            </button>
          </nav>

          <button
            onClick={() => navigate("/")}
            className="mt-auto w-full h-10 rounded bg-[#B82410] text-white font-semibold"
          >
            Keluar
          </button>
        </aside>

        <section className="flex-1">
          <div className="mb-5">
            <h1 className="text-3xl font-bold">Selamat Pagi, Ahmad !</h1>
            <p className="text-sm text-gray-600">
              Senin, 16 Maret 2026 - Semester Genap 2025/2026
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
            {[
              {
                title: "Sesi Hari ini",
                value: "3",
                icon: <MdOutlineClass size={64} />,
              },
              {
                title: "Total Mahasiswa",
                value: "50",
                icon: <LuUsers size={64} />,
              },
              {
                title: "Kehadiran",
                value: "80%",
                icon: <LuUserRoundCheck size={64} />,
              },
              {
                title: "Tidak Hadir",
                value: "3",
                icon: <LuUserRoundX size={64} />,
              },
            ].map(({ title, value, icon }) => (
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
          <div className="grid grid-cols-2 gap-6">
            <DashboardPanel title="Sesi Perkuliahan Hari Ini" />
            <ActivityPanel />
          </div>
        </section>
      </main>

      <footer className="bg-[#74B5BD] py-5 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img
            src={logo}
            alt="IdentiFace Logo"
            className="w-40 h-auto object-contain"
          />

          <p className="font-semibold">Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </div>
  );
}

function DashboardPanel({ title }) {
  return (
    <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-lg shadow-md p-4 min-h-[320px]">
      <h2 className="font-bold mb-3">{title}</h2>

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="bg-white border border-[#6BAAAF] rounded-md shadow mb-4 p-3"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">Kecerdasan Buatan</h3>
              <p className="text-xs text-gray-600">TI - 3A - SGCL Lt. 7B1</p>
              <p className="text-xs text-gray-600">07.30 - 10.00 WIB</p>
            </div>

            <span className="bg-green-300 px-4 py-1 rounded text-xs font-semibold">
              Berlangsung
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityPanel() {
  const data = [
    ["Budi Pekerti", "Hadir", "bg-green-300"],
    ["Anissa", "Tidak Hadir", "bg-red-300"],
  ];

  return (
    <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-lg shadow-md p-4 min-h-[320px]">
      <h2 className="font-bold mb-3">Aktivitas Terkini</h2>

      {data.map(([name, status, color]) => (
        <div
          key={name}
          className="bg-white border border-[#6BAAAF] rounded-md shadow mb-4 p-3"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">{name}</h3>
              <p className="text-xs text-gray-600">TI - 3A - SGCL Lt. 7B1</p>
              <p className="text-xs text-gray-600">07.30 - 10.00 WIB</p>
            </div>

            <span
              className={`${color} px-4 py-1 rounded text-xs font-semibold`}
            >
              {status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
