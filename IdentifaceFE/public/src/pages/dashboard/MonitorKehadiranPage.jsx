import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import {
  LuUserRoundCheck,
  LuUserRoundX,
  LuUserRoundSearch,
} from "react-icons/lu";
import { MdOutlineSick } from "react-icons/md";
import { FiCheck, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { MdCheckCircle, MdEditSquare } from "react-icons/md";

export default function MonitorPage() {
  const navigate = useNavigate();
  const [modalTambah, setModalTambah] = useState(null);
  const [formTambah, setFormTambah] = useState({
    status: "Hadir",
    alasan: "",
    bukti: null,
  });

  const [students, setStudents] = useState([
    {
      id: 1,
      nama: "Manusia a",
      tanggal: "16/03/2026",
      waktu: "08:30 WIB",
      status: "Hadir",
    },
    {
      id: 2,
      nama: "Manusia b",
      tanggal: "16/03/2026",
      waktu: "09:15 WIB",
      status: "Terlambat",
    },
    {
      id: 3,
      nama: "Manusia c",
      tanggal: "16/03/2026",
      waktu: "-",
      status: "Tidak Hadir",
    },
    {
      id: 4,
      nama: "Manusia d",
      tanggal: "16/03/2026",
      waktu: "08:30 WIB",
      status: "Izin/Sakit",
    },
    {
      id: 5,
      nama: "Manusia e",
      tanggal: "16/03/2026",
      waktu: "08:28 WIB",
      status: "Hadir",
    },
  ]);
  const [selectedStudents, setSelectedStudents] = useState({});
  const [toast, setToast] = useState(null);

  const selectAll =
    students.length > 0 && students.every((s) => selectedStudents[s.id]);

  const statusStyle = {
    Hadir: "bg-green-100 text-green-700 border border-green-300",
    Terlambat: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    "Tidak Hadir": "bg-red-100 text-red-700 border border-red-300",
    "Izin/Sakit": "bg-blue-100 text-blue-700 border border-blue-300",
  };

  const handleCheckboxChange = (id) => {
    setSelectedStudents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents({});
    } else {
      const all = {};
      students.forEach((s) => (all[s.id] = true));
      setSelectedStudents(all);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
    );
  };

  const handleTambahHadir = (student) => {
    setModalTambah(student);
    setFormTambah({ status: "Hadir", alasan: "", bukti: null });
  };

  const handleSaveTambah = () => {
    const now = new Date();
    const jam =
      now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
      " WIB";

    const selectedIds = Object.entries(selectedStudents)
      .filter(([, checked]) => checked)
      .map(([id]) => parseInt(id));

    // Kalau ada yang diceklis, update semua yang diceklis. Kalau ga ada, update yang diklik aja
    const targetIds = selectedIds.length > 0 ? selectedIds : [modalTambah.id];

    setStudents((prev) =>
      prev.map((s) =>
        targetIds.includes(s.id)
          ? { ...s, status: formTambah.status, waktu: jam }
          : s,
      ),
    );

    if (selectedIds.length > 0) setSelectedStudents({});
    setModalTambah(null);
    setToast(
      selectedIds.length > 1
        ? `${selectedIds.length} mahasiswa berhasil diperbarui!`
        : "Data kehadiran berhasil diperbarui!",
    );
    setTimeout(() => setToast(null), 3000);
  };

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

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

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all
                ${
                  refreshing
                    ? "bg-[#123B5D]/60 cursor-not-allowed"
                    : "bg-[#123B5D] hover:bg-[#0d2a3f] hover:shadow-md active:scale-95"
                }`}
            >
              <FiRefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Memperbarui..." : "Refresh"}
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

          <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-xl shadow-md overflow-hidden">
            {/* Header tabel */}
            <div className="bg-[#6BAAAF] text-white px-5 py-3 font-semibold flex items-center justify-between">
              <span>Daftar Mahasiswa</span>
              <span className="text-sm font-normal opacity-70">
                {Object.values(selectedStudents).filter(Boolean).length} dipilih
              </span>
            </div>

            {/* Scrollable wrapper biar oke di HP */}
            <div className="overflow-x-auto">
              <table className="w-full bg-white min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-[#6BAAAF]">
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 accent-[#123B5D] cursor-pointer"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Nama Mahasiswa
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Tanggal
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Waktu
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`border-b transition-colors duration-150
              ${
                selectedStudents[student.id]
                  ? "bg-blue-50"
                  : index % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50/50"
              }
              hover:bg-[#f0f9fa]
            `}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents[student.id] || false}
                          onChange={() => handleCheckboxChange(student.id)}
                          className="w-4 h-4 accent-[#123B5D] cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3 font-medium text-sm text-gray-800">
                        {student.nama}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.tanggal}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.waktu}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusStyle[student.status]}`}
                        >
                          {student.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTambahHadir(student)}
                            className="flex items-center gap-1 bg-[#123B5D] hover:bg-[#0d2a3f] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <MdEditSquare size={13} /> Perbarui Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {modalTambah && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-[#EFE6D3] rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#123B5D] mb-0.5">
              Tambah Kehadiran
            </h2>
            <p className="text-sm text-[#123B5D] font-medium mb-5">
              {Object.values(selectedStudents).filter(Boolean).length > 1
                ? `${Object.values(selectedStudents).filter(Boolean).length} mahasiswa dipilih`
                : `${modalTambah.nama} — Kecerdasan Buatan`}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Status Baru
              </label>
              <select
                value={formTambah.status}
                onChange={(e) =>
                  setFormTambah((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#123B5D]/30"
              >
                <option value="Hadir">Hadir</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Tidak Hadir">Tidak Hadir</option>
                <option value="Izin/Sakit">Izin/Sakit</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Alasan
              </label>
              <textarea
                value={formTambah.alasan}
                onChange={(e) =>
                  setFormTambah((prev) => ({ ...prev, alasan: e.target.value }))
                }
                placeholder="Tuliskan alasan perubahan kehadiran..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#123B5D]/30"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Bukti Konfirmasi
              </label>
              <div className="flex items-center gap-3">
                <label className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setFormTambah((prev) => ({
                        ...prev,
                        bukti: e.target.files[0],
                      }))
                    }
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {formTambah.bukti ? formTambah.bukti.name : "No file chosen"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Upload surat izin, bukti sakit, atau dokumen lainnya
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalTambah(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTambah}
                className="px-5 py-2.5 rounded-lg bg-[#123B5D] hover:bg-[#0d2a3f] text-white text-sm font-semibold transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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
