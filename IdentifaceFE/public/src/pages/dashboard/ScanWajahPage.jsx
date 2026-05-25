import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Webcam from "react-webcam";
import logo from "../../assets/logo.png";
import { FiCameraOff } from "react-icons/fi";
import { FaUserCheck } from "react-icons/fa";
import { LuScanFace } from "react-icons/lu";
import { RiCameraAiFill } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ScanWajahPage() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  // status: 'idle' | 'scanning' | 'processing' | 'success' | 'failed'
  const [status, setStatus] = useState("idle");
  const [searchParams] = useSearchParams();
  const id_sesi = searchParams.get("sesi");

  const [profile, setProfile] = useState(null);
  const [coords, setCoords] = useState(null);
  const [scanMessage, setScanMessage] = useState("");

  useEffect(() => {
    // Fetch profil mahasiswa
    fetch(`${API_BASE}/student/profile`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProfile(json.data);
      })
      .catch(() => {});

    // Ambil GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => setCoords({ latitude: 0, longitude: 0 }), // fallback jika ditolak
      );
    }
  }, []);

  const startScan = () => setStatus("scanning");
  const stopScan = () => setStatus("idle");

  const captureAndProcess = useCallback(async () => {
    if (!webcamRef.current) return;

    setStatus("processing");
    setScanMessage("");

    try {
      // 1. Ambil screenshot dari webcam sebagai base64, lalu convert ke Blob
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error("Gagal mengambil gambar dari kamera.");

      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], "scan.jpg", { type: "image/jpeg" });

      // 2. Siapkan FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("latitude", coords?.latitude ?? 0);
      formData.append("longitude", coords?.longitude ?? 0);
      if (id_sesi) formData.append("id_sesi", id_sesi);

      // 3. Kirim ke BE
      const response = await fetch(`${API_BASE}/student/attendance/scan`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await response.json();

      if (json.success) {
        setScanMessage("Kehadiran kamu tercatat. Terima kasih!");
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3500);
      } else {
        setScanMessage(json.message || "Wajah tidak dikenali.");
        setStatus("failed");
      }
    } catch (err) {
      setScanMessage(err.message || "Terjadi kesalahan koneksi.");
      setStatus("failed");
    }
  }, [coords, id_sesi]);

  const steps = ["Kamera", "Scanning", "Proses", "Selesai"];
  const stepIndex = {
    idle: 0,
    scanning: 1,
    processing: 2,
    success: 3,
    failed: 2,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      <style>{`
        @keyframes scanLine {
          0%   { top: 8%;  opacity: 1; }
          50%  { opacity: 0.6; }
          100% { top: 88%; opacity: 1; }
        }
        @keyframes cornerPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
        @keyframes fadeInScale {
          0%   { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pingRing {
          0%   { transform: scale(1);   opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #6BAAAF, #ffffff, #6BAAAF, transparent);
          box-shadow: 0 0 10px #6BAAAF, 0 0 24px rgba(107,170,175,0.6);
          animation: scanLine 1.8s ease-in-out infinite alternate;
        }
        .corner-pulse { animation: cornerPulse 1.4s ease-in-out infinite; }
        .result-appear { animation: fadeInScale 0.35s ease-out forwards; }
        .ping-ring {
          position: absolute; inset: 0;
          border-radius: 9999px;
          border: 2px solid #4ade80;
          animation: pingRing 1.4s ease-out infinite;
        }
        .step-shimmer {
          background: linear-gradient(90deg, #6BAAAF 0%, #ffffff 50%, #6BAAAF 100%);
          background-size: 200% auto;
          animation: shimmer 1.5s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5">
        <img
          src={logo}
          alt="IdentiFace Logo"
          className="w-40 h-auto object-contain"
        />
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {profile?.nama_lengkap || "Mahasiswa"}
          </h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D]" />
        </div>
      </header>

      <main className="flex-1 px-10 pb-10 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6">Menu Mahasiswa</h2>
          <nav className="space-y-3">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Dashboard
            </button>
            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold">
              Scan Wajah
            </button>
            <button
              onClick={() => navigate("/student/riwayat")}
              className="w-full h-10 rounded border border-white text-black font-semibold"
            >
              Riwayat Presensi
            </button>
          </nav>
          <button
            onClick={() => navigate("/")}
            className="mt-auto w-full h-10 rounded bg-[#B82410] text-white font-semibold"
          >
            Keluar
          </button>
        </aside>

        {/* Main content */}
        <section className="flex-1 flex justify-center items-center">
          <div className="w-[540px] border border-[#123B5D] rounded-2xl bg-[#EFE6D3] px-8 py-7 shadow-lg">
            {/* Title */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold">Scan Wajah</h1>
              <p className="text-sm text-gray-600">
                {profile?.nama_lengkap || "..."} — {profile?.nim || "..."}
                {!id_sesi && (
                  <span className="ml-2 text-red-500 font-semibold">
                    (Tidak ada sesi aktif)
                  </span>
                )}
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center mb-5 px-1">
              {steps.map((label, i) => {
                const current = stepIndex[status];
                const done = i < current;
                const active = i === current;
                return (
                  <div
                    key={label}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                        transition-all duration-500
                        ${done ? "bg-[#6BAAAF] text-white" : ""}
                        ${active ? "bg-[#123B5D] text-white ring-2 ring-[#123B5D] ring-offset-2" : ""}
                        ${!done && !active ? "bg-gray-300 text-gray-500" : ""}
                      `}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      <span
                        className={`text-[10px] font-semibold mt-1
                        ${active ? "text-[#123B5D]" : done ? "text-[#6BAAAF]" : "text-gray-400"}
                      `}
                      >
                        {label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`flex-1 h-px mb-4 mx-1 transition-all duration-500
                        ${done ? "bg-[#6BAAAF]" : "bg-gray-300"}
                      `}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Camera box */}
            <div className="relative bg-[#0d1117] rounded-2xl overflow-hidden h-64 mb-5 shadow-inner">
              {/* Webcam feed */}
              {(status === "scanning" || status === "processing") && (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="w-full h-full object-cover"
                />
              )}

              {/* IDLE */}
              {status === "idle" && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-5xl mb-3 ring-4 ring-gray-700">
                    <FiCameraOff size={40} className="text-gray-500" />
                  </div>
                  <p className="text-gray-500 text-sm tracking-wide">
                    Kamera belum aktif
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Tekan "Mulai Scan" untuk memulai
                  </p>
                </div>
              )}

              {/* SCANNING overlay */}
              {status === "scanning" && (
                <div className="absolute inset-0">
                  <div className="scan-line" />
                  <div className="corner-pulse absolute top-4 left-4 w-10 h-10 border-t-[3px] border-l-[3px] border-[#6BAAAF] rounded-tl-lg" />
                  <div className="corner-pulse absolute top-4 right-4 w-10 h-10 border-t-[3px] border-r-[3px] border-[#6BAAAF] rounded-tr-lg" />
                  <div className="corner-pulse absolute bottom-4 left-4 w-10 h-10 border-b-[3px] border-l-[3px] border-[#6BAAAF] rounded-bl-lg" />
                  <div className="corner-pulse absolute bottom-4 right-4 w-10 h-10 border-b-[3px] border-r-[3px] border-[#6BAAAF] rounded-br-lg" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-2 text-center">
                    <p className="step-shimmer text-xs font-bold tracking-[0.3em]">
                      SCANNING WAJAH...
                    </p>
                  </div>
                </div>
              )}

              {/* PROCESSING overlay */}
              {status === "processing" && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center result-appear">
                  <div className="relative w-14 h-14 mb-4">
                    <div className="w-14 h-14 rounded-full border-4 border-[#6BAAAF] border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-xl"></div>
                  </div>
                  <p className="text-white font-semibold text-sm tracking-wide">
                    Memproses wajah...
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Mohon tunggu sebentar
                  </p>
                </div>
              )}

              {status === "success" && (
                <div className="absolute inset-0 bg-green-950/85 flex flex-col items-center justify-center result-appear">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="ping-ring" />
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-3xl font-bold text-white relative z-10">
                      <FaUserCheck size={28} />
                    </div>
                  </div>
                  <p className="text-white font-bold text-lg">
                    Presensi Berhasil!
                  </p>
                  <p className="text-green-300 text-sm mt-1">
                    {profile?.nama_lengkap || ""}
                  </p>
                  <p className="text-green-400 text-xs mt-0.5">
                    {new Date().toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    WIB
                  </p>
                </div>
              )}

              {/* FAILED overlay */}
              {/* FAILED overlay */}
              {/* FAILED overlay */}
              {status === "failed" && (
                <div className="absolute inset-0 bg-red-950/85 flex flex-col items-center justify-center result-appear">
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-3xl font-bold text-white mb-4">
                    <RxCross2 size={28} />
                  </div>
                  <p className="text-white font-bold text-lg">
                    {scanMessage?.toLowerCase().includes("jauh") ||
                    scanMessage?.toLowerCase().includes("lokasi")
                      ? "Di Luar Jangkauan"
                      : "Wajah Tidak Dikenali"}
                  </p>
                  <p className="text-red-300 text-sm mt-1 text-center px-4">
                    {scanMessage || "Pastikan wajah terlihat jelas"}
                  </p>
                </div>
              )}
            </div>

            {/* Info text */}
            <p className="text-center text-xs text-gray-500 mb-4 min-h-[16px]">
              {status === "idle" &&
                "Posisikan wajah di depan kamera, lalu tekan Mulai Scan"}
              {status === "scanning" &&
                'Wajah terdeteksi — tekan "Ambil & Proses" jika posisi sudah pas'}
              {status === "processing" &&
                "Sistem sedang mencocokkan wajah dengan database..."}
              {status === "success" &&
                (scanMessage || "Kehadiran kamu tercatat. Terima kasih!")}
              {status === "failed" &&
                (scanMessage ||
                  "Wajah tidak cocok. Hubungi admin jika ada masalah.")}
            </p>

            {/* Action buttons */}
            <div className="flex gap-3">
              {status === "idle" && (
                <button
                  onClick={startScan}
                  className="flex-1 h-12 bg-[#123B5D] text-white rounded-xl font-semibold text-sm hover:bg-[#0d2a3f] transition-colors flex items-center justify-center gap-2"
                >
                  <LuScanFace size={18} className="text-[#6BAAAF]" /> Mulai Scan
                </button>
              )}

              {status === "scanning" && (
                <>
                  <button
                    onClick={captureAndProcess}
                    className="flex-1 h-12 bg-[#6BAAAF] text-white rounded-xl font-semibold text-sm hover:bg-[#5a9499] transition-colors flex items-center justify-center gap-2"
                  >
                    <RiCameraAiFill size={18} /> Ambil &amp; Proses
                  </button>
                  <button
                    onClick={stopScan}
                    className="h-12 px-5 border border-[#123B5D] bg-white rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                </>
              )}

              {status === "processing" && (
                <button
                  disabled
                  className="flex-1 h-12 bg-gray-200 text-gray-400 rounded-xl font-semibold text-sm cursor-not-allowed"
                >
                  Memproses...
                </button>
              )}

              {(status === "success" || status === "failed") && (
                <>
                  <button
                    onClick={stopScan}
                    className="flex-1 h-12 bg-[#123B5D] text-white rounded-xl font-semibold text-sm hover:bg-[#0d2a3f] transition-colors"
                  >
                    Scan Lagi
                  </button>
                  <button
                    onClick={() => navigate("/student/riwayat")}
                    className="h-12 px-5 border border-[#123B5D] bg-white rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Lihat Riwayat
                  </button>
                </>
              )}
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
