"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Heart, Home, Book, History, Clock, User, Search, X } from "lucide-react";

const STOCK_KEY = "book_stock_local";

function getLocalStock() {
  try {
    const saved = localStorage.getItem(STOCK_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function mergeStock(booksFromDB) {
  const localStock = getLocalStock();
  const merged = {};
  booksFromDB.forEach((b) => {
    const key = b.kode_buku;
    const dbStok = b.stok_tersedia ?? b.stok_total ?? 0;
    merged[key] = localStock[key] !== undefined ? Math.min(localStock[key], dbStok) : dbStok;
  });
  return merged;
}

function decrementStock(kode_buku, currentStockMap) {
  const newStock = Math.max(0, (currentStockMap[kode_buku] ?? 0) - 1);
  const updated = { ...currentStockMap, [kode_buku]: newStock };
  localStorage.setItem(STOCK_KEY, JSON.stringify(updated));
  return updated;
}

export default function KoleksiBukuPage() {
  const [books, setBooks] = useState([]);
  const [bookStock, setBookStock] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [visible, setVisible] = useState(12);

  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [namaPeminjam, setNamaPeminjam] = useState("");
  const [durasi, setDurasi] = useState("1 Minggu");

  const [wishlist, setWishlist] = useState([]);

  const fallbackImage = "https://via.placeholder.com/400x300.png?text=No+Image";
  const STEP = 12;

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        const normalised = (Array.isArray(data) ? data : []).map((b) => ({
          ...b,
          nama_kategori: b.nama_kategori || "Lainnya",
          gambar: b.gambar || (b.isbn ? `https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg` : null),
        }));
        setBooks(normalised);
        setBookStock(mergeStock(normalised));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(saved);
  }, []);

  const toggleWishlist = (book) => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const exists = saved.some((b) => b.kode_buku === book.kode_buku);
    const updated = exists
      ? saved.filter((b) => b.kode_buku !== book.kode_buku)
      : [...saved, { kode_buku: book.kode_buku, title: book.judul, author: book.pengarang, cover: book.gambar || null, stock: bookStock[book.kode_buku] ?? 0 }];
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setWishlist(updated);
  };

  const categories = ["Semua", ...Array.from(new Set(books.map((b) => b.nama_kategori))).sort()];

  const handleSearch = () => { setSearchQuery(searchInput.trim()); setVisible(STEP); };
  const resetFilter = () => { setSearchInput(""); setSearchQuery(""); setActiveCategory("Semua"); setVisible(STEP); };
  const isFiltering = searchQuery !== "" || activeCategory !== "Semua";

  const filteredBooks = books.filter((book) => {
    const key = searchQuery.toLowerCase();
    const matchText = !searchQuery ||
      (book.judul ?? "").toLowerCase().includes(key) ||
      (book.pengarang ?? "").toLowerCase().includes(key) ||
      (book.penerbit ?? "").toLowerCase().includes(key);
    return matchText && (activeCategory === "Semua" || book.nama_kategori === activeCategory);
  });

  const submitPinjam = () => {
    if (!namaPeminjam.trim()) return alert("Nama peminjam wajib diisi.");
    if (!selectedBook) return;
    const stok = bookStock[selectedBook.kode_buku] ?? 0;
    if (stok <= 0) return alert("Stok habis.");

    const newLoan = {
      id: `loan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      bookId: selectedBook.kode_buku,
      title: selectedBook.judul,
      author: selectedBook.pengarang,
      cover: selectedBook.gambar || "",
      user: namaPeminjam.trim(),
      durasi,
      status: "pending",
      tanggal: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }),
    };

    const existing = JSON.parse(localStorage.getItem("peminjaman") || "[]");
    localStorage.setItem("peminjaman", JSON.stringify([...existing, newLoan]));

    const updatedStock = decrementStock(selectedBook.kode_buku, bookStock);
    setBookStock(updatedStock);

    alert("Permintaan peminjaman berhasil dikirim ✅");
    setShowModal(false);
    setNamaPeminjam("");
    setDurasi("1 Minggu");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      <aside className="w-64 bg-gradient-to-b from-gray-700 to-gray-800 text-white fixed h-full shadow-2xl">
        <div className="p-6 border-b border-gray-600">
          <h1 className="text-3xl font-bold text-yellow-400">STARBOOK</h1>
        </div>
        <nav className="flex-1 py-6 space-y-2">
          <Link href="/Homepage" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition"><Home size={22} /> Beranda</Link>
          <Link href="/koleksi-buku" className="flex items-center gap-4 px-6 py-4 bg-yellow-600/20 border-r-4 border-yellow-500 text-yellow-400"><Book size={22} /> Koleksi Buku</Link>
          <Link href="/peminjaman" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition"><History size={22} /> Peminjaman</Link>
          <Link href="/wishlist" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition">
            <Heart size={22} /> Wishlist
          </Link>
          <Link href="/profile" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition">
            <User size={22} /> Profil
          </Link>
        </nav>
        <div className="p-6 border-t border-gray-600 text-sm text-gray-400">© 2025 StarBook</div>
      </aside>

      <main className="ml-64 w-full p-10">
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border-l-4 border-yellow-500">
          <h1 className="text-3xl font-bold text-gray-700">Koleksi Buku</h1>
          <p className="text-gray-500 mt-1">Temukan dan pinjam buku favoritmu</p>
        </div>

        {!loading && (
          <div className="bg-white p-5 rounded-xl shadow-sm mb-6 space-y-4">
            <div className="flex gap-3 flex-wrap items-center">
              <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-1 max-w-lg">
                <input type="text" placeholder="🔍 Cari judul, pengarang, atau penerbit..."
                  value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 px-4 py-3 bg-transparent text-gray-700 focus:outline-none text-sm" />
                {searchInput && (
                  <button onClick={() => { setSearchInput(""); setSearchQuery(""); setVisible(STEP); }} className="px-3 text-gray-400 hover:text-gray-600"><X size={15} /></button>
                )}
                <button onClick={handleSearch} className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-3 text-sm font-semibold transition flex items-center gap-2">
                  <Search size={15} /> Cari
                </button>
              </div>
              {isFiltering && (
                <button onClick={resetFilter} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 border border-gray-300 rounded-lg px-3 py-2 transition">
                  <X size={14} /> Reset
                </button>
              )}
              <span className="text-sm text-gray-500 ml-auto">{filteredBooks.length} buku ditemukan</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => { setActiveCategory(cat); setVisible(STEP); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
                    activeCategory === cat ? "bg-yellow-600 text-white border-yellow-600 shadow" : "bg-white text-gray-600 border-gray-300 hover:border-yellow-500 hover:text-yellow-600"
                  }`}>
                  {cat}{cat !== "Semua" && <span className="ml-1.5 text-xs opacity-70">({books.filter((b) => b.nama_kategori === cat).length})</span>}
                </button>
              ))}
            </div>

            {isFiltering && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500">Filter aktif:</span>
                {searchQuery && (
                  <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">
                    🔍 "{searchQuery}" <button onClick={() => { setSearchInput(""); setSearchQuery(""); }} className="hover:text-red-500 ml-1"><X size={12} /></button>
                  </span>
                )}
                {activeCategory !== "Semua" && (
                  <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                    🏷️ {activeCategory} <button onClick={() => setActiveCategory("Semua")} className="hover:text-red-500 ml-1"><X size={12} /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-20 justify-center">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Memuat buku...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-500 text-lg font-medium">Tidak ada buku yang cocok.</p>
            <button onClick={resetFilter} className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition">Tampilkan Semua</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.slice(0, visible).map((book) => (
                <div key={book.kode_buku} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition relative flex flex-col">
                  <button onClick={() => toggleWishlist(book)} className="absolute top-3 right-3 z-10">
                    <Heart size={22} className={wishlist.some((b) => b.kode_buku === book.kode_buku) ? "text-red-500 fill-red-500" : "text-gray-400"} />
                  </button>

                  <div className="relative overflow-hidden rounded-lg mb-3">
                    <img src={book.gambar || fallbackImage} className="w-full h-48 object-cover" onError={(e) => (e.target.src = fallbackImage)} />
                    {book.nama_kategori && (
                      <span className="absolute bottom-2 left-2 bg-gray-800/80 text-white text-xs px-2 py-0.5 rounded-full">{book.nama_kategori}</span>
                    )}
                    {(bookStock[book.kode_buku] ?? 0) <= 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Stok Habis</span>
                      </div>
                    )}
                  </div>

                  <h2 className="font-semibold text-base text-gray-800 line-clamp-2 mb-1">{book.judul}</h2>
                  <p className="text-gray-500 text-sm mb-1">{book.pengarang || "Tanpa Penulis"}</p>
                  <p className="text-xs text-gray-400 mb-2">{book.penerbit}{book.penerbit && book.tahun_terbit ? " · " : ""}{book.tahun_terbit}</p>

                  <p className={`text-sm font-semibold mb-3 ${(bookStock[book.kode_buku] ?? 0) > 0 ? "text-green-700" : "text-red-500"}`}>
                    {(bookStock[book.kode_buku] ?? 0) > 0 ? `Stok: ${bookStock[book.kode_buku]}` : "Stok Habis"}
                  </p>

                  <button
                    onClick={() => { setSelectedBook(book); setShowModal(true); }}
                    disabled={(bookStock[book.kode_buku] ?? 0) <= 0}
                    className={`mt-auto w-full py-2 rounded-lg font-semibold transition ${
                      (bookStock[book.kode_buku] ?? 0) > 0 ? "bg-yellow-600 text-white hover:bg-yellow-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {(bookStock[book.kode_buku] ?? 0) > 0 ? "Pinjam Buku" : "Tidak Tersedia"}
                  </button>
                </div>
              ))}
            </div>

            {filteredBooks.length > STEP && (
              <div className="flex flex-col items-center mt-10 gap-3">
                <p className="text-sm text-gray-500">{Math.min(visible, filteredBooks.length)} / {filteredBooks.length} buku</p>
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{ width: `${Math.min((visible / filteredBooks.length) * 100, 100)}%` }} />
                </div>
                <div className="flex gap-3 mt-2">
                  {visible > STEP && (
                    <button onClick={() => setVisible((v) => Math.max(v - STEP, STEP))} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition shadow">🔙 Lihat Lebih Sedikit</button>
                  )}
                  {visible < filteredBooks.length && (
                    <button onClick={() => setVisible((v) => v + STEP)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md">📚 Lihat Lebih Banyak</button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-extrabold mb-4 text-gray-900">Form Peminjaman Buku</h2>
            <p className="mb-4 font-semibold text-gray-800">Judul Buku: <span className="text-yellow-700">{selectedBook.judul}</span></p>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-800 mb-1 block">Nama Peminjam</label>
              <input type="text" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                placeholder="Masukkan nama peminjam..." value={namaPeminjam} onChange={(e) => setNamaPeminjam(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-800 mb-1 block">Durasi Peminjaman</label>
              <select value={durasi} onChange={(e) => setDurasi(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900">
                <option>1 Minggu</option>
                <option>2 Minggu</option>
                <option>1 Bulan</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition">Batal</button>
              <button onClick={submitPinjam} className="px-5 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition">Pinjam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}