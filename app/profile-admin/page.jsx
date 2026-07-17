"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Library,
  LayoutDashboard,
  BookOpen,
  Notebook,
  Undo2,
  UserSquare2,
  User,
  Mail,
  Calendar,
  Award,
  Loader2,
  LogOut,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ProfileAdminPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({});
  const [previewImage, setPreviewImage] = useState("");
  const [borrowHistory, setBorrowHistory] = useState([]);

  const resolveUserId = useCallback(async () => {
    try {
      const userDataStr = sessionStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData && userData.id) {
          return userData.id;
        }
      }
    } catch {

    }

    try {
      const res = await fetch("/api/profile/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.id) {
          try {
            sessionStorage.setItem("userData", JSON.stringify(data.user));
          } catch {

          }
          return data.user.id;
        }
      }
    } catch {

    }

    return null;
  }, []);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const userId = await resolveUserId();

      if (!userId) {
        router.push("/login-page");
        return;
      }

      const res = await fetch(`/api/profile-admin?userId=${userId}`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();

      if (!data.profileData) {
        throw new Error("Data profil tidak ditemukan dari server.");
      }

      setProfileData(data.profileData);

      setEditData({
        nama_lengkap: data.profileData.nama_lengkap || "",
        username: data.profileData.username || "",
        email: data.profileData.email || "",
        password: "",
        foto_profil: data.profileData.foto_profil || "",
      });

      let dbHistory = Array.isArray(data.borrowHistory) ? data.borrowHistory : [];

      try {
        let historyMap = new Map();
        dbHistory.forEach(h => historyMap.set(h.kode_peminjaman, h));

        const nLengkap = (data.profileData.nama_lengkap || "").toLowerCase().trim();
        const nUsername = (data.profileData.username || "").toLowerCase().trim();

        const matchUser = (l) => {
          if (!l.user) return false;
          const lu = l.user.toLowerCase().trim();
          return (nLengkap && lu === nLengkap) || (nUsername && lu === nUsername);
        };

        const savedLoans = localStorage.getItem("peminjaman");
        if (savedLoans) {
          const localData = JSON.parse(savedLoans);
          const userLocalLoans = localData.filter(matchUser);
          
          userLocalLoans.forEach(l => {
            historyMap.set(l.id, {
              kode_peminjaman: l.id,
              judul_buku: l.title,
              tanggal_pinjam: l.tanggal,
              tanggal_jatuh_tempo: l.durasi,
              tanggal_kembali: l.tanggalDikembalikan || "-",
              status: l.status
            });
          });
        }

        const savedPengembalian = localStorage.getItem("pengembalian");
        if (savedPengembalian) {
          const localPengembalian = JSON.parse(savedPengembalian);
          const userLocalPengembalian = localPengembalian.filter(matchUser);
          
          userLocalPengembalian.forEach(l => {
            if (!historyMap.has(l.id)) {
              historyMap.set(l.id, {
                kode_peminjaman: l.id,
                judul_buku: l.title,
                tanggal_pinjam: l.tanggalPinjam,
                tanggal_jatuh_tempo: "-",
                tanggal_kembali: l.tanggalDikembalikan || "-",
                status: "dikembalikan"
              });
            } else {
              const existing = historyMap.get(l.id);
              existing.status = "dikembalikan";
              existing.tanggal_kembali = l.tanggalDikembalikan || existing.tanggal_kembali;
            }
          });
        }

        dbHistory = Array.from(historyMap.values());
      } catch (err) {
        console.error("Gagal parse localStorage:", err);
      }

      setBorrowHistory(dbHistory);
    } catch (err) {
      console.error("loadProfile error:", err);

      let fallbackProfile = null;
      try {
        const userDataStr = sessionStorage.getItem("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData && userData.id) {
            fallbackProfile = {
              id: userData.id,
              nama_lengkap: userData.nama_lengkap || userData.username || "Admin",
              username: userData.username || "",
              email: userData.email || "",
              role: userData.role || "admin",
              status_akun: userData.status_akun || "aktif",
              created_at: "-",
              foto_profil: "",
            };
          }
        }
      } catch {

      }

      if (fallbackProfile) {
        setProfileData(fallbackProfile);

        setEditData({
          nama_lengkap: fallbackProfile.nama_lengkap || "",
          username: fallbackProfile.username || "",
          email: fallbackProfile.email || "",
          password: "",
          foto_profil: "",
        });

        setLoadError("Gagal memuat data lengkap. Menampilkan data tersimpan.");
      } else {
        setLoadError(err.message || "Gagal memuat profil.");
      }
      setBorrowHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [resolveUserId, router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    const namaLengkap = (editData.nama_lengkap || "").trim();
    const email = (editData.email || "").trim();

    if (!namaLengkap) {
      setSaveError("Nama lengkap tidak boleh kosong.");
      return;
    }

    if (!email) {
      setSaveError("Email tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const res = await fetch("/api/profile-admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profileData.id,
          nama_lengkap: namaLengkap,
          username: editData.username.trim(),
          email: email,
          password: editData.password,
          foto_profil: editData.foto_profil,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.error || `Gagal menyimpan (${res.status})`);
      }

      try {
        const currentStr = sessionStorage.getItem("userData");
        if (currentStr) {
          const current = JSON.parse(currentStr);
          sessionStorage.setItem(
            "userData",
            JSON.stringify({
              ...current,
              nama_lengkap: namaLengkap,
              username: editData.username,
              email: email,
            })
          );
        }
      } catch {
      
      }

      setProfileData((prev) => ({
        ...prev,
        nama_lengkap: namaLengkap,
        username: editData.username,
        email: email,
        foto_profil: editData.foto_profil || prev.foto_profil,
      }));

      setIsEditing(false);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setSaveError(err.message || "Gagal menyimpan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-profile", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Upload foto gagal");
      }

      setPreviewImage(result.path);
      setEditData((prev) => ({
        ...prev,
        foto_profil: result.path,
      }));

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Yakin ingin logout?")) return;

    try {
      sessionStorage.removeItem("userData");
    } catch {
    
    }

    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
    
    }

    window.location.href = "/login-page";
  };

  const getAvatar = (nama) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(nama || "U")}&size=200&background=d97706&color=fff&bold=true`;

  const avatarUrl =
    profileData?.foto_profil && !profileData.foto_profil.includes("default-avatar")
      ? profileData.foto_profil
      : getAvatar(profileData?.nama_lengkap || "U");

  
  const getStatusBadge = (status) => {
    const map = {
      menunggu: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Menunggu" },
      disetujui: { bg: "bg-green-100", text: "text-green-800", label: "Disetujui" },
      dipinjam: { bg: "bg-blue-100", text: "text-blue-800", label: "Dipinjam" },
      dikembalikan: { bg: "bg-gray-100", text: "text-gray-700", label: "Dikembalikan" },
      terlambat: { bg: "bg-orange-100", text: "text-orange-700", label: "Terlambat" },
      ditolak: { bg: "bg-red-100", text: "text-red-700", label: "Ditolak" },
    };
    const s = map[status] || { bg: "bg-gray-100", text: "text-gray-600", label: status || "-" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-500">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex w-full h-screen items-center justify-center bg-gray-100">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Gagal Memuat Profil</h2>
          <p className="text-gray-500 mb-6">{loadError || "Terjadi kesalahan saat memuat data profil."}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadProfile}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => router.push("/login-page")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold transition"
            >
              Ke Halaman Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100 relative">

      <aside className="w-64 bg-yellow-800 text-white flex flex-col p-6 shadow-xl hidden md:flex">
        <div className="flex items-center gap-3 mb-10">
          <Library className="w-8 h-8 text-yellow-300" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>

        <nav className="flex flex-col space-y-4">
          <button
            onClick={() => router.push("/Dashboard-Admin")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => router.push("/kelola-buku")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition"
          >
            <BookOpen size={20} />
            Kelola Buku
          </button>

          <button
            onClick={() => router.push("/kelola-peminjaman")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition"
          >
            <Notebook size={20} />
            Peminjaman
          </button>

          <button
            onClick={() => router.push("/pengembalian")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700 transition"
          >
            <Undo2 size={20} />
            Pengembalian
          </button>

          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-700 transition scale-[1.02]"
          >
            <UserSquare2 size={20} />
            Profile
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 md:ml-0 overflow-y-auto">

        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-800 capitalize">
            Profile Admin
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg shadow transition font-semibold"
          >
            <LogOut size={18} /> Logout
          </button>
        </header>

        {loadError && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <AlertCircle size={18} /> {loadError}
          </div>
        )}

        {saveSuccess && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <CheckCircle size={18} /> Profil berhasil diperbarui!
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md p-8 mb-6 border border-gray-100 max-w-4xl">
          <div className="flex gap-8 items-start flex-wrap">

            <div className="flex flex-col items-center gap-3">
              <img
                src={
                  previewImage
                    ? previewImage
                    : profileData.foto_profil
                    ? profileData.foto_profil
                    : avatarUrl
                }
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-lg object-cover"
              />

              {isEditing && (
                <>
                  <label className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    Upload Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500">JPG, PNG, JPEG</p>
                </>
              )}

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                👑 Admin
              </span>
            </div>

            <div className="flex-1 min-w-0">
              {!isEditing ? (
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {profileData.nama_lengkap || "User"}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mt-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-yellow-600 flex-shrink-0" />
                      <span>@{profileData.username || "-"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-yellow-600 flex-shrink-0" />
                      <span className="truncate">{profileData.email || "-"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-yellow-600 flex-shrink-0" />
                      <span>Bergabung: {profileData.created_at || "-"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-yellow-600 flex-shrink-0" />
                      <span className="capitalize">
                        Status: {profileData.status_akun || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      value={editData.nama_lengkap || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, nama_lengkap: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Username
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      value={editData.username || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, username: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      value={editData.email || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Kosongkan jika tidak ingin mengganti password"
                      className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      value={editData.password || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, password: e.target.value })
                      }
                    />
                  </div>

                  {saveError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg mt-2">
                      <AlertCircle size={15} />
                      {saveError}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-4 md:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setSaveError("");
                  }}
                  className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow w-full md:w-auto"
                >
                  <Edit2 size={16} /> Edit Profil
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow w-full md:w-auto disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Simpan
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSaveError("");
                      setEditData({
                        nama_lengkap: profileData.nama_lengkap || "",
                        username: profileData.username || "",
                        email: profileData.email || "",
                        password: "",
                        foto_profil: profileData.foto_profil || "",
                      });
                      setPreviewImage("");
                    }}
                    className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold transition w-full md:w-auto"
                  >
                    <X size={16} /> Batal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-yellow-500 pl-3">
            Riwayat Peminjaman
          </h2>

          {borrowHistory.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada riwayat peminjaman.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-gray-600">Kode</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Judul Buku</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Tgl Pinjam</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Jatuh Tempo</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Tgl Kembali</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowHistory.map((item, i) => (
                    <tr key={item.kode_peminjaman || i} className={`border-t border-gray-100 hover:bg-gray-50 transition ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.kode_peminjaman || "-"}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{item.judul_buku || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{item.tanggal_pinjam || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{item.tanggal_jatuh_tempo || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{item.tanggal_kembali || "-"}</td>
                      <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
