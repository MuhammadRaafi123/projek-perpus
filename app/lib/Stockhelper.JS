// =====================================================
// lib/stockHelper.js
// Utility untuk menyimpan stok buku ke localStorage
// agar stok tidak reset saat refresh
// =====================================================

const STOCK_KEY = "book_stock_local";

// Ambil semua stok lokal
export function getLocalStock() {
  try {
    const saved = localStorage.getItem(STOCK_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Simpan stok lokal
export function saveLocalStock(stockMap) {
  try {
    localStorage.setItem(STOCK_KEY, JSON.stringify(stockMap));
  } catch (e) {
    console.error("Gagal simpan stok:", e);
  }
}

// Gabungkan stok dari database dengan stok lokal
// Stok lokal selalu dipakai jika lebih kecil (sudah pernah berkurang)
export function mergeStock(booksFromDB) {
  const localStock = getLocalStock();
  const merged = {};

  booksFromDB.forEach((b) => {
    const key = b.kode_buku;
    const dbStok = b.stok_tersedia ?? b.stok_total ?? 0;

    if (localStock[key] !== undefined) {
      // Pakai stok lokal jika lebih kecil dari database
      // (artinya ada peminjaman lokal yang belum sync ke DB)
      merged[key] = Math.min(localStock[key], dbStok);
    } else {
      merged[key] = dbStok;
    }
  });

  return merged;
}

// Kurangi stok 1 buku
export function decrementStock(kode_buku, currentStockMap) {
  const current = currentStockMap[kode_buku] ?? 0;
  const newStock = Math.max(0, current - 1);
  const updated = { ...currentStockMap, [kode_buku]: newStock };
  saveLocalStock(updated);
  return updated;
}