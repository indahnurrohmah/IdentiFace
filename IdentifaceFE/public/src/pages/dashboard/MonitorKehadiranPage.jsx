import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import {
  LuUserRoundCheck,
  LuUserRoundX,
  LuUserRoundSearch,
} from "react-icons/lu";
import { MdOutlineSick } from "react-icons/md";

export default function MonitorPage() {
  const navigate = useNavigate();
  const [selectedStudents, setSelectedStudents] = useState({});

  const summaryStats = [
    {
      label: "Hadir",
      value: "50",
      className: "bg-green-400",
      icon: <LuUserRoundCheck size={64} />,
    },
    {
      label: "Terlambat",
      value: "4",
      className: "bg-yellow-400",
      icon: <LuUserRoundSearch size={64} />,
    },
    {
      label: "Tidak Hadir",
      value: "0",
      className: "bg-red-400",
      icon: <LuUserRoundX size={64} />,
    },
    {
      label: "Izin/Sakit",
      value: "3",
      className: "bg-[#6BAAAF]",
      icon: <MdOutlineSick size={64} />,
    },
  ];
  const studentData = Array(4).fill({
    nama: "Annisaa",
    tanggal: "16/03/2026",
    waktu: "08:30 WIB",
    status: "Hadir",
  });

  const handleCheckboxChange = (id) => {
    setSelectedStudents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
            <button
              onClick={() => navigate("/dosen/dashboard")}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/dosen/schedule")}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Jadwal Sesi
            </button>

            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Monitoring Kehadiran</h1>
              <p className="text-sm text-gray-600">
                Senin, 16 Maret 2026 - Semester Genap 2025/2026
              </p>
            </div>

            <button className="bg-[#123B5D] text-white px-6 py-3 rounded-lg font-semibold">
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
            {summaryStats.map((stat) => (
              <div
                key={stat.label}
                className={`${stat.className} rounded-2xl shadow-md px-5 py-4 h-24 relative overflow-hidden`}
              >
                <div className="absolute -right-3 -bottom-3 text-white opacity-20">
                  {stat.icon}
                </div>
                <p className="text-sm font-semibold text-white">{stat.label}</p>
                <h2 className="text-4xl font-bold text-white mt-1">
                  {stat.value}
                </h2>
              </div>
            ))}
          </div>

          <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-lg shadow-md p-3">
            <div className="bg-[#6BAAAF] text-white px-4 py-3 rounded-t font-semibold">
              Daftar Mahasiswa
            </div>

            <table className="w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="px-5 py-4 w-12">
                    <input type="checkbox" />
                  </th>
                  <th className="text-left px-5 py-4">Nama Mahasiswa</th>
                  <th className="text-left px-5 py-4">Tanggal</th>
                  <th className="text-left px-5 py-4">Waktu</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-left px-5 py-4">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {studentData.map((student, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents[index] || false}
                        onChange={() => handleCheckboxChange(index)}
                      />
                    </td>

                    <td className="px-5 py-4">{student.nama}</td>
                    <td className="px-5 py-4">{student.tanggal}</td>
                    <td className="px-5 py-4">{student.waktu}</td>

                    <td className="px-5 py-4">
                      <span className="bg-green-200 px-4 py-2 rounded font-semibold">
                        {student.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="bg-green-200 px-4 py-2 rounded font-semibold">
                          Tambah
                        </button>
                        <button className="bg-red-200 px-4 py-2 rounded font-semibold">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-5">
              <button className="w-full bg-[#123B5D] text-white py-3 rounded font-semibold">
                Simpan
              </button>
            </div>
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
        </div>

        <p className="font-semibold">Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  );
}
