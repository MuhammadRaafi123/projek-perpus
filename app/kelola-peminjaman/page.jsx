"use client";

import React, { useEffect, useState } from "react";
import { 
  Check, X, Clock, BookOpen, Menu,
  Library, LayoutDashboard, UserSquare2, Notebook, Undo2
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function KelolaPeminjaman() {
  const [requests, setRequests] = useState([]);
  const [openSidebar, setOpenSidebar] = useState(false);
  const router = useRouter();

  const updateRequests = (newList) => {
    const sorted = [...newList].sort((a, b) => {
      const order = ["pending", "disetujui", "ditolak"];
      return order.indexOf(a.status) - order.indexOf(b.status);
    });

    setRequests(sorted);
    localStorage.setItem("peminjaman", JSON.stringify(sorted));
  };

  const handleSetuju = (id) => {
    const updated = requests.map((r) =>
      r.id === id ? { ...r, status: "disetujui" } : r
    );
    updateRequests(updated);
  };

  const handleTolak = (id) => {
    const updated = requests.map((r) =>
      r.id === id ? { ...r, status: "ditolak" } : r
    );
    updateRequests(updated);
  };

  const handleRefresh = () => {
    localStorage.removeItem("peminjaman");
    setRequests([]);
  };

  useEffect(() => {
    const saved = localStorage.getItem("peminjaman");
    if (saved) {
      const data = JSON.parse(saved);
      if (Array.isArray(data)) {
        updateRequests(data); 
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">

      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-yellow-800 text-white p-2 rounded-lg shadow-lg"
        onClick={() => setOpenSidebar(true)}
      >
        <Menu size={24} />
      </button>

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
          <button onClick={() => router.push("/Dashboard-Admin")} className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-[#A26012] transition font-medium">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow border text-center">
            <Clock size={30} className="mx-auto text-yellow-600" />
            <p className="mt-3 text-3xl font-bold text-yellow-600">
              {requests.filter((r) => r.status === "pending").length}
            </p>
            <p className="text-gray-600 font-semibold mt-1">Menunggu</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border text-center">
            <Check size={30} className="mx-auto text-green-600" />
            <p className="mt-3 text-3xl font-bold text-green-600">
              {requests.filter((r) => r.status === "disetujui").length}
            </p>
            <p className="text-gray-600 font-semibold mt-1">Disetujui</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border text-center">
            <X size={30} className="mx-auto text-red-600" />
            <p className="mt-3 text-3xl font-bold text-red-600">
              {requests.filter((r) => r.status === "ditolak").length}
            </p>
            <p className="text-gray-600 font-semibold mt-1">Ditolak</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">

          <div className="flex justify-end mb-5">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
            >
              <X size={18} /> Bersihkan Semua
            </button>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Daftar Permintaan</h2>

          {requests.length === 0 ? (
            <p className="text-gray-600">Belum ada permintaan peminjaman.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="border rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow"
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{req.title}</p>
                    <p className="text-gray-600 text-sm">{req.author}</p>
                    <p className="text-gray-700 mt-2 text-sm"><strong>Peminjam:</strong> {req.user}</p>
                    <p className="text-gray-700 text-sm"><strong>Durasi:</strong> {req.durasi}</p>
                    <p className="text-gray-700 text-sm"><strong>Tanggal:</strong> {req.tanggal}</p>
                    <p className="mt-2 font-semibold">
                      Status:{" "}
                      <span
                        className={
                          req.status === "pending"
                            ? "text-yellow-600"
                            : req.status === "disetujui"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {req.status}
                      </span>
                    </p>
                  </div>

                  {req.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSetuju(req.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Check size={18} /> Setujui
                      </button>

                      <button
                        onClick={() => handleTolak(req.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <X size={18} /> Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
