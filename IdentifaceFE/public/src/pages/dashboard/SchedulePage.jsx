import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function SchedulePage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    mataKuliah: "",
    kelas: "",
    tanggalAwal: "",
    tanggalAkhir: "",
  });

  const scheduleData = Array(4).fill({
    mataKuliah: "Pemrograman Dasar",
    kelas: "TI - 3",
    tanggal: "10/03/2026",
    waktu: "07.30 - 10.00 WIB",
    ruangan: "Ruangan 204",
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      {/* HEADER */}
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

      {/* MAIN */}
      <main className="flex-1 px-10 pb-10 flex gap-8">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Dosen</h2>

          <nav className="space-y-3">
            <button
              onClick={() => navigate("/dosen/dashboard")}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Dashboard
            </button>

            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
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

        {/* CONTENT */}
        <section className="flex-1">
          <h1 className="text-3xl font-bold mb-3">Jadwal Perkuliahan</h1>

          {/* TABLE */}
          <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-xl shadow-md overflow-hidden mb-5">
            <div className="bg-[#6BAAAF] text-white px-5 py-3 font-semibold">
              Jadwal Perkuliahan
            </div>
            <div className="overflow-x-auto">
              <table className="w-full bg-white min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-[#6BAAAF]">
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Mata Kuliah
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Kelas
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Tanggal
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Waktu
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Ruangan
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleData.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#f0f9fa]`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {row.mataKuliah}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.kelas}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.tanggal}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.waktu}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.ruangan}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                            Mulai
                          </button>
                          <button className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                            Akhiri
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LAPORAN */}
          <div className="flex items-end gap-3 mb-3">
            <h2 className="text-3xl font-bold">Laporan Akhir</h2>

            <p className="text-sm text-gray-600 mb-1">
              Senin, 16 Maret 2026 - Semester Genap 2025/2026
            </p>
          </div>

          {/* FILTER */}
          <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-lg shadow-md p-3">
            <div className="bg-[#6BAAAF] text-white px-4 py-2 rounded-t">
              Filter Laporan
            </div>

            <div className="grid grid-cols-3 gap-8 px-1 py-5">
              <div>
                <label className="block mb-2 font-semibold">Mata Kuliah</label>

                <input
                  value={filters.mataKuliah}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      mataKuliah: e.target.value,
                    })
                  }
                  className="w-full h-9 border border-[#6BAAAF] rounded px-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Kelas</label>

                <input
                  value={filters.kelas}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      kelas: e.target.value,
                    })
                  }
                  className="w-full h-9 border border-[#6BAAAF] rounded px-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">
                  Tanggal Perkuliahan
                </label>

                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={filters.tanggalAwal}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        tanggalAwal: e.target.value,
                      })
                    }
                    className="w-full h-9 border border-[#6BAAAF] rounded px-3"
                  />

                  <span>-</span>

                  <input
                    type="text"
                    value={filters.tanggalAkhir}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        tanggalAkhir: e.target.value,
                      })
                    }
                    className="w-full h-9 border border-[#6BAAAF] rounded px-3"
                  />
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex gap-4">
              <button className="bg-[#123B5D] text-white px-6 py-2 rounded font-semibold">
                Simpan
              </button>

              <button className="border border-[#123B5D] text-[#123B5D] px-6 py-2 rounded font-semibold bg-white">
                Reset
              </button>

              <button className="bg-[#123B5D] text-white px-6 py-2 rounded font-semibold">
                Export
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
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
