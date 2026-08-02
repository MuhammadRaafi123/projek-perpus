"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Library, LayoutDashboard, BookOpen, Notebook, Undo2, UserSquare2,
  User, Mail, Calendar, Award, Loader2, LogOut, Edit2, Save, X,
  CheckCircle, AlertCircle, Camera, ShieldAlert
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

  const resolveUserId = useCallback(async () => {
    try {
      const userDataStr = sessionStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData && userData.id) {
          return userData.id;
        }
      }
    } catch {}

    try {
      const res = await fetch("/api/profile/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.id) {
          try {
            sessionStorage.setItem("userData", JSON.stringify(data.user));
          } catch {}
          return data.user.id;
        }
      }
    } catch {}

    return null;
  }, []);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const userId = await resolveUserId();

      if (!userId) {
        router.push("/login");
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
      } catch {}

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
        headers: { "Content-Type": "application/json" },
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
      } catch {}

      setProfileData((prev) => ({
        ...prev,
        nama_lengkap: namaLengkap,
        username: editData.username,
        email: email,
        foto_profil: editData.foto_profil || prev.foto_profil,
      }));

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
    try { sessionStorage.removeItem("userData"); } catch {}
    try { await fetch("/api/logout", { method: "POST" }); } catch {}
    window.location.href = "/login";
  };

  const getAvatar = (nama) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(nama || "A")}&size=200&background=d97706&color=fff&bold=true`;

  const avatarUrl =
    profileData?.foto_profil && !profileData.foto_profil.includes("default-avatar")
      ? profileData.foto_profil
      : getAvatar(profileData?.nama_lengkap || "A");

  if (isLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-600 mx-auto mb-3" />
          <p className="text-gray-500">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex w-full h-screen items-center justify-center bg-gray-100">
        <div className="text-center max-w-md mx-auto p-10 bg-white border border-gray-200 rounded-3xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gagal Memuat Profil</h2>
          <p className="text-gray-500 mb-8">{loadError || "Terjadi kesalahan saat memuat data profil."}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadProfile}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => router.push("/login")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              Ke Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar - sama persis dengan Dashboard Admin */}
      <aside className="w-64 bg-yellow-800 text-white flex flex-col p-6 shadow-xl hidden md:flex">
        <div className="flex items-center gap-3 mb-10">
          <Library className="w-8 h-8 text-yellow-300" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>

        <nav className="flex flex-col space-y-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-700"
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-700 scale-[1.02] transition-all"
          >
            <UserSquare2 size={20} />
            Profile
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-800">Profile Admin</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 px-5 py-2.5 rounded-lg shadow-sm transition-all font-medium"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Alert Messages */}
        {loadError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl mb-6">
            <AlertCircle size={20} className="shrink-0" />
            <p className="font-medium">{loadError}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl mb-6">
            <CheckCircle size={20} className="shrink-0" />
            <p className="font-medium">Profil admin berhasil diperbarui!</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 w-full md:w-auto">
              <div className="relative group">
                <img
                  src={previewImage ? previewImage : (profileData.foto_profil || avatarUrl)}
                  alt="Admin Avatar"
                  className="w-36 h-36 rounded-full border-4 border-yellow-100 shadow-md object-cover bg-gray-100 transition-transform duration-300 group-hover:scale-105"
                />
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex flex-col items-center text-white">
                      <Camera size={24} className="mb-1" />
                      <span className="text-xs font-medium">Ubah Foto</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 border border-yellow-200 text-sm font-bold text-yellow-800">
                <ShieldAlert size={16} />
                SUPER ADMIN
              </div>
            </div>

            {/* Details / Edit Form Section */}
            <div className="flex-1 w-full">
              {!isEditing ? (
                <div className="space-y-6">
                  {/* Name & Username */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {profileData.nama_lengkap || "Admin Sistem"}
                    </h2>
                    <p className="text-gray-500 text-base mt-0.5">
                      @{profileData.username || "admin"}
                    </p>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                      <div className="p-2.5 bg-white rounded-lg text-yellow-600 shadow-sm">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-gray-800 font-medium text-sm truncate">{profileData.email || "-"}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                      <div className="p-2.5 bg-white rounded-lg text-orange-500 shadow-sm">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Tanggal Dibuat</p>
                        <p className="text-gray-800 font-medium text-sm">{profileData.created_at || "-"}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4 sm:col-span-2">
                      <div className="p-2.5 bg-white rounded-lg text-green-500 shadow-sm">
                        <Award size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Status Akses</p>
                        <p className="text-green-600 font-medium text-sm capitalize flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          {profileData.status_akun || "Aktif - Full Access"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => { setIsEditing(true); setSaveError(""); }}
                      className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm"
                    >
                      <Edit2 size={18} /> Edit Data Admin
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Edit Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                        value={editData.nama_lengkap || ""}
                        onChange={(e) => setEditData({ ...editData, nama_lengkap: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Username Admin</label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                        value={editData.username || ""}
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Email Utama</label>
                      <input
                        type="email"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                        value={editData.email || ""}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Password Baru</label>
                      <input
                        type="password"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                        placeholder="Kosongkan jika tidak ingin mengubah password"
                        value={editData.password || ""}
                        onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                      />
                    </div>
                  </div>

                  {saveError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                      <AlertCircle size={16} /> <p className="font-medium">{saveError}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
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
                      className="px-5 py-3 rounded-lg font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <><Loader2 size={18} className="animate-spin" /> Proses...</>
                      ) : (
                        <><Save size={18} /> Simpan Perubahan</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

