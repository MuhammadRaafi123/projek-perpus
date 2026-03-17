"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Library, Zap, BookOpen, Heart, Clock, User, Home, Book, History, Trash2} from "lucide-react";

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState([]);

  const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";

  // Load data dari localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("riwayat");
      if (saved) {
        setRiwayat(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Gagal memuat riwayat:", err);
    }
  }, []);

  // Hapus riwayat berdasarkan bookId
  const hapusRiwayat = (id) => {
    const filtered = riwayat.filter((item) => item.bookId !== id);
    setRiwayat(filtered);
    localStorage.setItem("riwayat", JSON.stringify(filtered));
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-gray-700 to-gray-800 text-white fixed h-full shadow-2xl">
        <div className="p-6 border-b border-gray-600">
          <h1 className="text-3xl font-bold text-yellow-400">STARBOOK</h1>
        </div>

        <nav className="flex-1 py-6 space-y-2">
          <Link
            href="/Homepage"
            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700"
          >
            <Home size={22} /> Beranda
          </Link>

          <Link
            href="/koleksi-buku"
            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700"
          >
            <Book size={22} /> Koleksi Buku
          </Link>

          <Link
            href="/peminjaman"
            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700"
          >
            <History size={22} /> Peminjaman
          </Link>

          <Link
            href="/wishlist"
            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700"
          >
            <Heart size={22} /> Wishlist
          </Link>

          <Link
            href="/riwayat"
            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700"
          >
            <Clock size={22} /> Riwayat
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700"
          >
            <User size={22} /> Profil
          </Link>
        </nav>

        <div className="p-6 border-t border-gray-600 text-sm text-gray-400">
          © 2025 StarBook
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-64 p-10 w-full">

        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-l-4 border-yellow-500">
          <h1 className="text-3xl font-bold text-gray-700">Riwayat Peminjaman</h1>
          <p className="text-gray-600 mt-1">Daftar buku yang pernah kamu pinjam.</p>
        </div>

        {/* JIKA KOSONG */}
        {riwayat.length === 0 && (
          <div className="text-center mt-20">
            <History className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600">Riwayat Kosong</h3>
            <p className="text-gray-500 mt-2">Belum ada buku yang kamu pinjam.</p>

            <Link
              href="/koleksi-buku"
              className="inline-block mt-6 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold"
            >
              Pinjam Buku
            </Link>
          </div>
        )}

        {/* LIST RIWAYAT */}
        {riwayat.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-5 text-gray-700 border-l-4 border-yellow-500 pl-3">
              Riwayat Peminjaman Buku
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {riwayat.map((item) => (
                <div
                  key={item.bookId}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition border border-gray-200 relative"
                >

                  {/* Tombol Hapus */}
                  <button
                    onClick={() => hapusRiwayat(item.bookId)}
                    className="absolute top-3 right-3"
                  >
                    <Trash2 className="text-red-500 hover:text-red-700" size={22} />
                  </button>

                  <img
                    src={item.cover || fallbackImage}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded mb-3"
                  />

                  <h4 className="font-semibold text-lg text-gray-700">{item.title}</h4>
                  <p className="text-gray-500 text-sm">{item.author}</p>

                  <div className="mt-3 text-sm text-gray-700">
                    <p><strong>Peminjam:</strong> {item.user}</p>
                    <p className="flex items-center gap-1 mt-1">
                      <Clock size={16} /> {item.durasi}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(item.date).toLocaleString()}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
