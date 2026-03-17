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
    const namaUser = localStorage.getItem("namaUser") || "User";
    const kelasUser = localStorage.getItem("kelasUser") || "-";

    const pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];

    pengajuan.push({
      id: Date.now(),
      bookId: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      user: namaUser,
      kelas: kelasUser,
      tanggal: new Date().toLocaleDateString("id-ID"),
      status: "pending"
    });

    localStorage.setItem("pengajuan", JSON.stringify(pengajuan));
    alert("⏳ Permintaan peminjaman dikirim. Menunggu persetujuan admin.");
  };

  if (!book) return <p>Loading...</p>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">{book.title}</h1>
      <p className="text-gray-600">{book.author}</p>

      <button
        onClick={handleAjukanPinjam}
        className="mt-5 px-6 py-3 bg-yellow-600 text-white rounded-lg"
      >
        Ajukan Peminjaman
      </button>
    </div>
  );
}
