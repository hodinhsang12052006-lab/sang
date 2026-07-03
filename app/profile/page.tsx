"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { 
  ArrowLeft, Edit3, MapPin, Phone, Mail, FileText, 
  Sparkles, ShieldCheck, BadgeCheck, Star, Briefcase, 
  DollarSign, Clock, X, Loader2, Save 
} from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

interface JobType {
  id: string;
  title: string;
  companyName: string;
  salary: string;
  niche: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({
    name: "",
    email: "",
    role: "USER",
    bio: "",
    phone: "",
    address: "",
    cover_image: "",
    cv_url: "",
    skills: "",
    pawCoin: 150,
    reputation: 10,
    trustScore: 5.0,
    isVerified: false,
    jobs: [],
  });

  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    phone: "",
    address: "",
    cover_image: "",
    cv_url: "",
    skills: "",
  });

  const [claiming, setClaiming] = useState(false);

  // Load user profile details on mount
  async function loadUserProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditForm({
          name: data.name || "",
          bio: data.bio || "",
          phone: data.phone || "",
          address: data.address || "",
          cover_image: data.cover_image || "",
          cv_url: data.cv_url || "",
          skills: data.skills || "",
        });
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin hồ sơ người dùng:", err);
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Daily Reward claim handler
  const handleDailyReward = async () => {
    try {
      setClaiming(true);
      const res = await fetch("/api/wallet/daily-reward", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`🎉 Điểm danh thành công! ${data.message}`);
        // Increment balance locally
        setProfile((prev: any) => ({
          ...prev,
          pawCoin: prev.pawCoin + 20,
        }));
      } else {
        toast.error(data.error || "Hôm nay bạn đã nhận thưởng rồi. Hãy quay lại vào ngày mai!");
      }
    } catch (err) {
      toast.error("Lỗi kết nối điểm danh.");
    } finally {
      setClaiming(false);
    }
  };

  // Submit profile changes PUT request
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Cập nhật thông tin hồ sơ thành công! ✨");
        setProfile((prev: any) => ({
          ...prev,
          ...data.user,
        }));
        setIsEditModalOpen(false);
      } else {
        toast.error(data.error || "Cập nhật thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối lưu hồ sơ.");
    }
  };

  // AI CV parsing file handler
  const handleCvUploadAndParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Vui lòng tải lên tệp tin định dạng PDF.");
      return;
    }

    const toastId = toast.loading("AI đang phân tích tệp tin CV và bóc tách kỹ năng...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/cv-parser", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        if (data.skills) {
          toast.success("AI đã bóc tách kỹ năng thành công! ✨", { id: toastId });
          // Combine existing skills with new parsed skills, removing duplicates
          const existingSkills = editForm.skills
            ? editForm.skills.split(/[,\s]+/).map(s => s.trim())
            : [];
          const newSkills = data.skills
            .split(/[,\s]+/)
            .map((s: string) => s.trim());
          
          const combined = Array.from(new Set([...existingSkills, ...newSkills]))
            .filter(s => s.length > 0)
            .join(", ");
          
          setEditForm(prev => ({
            ...prev,
            skills: combined
          }));
        } else {
          toast.error("Không phát hiện từ khóa kỹ năng phù hợp nào trong CV.", { id: toastId });
        }
      } else {
        toast.error(data.error || "Lỗi bóc tách CV.", { id: toastId });
      }
    } catch (err) {
      toast.error("Lỗi kết nối quét CV.", { id: toastId });
    }
  };

  // Split skill keywords helper
  const skillsArray: string[] = profile.skills
    ? profile.skills.split(/[,\s]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    : [];

  const defaultCover = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "P")}&background=2563eb&color=ffffff&bold=true`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative">
      <Toaster position="top-center" />
      <Navbar />

      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 mb-20 md:mb-0">
        {/* Back navigation */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại Bảng tin</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/10">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-400">Đang tải hồ sơ chuyên nghiệp...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header section (Facebook style splits) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 overflow-hidden backdrop-blur-md">
              {/* Cover Photo area */}
              <div className="relative h-48 sm:h-64 w-full bg-slate-900">
                <img
                  src={profile.cover_image || defaultCover}
                  alt="Ảnh bìa"
                  className="h-full w-full object-cover opacity-80"
                />
              </div>

              {/* Avatar position and name elements wrapper */}
              <div className="relative px-6 pb-6 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
                  {/* Left elements: Avatar and main details */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                    <div className="h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-2xl border-4 border-slate-950 bg-slate-900 shadow-2xl relative z-10 flex-shrink-0">
                      <img
                        src={profile.avatarUrl || defaultAvatar}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-1">
                          {profile.name}
                          {profile.isVerified && (
                            <BadgeCheck className="h-5.5 w-5.5 text-blue-500 fill-blue-500/10" />
                          )}
                        </h1>
                        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-4xs font-extrabold text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                          {profile.role}
                        </span>
                      </div>
                      <p className="text-2xs text-slate-400 font-medium">Hồ sơ thành viên PawBook</p>
                    </div>
                  </div>

                  {/* Right elements: Action Buttons */}
                  <div className="flex flex-wrap justify-center sm:justify-end gap-2 items-center">
                    <button
                      id="btn-daily-reward"
                      disabled={claiming}
                      onClick={handleDailyReward}
                      className="flex items-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 px-4 py-2.5 text-2xs font-extrabold text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
                      Điểm danh nhận 20 Coins
                    </button>

                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 px-4 py-2.5 text-2xs font-bold text-slate-200 transition-all cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Chỉnh sửa hồ sơ
                    </button>
                  </div>
                </div>

                {/* Score Indicators and Reputation Stats */}
                <div className="flex flex-wrap gap-3 mt-4 border-t border-slate-850/60 pt-4 text-xs font-semibold text-slate-400 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/60 px-3 py-1 border border-slate-800">
                    👛 Số dư: <span id="user-pawcoin-balance" className="text-slate-200">{profile.pawCoin || 0} PawCoins</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/60 px-3 py-1 border border-slate-800">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    Reputation: <span className="text-yellow-450">{profile.reputation || 0}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/60 px-3 py-1 border border-slate-800">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    TrustScore: <span className="text-emerald-450">{profile.trustScore ? profile.trustScore.toFixed(1) : "5.0"} / 5.0</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Split layout Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Contact and Skills */}
              <div className="lg:col-span-4 space-y-6">
                {/* Contact Card info */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 backdrop-blur-md space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin liên hệ</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Mail className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300">
                      <Phone className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <span>{profile.phone || "Chưa cập nhật số điện thoại"}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300">
                      <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <span className="line-clamp-2">{profile.address || "Chưa cập nhật địa chỉ"}</span>
                    </div>

                    {profile.cv_url && (
                      <div className="flex items-center gap-3 pt-2 border-t border-slate-850/60">
                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <a
                          href={profile.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 font-bold hover:underline"
                        >
                          Tải xuống CV Đã Lưu
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills Card info */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 backdrop-blur-md space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kỹ năng / Dịch vụ</h3>
                  {skillsArray.length === 0 ? (
                    <p className="text-2xs text-slate-500 italic">Chưa nhập thông tin kỹ năng.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {skillsArray.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-lg bg-blue-500/10 px-2 py-1 text-2xs font-semibold text-blue-400 border border-blue-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Bio and Storefront Jobs */}
              <div className="lg:col-span-8 space-y-6">
                {/* About Bio Section */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 backdrop-blur-md space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giới thiệu bản thân</h3>
                  <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-line">
                    {profile.bio || "Thành viên này chưa điền tiểu sử giới thiệu. Nhấp 'Chỉnh sửa hồ sơ' để cập nhật."}
                  </p>
                </div>

                {/* Storefront section: Job postings */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 backdrop-blur-md space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="h-4.5 w-4.5 text-blue-500" />
                    <span>Dịch vụ & Tin tuyển dụng đã đăng ({profile.jobs?.length || 0})</span>
                  </h3>

                  {(profile.jobs || []).length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                      <p className="text-xs text-slate-500 italic">Chưa có bài đăng tuyển dụng hay đấu thầu nào.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.jobs.map((job: JobType) => (
                        <Link
                          key={job.id}
                          href={`/jobs/${job.id}`}
                          className="block group rounded-xl border border-slate-850 bg-slate-950/30 p-4 hover:border-blue-500/30 transition-all"
                        >
                          <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-4xs font-bold text-blue-400 border border-blue-500/25 uppercase tracking-wider mb-2">
                            {job.niche}
                          </span>
                          <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                            {job.title}
                          </h4>
                          <p className="text-4xs text-slate-500 mt-1 font-semibold">{job.companyName}</p>

                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-900 text-3xs font-semibold text-slate-400">
                            <span className="text-emerald-500 font-bold">{job.salary}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(job.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Profile Modal Dialog Overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#090e1c] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="h-4.5 w-4.5 text-blue-500" />
                <span>Chỉnh sửa thông tin cá nhân</span>
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block font-bold text-slate-350 mb-1.5">Tên hiển thị</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block font-bold text-slate-350 mb-1.5">Giới thiệu tiểu sử</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Viết một đoạn ngắn giới thiệu bản thân hoặc cơ sở kinh doanh..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Phone & Address row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">Số điện thoại</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Ví dụ: 0987654321"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">Địa chỉ</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Cover image & CV link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">URL Ảnh bìa (Cover Image)</label>
                  <input
                    type="text"
                    value={editForm.cover_image}
                    onChange={(e) => setEditForm({ ...editForm, cover_image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">URL Tệp tin CV (PDF)</label>
                  <input
                    type="text"
                    value={editForm.cv_url}
                    onChange={(e) => setEditForm({ ...editForm, cv_url: e.target.value })}
                    placeholder="https://pawbook.vn/cv/..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-350">Kỹ năng (cách nhau bằng dấu phẩy)</label>
                  <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 font-bold text-[10px] hover:bg-emerald-500/20 transition-all cursor-pointer">
                    <FileText className="h-3.5 w-3.5" />
                    Quét kỹ năng bằng AI từ CV (PDF)
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleCvUploadAndParse}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={editForm.skills}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  placeholder="nextjs, react, massage, sua-xe-may"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Submit action */}
              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-2xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-2xs font-semibold text-white hover:bg-blue-500 transition-all cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
