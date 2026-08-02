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
  ChevronDown,
} from "lucide-react";

export default function DashboardAdmin() {
  const router = useRouter();

  const [requests, setRequests] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const [activePage, setActivePage] = useState("dashboard");

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const monthNamesFull = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  
  // Label untuk sumbu X: Per minggu dalam sebulan
  const weekNames = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];

  const loadPeminjaman = async () => {
    try {
      const res = await fetch("/api/peminjaman");
      const data = await res.json();
      
      // Ambil array data dengan lebih fleksibel (mendukung berbagai format respons API)
      const rawList = data?.data || data?.peminjaman || data?.result || (Array.isArray(data) ? data : []);

      if (rawList.length > 0) {
        const normalized = rawList.map((item) => {
          const dateSource = item.created_at || item.tanggal_pinjam || item.tanggal;
          let parsedDate = dateSource ? new Date(dateSource) : new Date();
          
          if (typeof dateSource === 'string' && dateSource.includes('/')) {
            const [d, m, y] = dateSource.split('/');
            if (y && y.length === 4) {
              parsedDate = new Date(`${y}-${m}-${d}`);
            }
          }

          return {
            ...item,
            status: item.status?.toLowerCase(),
            user: item.nama_lengkap || item.user,
            title: item.judul || item.title,
            raw_date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
            tanggal: !isNaN(parsedDate.getTime())
              ? parsedDate.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Baru saja",
          };
        });
        setRequests(normalized);
      } else {
        const saved = localStorage.getItem("peminjaman");
        if (saved) {
          const parsed = JSON.parse(saved);
          const normalized = parsed.map((item) => {
            const dateSource = item.created_at || item.tanggal_pinjam || item.tanggal;
            let parsedDate = dateSource ? new Date(dateSource) : new Date();
            
            if (typeof dateSource === 'string' && dateSource.includes('/')) {
              const [d, m, y] = dateSource.split('/');
              if (y && y.length === 4) {
                parsedDate = new Date(`${y}-${m}-${d}`);
              }
            }

            return {
              ...item,
              status: item.status?.toLowerCase(),
              user: item.nama_lengkap || item.user,
              title: item.judul || item.title,
              raw_date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
              tanggal: !isNaN(parsedDate.getTime())
                ? parsedDate.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Baru saja",
            };
          });
          setRequests(normalized);
        } else {
          setRequests([]);
        }
      }
    } catch (e) {
      console.log("Error loading peminjaman:", e);
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
        (Array.isArray(data) ? data : []);
      setTotalBooks(list.length);
    } catch (e) {
      console.log("Error:", e);
      setTotalBooks(0);
    }
  };

  const loadSiswa = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setTotalUsers(data?.data?.length || 0);
    } catch (e) {
      setTotalUsers(0);
    }
  };

  useEffect(() => {
    loadPeminjaman();
    loadBooks();
    loadSiswa();
  }, []);

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const badge = {
      pending: "bg-yellow-100 text-yellow-800",
      menunggu: "bg-yellow-100 text-yellow-800",
      disetujui: "bg-green-100 text-green-800",
      ditolak: "bg-red-100 text-red-800",
      dipinjam: "bg-blue-100 text-blue-800",
    };
    return badge[s] || "bg-gray-200 text-gray-700";
  };

  // Chart: X-axis = Minggu 1 s.d. 4, mengelompokkan data berdasarkan tanggal di bulan+tahun terpilih
  const getChartData = () => {
    const data = [
      { label: "Minggu 1", value: 0 },
      { label: "Minggu 2", value: 0 },
      { label: "Minggu 3", value: 0 },
      { label: "Minggu 4", value: 0 },
    ];
    let max = 5;

    requests.forEach((req) => {
      if (!req.raw_date) return;
      const reqDate = new Date(req.raw_date);
      if (isNaN(reqDate.getTime())) return;

      if (isNaN(reqDate.getTime())) return;

      // Cek apakah bulan dan tahunnya sesuai dengan filter dropdown
      if (reqDate.getMonth() === selectedMonth && reqDate.getFullYear() === selectedYear) {
        const dayOfMonth = reqDate.getDate(); // Tanggal 1 sampai 31
        
        // Tentukan masuk minggu ke berapa (1-7 = Mg 1, 8-14 = Mg 2, 15-21 = Mg 3, 22+ = Mg 4)
        let weekIndex = Math.floor((dayOfMonth - 1) / 7);
        if (weekIndex > 3) weekIndex = 3; // Batasi maksimal ke index 3 (Minggu 4)

        data[weekIndex].value += 1;
      }
    });

    data.forEach((item) => {
      if (item.value > max) {
        max = item.value + Math.ceil(item.value * 0.2);
      }
    });

    return { data, max };
  };

  const chartInfo = getChartData();

  return (
    <div className="min-h-screen flex bg-gray-50 relative">
      {/* Sidebar */}
      <aside className="w-64 bg-yellow-800 text-white flex flex-col p-6 shadow-xl hidden md:flex">
        <div className="flex items-center gap-3 mb-10">
          <Library className="w-8 h-8 text-yellow-300" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>

        <nav className="flex flex-col space-y-4">
          <button
            onClick={() => setActivePage("dashboard")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all 
              ${activePage === "dashboard" ? "bg-yellow-700 scale-[1.02] shadow-md" : "hover:bg-yellow-700"}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => router.push("/kelola-buku")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <BookOpen size={20} />
            Kelola Buku
          </button>

          <button
            onClick={() => router.push("/kelola-peminjaman")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Notebook size={20} />
            Peminjaman
          </button>

          <button
            onClick={() => router.push("/pengembalian")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Undo2 size={20} />
            Pengembalian
          </button>

          <button
            onClick={() => router.push("/profile-admin")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <UserSquare2 size={20} />
            Profile
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-0 overflow-hidden">
        <header className="hidden md:flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 capitalize">{activePage}</h1>
        </header>

        {activePage === "dashboard" && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Buku</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{totalBooks}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <BookOpen className="text-yellow-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Siswa</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Sedang Dipinjam</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {requests.filter((r) => r.status === "disetujui" || r.status === "dipinjam").length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <RefreshCw className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {requests.filter((r) => r.status === "pending" || r.status === "menunggu").length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <Clock className="text-red-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg shrink-0">
                    <TrendingUp className="text-yellow-700" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Tren Data Peminjaman</h3>
                    <p className="text-sm text-gray-500">
                      {monthNamesFull[selectedMonth]} {selectedYear}
                    </p>
                  </div>
                </div>

                {/* Month & Year Selectors */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="appearance-none text-sm font-semibold text-yellow-800 bg-yellow-50 pl-3 pr-8 py-2 rounded-lg border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer hover:bg-yellow-100 transition-colors"
                    >
                      {monthNames.map((month, idx) => (
                        <option key={idx} value={idx}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-600 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="appearance-none text-sm font-semibold text-yellow-800 bg-yellow-50 pl-3 pr-8 py-2 rounded-lg border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer hover:bg-yellow-100 transition-colors"
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bar Chart — 4 bars: Minggu 1 - Minggu 4 */}
              <div className="relative h-64 mt-4 flex items-end">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-10 z-0">
                  {[4, 3, 2, 1, 0].map((i) => (
                    <div key={i} className="w-full border-t border-dashed border-gray-200 flex-1"></div>
                  ))}
                </div>

                {/* Bars */}
                <div className="relative z-10 w-full h-full flex items-end justify-between gap-6 px-4 pb-1">
                  {chartInfo.data.map((item, idx) => {
                    const percentage = (item.value / chartInfo.max) * 100;

                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group h-full justify-end cursor-pointer">
                        <div className="relative flex justify-center w-full h-full items-end">
                          {/* Tooltip */}
                          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 bg-gray-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg whitespace-nowrap z-20 shadow-xl pointer-events-none">
                            {item.label}: {item.value} peminjaman
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>

                          {/* Bar */}
                          <div
                            className="w-full max-w-[64px] bg-yellow-800 rounded-t-lg transition-all duration-300 group-hover:bg-yellow-600 relative shadow-sm group-hover:shadow-md"
                            style={{ height: `${percentage}%`, minHeight: item.value > 0 ? "10px" : "0px" }}
                          ></div>
                        </div>

                        {/* Week Label */}
                        <span className="mt-3 text-xs sm:text-sm font-medium text-gray-500 group-hover:text-yellow-800 transition-colors text-center">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Calendar className="text-gray-700" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Aktivitas Terkini</h3>
                </div>
              </div>

              <div className="space-y-4">
                {requests.slice(0, 5).map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl text-white shadow-sm ${
                        activity.status === "pending" || activity.status === "menunggu"
                          ? "bg-yellow-500"
                          : activity.status === "disetujui" || activity.status === "dipinjam"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {activity.status === "pending" || activity.status === "menunggu"
                        ? "⏳"
                        : activity.status === "disetujui" || activity.status === "dipinjam"
                        ? "✓"
                        : "✗"}
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-gray-800 capitalize">
                        {activity.status === "pending" || activity.status === "menunggu"
                          ? "Permintaan Baru"
                          : activity.status === "disetujui" || activity.status === "dipinjam"
                          ? "Peminjaman Disetujui"
                          : "Peminjaman Ditolak"}
                      </p>

                      <p className="text-sm text-gray-600 mt-0.5">
                        <span className="font-medium">{activity.user}</span> meminjam &quot;{activity.title}&quot;
                      </p>

                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <Clock size={12} />
                        {activity.tanggal || "Baru saja"}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1.5 text-xs rounded-full font-bold uppercase tracking-wider ${getStatusBadge(
                        activity.status
                      )}`}
                    >
                      {activity.status}
                    </span>
                  </div>
                ))}

                {requests.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Belum ada aktivitas.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}