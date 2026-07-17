"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Library, LayoutDashboard, BookOpen, Notebook, UserSquare2,
  Undo2, Plus, Search, Edit, Trash2, X, Save, RefreshCw,
} from "lucide-react";

export default function KelolaBukuPage() {
  const router = useRouter();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); 
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    title: "", author: "", publisher: "",
    description: "", year: "", stock: 1, available: 1, cover: "",
  });

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat buku:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBooks(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const resetForm = () => {
    setForm({ title: "", author: "", publisher: "", description: "", year: "", stock: 1, available: 1, cover: "" });
    setShowForm(false);
    setEditId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;

    setSaveLoading(true);
    try {
      const payload = {
        judul:         form.title,
        pengarang:     form.author,
        penerbit:      form.publisher  || null,
        tahun_terbit:  form.year       || null,
        deskripsi:     form.description || null,
        gambar:        form.cover      || null,
        stok_total:    Number(form.stock),
        stok_tersedia: Number(form.available),
      };

      if (editId) {

        const res = await fetch(`/api/books/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Gagal update");
        showToast("✅ Buku berhasil diupdate");
      } else {

        const res = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Gagal tambah");
        showToast("✅ Buku berhasil ditambahkan");
      }

      await loadBooks();
      resetForm();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCover = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-book", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Upload foto gagal");
      }

      setForm((f) => ({ ...f, cover: result.path }));

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/books/${deleteConfirm.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "Gagal menghapus buku.");
        return;
      }

      await loadBooks();
      setDeleteConfirm(null);
      showToast("🗑️ Buku berhasil dihapus");
    } catch (err) {
      setDeleteError("Terjadi kesalahan: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = books.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.judul     || "").toLowerCase().includes(q) ||
      (b.pengarang || "").toLowerCase().includes(q) ||
      String(b.tahun_terbit || "").includes(q)
    );
  });

  return (
    <div className="min-h-screen flex bg-gray-100">

      <aside className="w-64 bg-yellow-800 text-white flex-col p-6 shadow-xl hidden md:flex">
        <div className="flex items-center gap-3 mb-10">
          <Library className="w-8 h-8 text-yellow-300" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex flex-col space-y-4">
          <button onClick={() => router.push("/Dashboard-Admin")} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-700">
            <BookOpen size={20} /> Kelola Buku
          </button>
          <button onClick={() => router.push("/kelola-peminjaman")} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition">
            <Notebook size={20} /> Peminjaman
          </button>
          <button onClick={() => router.push("/pengembalian")} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition">
            <Undo2 size={20} /> Pengembalian
          </button>
          <button onClick={() => router.push("/profile-admin")} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition">
            <UserSquare2 size={20} /> Profile
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6">

        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="text-amber-700 w-9 h-9" />
            <div>
              <h1 className="text-3xl font-bold text-amber-800">Kelola Buku</h1>
              <p className="text-sm text-gray-500">Manajemen koleksi buku perpustakaan</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={loadBooks} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition flex items-center gap-2">
              <RefreshCw size={18} /> Refresh
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition flex items-center gap-2"
            >
              <Plus size={18} /> Tambah Buku
            </button>
          </div>
        </header>

        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, pengarang..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border bg-white shadow focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filtered.length} buku ditemukan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500">Memuat buku...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p>Tidak ada buku ditemukan.</p>
            </div>
          ) : (
            filtered.map((book) => (
              <div key={book.kode_buku || book.id} className="bg-white rounded-2xl shadow p-4 border border-amber-100 flex flex-col hover:shadow-md transition">

                <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center mb-3">
                  {book.gambar && !book.gambar.includes("default-book-cover") ? (
                    <img
                      src={book.gambar}
                      alt={book.judul}
                      className="object-cover w-full h-full"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <BookOpen size={32} className="mx-auto mb-1 opacity-40" />
                      <span className="text-xs">Tidak ada sampul</span>
                    </div>
                  )}
                </div>

                <h2 className="font-semibold text-base text-amber-800 line-clamp-2 mb-1">{book.judul}</h2>
                <p className="text-gray-600 text-sm mb-1">{book.pengarang}</p>
                <p className="text-gray-400 text-xs mb-2">
                  {book.penerbit || "-"}{book.tahun_terbit ? ` · ${book.tahun_terbit}` : ""}
                </p>

                <div className="flex gap-2 text-xs mb-3">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                    Tersedia: {book.stok_tersedia ?? 0}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    Total: {book.stok_total ?? 0}
                  </span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => {
                      setEditId(book.id);
                      setForm({
                        title:       book.judul         || "",
                        author:      book.pengarang     || "",
                        publisher:   book.penerbit      || "",
                        description: book.deskripsi     || "",
                        year:        book.tahun_terbit  || "",
                        stock:       book.stok_total    ?? 1,
                        available:   book.stok_tersedia ?? 1,
                        cover:       book.gambar        || "",
                      });
                      setShowForm(true);
                    }}
                    className="flex-1 py-2 border rounded-xl flex items-center justify-center gap-1.5 hover:bg-amber-50 transition text-sm font-semibold text-amber-800"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>

                  <button
                    onClick={() => {
                      setDeleteError("");
                      setDeleteConfirm({ id: book.id, judul: book.judul });
                    }}
                    className="flex-1 py-2 border border-red-200 rounded-xl flex items-center justify-center gap-1.5 hover:bg-red-50 transition text-sm font-semibold text-red-600"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-extrabold text-amber-900">
                {editId ? "✏️ Edit Buku" : "📚 Tambah Buku"}
              </h2>
              <button type="button" onClick={resetForm}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-700" />
              </button>
            </div>

            <div className="grid gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Judul *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Judul buku" required
                  className="w-full border rounded-xl px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Pengarang *</label>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Nama pengarang" required
                  className="w-full border rounded-xl px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Penerbit</label>
                <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                  placeholder="Nama penerbit"
                  className="w-full border rounded-xl px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Deskripsi</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Deskripsi singkat buku"
                  className="w-full border rounded-xl px-3 py-2 text-black min-h-[80px] focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Tahun</label>
                  <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="2024"
                    className="w-full border rounded-xl px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Stok Total</label>
                  <input type="number" min="0" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Stok Tersedia</label>
                  <input type="number" min="0" value={form.available}
                    onChange={(e) => setForm({ ...form, available: Number(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Cover Buku</label>
                <input type="file" accept="image/*"
                  onChange={(e) => handleCover(e.target.files?.[0])}
                  className="w-full border rounded-xl px-3 py-2 text-sm text-gray-600" />
                {form.cover && (
                  <div className="mt-2 relative w-24">
                    <img src={form.cover} className="w-24 h-32 object-cover rounded-lg border" />
                    <button type="button"
                      onClick={() => setForm((f) => ({ ...f, cover: "" }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={saveLoading}
              className="mt-5 w-full py-2.5 bg-amber-700 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-amber-800 transition disabled:opacity-60">
              {saveLoading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Save className="w-5 h-5" />}
              {saveLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">

            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>

            <h3 className="text-xl font-bold text-center text-gray-800 mb-1">Hapus Buku?</h3>
            <p className="text-center text-gray-500 text-sm mb-1">Anda akan menghapus:</p>
            <p className="text-center font-semibold text-amber-800 mb-1">"{deleteConfirm.judul}"</p>
            <p className="text-center text-xs text-red-500 mb-4">Tindakan ini tidak dapat dibatalkan.</p>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                ⚠️ {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteError(""); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteLoading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Trash2 size={16} />}
                {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </div>
  );
}