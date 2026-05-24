import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import { FiUser, FiLock, FiChevronDown } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state?.role || "dosen";

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: initialRole,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (form.role === "admin") {
        navigate("/admin/presensi");
      } else if (form.role === "mahasiswa") {
        navigate("/student/dashboard");
      } else {
        navigate("/dosen/dashboard");
      }
    }, 1000);
  };

  const handleGoogleSignIn = () => {
    alert("Google Login");
  };

  const cardStyle = {
    animation: "slideUp 0.5s ease-out forwards",
  };

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

      .input-icon-wrapper input:focus {
        outline: none;
        border-color: #123B5D;
        box-shadow: 0 0 0 3px rgba(18,59,93,0.15);
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

      <div
        className="w-full max-w-md bg-white rounded-[28px] shadow-xl px-6 py-8 sm:px-10 sm:py-9 relative z-10"
        style={cardStyle}
      >

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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">
              Username
            </label>
            <div className="input-icon-wrapper relative flex items-center">
              <FiUser className="absolute left-3.5 text-gray-400" size={17} />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Masukkan username"
                className="w-full h-12 border border-slate-300 rounded-lg pl-10 pr-4 text-sm transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="input-icon-wrapper relative flex items-center">
              <FiLock className="absolute left-3.5 text-gray-400" size={17} />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                className="w-full h-12 border border-slate-300 rounded-lg pl-10 pr-4 text-sm transition-all"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">
              Masuk Sebagai
            </label>
            <div className="relative flex items-center">
              <FiChevronDown
                className="absolute right-3.5 text-gray-400 pointer-events-none"
                size={17}
              />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full h-12 border border-slate-300 rounded-lg px-4 bg-white text-sm appearance-none transition-all focus:outline-none focus:border-[#123B5D] focus:ring-2 focus:ring-[#123B5D]/20"
              >
                <option value="dosen">Dosen</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <a
              href="#"
              className="text-xs text-[#123B5D] underline hover:text-[#0d2a3f]"
            >
              Lupa Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-btn w-full h-12 bg-[#123B5D] text-white rounded-lg font-semibold text-sm"
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
                Loading...
              </span>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">Atau</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full h-12 border border-gray-200 rounded-lg flex items-center justify-center gap-3 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          <span className="text-lg font-bold text-red-500">G</span>
          Masuk dengan Google
        </button>

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
