"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen, Trash2, RotateCcw, Clock,
  Heart, User, Home, Book, History,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
} from "lucide-react";

// ── STOCK HELPER ──
const STOCK_KEY = "book_stock_local";
function incrementStock(kode_buku) {
  try {
    const saved = localStorage.getItem(STOCK_KEY);
    const stockMap = saved ? JSON.parse(saved) : {};
    stockMap[kode_buku] = (stockMap[kode_buku] ?? 0) + 1;
    localStorage.setItem(STOCK_KEY, JSON.stringify(stockMap));
  } catch (e) { console.error(e); }
}

export default function PeminjamanPage() {
  const [peminjaman, setPeminjaman] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [sortOrder, setSortOrder] = useState("terbaru");

  // Reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";

  useEffect(() => { loadPeminjaman(); }, []);

  const loadPeminjaman = () => {
    try {
      const saved = localStorage.getItem("peminjaman");
      setPeminjaman(saved ? JSON.parse(saved) : []);
    } catch { setPeminjaman([]); }
  };

  const saveData = (newList) => {
    localStorage.setItem("peminjaman", JSON.stringify(newList));
    loadPeminjaman();
  };

  // ── PARSE TANGGAL ──
  const parseDate = (tanggal) => {
    if (!tanggal) return new Date(0);
    if (tanggal.includes("/")) {
      const [d, m, y] = tanggal.split("/");
      return new Date(`${y}-${m}-${d}`);
    }
    return new Date(tanggal);
  };

  // ── FILTER + SORT ──
  const filtered = peminjaman
    .filter((item) => filterStatus === "semua" || item.status === filterStatus)
    .sort((a, b) => {
      const da = parseDate(a.tanggal).getTime();
      const db = parseDate(b.tanggal).getTime();
      return sortOrder === "terbaru" ? db - da : da - db;
    });

  const countByStatus = (status) => peminjaman.filter((i) => i.status === status).length;

  // ── KEMBALIKAN ──
  const confirmKembalikan = () => {
    const saved = localStorage.getItem("peminjaman");
    if (saved) {
      const allData = JSON.parse(saved);
      const tanggalKembali = new Date().toLocaleDateString("id-ID", {
        day: "2-digit", month: "2-digit", year: "numeric",
      });
      const updated = allData.map((loan) =>
        loan.id === selectedItem.id
          ? { ...loan, status: "dikembalikan", tanggalDikembalikan: tanggalKembali }
          : loan
      );
      saveData(updated);

      const pengembalian = JSON.parse(localStorage.getItem("pengembalian") || "[]");
      pengembalian.push({
        id: selectedItem.id, title: selectedItem.title,
        author: selectedItem.author, cover: selectedItem.cover,
        user: selectedItem.user || "-",
        tanggalPinjam: selectedItem.tanggal || "-",
        tanggalDikembalikan: tanggalKembali,
      });
      localStorage.setItem("pengembalian", JSON.stringify(pengembalian));

      const riwayat = JSON.parse(localStorage.getItem("riwayat") || "[]");
      riwayat.push({
        bookId: selectedItem.bookId, title: selectedItem.title,
        author: selectedItem.author, cover: selectedItem.cover,
        user: selectedItem.user || "-", durasi: selectedItem.durasi || "-",
        date: new Date().toISOString(),
      });
      localStorage.setItem("riwayat", JSON.stringify(riwayat));

      if (selectedItem.bookId) incrementStock(selectedItem.bookId);
      alert(`✅ Buku "${selectedItem.title}" telah dikembalikan!`);
    }
    setShowConfirmModal(false);
    setSelectedItem(null);
  };

  // ── HAPUS ──
  const confirmHapus = () => {
    const saved = localStorage.getItem("peminjaman");
    if (saved) {
      saveData(JSON.parse(saved).filter((item) => item.id !== selectedItem.id));
      alert(`🗑️ Data "${selectedItem.title}" telah dihapus`);
    }
    setShowConfirmModal(false);
    setSelectedItem(null);
  };

  // ── RESET SEMUA DATA PEMINJAMAN ──
  const handleReset = () => {
    setResetLoading(true);
    setTimeout(() => {
      // Kembalikan semua stok buku yang masih pending/dipinjam
      const allData = JSON.parse(localStorage.getItem("peminjaman") || "[]");
      allData.forEach((loan) => {
        if (["pending", "disetujui", "dipinjam"].includes(loan.status) && loan.bookId) {
          incrementStock(loan.bookId);
        }
      });

      // Hapus semua data peminjaman
      localStorage.removeItem("peminjaman");
      // Reset juga pengembalian & riwayat yang terkait
      localStorage.removeItem("pengembalian");
      localStorage.removeItem("riwayat");

      setPeminjaman([]);
      setFilterStatus("semua");
      setResetLoading(false);
      setShowResetModal(false);
      alert("✅ Semua data peminjaman berhasil direset!");
    }, 800);
  };

  // ── STATUS BADGE ──
  const getStatusBadge = (status) => {
    const badges = {
      pending:      { bg: "bg-yellow-100", text: "text-yellow-800", label: "⏳ Menunggu" },
      disetujui:    { bg: "bg-green-100",  text: "text-green-800",  label: "✅ Disetujui" },
      dipinjam:     { bg: "bg-blue-100",   text: "text-blue-800",   label: "📖 Dipinjam" },
      dikembalikan: { bg: "bg-gray-100",   text: "text-gray-700",   label: "🔄 Dikembalikan" },
      ditolak:      { bg: "bg-red-100",    text: "text-red-800",    label: "❌ Ditolak" },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getRelativeTime = (tanggal) => {
    if (!tanggal) return "-";
    const date = parseDate(tanggal);
    const diffDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return `${Math.floor(diffDays / 30)} bulan lalu`;
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-gray-700 to-gray-800 text-white fixed h-full shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-600">
          <h1 className="text-3xl font-bold text-yellow-400">STARBOOK</h1>
        </div>
        <nav className="flex-1 py-6 space-y-2">
          <Link href="/Homepage" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition"><Home size={22} /> Beranda</Link>
          <Link href="/koleksi-buku" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition"><Book size={22} /> Koleksi Buku</Link>
          <Link href="/peminjaman" className="flex items-center gap-4 px-6 py-4 bg-yellow-600/20 border-r-4 border-yellow-500 text-yellow-400"><History size={22} /> Peminjaman</Link>
          <Link href="/wishlist" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition"><Heart size={22} /> Wishlist</Link>
          <Link href="/profile" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700 transition"><User size={22} /> Profil</Link>
        </nav>
        <div className="p-6 border-t border-gray-600 text-sm text-gray-400">© 2025 StarBook</div>
      </aside>

      {/* MAIN */}
      <main className="ml-64 p-10 w-full">

        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow mb-6 border-l-4 border-yellow-500 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-700">Peminjaman Buku</h1>
            <p className="text-gray-500 mt-1">Kelola semua permintaan dan status peminjaman bukumu.</p>
          </div>

          {/* TOMBOL RESET */}
          {peminjaman.length > 0 && (
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-lg font-semibold text-sm transition"
            >
              <RefreshCw size={16} /> Reset Data
            </button>
          )}
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Semua", value: peminjaman.length, status: "semua" },
            { label: "Menunggu", value: countByStatus("pending"), status: "pending" },
            { label: "Disetujui", value: countByStatus("disetujui"), status: "disetujui" },
            { label: "Dipinjam", value: countByStatus("dipinjam"), status: "dipinjam" },
            { label: "Dikembalikan", value: countByStatus("dikembalikan"), status: "dikembalikan" },
          ].map((s) => (
            <button
              key={s.status}
              onClick={() => setFilterStatus(s.status)}
              className={`bg-white rounded-xl shadow px-4 py-3 text-center transition border-2 ${
                filterStatus === s.status ? "border-yellow-500" : "border-transparent hover:border-gray-200"
              }`}
            >
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* SORT BAR */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <p className="text-sm text-gray-500">
            Menampilkan <span className="font-semibold text-gray-700">{filtered.length}</span> peminjaman
            {filterStatus !== "semua" && ` · ${filterStatus}`}
          </p>
          <button
            onClick={() => setSortOrder((v) => v === "terbaru" ? "terlama" : "terbaru")}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition"
          >
            {sortOrder === "terbaru" ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            {sortOrder === "terbaru" ? "Terbaru dulu" : "Terlama dulu"}
          </button>
        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-500 font-semibold">
              {filterStatus === "semua" ? "Belum Ada Peminjaman" : `Tidak ada peminjaman "${filterStatus}"`}
            </h3>
            {filterStatus !== "semua"
              ? <button onClick={() => setFilterStatus("semua")} className="mt-4 text-yellow-600 hover:underline text-sm">Tampilkan semua</button>
              : <Link href="/koleksi-buku" className="mt-6 inline-block px-6 py-3 rounded-xl bg-yellow-600 text-white font-semibold">Pilih Buku</Link>
            }
          </div>
        )}

        {/* LIST */}
        <div className="space-y-4">
          {filtered.map((item, idx) => {
            const prevItem = filtered[idx - 1];
            const prevDate = prevItem ? parseDate(prevItem.tanggal).toDateString() : null;
            const thisDate = parseDate(item.tanggal).toDateString();
            const showDateLabel = idx === 0 || prevDate !== thisDate;

            return (
              <React.Fragment key={item.id}>
                {showDateLabel && (
                  <div className="flex items-center gap-3 my-3">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                      📅 {item.tanggal || "Tanggal tidak diketahui"} · {getRelativeTime(item.tanggal)}
                    </span>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>
                )}

                <div className={`bg-white rounded-xl shadow border-l-4 overflow-hidden transition hover:shadow-md ${
                  item.status === "pending"      ? "border-yellow-400" :
                  item.status === "disetujui"    ? "border-green-400"  :
                  item.status === "dipinjam"     ? "border-blue-400"   :
                  item.status === "dikembalikan" ? "border-gray-300"   :
                  item.status === "ditolak"      ? "border-red-400"    : "border-gray-300"
                }`}>
                  <div className="flex gap-4 p-5">
                    <div className="flex-shrink-0">
                      <img src={item.cover || fallbackImage} alt={item.title}
                        className="w-20 h-28 object-cover rounded-lg shadow"
                        onError={(e) => (e.target.src = fallbackImage)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-base text-gray-900 line-clamp-2 flex-1">{item.title}</h4>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-gray-500 text-sm mb-2">{item.author}</p>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                        <span>👤 <span className="font-medium text-gray-700">{item.user || "-"}</span></span>
                        <span>📅 <span className="font-medium text-gray-700">{item.tanggal || "-"}</span></span>
                        {item.durasi && <span>⏱️ <span className="font-medium text-gray-700">{item.durasi}</span></span>}
                        {item.tanggalDikembalikan && <span>🔄 <span className="font-medium text-gray-700">{item.tanggalDikembalikan}</span></span>}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {(item.status === "disetujui" || item.status === "dipinjam") && (
                          <button
                            onClick={() => { setSelectedItem(item); setConfirmAction("kembalikan"); setShowConfirmModal(true); }}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            <RotateCcw size={14} /> Kembalikan
                          </button>
                        )}
                        {item.status === "pending" && (
                          <span className="flex items-center gap-1.5 text-yellow-700 text-xs font-semibold bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
                            <Clock size={14} /> Menunggu persetujuan admin
                          </span>
                        )}
                        {item.status === "ditolak" && (
                          <span className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                            Permintaan ditolak oleh admin
                          </span>
                        )}
                        {(item.status === "dikembalikan" || item.status === "ditolak") && (
                          <button
                            onClick={() => { setSelectedItem(item); setConfirmAction("hapus"); setShowConfirmModal(true); }}
                            className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs font-semibold border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </main>

      {/* ── MODAL KONFIRMASI HAPUS / KEMBALIKAN ── */}
      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg overflow-hidden">
            <div className={`p-6 border-b ${confirmAction === "hapus" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
              <h2 className={`text-xl font-bold ${confirmAction === "hapus" ? "text-red-700" : "text-green-700"}`}>
                {confirmAction === "hapus" ? "🗑️ Hapus Data?" : "🔄 Kembalikan Buku?"}
              </h2>
              <p className="text-gray-700 mt-1 text-sm font-semibold">"{selectedItem.title}"</p>
              <p className="text-gray-500 mt-1 text-xs">
                {confirmAction === "hapus" ? "Data akan dihapus permanen." : "Pastikan buku sudah benar-benar dikembalikan."}
              </p>
            </div>
            <div className="p-5 flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg py-2 transition">Batal</button>
              <button
                onClick={confirmAction === "hapus" ? confirmHapus : confirmKembalikan}
                className={`flex-1 py-2 rounded-lg text-white font-semibold transition ${confirmAction === "hapus" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL RESET ── */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg overflow-hidden">

            {/* Header */}
            <div className="bg-red-50 border-b border-red-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-700">Reset Data Peminjaman</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Semua data peminjaman, riwayat, dan pengembalian akan <strong>dihapus permanen</strong>. Stok buku yang sedang dipinjam akan dikembalikan otomatis.
              </p>
            </div>

            {/* Info */}
            <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
              <p className="text-xs text-yellow-800 font-semibold mb-2">Data yang akan direset:</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>✅ Semua data peminjaman ({peminjaman.length} data)</li>
                <li>✅ Riwayat pengembalian</li>
                <li>✅ Riwayat baca</li>
                <li>✅ Stok buku dikembalikan ke posisi terakhir</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="p-5 flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg py-2.5 transition"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                disabled={resetLoading}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resetLoading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mereset...</>
                  : <><RefreshCw size={15} /> Ya, Reset Sekarang</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}