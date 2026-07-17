const STOCK_KEY = "book_stock_local";

export function getLocalStock() {
  try {
    const saved = localStorage.getItem(STOCK_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveLocalStock(stockMap) {
  try {
    localStorage.setItem(STOCK_KEY, JSON.stringify(stockMap));
  } catch (e) {
    console.error("Gagal simpan stok:", e);
  }
}

export function mergeStock(booksFromDB) {
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

export function decrementStock(kode_buku, currentStockMap) {
  const current = currentStockMap[kode_buku] ?? 0;
  const newStock = Math.max(0, current - 1);
  const updated = { ...currentStockMap, [kode_buku]: newStock };
  saveLocalStock(updated);
  return updated;
}