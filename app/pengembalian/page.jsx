"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  UserSquare2,
  Notebook,
  Undo2,
  Library,
  RotateCcw,
  Trash2
} from "lucide-react";

export default function KelolaPengembalian() {
  const [pengembalian, setPengembalian] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadPengembalian();
  }, []);

  const loadPengembalian = () => {
    const saved = localStorage.getItem("pengembalian");
    if (saved) setPengembalian(JSON.parse(saved));
  };

  const handleHapus = (id) => {
    if (!confirm("Hapus data pengembalian ini?")) return;

    const saved = localStorage.getItem("pengembalian");
    if (saved) {
      const list = JSON.parse(saved).filter((item) => item.id !== id);
      localStorage.setItem("pengembalian", JSON.stringify(list));
      setPengembalian(list);
    }
  };

  const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";

  return (
    <div className="flex min-h-screen bg-gray-100">

      <aside className="w-64 bg-yellow-800 text-white flex flex-col p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-10">
          <Library className="w-8 h-8 text-yellow-300" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>

        <nav className="flex flex-col space-y-4">
          <button
            onClick={() => router.push("/Dashboard-Admin")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => router.push("/kelola-buku")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700"
          >
            <BookOpen size={20} />
            Kelola Buku
          </button>

          <button
            onClick={() => router.push("/kelola-peminjaman")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700"
          >
            <Notebook size={20} />
            Peminjaman
          </button>

          <button
            onClick={() => router.push("/kelola-pengembalian")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-700"
          >
            <Undo2 size={20} />
            Pengembalian
          </button>

          <button
            onClick={() => router.push("/profile-admin")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700"
          >
            <UserSquare2 size={20} />
            Profile
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-10">

        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-l-4 border-yellow-500">
          <h1 className="text-3xl font-bold text-gray-700">Kelola Pengembalian</h1>
          <p className="text-gray-600 mt-1">
            Daftar buku yang sudah dikembalikan pengguna.
          </p>
        </div>

        {pengembalian.length === 0 ? (
          <div className="text-center mt-24">
            <RotateCcw className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600">Belum Ada Pengembalian</h3>
            <p className="text-gray-500">Belum ada buku yang dikembalikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pengembalian.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
              >
                <img
                  src={item.cover || fallbackImage}
                  className="w-full h-56 object-cover"
                />

                <div className="p-5">
                  <h4 className="font-bold text-lg text-gray-800">
                    {item.title}
                  </h4>

                  <p className="text-gray-600 text-sm mb-3">
                    {item.author}
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg text-sm border border-gray-200">
                    <p className="mb-1">
                      <span className="font-semibold text-gray-700">Nama Peminjam:</span>{" "}
                      <span className="text-gray-800">{item.user}</span>
                    </p>

                    <p className="mb-1">
                      <span className="font-semibold text-gray-700">Tanggal Peminjaman:</span>{" "}
                      <span className="text-gray-800">{item.tanggalPinjam}</span>
                    </p>

                    <p>
                      <span className="font-semibold text-gray-700">Tanggal Pengembalian:</span>{" "}
                      <span className="text-gray-800">{item.tanggalDikembalikan}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleHapus(item.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  <Trash2 size={18} /> Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
