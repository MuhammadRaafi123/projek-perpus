"use client";

import React, { useEffect, useState } from "react";
import { 
  Check, X, Clock, BookOpen, Menu,
  Library, LayoutDashboard, UserSquare2, Notebook, Undo2, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function KelolaPeminjaman() {
  const [requests, setRequests] = useState([]);
  const [openSidebar, setOpenSidebar] = useState(false);
  const router = useRouter();

  const updateRequests = (newList) => {
    const sorted = [...newList].sort((a, b) => {
      const statusA = (a.status || "").toLowerCase();
      const statusB = (b.status || "").toLowerCase();
      
      const isPendingA = statusA === "pending" || statusA === "menunggu";
      const isPendingB = statusB === "pending" || statusB === "menunggu";

      if (isPendingA && !isPendingB) return -1;
      if (!isPendingA && isPendingB) return 1;

      const dateA = new Date(a.created_at || a.tanggal_pinjam || a.tanggal || 0);
      const dateB = new Date(b.created_at || b.tanggal_pinjam || b.tanggal || 0);
      return dateB - dateA;
    });

    setRequests(sorted);
    localStorage.setItem("peminjaman", JSON.stringify(sorted));
  };

  const fetchPeminjaman = async () => {
    try {
      const res = await fetch("/api/peminjaman");
      const data = await res.json();
      const rawList = data?.data || data?.peminjaman || data?.result || (Array.isArray(data) ? data : []);

      if (rawList.length > 0) {
        const normalized = rawList.map((item) => {
          const dateSource = item.created_at || item.tanggal_pinjam || item.tanggal;
          const parsedDate = dateSource ? new Date(dateSource) : new Date();

          return {
            ...item,
            status: item.status?.toLowerCase(),
            user: item.nama_lengkap || item.user,
            title: item.judul || item.title,
            cover: item.cover_url || item.gambar || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=150&auto=format&fit=crop", 
            tanggal: !isNaN(parsedDate.getTime())
              ? parsedDate.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Baru saja",
          };
        });
        updateRequests(normalized);
      } else {
        const saved = localStorage.getItem("peminjaman");
        if (saved) {
          updateRequests(JSON.parse(saved));
        }
      }
    } catch (e) {
      console.log("Error fetching peminjaman:", e);
      const saved = localStorage.getItem("peminjaman");
      if (saved) {
        updateRequests(JSON.parse(saved));
      }
    }
  };

  const handleSetuju = (id) => {
    const updated = requests.map((r) =>
      r.id === id ? { ...r, status: "disetujui" } : r
    );
    updateRequests(updated);
  };

  const handleTolak = (id) => {
    const updated = requests.map((r) => {
      if (r.id === id) {
        fetch("/api/books/update-stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kode_buku: r.bookId || r.buku_id, action: "increment" }),
        }).catch(console.error);
        return { ...r, status: "ditolak" };
      }
      return r;
    });
    updateRequests(updated);
  };

  const handleRefresh = () => {
    localStorage.removeItem("peminjaman");
    setRequests([]);
    fetchPeminjaman();
  };

  useEffect(() => {
    fetchPeminjaman();
  }, []);

  const renderStatusBadge = (status) => {
    if (status === "pending" || status === "menunggu") {
      return (
        <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
          <Clock size={14} /> Menunggu
        </span>
      );
    }
    if (status === "disetujui" || status === "dipinjam") {
      return (
        <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
          <Check size={14} /> Disetujui
        </span>
      );
    }
    return (
      <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
        <X size={14} /> Ditolak
      </span>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Tombol Menu Mobile Asli */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-yellow-800 text-white p-2 rounded-lg shadow-lg"
        onClick={() => setOpenSidebar(true)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Asli - Tidak Diubah */}
      <aside
        className={`
          w-64 bg-[#8A4B08] text-white flex flex-col p-6 shadow-2xl fixed h-full z-40
          transform transition-transform duration-300
          ${openSidebar ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0`}
      >
        <button
          className="md:hidden text-white mb-4"
          onClick={() => setOpenSidebar(false)}
        >
          <X size={26} />
        </button>

        <div className="flex items-center gap-3 mb-10">
          <Library className="w-8 h-8 text-yellow-300" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>

        <nav className="flex flex-col space-y-4">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-[#A26012] transition font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </button>

          <button onClick={() => router.push("/kelola-buku")} className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-[#A26012] transition font-medium">
            <BookOpen size={20} /> Kelola Buku
          </button>

          <button onClick={() => router.push("/kelola-peminjaman")} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#A26012] text-white transition font-medium">
            <Notebook size={20} /> Peminjaman
          </button>

          <button onClick={() => router.push("/pengembalian")} className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-[#A26012] transition font-medium">
            <Undo2 size={20} /> Pengembalian
          </button>

          <button onClick={() => router.push("/profile-admin")} className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-[#A26012] transition font-medium">
            <UserSquare2 size={20} /> Profile
          </button>
        </nav>
      </aside>

      <main className="p-10 w-full md:ml-64 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6 text-gray-700 border-l-4 border-yellow-500 pl-3">
          Kelola Permintaan Peminjaman
        </h1>

        {/* Statistik Cards Modern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="p-4 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Clock size={32} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {requests.filter((r) => r.status === "pending" || r.status === "menunggu").length}
              </p>
              <p className="text-gray-500 text-sm font-semibold">Menunggu Persetujuan</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="p-4 bg-green-50 rounded-xl flex items-center justify-center">
              <Check size={32} className="text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {requests.filter((r) => r.status === "disetujui" || r.status === "dipinjam").length}
              </p>
              <p className="text-gray-500 text-sm font-semibold">Buku Dipinjam</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="p-4 bg-red-50 rounded-xl flex items-center justify-center">
              <X size={32} className="text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {requests.filter((r) => r.status === "ditolak").length}
              </p>
              <p className="text-gray-500 text-sm font-semibold">Permintaan Ditolak</p>
            </div>
          </div>
        </div>

        {/* Tabel Data Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-700">Daftar Permintaan</h2>
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
            >
              <RefreshCw size={16} /> Segarkan Data
            </button>
          </div>

          <div className="overflow-x-auto">
            {requests.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
                <p>Belum ada permintaan peminjaman saat ini.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Info Buku</th>
                    <th className="px-6 py-4 font-semibold">Peminjam</th>
                    <th className="px-6 py-4 font-semibold">Waktu & Durasi</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                    <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition duration-150">
                      
                      {/* Kolom Info Buku */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={req.cover || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=150&auto=format&fit=crop"} 
                            alt={req.title || req.judul}
                            className="w-12 h-16 object-cover rounded shadow-sm border border-gray-200"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{req.title || req.judul}</p>
                            <p className="text-gray-500 text-xs mt-1">{req.author || req.pengarang}</p>
                          </div>
                        </div>
                      </td>

                      {/* Kolom Peminjam */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {(req.user || req.nama_lengkap || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-700">{req.user || req.nama_lengkap}</span>
                        </div>
                      </td>

                      {/* Kolom Waktu & Durasi */}
                      <td className="px-6 py-4">
                        <p className="text-gray-800 mb-1">{req.tanggal}</p>
                        <p className="text-gray-500 text-xs">{req.durasi || "7 Hari"}</p>
                      </td>

                      {/* Kolom Status */}
                      <td className="px-6 py-4 text-center">
                        {renderStatusBadge(req.status)}
                      </td>

                      {/* Kolom Aksi */}
                      <td className="px-6 py-4 text-center">
                        {(req.status === "pending" || req.status === "menunggu") ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleSetuju(req.id)}
                              title="Setujui"
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition shadow-sm border border-green-200 hover:border-transparent flex items-center justify-center"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleTolak(req.id)}
                              title="Tolak"
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm border border-red-200 hover:border-transparent flex items-center justify-center"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Selesai</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}