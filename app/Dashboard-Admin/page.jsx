"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  LayoutDashboard,
  Library,
  Notebook,
  Undo2,
  UserSquare2,
  Menu,
  X,
} from "lucide-react";

export default function DashboardAdmin() {
  const router = useRouter();

  

  const [requests, setRequests] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0); 
  const [loading, setLoading] = useState(true);

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadPeminjaman = () => {
    try {
      const saved = localStorage.getItem("peminjaman");

      if (saved) {
        const parsed = JSON.parse(saved);

        const normalized = parsed.map((item) => ({
          ...item,
          status: item.status?.toLowerCase(),
        }));

        setRequests(normalized);
      }
    } catch (e) {
      setRequests([]);
    }
  };

  const loadBooks = async () => {
  try {
    const res = await fetch("/api/books");
    const data = await res.json();

    const list =
      data?.data ||
      data?.books ||
      data?.book ||
      data?.results ||
      Array.isArray(data) ? data : [];

    setTotalBooks(list.length);
  } catch (e) {
    console.log("Error:", e);
    setTotalBooks(0);
  }
};


  // =====================================================
  // LOAD TOTAL SISWA (USER YANG DAFTAR)
  // =====================================================
  const loadSiswa = async () => {
    try {
      const res = await fetch("/api/users"); // ⬅️ SESUAIKAN JIKA ENDPOINT BERBEDA
      const data = await res.json();

      setTotalUsers(data?.data?.length || 0);
    } catch (e) {
      setTotalUsers(0);
    }
  };

  // =====================================================
  // EFFECT
  // =====================================================
  useEffect(() => {
    loadPeminjaman();
    loadBooks();
    loadSiswa();   // ⬅️ TAMBAHAN
  }, []);

  // =====================================================
  // BADGE STATUS
  // =====================================================
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const badge = {
      pending: "bg-yellow-100 text-yellow-800",
      disetujui: "bg-green-100 text-green-800",
      ditolak: "bg-red-100 text-red-800",
      dipinjam: "bg-blue-100 text-blue-800",
    };
    return badge[s] || "bg-gray-200 text-gray-700";
  };

  return (
    <div className="min-h-screen flex bg-gray-100 relative">

      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 bg-yellow-800 text-white flex flex-col p-6 shadow-xl hidden md:flex">
        <div className="flex items-center gap-3 mb-10">
          <Library className="w-8 h-8 text-yellow-300" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>

        <nav className="flex flex-col space-y-4">
          <button
            onClick={() => setActivePage("dashboard")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all 
              ${activePage === "dashboard" ? "bg-yellow-700 scale-[1.02]" : "hover:bg-yellow-700"}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => router.push("/kelola-buku")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700"
          >
            <BookOpen size={20} />
            Kelola Buku
          </button>

          <button
            onClick={() => router.push("/kelola-peminjaman")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700"
          >
            <Notebook size={20} />
            Peminjaman
          </button>

          <button
            onClick={() => router.push("/pengembalian")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700"
          >
            <Undo2 size={20} />
            Pengembalian
          </button>

          <button
            onClick={() => router.push("/profile-admin")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700"
          >
            <UserSquare2 size={20} />
            Profile
          </button>

        </nav>
      </aside>

      <main className="flex-1 p-6 md:ml-0">

        <header className="hidden md:flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-800 capitalize">
            {activePage}
          </h1>

          
        </header>

        {activePage === "dashboard" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              
              <div className="p-6 bg-white rounded-xl shadow border-l-4 border-yellow-500">
                <h3 className="text-gray-600 text-sm font-semibold">Total Buku</h3>
                <p className="text-3xl font-bold text-yellow-700 mt-2">{totalBooks}</p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow border-l-4 border-blue-500">
                <h3 className="text-gray-600 text-sm font-semibold">Total Siswa</h3>
                <p className="text-3xl font-bold text-blue-700 mt-2">{totalUsers}</p>
              </div>

              {/* Sedang Dipinjam */}
              <div className="p-6 bg-white rounded-xl shadow border-l-4 border-purple-500">
                <h3 className="text-gray-600 text-sm font-semibold">Sedang Dipinjam</h3>
                <p className="text-3xl font-bold text-purple-700 mt-2">
                  {requests.filter((r) => r.status === "disetujui").length}
                </p>
              </div>

              {/* Pending */}
              <div className="p-6 bg-white rounded-xl shadow border-l-4 border-red-500">
                <h3 className="text-gray-600 text-sm font-semibold">Pending</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
            </div>

            {/* STATISTIK AKTIVITAS */}
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-yellow-700" size={24} />
                <h3 className="text-lg font-bold text-yellow-800">
                  Aktivitas Peminjaman (7 Hari)
                </h3>
              </div>

              <div className="space-y-4">
                {["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"].map((day, idx) => {
                  const value = [45, 52, 38, 65, 48, 30, 15][idx];

                  return (
                    <div key={day}>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-gray-700">{day}</span>
                        <span className="font-semibold text-gray-900">{value}</span>
                      </div>

                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all"
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AKTIVITAS TERKINI */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-yellow-800" size={24} />
                <h3 className="text-lg font-bold text-yellow-800">Aktivitas Terkini</h3>
              </div>

              <div className="space-y-3">
                {requests.slice(0, 5).map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl text-white ${
                        activity.status === "pending"
                          ? "bg-yellow-500"
                          : activity.status === "disetujui"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {activity.status === "pending" ? "⏳" : activity.status === "disetujui" ? "✓" : "✗"}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {activity.status === "pending"
                          ? "Permintaan Baru"
                          : activity.status === "disetujui"
                          ? "Peminjaman Disetujui"
                          : "Peminjaman Ditolak"}
                      </p>

                      <p className="text-sm text-gray-600">
                        {activity.user} — {activity.title}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {activity.tanggal || "Baru saja"}
                      </p>
                    </div>

                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusBadge(activity.status)}`}>
                      {activity.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  ); 
}
