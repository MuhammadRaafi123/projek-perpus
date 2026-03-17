"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Clock,
  User,
  Home,
  Book,
  History,
  Trash2,
} from "lucide-react";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [namaPeminjam, setNamaPeminjam] = useState("");
  const [durasi, setDurasi] = useState("1 Minggu");

  const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";

  // ============================
  // LOAD WISHLIST
  // ============================
  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      const parsed = JSON.parse(saved);

      // Pastikan setiap item punya key unik
      const fixed = parsed.map((b, index) => ({
        ...b,
        kode_buku:
          b.kode_buku ||
          b.id ||
          b.isbn ||
          b.title?.replace(/\s+/g, "-").toLowerCase() ||
          "fallback_" + index,
      }));

      setWishlist(fixed);
      localStorage.setItem("wishlist", JSON.stringify(fixed));
    }
  }, []);

  // ============================
  // SAVE WISHLIST
  // ============================
  const saveWishlist = (newList) => {
    setWishlist(newList);
    localStorage.setItem("wishlist", JSON.stringify(newList));
  };

  // ============================
  // KEY GENERATOR
  // ============================
  const getBookKey = (book, index) => {
    return (
      book.kode_buku ||
      book.id ||
      book.isbn ||
      book.title?.replace(/\s+/g, "-").toLowerCase() ||
      `fallback_${index}`
    );
  };

  // ============================
  // REMOVE FROM WISHLIST
  // ============================
  const removeFromWishlist = (key) => {
    const updated = wishlist.filter((b, i) => getBookKey(b, i) !== key);
    saveWishlist(updated);
  };

  // ============================
  // SUBMIT PINJAM
  // ============================
  const submitPinjam = async () => {
    if (!namaPeminjam.trim()) {
      alert("Nama peminjam wajib diisi!");
      return;
    }

    const loan = {
      id: "loan_" + Date.now(),
      bookId: selectedBook.kode_buku,
      title: selectedBook.title,
      author: selectedBook.author,
      cover: selectedBook.cover,
      user: namaPeminjam,
      durasi,
      status: "pending",
      tanggal: new Date().toLocaleDateString("id-ID"),
    };

    const existing = JSON.parse(localStorage.getItem("peminjaman") || "[]");
    localStorage.setItem("peminjaman", JSON.stringify([...existing, loan]));

    alert("Permintaan peminjaman berhasil dikirim!");

    setShowModal(false);
    setNamaPeminjam("");
    setDurasi("1 Minggu");
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-gradient-to-b from-gray-700 to-gray-800 text-white fixed h-full shadow-2xl">
        <div className="p-6 border-b border-gray-600">
          <h1 className="text-3xl font-bold text-yellow-400">STARBOOK</h1>
        </div>

        <nav className="flex-1 py-6 space-y-2">
          <Link href="/Homepage" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700">
            <Home size={22} /> Beranda
          </Link>

          <Link href="/koleksi-buku" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700">
            <Book size={22} /> Koleksi Buku
          </Link>

          <Link href="/peminjaman" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700">
            <History size={22} /> Peminjaman
          </Link>

          <Link href="/wishlist" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700">
            <Heart size={22} /> Wishlist
          </Link>

          <Link href="/riwayat" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700">
            <Clock size={22} /> Riwayat
          </Link>

          <Link href="/profile" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700">
            <User size={22} /> Profil
          </Link>
        </nav>

        <div className="p-6 border-t border-gray-600 text-sm text-gray-400">
          © 2025 StarBook
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="ml-64 p-10 w-full">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 mb-8">
          <h1 className="text-3xl font-bold text-gray-700">Wishlist Kamu</h1>
          <p className="text-gray-600">Daftar buku yang kamu simpan.</p>
        </div>

        {/* ================= EMPTY STATE ================= */}
        {wishlist.length === 0 && (
          <div className="text-center mt-20">
            <Heart className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600">Wishlist Kosong</h3>
            <p className="text-gray-500">Tambahkan buku ke wishlist.</p>

            <Link href="/koleksi-buku" className="mt-6 inline-block px-6 py-3 bg-yellow-600 text-white rounded-xl">
              Jelajahi Buku
            </Link>
          </div>
        )}

        {/* ================= LIST ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((book, index) => (
            <div key={getBookKey(book, index)} className="bg-white p-4 rounded-xl shadow relative border">

              {/* DELETE BUTTON */}
              <button
                onClick={() => removeFromWishlist(getBookKey(book, index))}
                className="absolute top-3 right-3"
              >
                <Trash2 className="text-red-500 hover:text-red-700" size={22} />
              </button>

              {/* COVER */}
              <img
                src={book.cover || fallbackImage}
                onError={(e) => (e.target.src = fallbackImage)}
                className="w-full h-48 object-cover rounded mb-3"
                alt={book.title}
              />

              {/* TITLE */}
              <h4 className="font-semibold text-lg text-gray-700">
                {book.title || "Judul Tidak Tersedia"}
              </h4>

              <p className="text-gray-500 text-sm">
                {book.author || "Penulis Tidak Diketahui"}
              </p>

              <p className="text-gray-600 text-sm mt-1">
                Stok: {book.stock ?? "Tidak Ada Info"}
              </p>

              {/* BUTTON PINJAM */}
              <button
                onClick={() => {
                  setSelectedBook(book);
                  setShowModal(true);
                }}
                className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg"
              >
                Pinjam
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* ================= MODAL ================= */}
      {showModal && selectedBook && (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
  <div className="bg-white p-6 w-full max-w-md rounded-xl shadow-lg">

    {/* Judul Modal */}
    <h2 className="text-xl font-bold mb-3 text-gray-800">
      Form Peminjaman Buku
    </h2>

    {/* Judul Buku */}
    <p className="mb-4 font-semibold text-gray-700">
      {selectedBook.title}
    </p>

    {/* Input Nama Peminjam */}
    <div className="mb-4">
      <label className="font-semibold text-gray-700">
        Nama Peminjam
      </label>

      <input
        type="text"
        className="w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-yellow-500 outline-none"
        placeholder="Masukkan nama kamu..."
        value={namaPeminjam}
        onChange={(e) => setNamaPeminjam(e.target.value)}
      />
    </div>

    {/* Pilihan Durasi */}
    <div className="mb-6">
      <label className="font-semibold text-gray-700">
        Durasi Peminjaman
      </label>

      <select
        className="w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-yellow-500 outline-none"
        value={durasi}
        onChange={(e) => setDurasi(e.target.value)}
      >
        <option>1 Minggu</option>
        <option>2 Minggu</option>
        <option>1 Bulan</option>
      </select>
    </div>

    {/* Tombol Aksi */}
    <div className="flex justify-end gap-3">

      {/* Tombol Batal */}
      <button
        className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
        onClick={() => setShowModal(false)}
      >
        Batal
      </button>

      {/* Tombol Submit */}
      <button
        className="px-5 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition"
        onClick={submitPinjam}
      >
        Kirim Permintaan
      </button>
    </div>

  </div>
</div>

      )}
    </div>
  );
}
