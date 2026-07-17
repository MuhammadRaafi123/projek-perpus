"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal.");
        return;
      }

      sessionStorage.setItem("userData", JSON.stringify(data.user));

      if (data.role === "admin") {
        router.push("/Dashboard-Admin");
      } else {
        router.push("/Homepage");
      }

    } catch (err) {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center relative px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: "url('/library-g207303354_1920.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md border border-yellow-100">

        <div className="text-center mb-6">
          <div className="flex justify-center mb-2 text-4xl">📚</div>
          <h1 className="text-xl sm:text-2xl font-bold text-yellow-800">STARBOOK</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Selamat datang! Silakan masuk untuk mengakses akun perpustakaanmu.
          </p>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Email atau Username
            </label>
            <input
              name="email"
              type="text"
              placeholder="Masukkan email atau username"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Kata Sandi
            </label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi kamu"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-gray-700 rounded-lg border border-gray-300 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-700 hover:bg-yellow-800 text-white font-semibold py-2.5 rounded-lg transition duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Masuk...</>
            ) : "Masuk"}
          </button>
        </form>

        <p className="text-center text-gray-700 mt-6 text-xs sm:text-sm">
          Belum punya akun?{" "}
          <a href="/register-page" className="text-yellow-700 hover:underline font-medium">
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
}