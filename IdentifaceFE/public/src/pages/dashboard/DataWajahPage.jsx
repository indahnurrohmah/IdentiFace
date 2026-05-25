import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { LuUsers, LuUserRoundCheck, LuUserRoundX, LuScanFace } from "react-icons/lu";
import { FiRefreshCw, FiCameraOff, FiCamera } from "react-icons/fi";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include", // WAJIB untuk mengirim HTTP-Only Cookie
  });

  if (res.status === 401) {
    localStorage.removeItem("user");
    window.location.href = "/";
    return null;
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Request gagal.");
  return json; // Mengembalikan full json agar bisa membaca message
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function DataWajahPage() {
  const navigate = useNavigate();
  
  // Ambil profil admin dari localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ── State ──────────────────────────────────────────────────────────────
  const [dataWajah, setDataWajah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  // State Filter
  const [search, setSearch] = useState("");
  const [filterProdi, setFilterProdi] = useState("Semua Prodi");

  // State Modal & Kamera
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ── Fetch Data ─────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Memanggil endpoint backend dengan parameter query opsional
      // Catatan: Pastikan backend support query parameter ini
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (filterProdi !== "Semua Prodi") queryParams.append("prodi", filterProdi);

      const response = await apiFetch(`/admin/students?${queryParams.toString()}`);
      setDataWajah(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, filterProdi]);

  useEffect(() => {
    // Delay fetch saat mengetik pencarian (Debounce manual sederhana)
    const timeout = setTimeout(() => fetchStudents(), 500);
    return () => clearTimeout(timeout);
  }, [fetchStudents]);

  // ── Logic Kamera & Modal ────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraOn(true);
      setScanStep(1);
    } catch (error) {
      alert("Kamera tidak bisa dibuka. Pastikan izin kamera pada browser sudah diberikan.");
      console.error(error);
    }
  };

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
    setIsSaving(false);
  };

  const openModal = (userRow) => {
    setSelectedRow(userRow);
    setSelectedFile(null);
    setScanStep(0);
    setCameraOn(false);
    setIsModalOpen(true);
  };

  // Fungsi untuk menangkap frame dari Video (Kamera) menjadi Blob/File
  const captureImageFromVideo = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(new File([blob], "capture.jpg", { type: "image/jpeg" }));
        }, "image/jpeg");
      });
    }
    return null;
  };

  const handleSaveFaceData = async () => {
    let fileToUpload = selectedFile;

    // Jika sedang menggunakan kamera, ambil gambar dari frame video saat ini
    if (cameraOn && !fileToUpload) {
      fileToUpload = await captureImageFromVideo();
    }

    if (!fileToUpload) {
      alert("Silakan buka kamera atau upload foto terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    setScanStep(2); // Step Mapping / Proses AI

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);

      // Mengirim POST ke controller admin: registerFaceData
      const response = await fetch(`${API_BASE}/admin/face-data/${selectedRow.nim}/register`, {
        method: "POST",
        credentials: "include",
        body: formData, // Browser otomatis set Content-Type ke multipart/form-data
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Gagal mendaftarkan wajah.");
      }

      setScanStep(3); // Step Selesai
      setToast(`Wajah ${selectedRow.nama_lengkap || selectedRow.nama} berhasil didaftarkan!`);
      
      setTimeout(() => {
        setToast(null);
        closeModal();
        fetchStudents(); // Refresh tabel setelah sukses
      }, 2000);

    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
      setScanStep(1); // Kembali ke step sebelumnya jika gagal
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {}
    localStorage.removeItem("user");
    navigate("/");
  };

  // ── Perhitungan Statistik ─────────────────────────────────────────────
  // Asumsi atribut backend: `is_registered` atau `face_registered`
  const totalData = dataWajah.length;
  const registeredCount = dataWajah.filter(d => d.is_registered === true || d.status_wajah === "Terdaftar").length;
  const unregisteredCount = totalData - registeredCount;

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF] relative">
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-5">
        <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{user?.nama || "Administrator"}</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D] bg-[#6BAAAF] flex items-center justify-center text-white font-bold text-lg">
            {user?.nama ? user.nama.charAt(0).toUpperCase() : "A"}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 px-10 pb-10 flex gap-8">
        {/* SIDEBAR */}
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
              Data Wajah
            </button>
          </nav>
          <button
            onClick={handleLogout}
            className="mt-auto w-full h-10 rounded bg-[#B82410] text-white font-semibold hover:bg-[#9a1d0d] transition-colors"
          >
            Keluar
          </button>
        </aside>

        {/* CONTENT */}
        <section className="flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-3xl font-bold">Data Wajah</h1>
              <p className="text-sm text-gray-600">
                Kelola data face recognition mahasiswa
              </p>
            </div>
            <button
              onClick={() => fetchStudents(true)}
              disabled={refreshing || loading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all
                ${refreshing || loading ? "bg-[#123B5D]/60 cursor-not-allowed" : "bg-[#123B5D] hover:bg-[#0d2a3f] hover:shadow-md active:scale-95"}`}
            >
              <FiRefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Memperbarui..." : "Refresh"}
            </button>
          </div>

          {/* Statistik Box */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            {[
              { value: loading ? "-" : totalData, label: "Total Data", icon: <LuUsers size={64} /> },
              { value: loading ? "-" : registeredCount, label: "Terdaftar", icon: <LuUserRoundCheck size={64} /> },
              { value: loading ? "-" : unregisteredCount, label: "Belum Terdaftar", icon: <LuUserRoundX size={64} /> },
            ].map(({ value, label, icon }) => (
              <div key={label} className="bg-[#6BAAAF] rounded-2xl shadow-md px-6 py-4 h-24 relative overflow-hidden">
                <div className="absolute -right-3 -bottom-3 text-white opacity-20">{icon}</div>
                <h2 className="text-3xl font-bold text-white">{value}</h2>
                <p className="text-sm text-white/80">{label}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="bg-[#EFE6D3] border border-[#123B5D] rounded-lg shadow-md p-3 mb-5">
            <div className="grid grid-cols-4 gap-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau NIM..."
                className="h-9 rounded px-3 text-sm border border-[#6BAAAF] focus:outline-none focus:ring-1 focus:ring-[#123B5D]"
              />
              {/* Note: Disembunyikan select lain sementara, karena backend '/students' biasanya fokus ke filter prodi/angkatan */}
              <select 
                value={filterProdi}
                onChange={(e) => setFilterProdi(e.target.value)}
                className="h-9 rounded px-3 text-sm border border-[#6BAAAF] focus:outline-none"
              >
                <option value="Semua Prodi">Semua Prodi</option>
                <option value="Teknologi Informasi">Teknologi Informasi</option>
                <option value="Sistem Informasi">Sistem Informasi</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-xl shadow-md overflow-hidden flex-1">
            <div className="bg-[#6BAAAF] text-white px-5 py-3 font-semibold">
              Daftar Data Wajah
            </div>
            <div className="overflow-x-auto">
              <table className="w-full bg-white min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-[#6BAAAF]">
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">NIM / ID</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Nama</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Prodi</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Status Wajah</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-400">Memuat data...</td>
                    </tr>
                  ) : error ? (
                     <tr>
                      <td colSpan="5" className="text-center py-10 text-red-500">Error: {error}</td>
                    </tr>
                  ) : dataWajah.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-400">Tidak ada data ditemukan.</td>
                    </tr>
                  ) : (
                    dataWajah.map((row, index) => {
                      // Menentukan status terdaftar dari API backend
                      const isRegistered = row.is_registered === true || row.status_wajah === "Terdaftar";
                      
                      return (
                        <tr key={row.nim || index} className={`border-b transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#f0f9fa]`}>
                          <td className="px-4 py-3 text-sm text-gray-600 font-medium">{row.nim}</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-800">{row.nama_lengkap || row.nama}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.prodi || "-"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isRegistered ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                              {isRegistered ? "Terdaftar" : "Belum"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openModal(row)}
                              className="bg-[#123B5D] hover:bg-[#0d2a3f] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                            >
                              {isRegistered ? "Perbarui Wajah" : "Daftarkan Wajah"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Pendaftaran Wajah */}
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

          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
            <div className="modal-card bg-[#EFE6D3] w-full max-w-[540px] rounded-2xl border-2 border-[#123B5D] shadow-2xl p-7">

              {/* Header */}
              <h2 className="text-2xl font-bold text-[#123B5D] mb-0.5">Mendaftarkan Wajah</h2>
              <p className="text-sm font-semibold text-gray-500 mb-5">
                {selectedRow.nama_lengkap || selectedRow.nama} — {selectedRow.nim}
              </p>

              {/* Step indicator */}
              <div className="flex items-center mb-5">
                {["Input", "Deteksi AI", "Selesai"].map((label, i) => {
                  const done = i < scanStep;
                  const active = i === scanStep;
                  return (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                          ${done ? "bg-[#6BAAAF] text-white" : active ? "bg-[#123B5D] text-white ring-2 ring-[#123B5D] ring-offset-2" : "bg-gray-300 text-gray-500"}`}>
                          {done ? "✓" : i + 1}
                        </div>
                        <span className={`text-[10px] font-semibold mt-1 ${active ? "text-[#123B5D]" : done ? "text-[#6BAAAF]" : "text-gray-500"}`}>
                          {label}
                        </span>
                      </div>
                      {i < 2 && (
                        <div className={`flex-1 h-px mb-4 mx-1 transition-all duration-500 ${done ? "bg-[#6BAAAF]" : "bg-gray-300"}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Camera / preview area */}
              <div className="bg-[#0d1117] rounded-2xl h-64 relative overflow-hidden mb-5 border border-gray-700 shadow-inner">
                {cameraOn ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: "scaleX(-1)" }} // Mirror effect seperti cermin
                    />
                    {isSaving && <div className="scan-line-modal" />}
                    <div className="corner-pulse-modal absolute top-4 left-4 w-9 h-9 border-t-[3px] border-l-[3px] border-[#6BAAAF] rounded-tl-lg" />
                    <div className="corner-pulse-modal absolute top-4 right-4 w-9 h-9 border-t-[3px] border-r-[3px] border-[#6BAAAF] rounded-tr-lg" />
                    <div className="corner-pulse-modal absolute bottom-4 left-4 w-9 h-9 border-b-[3px] border-l-[3px] border-[#6BAAAF] rounded-bl-lg" />
                    <div className="corner-pulse-modal absolute bottom-4 right-4 w-9 h-9 border-b-[3px] border-r-[3px] border-[#6BAAAF] rounded-br-lg" />
                  </>
                ) : selectedFile ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <LuScanFace size={50} className="text-[#6BAAAF] mb-3" />
                    <p className="text-white text-sm font-semibold px-4 text-center">{selectedFile.name}</p>
                    <p className="text-gray-400 text-xs mt-1">Foto siap dikirim ke AI</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-3 ring-4 ring-gray-700">
                      <FiCameraOff size={30} className="text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-sm">Kamera tidak aktif</p>
                    <p className="text-gray-600 text-xs mt-1">Pilih metode di bawah</p>
                  </div>
                )}

                {/* Overlay Loading saat AI Memproses */}
                {isSaving && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 backdrop-blur-[2px]">
                     <FiRefreshCw size={36} className="text-white animate-spin mb-3" />
                     <p className="text-white font-bold tracking-widest text-sm">MEMPROSES AI...</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <label className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold text-sm text-[#123B5D] border-2 border-[#123B5D] cursor-pointer transition-colors hover:bg-[#123B5D] hover:text-white ${isSaving ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                  <FiCamera size={16} /> Upload File Foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isSaving}
                    onChange={(e) => {
                      setSelectedFile(e.target.files[0]);
                      stopCamera();
                      setScanStep(1);
                    }}
                  />
                </label>

                <button
                  disabled={isSaving}
                  onClick={cameraOn ? stopCamera : startCamera}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold text-sm transition-colors border-2 border-[#123B5D] ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                    ${cameraOn
                      ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
                      : "bg-[#123B5D] text-white hover:bg-[#0d2a3f]"
                    }`}
                >
                  {cameraOn ? <FiCameraOff size={16} /> : <FiCamera size={16} />}
                  {cameraOn ? "Tutup Kamera" : "Gunakan Kamera"}
                </button>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-300">
                <button
                  disabled={isSaving}
                  onClick={closeModal}
                  className="px-6 py-2 rounded-lg border border-gray-400 bg-white text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  disabled={isSaving || (!cameraOn && !selectedFile)}
                  onClick={handleSaveFaceData}
                  className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Menyimpan..." : "Daftarkan Sekarang"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* FOOTER */}
      <footer className="bg-[#74B5BD] py-5 text-center mt-auto">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img src={logo} alt="IdentiFace Logo" className="w-24 h-auto object-contain" />
        </div>
        <p className="font-semibold text-[#123B5D]">Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  );
}