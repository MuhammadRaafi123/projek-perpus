"use client";

import React, { useEffect, useState } from "react";
import { Library, Zap, BookOpen, Search, X } from "lucide-react";

const FALLBACK_BOOKS = [
  { id: 1, kode_buku: "BK01", judul: "To Kill a Mockingbird", pengarang: "Harper Lee", penerbit: "J.B. Lippincott & Co.", tahun_terbit: 1960, isbn: "9780061120084", deskripsi: "Klasik tentang keadilan dan moral di Amerika Selatan", stok_tersedia: 4, nama_kategori: "Fiksi" },
  { id: 2, kode_buku: "BK02", judul: "1984", pengarang: "George Orwell", penerbit: "Secker & Warburg", tahun_terbit: 1949, isbn: "9780451524935", deskripsi: "Novel distopia tentang totalitarianisme", stok_tersedia: 5, nama_kategori: "Fiksi" },
  { id: 3, kode_buku: "BK03", judul: "The Psychology of Money", pengarang: "Morgan Housel", penerbit: "Harriman House", tahun_terbit: 2020, isbn: "9780857197689", deskripsi: "Pelajaran penting tentang perilaku manusia terhadap uang", stok_tersedia: 7, nama_kategori: "Ekonomi & Bisnis" },
  { id: 4, kode_buku: "BK04", judul: "Ikigai", pengarang: "Héctor García & Francesc Miralles", penerbit: "Penguin Books", tahun_terbit: 2016, isbn: "9780143130727", deskripsi: "Konsep hidup bahagia ala Jepang", stok_tersedia: 6, nama_kategori: "Pengembangan Diri" },
  { id: 5, kode_buku: "BK05", judul: "Deep Work", pengarang: "Cal Newport", penerbit: "Grand Central Publishing", tahun_terbit: 2016, isbn: "9781455586691", deskripsi: "Strategi fokus mendalam di era distraksi", stok_tersedia: 5, nama_kategori: "Pengembangan Diri" },
  { id: 6, kode_buku: "BK06", judul: "Atomic Habits", pengarang: "James Clear", penerbit: "Avery", tahun_terbit: 2018, isbn: "9780735211292", deskripsi: "Panduan membangun kebiasaan baik dan menghilangkan kebiasaan buruk", stok_tersedia: 8, nama_kategori: "Pengembangan Diri" },
  { id: 7, kode_buku: "BK07", judul: "Rich Dad Poor Dad", pengarang: "Robert T. Kiyosaki", penerbit: "Warner Books", tahun_terbit: 1997, isbn: "9781612680194", deskripsi: "Pelajaran finansial tentang cara mengelola uang", stok_tersedia: 6, nama_kategori: "Ekonomi & Bisnis" },
  { id: 8, kode_buku: "BK08", judul: "The Alchemist", pengarang: "Paulo Coelho", penerbit: "HarperOne", tahun_terbit: 1988, isbn: "9780062315007", deskripsi: "Novel tentang perjalanan menemukan tujuan hidup", stok_tersedia: 5, nama_kategori: "Fiksi" },
  { id: 9, kode_buku: "BK09", judul: "Sapiens: A Brief History of Humankind", pengarang: "Yuval Noah Harari", penerbit: "Harper", tahun_terbit: 2011, isbn: "9780062316097", deskripsi: "Sejarah singkat perkembangan manusia", stok_tersedia: 4, nama_kategori: "Sejarah" },
  { id: 10, kode_buku: "BK10", judul: "Thinking, Fast and Slow", pengarang: "Daniel Kahneman", penerbit: "Farrar, Straus and Giroux", tahun_terbit: 2011, isbn: "9780374533557", deskripsi: "Penjelasan tentang cara manusia berpikir", stok_tersedia: 3, nama_kategori: "Psikologi" },
  { id: 11, kode_buku: "BK11", judul: "Start With Why", pengarang: "Simon Sinek", penerbit: "Portfolio", tahun_terbit: 2009, isbn: "9781591846444", deskripsi: "Pentingnya mengetahui alasan dalam kepemimpinan", stok_tersedia: 4, nama_kategori: "Pengembangan Diri" },
  { id: 12, kode_buku: "BK12", judul: "Clean Code", pengarang: "Robert C. Martin", penerbit: "Prentice Hall", tahun_terbit: 2008, isbn: "9780132350884", deskripsi: "Panduan menulis kode yang bersih dan mudah dipahami", stok_tersedia: 6, nama_kategori: "Pemrograman" },
  { id: 13, kode_buku: "BK13", judul: "The Pragmatic Programmer", pengarang: "Andrew Hunt & David Thomas", penerbit: "Addison-Wesley", tahun_terbit: 1999, isbn: "9780201616224", deskripsi: "Prinsip penting dalam pengembangan software", stok_tersedia: 5, nama_kategori: "Pemrograman" },
  { id: 14, kode_buku: "BK14", judul: "Ego Is the Enemy", pengarang: "Ryan Holiday", penerbit: "Portfolio", tahun_terbit: 2016, isbn: "9781591847816", deskripsi: "Mengendalikan ego untuk mencapai kesuksesan", stok_tersedia: 4, nama_kategori: "Pengembangan Diri" },
  { id: 15, kode_buku: "BK15", judul: "Zero to One", pengarang: "Peter Thiel", penerbit: "Crown Business", tahun_terbit: 2014, isbn: "9780804139298", deskripsi: "Cara membangun startup yang inovatif", stok_tersedia: 5, nama_kategori: "Ekonomi & Bisnis" },
  { id: 16, kode_buku: "BK16", judul: "The 7 Habits of Highly Effective People", pengarang: "Stephen R. Covey", penerbit: "Free Press", tahun_terbit: 1989, isbn: "9780743269513", deskripsi: "Tujuh kebiasaan untuk menjadi pribadi yang efektif", stok_tersedia: 6, nama_kategori: "Pengembangan Diri" },
  { id: 17, kode_buku: "BK17", judul: "Man's Search for Meaning", pengarang: "Viktor E. Frankl", penerbit: "Beacon Press", tahun_terbit: 1946, isbn: "9780807014271", deskripsi: "Refleksi tentang makna hidup dari pengalaman di kamp konsentrasi", stok_tersedia: 4, nama_kategori: "Psikologi" },
  { id: 18, kode_buku: "BK18", judul: "The Subtle Art of Not Giving a F*ck", pengarang: "Mark Manson", penerbit: "Harper", tahun_terbit: 2016, isbn: "9780062457714", deskripsi: "Pendekatan realistis dalam menjalani kehidupan", stok_tersedia: 5, nama_kategori: "Pengembangan Diri" },
  { id: 19, kode_buku: "BK19", judul: "How to Win Friends and Influence People", pengarang: "Dale Carnegie", penerbit: "Simon & Schuster", tahun_terbit: 1936, isbn: "9780671027032", deskripsi: "Panduan klasik membangun hubungan dan komunikasi", stok_tersedia: 7, nama_kategori: "Pengembangan Diri" },
  { id: 20, kode_buku: "BK20", judul: "The Power of Habit", pengarang: "Charles Duhigg", penerbit: "Random House", tahun_terbit: 2012, isbn: "9780812981605", deskripsi: "Penjelasan tentang bagaimana kebiasaan terbentuk", stok_tersedia: 5, nama_kategori: "Psikologi" },
  { id: 21, kode_buku: "BK21", judul: "Harry Potter and the Sorcerer's Stone", pengarang: "J.K. Rowling", penerbit: "Bloomsbury", tahun_terbit: 1997, isbn: "9780590353427", deskripsi: "Petualangan awal Harry Potter di Hogwarts", stok_tersedia: 6, nama_kategori: "Fantasi" },
  { id: 22, kode_buku: "BK22", judul: "Harry Potter and the Chamber of Secrets", pengarang: "J.K. Rowling", penerbit: "Bloomsbury", tahun_terbit: 1998, isbn: "9780439064873", deskripsi: "Petualangan kedua Harry di Hogwarts", stok_tersedia: 5, nama_kategori: "Fantasi" },
  { id: 23, kode_buku: "BK23", judul: "The Hobbit", pengarang: "J.R.R. Tolkien", penerbit: "George Allen & Unwin", tahun_terbit: 1937, isbn: "9780547928227", deskripsi: "Perjalanan Bilbo Baggins dalam dunia Middle-earth", stok_tersedia: 4, nama_kategori: "Fantasi" },
  { id: 24, kode_buku: "BK24", judul: "The Lord of the Rings", pengarang: "J.R.R. Tolkien", penerbit: "George Allen & Unwin", tahun_terbit: 1954, isbn: "9780618640157", deskripsi: "Epic fantasy tentang cincin kekuasaan", stok_tersedia: 3, nama_kategori: "Fantasi" },
  { id: 25, kode_buku: "BK25", judul: "A Brief History of Time", pengarang: "Stephen Hawking", penerbit: "Bantam Books", tahun_terbit: 1988, isbn: "9780553380163", deskripsi: "Penjelasan populer tentang konsep alam semesta", stok_tersedia: 3, nama_kategori: "Sains & Teknologi" },
];

