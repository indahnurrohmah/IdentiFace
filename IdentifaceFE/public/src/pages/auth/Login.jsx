import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";

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

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF]">
      <header className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="IdentiFace Logo"
            className="w-40 h-auto object-contain"
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center pb-16">
        <div className="w-full max-w-md bg-white rounded-[28px] shadow-md px-10 py-9">
          <h2 className="text-3xl font-bold text-center mb-10">Login Form</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold">Username</label>

              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full h-12 border border-slate-400 rounded-md px-4"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Password</label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full h-12 border border-slate-400 rounded-md px-4"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Masuk Sebagai</label>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full h-12 border border-slate-400 rounded-md px-4 bg-white"
              >
                <option value="dosen">Dosen</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <a href="#" className="text-sm underline">
              Forgot Password?
            </a>

            <button
              type="submit"
              className="w-full h-12 bg-[#123B5D] text-white rounded-md font-semibold"
            >
              {loading ? "Loading..." : "Masuk"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-400">Atau</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-12 border border-gray-300 rounded-md flex items-center justify-center gap-3 font-medium"
          >
            <span className="text-xl font-bold text-red-500">G</span>
            Masuk dengan Google
          </button>

          <p className="text-center mt-8 text-sm">
            Belum Punya Akun?{" "}
            <a href="#" className="text-blue-600 underline">
              Hubungi Administrator
            </a>
          </p>
        </div>
      </main>

      <footer className="bg-[#74B5BD] py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img
            src={logo}
            alt="IdentiFace Logo"
            className="w-40 h-auto object-contain"
          />
        </div>

        <p className="font-medium">Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  );
}
