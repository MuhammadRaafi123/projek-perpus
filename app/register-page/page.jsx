"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok!");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan!");
        setLoading(false);
        return;
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      router.push("/login-page");

    } catch (err) {
      setError("Gagal terhubung ke server.");
    }

    setLoading(false);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/library-g207303354_1920.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-[90%] max-w-md border border-yellow-100">

        <div className="text-center mb-6">
          <div className="flex justify-center mb-2 text-4xl">📚</div>
          <h1 className="text-2xl font-bold text-yellow-800">
            Daftar Akun Perpustakaan
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Buat akunmu untuk mengakses sistem perpustakaan.
          </p>
        </div>

        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Masukkan username"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Masukkan email kamu"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-2">
              Kata Sandi
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-2">
              Konfirmasi Kata Sandi
            </label>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Ulangi kata sandi"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black pr-10"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-[42px] text-gray-700"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold py-2 rounded-lg transition
              ${loading ? "bg-gray-400" : "bg-yellow-700 hover:bg-yellow-800"}`}
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p className="text-center text-gray-700 mt-6 text-sm">
          Sudah punya akun?{" "}
          <a href="/login-page" className="text-yellow-700 hover:underline font-medium">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  );
}