const STEP = 8;
const fallbackImage = "https://covers.openlibrary.org/b/id/12345002-L.jpg";

export default function LandingPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filter state
  const [searchInput, setSearchInput] = useState("");   // nilai di input (real-time)
  const [searchQuery, setSearchQuery] = useState("");   // nilai yang dipakai filter (submit)
  const [activeCategory, setActiveCategory] = useState("Semua"); // filter kategori aktif
  const [visible, setVisible] = useState(STEP);

  // ── FETCH API, fallback hardcode ──
  useEffect(() => {
    setLoading(true);
    fetch("/api/books")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const normalised = (Array.isArray(data) ? data : []).map((b) => ({
          ...b,
          judul: b.judul || b.title || "",
          pengarang: b.pengarang || b.author || "",
          penerbit: b.penerbit || "",
          tahun_terbit: b.tahun_terbit || "",
          isbn: b.isbn || "",
          deskripsi: b.deskripsi || b.description || "",
          stok_tersedia: b.stok_tersedia ?? 0,
          nama_kategori: b.nama_kategori || "Lainnya",
          gambar: b.gambar || (b.isbn ? `https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg` : null),
        }));
        setBooks(normalised.length > 0 ? normalised : FALLBACK_BOOKS);
      })
      .catch(() => setBooks(FALLBACK_BOOKS))
      .finally(() => setLoading(false));
  }, []);

  // ── Daftar kategori unik dari data ──
  const categories = ["Semua", ...Array.from(new Set(books.map((b) => b.nama_kategori || "Lainnya"))).sort()];

  // ── Eksekusi pencarian ──
  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setVisible(STEP);
    document.getElementById("koleksi")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // ── Reset semua filter ──
  const resetFilter = () => {
    setSearchInput("");
    setSearchQuery("");
    setActiveCategory("Semua");
    setVisible(STEP);
  };

  // ── Filter: nama/pengarang + kategori ──
  const filtered = books.filter((b) => {
    const key = searchQuery.toLowerCase();
    const matchText =
      !searchQuery ||
      b.judul.toLowerCase().includes(key) ||
      b.pengarang.toLowerCase().includes(key) ||
      (b.penerbit || "").toLowerCase().includes(key);

    const matchCategory =
      activeCategory === "Semua" || b.nama_kategori === activeCategory;

    return matchText && matchCategory;
  });

  const getBookCover = (book) => {
    if (book.gambar && !book.gambar.includes("default-book-cover")) return book.gambar;
    if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
    return fallbackImage;
  };

  const isFiltering = searchQuery !== "" || activeCategory !== "Semua";

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('./library-g207303354_1920.jpg')" }}
    >
      <div className="absolute inset-0 bg-gray-800/75"></div>

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-4 bg-gray-700/80 backdrop-blur-md text-white border-b border-gray-600">
        <h1 className="text-2xl font-bold">
          <span className="text-yellow-400">STARBOOK</span>
        </h1>

        <div className="flex ml-auto space-x-6 text-sm md:text-base">
    <a href="#hero" className="hover:text-yellow-400 transition">Beranda</a>
    <a href="#about" className="hover:text-yellow-400 transition">Tentang</a>
    <a href="#koleksi" className="hover:text-yellow-400 transition">Koleksi Buku</a>
  </div>
        <div className="space-x-3 ml-6">
          <a href="/login-page" className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-semibold text-sm transition">Masuk</a>
          <a href="/register-page" className="bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold text-sm transition">Daftar</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="relative z-10 flex flex-col justify-center items-center text-center text-white px-6 py-32 md:py-40">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          Selamat Datang di <span className="text-yellow-400">STARBOOK</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl text-gray-300 mb-8">
          Jelajahi dunia pengetahuan. Pinjam buku, baca online, dan kelola akun perpustakaan Anda dengan mudah.
        </p>
        <div className="flex gap-4">
          <a href="/login-page" className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold text-white transition">Mulai Sekarang</a>
          <a href="#about" className="bg-gray-600/80 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition border border-gray-500">Pelajari Lebih Lanjut</a>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="relative z-10 bg-gray-100 py-16 px-6 md:px-20 text-center">
        <h2 className="text-3xl font-bold text-gray-700 mb-4 border-l-4 border-yellow-500 pl-3 inline-block text-left">
          Tentang Perpustakaan Kami
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mt-2">
          StarBook adalah perpustakaan digital modern yang menyediakan akses mudah ke ribuan koleksi buku.
        </p>
      </section>

      {/* ── KOLEKSI ── */}
      <section id="koleksi" className="relative z-10 bg-white py-16 px-6 md:px-20">

        {/* Header + counter */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-3xl font-bold text-gray-700 border-l-4 border-yellow-500 pl-3">
            {isFiltering
              ? `Hasil: ${filtered.length} buku ditemukan`
              : "Koleksi Buku Kami"}
          </h2>
          {!loading && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Menampilkan {Math.min(visible, filtered.length)} dari {filtered.length} buku
            </span>
          )}
        </div>

        {/* ── FILTER BAR ── */}
        {!loading && (
          <div className="mb-8 space-y-4">

            {/* Search inline (di bawah heading, untuk UX mobile) */}
            <div className="flex gap-3 flex-wrap items-center">
              <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Cari judul atau pengarang..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 bg-transparent text-gray-700 focus:outline-none text-sm"
                />
                {searchInput && (
                  <button onClick={() => { setSearchInput(""); setSearchQuery(""); setVisible(STEP); }} className="px-3 text-gray-400 hover:text-gray-600">
                    <X size={15} />
                  </button>
                )}
                <button onClick={handleSearch} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 text-sm font-semibold transition">
                  Cari
                </button>
              </div>

              {/* Tombol reset */}
              {isFiltering && (
                <button
                  onClick={resetFilter}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 border border-gray-300 rounded-lg px-3 py-2 transition"
                >
                  <X size={14} /> Reset Filter
                </button>
              )}
            </div>

            {/* ── KATEGORI CHIPS ── */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setVisible(STEP);
                    document.getElementById("koleksi")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
                    activeCategory === cat
                      ? "bg-yellow-600 text-white border-yellow-600 shadow"
                      : "bg-white text-gray-600 border-gray-300 hover:border-yellow-500 hover:text-yellow-600"
                  }`}
                >
                  {cat}
                  {cat !== "Semua" && (
                    <span className="ml-1.5 text-xs opacity-70">
                      ({books.filter((b) => b.nama_kategori === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Active filter tags */}
            {isFiltering && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500">Filter aktif:</span>
                {searchQuery && (
                  <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">
                    🔍 "{searchQuery}"
                    <button onClick={() => { setSearchInput(""); setSearchQuery(""); setVisible(STEP); }} className="hover:text-red-500 ml-1">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {activeCategory !== "Semua" && (
                  <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                    🏷️ {activeCategory}
                    <button onClick={() => { setActiveCategory("Semua"); setVisible(STEP); }} className="hover:text-red-500 ml-1">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Memuat koleksi buku...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-500 text-lg font-medium">Tidak ada buku yang cocok.</p>
            <p className="text-gray-400 text-sm mt-1">Coba kata kunci lain atau pilih kategori berbeda.</p>
            <button onClick={resetFilter} className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition">
              Tampilkan Semua Buku
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-8">
              {filtered.slice(0, visible).map((book) => (
                <div
                  key={book.kode_buku || book.id}
                  className="bg-white shadow-lg rounded-2xl p-4 hover:shadow-2xl hover:-translate-y-2 transform transition border border-gray-100 flex flex-col"
                >
                  <div className="overflow-hidden rounded-xl mb-4 relative">
                    <img
                      src={getBookCover(book)}
                      alt={book.judul}
                      className="w-full h-52 object-cover hover:scale-105 transition-transform"
                      onError={(e) => (e.currentTarget.src = fallbackImage)}
                    />
                    {/* Badge kategori */}
                    {book.nama_kategori && (
                      <span className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs px-2 py-0.5 rounded-full">
                        {book.nama_kategori}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-base text-gray-800 mb-1 line-clamp-2">{book.judul}</h3>
                  <p className="text-sm text-gray-500 mb-1">by {book.pengarang}</p>
                  <p className="text-xs text-gray-400 mb-1">
                    {book.penerbit}{book.penerbit && book.tahun_terbit ? " · " : ""}{book.tahun_terbit}
                  </p>
                  <p className={`text-xs font-semibold mb-2 ${book.stok_tersedia > 0 ? "text-green-700" : "text-red-500"}`}>
                    {book.stok_tersedia > 0 ? `Stok: ${book.stok_tersedia}` : "Stok Habis"}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{book.deskripsi}</p>

                  <a
                    href="/login-page"
                    className={`w-full block text-center py-2 rounded-lg font-semibold transition mt-auto ${
                      book.stok_tersedia > 0
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    {book.stok_tersedia > 0 ? "📖 Pinjam Buku" : "❌ Tidak Tersedia"}
                  </a>
                </div>
              ))}
            </div>

            {/* Progress + tombol */}
            <div className="flex flex-col items-center mt-10 gap-3">
              <p className="text-sm text-gray-500">
                {Math.min(visible, filtered.length)} / {filtered.length} buku ditampilkan
              </p>
              <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((visible / filtered.length) * 100, 100)}%` }}
                />
              </div>

              <div className="flex gap-3 mt-2">
                {visible > STEP && (
                  <button
                    onClick={() => {
                      setVisible((v) => Math.max(v - STEP, STEP));
                      document.getElementById("koleksi")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition shadow"
                  >
                    🔙 Lihat Lebih Sedikit
                  </button>
                )}
                {visible < filtered.length && (
                  <button
                    onClick={() => setVisible((v) => v + STEP)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md"
                  >
                    📚 Lihat Lebih Banyak
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── FITUR ── */}
      <section className="relative z-10 bg-gray-100 py-16 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-gray-700 mb-10 border-l-4 border-yellow-500 pl-3">
          Fitur yang Kami Tawarkan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/70 p-8 rounded-2xl shadow-md border hover:shadow-xl transition">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mx-auto mb-6">
              <Library size={36} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Koleksi Lengkap</h3>
            <p className="text-gray-600 text-center">Buku pelajaran, novel, komik, referensi, dan banyak lagi.</p>
          </div>
          <div className="bg-white/70 p-8 rounded-2xl shadow-md border hover:shadow-xl transition">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-6">
              <Zap size={36} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Akses Super Cepat</h3>
            <p className="text-gray-600 text-center">Tampilan modern dan responsif untuk semua pengguna.</p>
          </div>
          <div className="bg-white/70 p-8 rounded-2xl shadow-md border hover:shadow-xl transition">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-6">
              <BookOpen size={36} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Manajemen Buku Modern</h3>
            <p className="text-gray-600 text-center">Pinjam & cek riwayat dengan mudah.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 bg-gradient-to-b from-gray-700 to-gray-800 text-white py-6 text-center border-t border-gray-600">
        <p className="text-gray-400 text-sm">© 2025 StarBook. Semua hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}