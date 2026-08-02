"use client";

import { useState, useEffect } from "react";

export default function DetailBuku({ params }) {
  const [book, setBook] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("books")) || [];
    const found = data.find(b => b.id == params.id);
    setBook(found);
  }, []);

  const handleAjukanPinjam = () => {
    // 1. Ambil data user dari sessionStorage sesuai file Login lu
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    
    // Pake username atau nama_lengkap dari API lu, kalo belum login kasih default "Guest"
    const namaUser = userData ? (userData.username || userData.nama_lengkap) : "Guest";
    const kelasUser = userData ? (userData.kelas || "-") : "-";

    // 2. Simpan ke "peminjaman" biar sinkron sama PeminjamanPage
    const peminjaman = JSON.parse(localStorage.getItem("peminjaman")) || [];

    peminjaman.push({
      id: Date.now(),
      bookId: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      user: namaUser,
      username: namaUser,
      kelas: kelasUser,
      tanggal: new Date().toLocaleDateString("id-ID"),
      status: "pending"
    });

    localStorage.setItem("peminjaman", JSON.stringify(peminjaman));
    alert("⏳ Permintaan peminjaman dikirim. Menunggu persetujuan admin.");
  };

  if (!book) return <p>Loading...</p>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">{book.title}</h1>
      <p className="text-gray-600">{book.author}</p>

      <button
        onClick={handleAjukanPinjam}
        className="mt-5 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
      >
        Ajukan Peminjaman
      </button>
    </div>
  );
}