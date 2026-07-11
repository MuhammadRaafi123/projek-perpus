"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Library, Zap, BookOpen, Heart, Clock,
  User, Home, Book, History, Search, X,
} from "lucide-react";

// ── STOCK HELPER (inline agar tidak perlu import terpisah) ──
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
    if (localStock[key] !== undefined) {
      merged[key] = Math.min(localStock[key], dbStok);
    } else {
      merged[key] = dbStok;
    }
  });
  return merged;
}

function decrementStock(kode_buku, currentStockMap) {
  const current = currentStockMap[kode_buku] ?? 0;
  const newStock = Math.max(0, current - 1);
  const updated = { ...currentStockMap, [kode_buku]: newStock };
  localStorage.setItem(STOCK_KEY, JSON.stringify(updated));
  return updated;
}

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [bookStock, setBookStock] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [visible, setVisible] = useState(8);

  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [namaPeminjam, setNamaPeminjam] = useState("");
  const [durasi, setDurasi] = useState("1 Minggu");

  const [wishlist, setWishlist] = useState([]);
  const [loans, setLoans] = useState([]);
  const [activeLoans, setActiveLoans] = useState(0);
  const [myLoans, setMyLoans] = useState(0);

  const fallbackImage = "https://via.placeholder.com/400x300.png?text=No+Image";
  const STEP = 8;

  // ── FETCH BOOKS + MERGE STOK LOKAL ──
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
        // Gabungkan stok DB dengan stok lokal
        const merged = mergeStock(normalised);
        setBookStock(merged);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── LOAD LOCAL STORAGE ──
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("wishlist");
      const savedLoans = localStorage.getItem("peminjaman");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      if (savedLoans) {
        const data = JSON.parse(savedLoans);
        setLoans(data);
        const active = data.filter((i) => ["dipinjam", "disetujui", "pending"].includes(i.status)).length;
        setActiveLoans(active);
      }
    } catch (err) { console.error(err); }
  }, []);

  // ── WISHLIST ──
  const toggleWishlist = (book) => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const exists = saved.some((b) => b.kode_buku === book.kode_buku);
    const updated = exists
      ? saved.filter((b) => b.kode_buku !== book.kode_buku)
      : [...saved, {
          kode_buku: book.kode_buku,
          title: book.judul,
          author: book.pengarang,
          cover: book.gambar || null,
          stock: bookStock[book.kode_buku] ?? 0,
        }];
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setWishlist(updated);
  };

  // ── KATEGORI ──
  const categories = ["Semua", ...Array.from(new Set(books.map((b) => b.nama_kategori))).sort()];

  // ── SEARCH & FILTER ──
  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setVisible(STEP);
  };

  const resetFilter = () => {
    setSearchInput(""); setSearchQuery(""); setActiveCategory("Semua"); setVisible(STEP);
  };

  const isFiltering = searchQuery !== "" || activeCategory !== "Semua";

  const filteredBooks = books.filter((b) => {
    const key = searchQuery.toLowerCase();
    const matchText = !searchQuery ||
      (b.judul ?? "").toLowerCase().includes(key) ||
      (b.pengarang ?? "").toLowerCase().includes(key) ||
      (b.penerbit ?? "").toLowerCase().includes(key);
    const matchCat = activeCategory === "Semua" || b.nama_kategori === activeCategory;
    return matchText && matchCat;
  });

  // ── SUBMIT PINJAM ──
  const submitPinjam = () => {
    if (!namaPeminjam.trim()) return alert("Nama peminjam wajib diisi.");
    if (!selectedBook) return;
    const stok = bookStock[selectedBook.kode_buku] ?? 0;
    if (stok <= 0) return alert("Stok habis.");

    const newLoan = {
      id: `loan_${Date.now()}`,
      bookId: selectedBook.kode_buku,
      title: selectedBook.judul,
      author: selectedBook.pengarang,
      cover: selectedBook.gambar || "",
      user: namaPeminjam.trim(),
      durasi,
      status: "pending",
      tanggal: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }),
    };

    const saved = JSON.parse(localStorage.getItem("peminjaman") || "[]");
    const updatedLoans = [...saved, newLoan];
    localStorage.setItem("peminjaman", JSON.stringify(updatedLoans));
    setLoans(updatedLoans);
    setActiveLoans((v) => v + 1);

    // ── Kurangi stok dan simpan ke localStorage ──
    const updatedStock = decrementStock(selectedBook.kode_buku, bookStock);
    setBookStock(updatedStock);

    setShowModal(false);
    setNamaPeminjam("");
    setDurasi("1 Minggu");
    alert("Permintaan peminjaman berhasil dikirim ✅");
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-gray-700 to-gray-800 text-white fixed h-full shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-600">
          <h1 className="text-3xl font-bold text-yellow-400">STARBOOK</h1>
        </div>
        <nav className="flex-1 py-6 space-y-2">
          <Link href="/Homepage" className="flex items-center gap-4 px-6 py-4 bg-yellow-600/20 border-r-4 border-yellow-500 text-yellow-400">
            <Home size={22} /> Beranda
          </Link>
          <Link href="/koleksi-buku" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition">
            <Book size={22} /> Koleksi Buku
          </Link>
          <Link href="/peminjaman" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition">
            <History size={22} /> Peminjaman
          </Link>
          <Link href="/wishlist" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition">
            <Heart size={22} /> Wishlist
          </Link>
          <Link href="/profile" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition">
            <User size={22} /> Profil
          </Link>
        </nav>
        <div className="p-6 border-t border-gray-600 text-sm text-gray-400">© 2025 StarBook</div>
      </aside>

      {/* MAIN */}
      <main className="ml-64 p-10 w-full">

        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-l-4 border-yellow-500">
          <h1 className="text-3xl font-bold text-gray-700">Selamat Datang di STARBOOK</h1>
          <p className="text-gray-500 mt-1">Jelajahi koleksi buku dan temukan bacaan favoritmu.</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<Library size={32} />} color="yellow" value={books.length} title="Total Buku" />
          <StatCard icon={<Heart size={32} />} color="red" value={wishlist.length} title="Wishlist" />
          <StatCard icon={<Zap size={32} />} color="blue" value={activeLoans} title="Aktif" />
          <StatCard icon={<BookOpen size={32} />} color="green" value={myLoans} title="Dipinjam" />
        </div>

        {/* SEARCH + FILTER */}
        {!loading && (
          <div className="bg-white p-5 rounded-xl shadow-sm mb-6 space-y-4">
            <div className="flex gap-3 flex-wrap items-center">
              <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-1 max-w-lg">
                <input
                  type="text"
                  placeholder="🔍 Cari judul, pengarang, atau penerbit..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 px-4 py-3 bg-transparent text-gray-700 focus:outline-none text-sm"
                />
                {searchInput && (
                  <button onClick={() => { setSearchInput(""); setSearchQuery(""); setVisible(STEP); }} className="px-3 text-gray-400 hover:text-gray-600">
                    <X size={15} />
                  </button>
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
                  {cat}
                  {cat !== "Semua" && <span className="ml-1.5 text-xs opacity-70">({books.filter((b) => b.nama_kategori === cat).length})</span>}
                </button>
              ))}
            </div>

            {isFiltering && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500">Filter aktif:</span>
                {searchQuery && (
                  <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">
                    🔍 "{searchQuery}"
                    <button onClick={() => { setSearchInput(""); setSearchQuery(""); setVisible(STEP); }} className="hover:text-red-500 ml-1"><X size={12} /></button>
                  </span>
                )}
                {activeCategory !== "Semua" && (
                  <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                    🏷️ {activeCategory}
                    <button onClick={() => { setActiveCategory("Semua"); setVisible(STEP); }} className="hover:text-red-500 ml-1"><X size={12} /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* BOOK GRID */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 border-l-4 border-yellow-500 pl-3">
            {isFiltering ? `Hasil: ${filteredBooks.length} buku ditemukan` : "Koleksi Buku"}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20">
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
                  <div key={book.kode_buku} className="bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transform transition relative flex flex-col overflow-hidden">
                    <button onClick={() => toggleWishlist(book)} className="absolute top-3 right-3 z-10 bg-white/80 rounded-full p-1 shadow">
                      <Heart size={20} className={wishlist.some((i) => i.kode_buku === book.kode_buku) ? "text-red-500 fill-red-500" : "text-gray-400"} />
                    </button>

                    <div className="relative overflow-hidden">
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

                    <div className="p-4 flex flex-col flex-1">
                      <h4 className="font-bold text-base text-gray-900 line-clamp-2 mb-1">{book.judul}</h4>
                      <p className="text-gray-500 text-sm mb-1">{book.pengarang}</p>
                      <p className="text-xs text-gray-400 mb-2">{book.penerbit}{book.penerbit && book.tahun_terbit ? " · " : ""}{book.tahun_terbit}</p>
                      <p className={`text-sm font-semibold mb-3 ${(bookStock[book.kode_buku] ?? 0) > 0 ? "text-green-700" : "text-red-500"}`}>
                        {(bookStock[book.kode_buku] ?? 0) > 0 ? `Stok: ${bookStock[book.kode_buku]}` : "Tidak Tersedia"}
                      </p>
                      <button
                        onClick={() => { setSelectedBook(book); setShowModal(true); }}
                        disabled={(bookStock[book.kode_buku] ?? 0) <= 0}
                        className={`mt-auto w-full py-2 rounded-lg font-semibold transition text-sm ${
                          (bookStock[book.kode_buku] ?? 0) > 0 ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {(bookStock[book.kode_buku] ?? 0) > 0 ? "Pinjam" : "Tidak Tersedia"}
                      </button>
                    </div>
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
                      <button onClick={() => setVisible((v) => Math.max(v - STEP, STEP))} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition shadow">
                        🔙 Lihat Lebih Sedikit
                      </button>
                    )}
                    {visible < filteredBooks.length && (
                      <button onClick={() => setVisible((v) => v + STEP)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md">
                        📚 Lihat Lebih Banyak
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* MODAL */}
      {showModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Pinjam Buku</h2>
            <p className="text-base font-semibold text-yellow-700 mb-4">{selectedBook.judul}</p>
            <div className="mb-3">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Nama Peminjam</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Masukkan nama..." value={namaPeminjam} onChange={(e) => setNamaPeminjam(e.target.value)} />
            </div>
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Durasi Peminjaman</label>
              <select className="w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={durasi} onChange={(e) => setDurasi(e.target.value)}>
                <option>1 Minggu</option>
                <option>2 Minggu</option>
                <option>1 Bulan</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">Batal</button>
              <button onClick={submitPinjam} className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition">Kirim Permintaan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, color, value, title }) {
  const colorMap = {
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    red:    { bg: "bg-red-100",    text: "text-red-600"    },
    blue:   { bg: "bg-blue-100",   text: "text-blue-600"   },
    green:  { bg: "bg-green-100",  text: "text-green-600"  },
  };
  const c = colorMap[color] || colorMap.yellow;
  return (
    <div className="p-6 bg-white rounded-2xl shadow-md text-center">
      <div className={`w-14 h-14 mx-auto ${c.bg} ${c.text} rounded-full flex items-center justify-center mb-4`}>{icon}</div>
      <p className={`text-4xl font-bold ${c.text}`}>{value}</p>
      <p className="font-semibold text-gray-700 mt-2">{title}</p>
    </div>
  );
}