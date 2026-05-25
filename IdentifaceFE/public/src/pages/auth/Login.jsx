import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Role → route mapping
const ROLE_REDIRECT = {
  admin: "/admin/presensi",
  mahasiswa: "/student/dashboard",
  dosen: "/dosen/dashboard",
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state?.role || "dosen";

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: initialRole,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setError(""); // clear error saat user mulai mengetik
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic client-side validation
    if (!form.email.trim()) {
      setError("Email tidak boleh kosong.");
      return;
    }
    if (!form.password) {
      setError("Password tidak boleh kosong.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const json = await res.json();

      // Handle error responses dari backend
      if (!res.ok || !json.success) {
        setError(json.message || "Login gagal. Silakan coba lagi.");
        return;
      }

      const { role, email, id_akun } = json.data;

      // Validasi role: pastikan role dari DB sesuai pilihan dropdown
      if (role !== form.role) {
        setError(
          `Akun ini terdaftar sebagai ${
            role === "dosen"
              ? "Dosen"
              : role === "mahasiswa"
                ? "Mahasiswa"
                : "Admin"
          }, bukan ${
            form.role === "dosen"
              ? "Dosen"
              : form.role === "mahasiswa"
                ? "Mahasiswa"
                : "Admin"
          }.`,
        );
        return;
      }

      // 3️⃣ HAPUS penyimpanan token ke localStorage. Kita hanya menyimpan profil user.
      localStorage.setItem("user", JSON.stringify({ email, role, id_akun }));

      // Redirect berdasarkan role dari backend (bukan dari form)
      navigate(ROLE_REDIRECT[role] || "/");
    } catch (err) {
      // Network error / server down
      setError(
        "Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECE7DF] relative overflow-hidden">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBg {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes wobbleBg {
          0%, 100% { transform: translateX(0) scale(1); }
          25%       { transform: translateX(-10px) scale(1.05); }
          75%       { transform: translateX(10px) scale(0.95); }
        }
        .input-field {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #123B5D;
          box-shadow: 0 0 0 3px rgba(18,59,93,0.15);
        }
        .input-field.error-field {
          border-color: #ef4444;
        }
        .login-btn {
          transition: all 0.2s ease;
        }
        .login-btn:hover:not(:disabled) {
          background: #0d2a3f;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(18,59,93,0.3);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>

      {/* Background blobs */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-20 -top-20 -left-20"
        style={{
          background: "#6BAAAF",
          animation: "floatBg 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full opacity-10 -bottom-10 -right-10"
        style={{
          background: "#123B5D",
          animation: "wobbleBg 4s ease-in-out infinite reverse",
        }}
      />

      {/* Card */}
      <div
        className="w-full max-w-md bg-white rounded-[28px] shadow-xl px-6 py-8 sm:px-10 sm:py-9 relative z-10"
        style={{ animation: "slideUp 0.5s ease-out forwards" }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="IdentiFace Logo"
            className="w-44 h-auto object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-[#123B5D] mb-1">
          Selamat Datang
        </h2>
        <p className="text-center text-sm text-gray-400 mb-7">
          Silakan masuk ke akun Anda
        </p>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">
              Email
            </label>
            <div className="relative flex items-center">
              <FiUser
                className="absolute left-3.5 text-gray-400 pointer-events-none"
                size={17}
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@ugm.ac.id"
                autoComplete="email"
                disabled={loading}
                className={`input-field w-full h-12 border border-slate-300 rounded-lg pl-10 pr-4 text-sm ${
                  error && !form.email ? "error-field" : ""
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative flex items-center">
              <FiLock
                className="absolute left-3.5 text-gray-400 pointer-events-none"
                size={17}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                autoComplete="current-password"
                disabled={loading}
                className="input-field w-full h-12 border border-slate-300 rounded-lg pl-10 pr-11 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <a
              href="#"
              className="text-xs text-[#123B5D] underline hover:text-[#0d2a3f] transition-colors"
            >
              Lupa Password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="login-btn w-full h-12 bg-[#123B5D] text-white rounded-lg font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="3"
                    strokeDasharray="60"
                    strokeDashoffset="20"
                  />
                </svg>
                Memverifikasi...
              </span>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-gray-500">
          Belum punya akun?{" "}
          <a
            href="#"
            className="text-[#123B5D] font-semibold underline hover:text-[#0d2a3f]"
          >
            Hubungi Administrator
          </a>
        </p>
      </div>
    </div>
  );
}
