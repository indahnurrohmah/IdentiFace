import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { LuUsers, LuUserRoundCheck, LuUserRoundX, LuScanFace } from "react-icons/lu";
import { FiRefreshCw, FiCameraOff, FiCamera } from "react-icons/fi";

export default function DataWajahPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const dataWajahTable = [
    [
      "Hamba Allah",
      "29/123456/TK/12345",
      "Teknologi Informasi",
      "Mahasiswa",
      "Terdaftar",
      "2024-12-01",
    ],
    [
      "Hamba Allah",
      "29/123456/TK/12345",
      "Teknologi Informasi",
      "Mahasiswa",
      "Belum",
      "2024-12-01",
    ],
    [
      "Hamba Allah",
      "29/123456/TK/12345",
      "Teknologi Informasi",
      "Dosen",
      "Terdaftar",
      "2024-12-01",
    ],
  ];

  const statusClass = {
    Terdaftar: "bg-green-300",
    Belum: "bg-red-300",
  };

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraOn(true);
      setScanStep(1);
    } catch (error) {
      alert("Kamera tidak bisa dibuka. Pastikan izin kamera sudah diberikan.");
      console.error(error);
    }
  };

  // Assign stream ke video element SETELAH dia muncul di DOM
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const closeModal = () => {
    stopCamera();
    setIsModalOpen(false);
    setSelectedRow(null);
    setSelectedFile(null);
    setScanStep(0);
  };

  const openModal = (row) => {
    setSelectedRow(row);
    setSelectedFile(null);
    setScanStep(0);
    setCameraOn(false);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      <header className="flex items-center justify-between px-10 py-5">
        <img
          src={logo}
          alt="IdentiFace Logo"
          className="w-40 h-auto object-contain"
        />

        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Username</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D]" />
        </div>
      </header>

      <main className="flex-1 px-10 pb-10 flex gap-8">
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Admin</h2>

          <nav className="space-y-3">
            <button
              onClick={() => navigate("/admin/presensi")}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Laporan Presensi
            </button>

            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
              Daftar Wajah
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
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-3xl font-bold">Data Wajah</h1>
              <p className="text-sm text-gray-600">
                Kelola data face recognition mahasiswa & dosen
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

          <div className="grid grid-cols-3 gap-5 mb-5">
            {[
              { value: "3", label: "Total Data", icon: <LuUsers size={64} /> },
              {
                value: "2",
                label: "Terdaftar",
                icon: <LuUserRoundCheck size={64} />,
              },
              {
                value: "1",
                label: "Belum Terdaftar",
                icon: <LuUserRoundX size={64} />,
              },
            ].map(({ value, label, icon }) => (
              <div
                key={label}
                className="bg-[#6BAAAF] rounded-2xl shadow-md px-6 py-4 h-24 relative overflow-hidden"
              >
                <div className="absolute -right-3 -bottom-3 text-white opacity-20">
                  {icon}
                </div>
                <h2 className="text-3xl font-bold text-white">{value}</h2>
                <p className="text-sm text-white/80">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#EFE6D3] border border-[#123B5D] rounded-lg shadow-md p-3 mb-5">
            <div className="grid grid-cols-4 gap-4">
              <input
                placeholder="Cari nama atau NIM..."
                className="h-8 rounded px-3 text-sm border border-[#6BAAAF]"
              />

              <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]">
                <option>Semua Peran</option>
                <option>Mahasiswa</option>
                <option>Dosen</option>
              </select>

              <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]">
                <option>Semua Prodi</option>
              </select>

              <select className="h-8 rounded px-3 text-sm border border-[#6BAAAF]">
                <option>Semua Status</option>
                <option>Terdaftar</option>
                <option>Belum Terdaftar</option>
              </select>
            </div>
          </div>

          <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-xl shadow-md overflow-hidden">
            <div className="bg-[#6BAAAF] text-white px-5 py-3 font-semibold">
              Daftar Data Wajah
            </div>
            <div className="overflow-x-auto">
              <table className="w-full bg-white min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-[#6BAAAF]">
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Nama
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      NIM
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Prodi
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Peran
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Update Terakhir
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataWajahTable.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#f0f9fa]`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {row[0]}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row[1]}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row[2]}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-full border border-[#6BAAAF] text-xs text-gray-600">
                          {row[3]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`${statusClass[row[4]]} px-3 py-1 rounded-full text-xs font-semibold`}
                        >
                          {row[4]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row[5]}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(row)}
                            className="bg-[#123B5D] hover:bg-[#0d2a3f] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Update
                          </button>
                          <button className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                            Hapus
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

      {isModalOpen && selectedRow && (
        <>
          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.93) translateY(16px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes scanLine {
              0%   { top: 8%;  opacity: 1; }
              50%  { opacity: 0.5; }
              100% { top: 88%; opacity: 1; }
            }
            @keyframes cornerPulse {
              0%, 100% { opacity: 1; }
              50%       { opacity: 0.3; }
            }
            .modal-card { animation: modalIn 0.3s ease-out forwards; }
            .scan-line-modal {
              position: absolute; left: 0; right: 0; height: 2px;
              background: linear-gradient(90deg, transparent, #6BAAAF, #fff, #6BAAAF, transparent);
              box-shadow: 0 0 10px #6BAAAF;
              animation: scanLine 1.8s ease-in-out infinite alternate;
            }
            .corner-pulse-modal { animation: cornerPulse 1.4s ease-in-out infinite; }
          `}</style>

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="modal-card bg-[#EFE6D3] w-full max-w-[540px] rounded-2xl border border-[#123B5D] shadow-2xl p-7">

              {/* Header */}
              <h2 className="text-2xl font-bold text-[#123B5D] mb-0.5">Update Data Wajah</h2>
              <p className="text-sm font-semibold text-gray-500 mb-5">
                {selectedRow[0]} — {selectedRow[1]}
              </p>

              {/* Step indicator */}
              {(() => {
                const steps = ["Input", "Deteksi", "Mapping", "Selesai"];
                return (
                  <div className="flex items-center mb-5">
                    {steps.map((label, i) => {
                      const done = i < scanStep;
                      const active = i === scanStep;
                      return (
                        <div key={label} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                              ${done ? "bg-[#6BAAAF] text-white" : active ? "bg-[#123B5D] text-white ring-2 ring-[#123B5D] ring-offset-2" : "bg-gray-200 text-gray-400"}`}>
                              {done ? "✓" : i + 1}
                            </div>
                            <span className={`text-[10px] font-semibold mt-1
                              ${active ? "text-[#123B5D]" : done ? "text-[#6BAAAF]" : "text-gray-400"}`}>
                              {label}
                            </span>
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`flex-1 h-px mb-4 mx-1 transition-all duration-500 ${done ? "bg-[#6BAAAF]" : "bg-gray-300"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Camera / preview area */}
              <div className="bg-[#0d1117] rounded-2xl h-56 relative overflow-hidden mb-4">
                {cameraOn ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Scan line */}
                    <div className="scan-line-modal" />
                    {/* Corner brackets */}
                    <div className="corner-pulse-modal absolute top-4 left-4 w-9 h-9 border-t-[3px] border-l-[3px] border-[#6BAAAF] rounded-tl-lg" />
                    <div className="corner-pulse-modal absolute top-4 right-4 w-9 h-9 border-t-[3px] border-r-[3px] border-[#6BAAAF] rounded-tr-lg" />
                    <div className="corner-pulse-modal absolute bottom-4 left-4 w-9 h-9 border-b-[3px] border-l-[3px] border-[#6BAAAF] rounded-bl-lg" />
                    <div className="corner-pulse-modal absolute bottom-4 right-4 w-9 h-9 border-b-[3px] border-r-[3px] border-[#6BAAAF] rounded-br-lg" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1.5 text-center">
                      <p className="text-[#6BAAAF] text-xs font-bold tracking-widest">SCANNING WAJAH...</p>
                    </div>
                  </>
                ) : selectedFile ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <LuScanFace size={44} className="text-[#6BAAAF] mb-2" />
                    <p className="text-white text-sm font-semibold">{selectedFile.name}</p>
                    <p className="text-gray-400 text-xs mt-1">Foto siap diproses</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-3 ring-4 ring-gray-700">
                      <FiCameraOff size={30} className="text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-sm">Kamera belum aktif</p>
                    <p className="text-gray-600 text-xs mt-1">Upload foto atau buka kamera</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <label className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg py-2.5 font-semibold text-sm text-white cursor-pointer transition-colors">
                  <FiCamera size={16} /> Upload Foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      setSelectedFile(e.target.files[0]);
                      stopCamera();
                      setScanStep(1);
                    }}
                  />
                </label>

                <button
                  onClick={cameraOn ? stopCamera : startCamera}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold text-sm transition-colors
                    ${cameraOn
                      ? "bg-red-100 hover:bg-red-200 text-red-700"
                      : "bg-[#6BAAAF] hover:bg-[#5a9499] text-white"
                    }`}
                >
                  {cameraOn ? <FiCameraOff size={16} /> : <FiCamera size={16} />}
                  {cameraOn ? "Tutup Kamera" : "Buka Kamera"}
                </button>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg bg-[#123B5D] hover:bg-[#0d2a3f] text-white text-sm font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <footer className="bg-[#74B5BD] py-5 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img
            src={logo}
            alt="IdentiFace Logo"
            className="w-24 h-auto object-contain"
          />
        </div>
        <p className="font-semibold">Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  );
}
