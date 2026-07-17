"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, LogIn, Home } from "lucide-react";

export default function AksesDitolakPage() {
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    
    document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login-page");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border border-red-100">

        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
        <p className="text-gray-500 mb-1">
          Halaman ini hanya bisa diakses oleh{" "}
          <span className="font-semibold text-red-600">Admin</span>.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Akun kamu tidak memiliki izin untuk masuk ke halaman admin.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/Homepage")}
            className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 rounded-xl transition"
          >
            <Home size={18} /> Kembali ke Beranda
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl transition"
          >
            <LogIn size={18} /> Login dengan Akun Lain
          </button>
        </div>
      </div>
    </div>
  );
}