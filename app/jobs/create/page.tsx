"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, Save, Loader2, Sparkles, AlertCircle, Plus, ShieldCheck, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function CreateListingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Form type: "JOB" (Tuyển dụng & Việc làm) or "SERVICE" (Dịch vụ & Cửa hàng)
  const [listingType, setListingType] = useState<"JOB" | "SERVICE">("SERVICE");
  const [submitting, setSubmitting] = useState(false);

  // Form Fields State
  const [form, setForm] = useState({
    // Common
    description: "",
    priceRange: "", // Price Range for service, or Salary Period ("Theo giờ" / "Theo tháng") for jobs
    vehiclePlate: "",
    vehicleType: "",
    isEmergency: false,
    workType: "Toàn thời gian", // workType

    // For Services
    name: "",
    category: "Vận tải", // Vận tải, Spa & Làm đẹp, Thợ sửa chữa, Khác
    location: "TP. Hồ Chí Minh",
    contactInfo: "",

    // For Jobs
    title: "",
    salary: "",
    companyName: "",
    salaryPeriod: "Theo tháng",
  });

  // Verify Session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const session = await res.json();
          if (session && session.user) {
            setCurrentUser(session.user);
          } else {
            toast.error("Vui lòng đăng nhập trước khi đăng tin.");
            router.push("/auth/login");
          }
        } else {
          router.push("/auth/login");
        }
      } catch (err) {
        console.error("Session verification error:", err);
      } finally {
        setSessionLoading(false);
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const toastId = toast.loading("Đang xuất bản bài đăng của bạn...");

    try {
      if (listingType === "SERVICE") {
        // Construct vehicleInfo if category is Vận tải
        const vehicleInfo = form.category === "Vận tải"
          ? `${form.vehicleType} - BKS: ${form.vehiclePlate}`
          : "";

        const payload = {
          name: form.name.trim(),
          category: form.category,
          description: form.description.trim(),
          location: form.location.trim(),
          contactInfo: form.contactInfo.trim(),
          priceRange: form.priceRange.trim(),
          vehicleInfo,
          isEmergency: form.isEmergency,
          workType: form.workType,
        };

        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          toast.success("Đăng tin quảng bá dịch vụ thành công! 🌟", { id: toastId });
          router.push("/services");
        } else {
          toast.error(data.error || "Không thể đăng tin dịch vụ.", { id: toastId });
        }
      } else {
        // JOB
        const payload = {
          title: form.title.trim(),
          description: form.description.trim(),
          salary: form.salary.trim(),
          companyName: form.companyName.trim(),
          priceRange: form.salaryPeriod, // Store salary period (Theo giờ / tháng) inside priceRange
          workType: form.workType,
          isEmergency: form.isEmergency,
        };

        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          toast.success("Đăng tin tuyển dụng thành công! 💼", { id: toastId });
          router.push("/?tab=jobs");
        } else {
          toast.error(data.error || "Không thể đăng tin tuyển dụng.", { id: toastId });
        }
      }
    } catch (err) {
      toast.error("Lỗi mạng khi đăng bài.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400">Đang chuẩn bị form...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <Toaster position="top-center" />

      <main className="mx-auto flex-1 w-full max-w-2xl px-4 py-8">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại Trang chủ</span>
          </Link>
        </div>

        {/* Form Container Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-500" />
                Đăng tin tức thời
              </h1>
              <p className="text-3xs text-slate-450 mt-1">Đăng tin tuyển thợ, gọi xe, tìm việc, hoặc giới thiệu dịch vụ 0% chiết khấu</p>
            </div>
            {currentUser?.isVerified && (
              <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-4xs font-bold text-blue-400 border border-blue-500/25 uppercase">
                <ShieldCheck className="h-3 w-3" /> Tài khoản Xác minh
              </span>
            )}
          </div>

          {/* Selector Tabs for Listing Type */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-850">
            <button
              type="button"
              onClick={() => setListingType("SERVICE")}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                listingType === "SERVICE"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              💼 Dịch vụ bản địa (Spa, Xe ôm, Thợ...)
            </button>
            <button
              type="button"
              onClick={() => setListingType("JOB")}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                listingType === "JOB"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📢 Tin Tuyển dụng / Việc làm
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {listingType === "SERVICE" ? (
              <>
                {/* Name */}
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">Tên Dịch vụ / Cửa hàng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Xe ôm công nghệ Q1, Tiệm sửa điều hòa điện lạnh..."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 placeholder-slate-650 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Category selection */}
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">Danh mục Dịch vụ *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 focus:outline-none"
                  >
                    <option value="Vận tải">🚗 Vận tải & Giao nhận (0% chiết khấu)</option>
                    <option value="Spa">💅 Spa & Làm đẹp</option>
                    <option value="Sửa chữa">🛠️ Thợ sửa chữa tận nơi</option>
                    <option value="Khác">✨ Dịch vụ khác</option>
                  </select>
                </div>

                {/* DYNAMIC FORMS FOR SERVICE: TRANSPORT */}
                {form.category === "Vận tải" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 animate-scaleUp">
                    <div>
                      <label className="block font-bold text-blue-400 mb-1.5">Loại xe *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Winner X, Toyota Vios..."
                        value={form.vehicleType}
                        onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 placeholder-slate-650 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-blue-400 mb-1.5">Biển số xe *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: 29A-123.45"
                        value={form.vehiclePlate}
                        onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 placeholder-slate-650 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                )}

                {/* Price range */}
                <div>
                  <label className="block font-bold text-slate-355 mb-1.5">Bảng giá tham khảo (priceRange)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 10K/km, 200K - 500K tùy thiết bị..."
                    value={form.priceRange}
                    onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 placeholder-slate-650 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">Tỉnh thành hoạt động *</label>
                  <select
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 focus:outline-none"
                  >
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Nha Trang">Nha Trang</option>
                    <option value="Huế">Huế</option>
                    <option value="Đà Lạt">Đà Lạt</option>
                    <option value="Vinh">Vinh</option>
                    <option value="Buôn Ma Thuột">Buôn Ma Thuột</option>
                  </select>
                </div>

                {/* ContactInfo */}
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">Số điện thoại liên hệ *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập SĐT để khách hàng liên hệ hoặc chốt đơn..."
                    value={form.contactInfo}
                    onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 placeholder-slate-650 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Title */}
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">Tiêu đề Tuyển dụng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Cần tuyển thợ phụ cắt tóc gội đầu, Shipper giao đồ ăn..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 placeholder-slate-650 focus:outline-none"
                  />
                </div>

                {/* Company name */}
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">Tên cơ sở tuyển dụng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Salon tóc Anh Tuấn, Garage Ôtô Bình Tân..."
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 placeholder-slate-650 focus:outline-none"
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">Mức lương *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 8.000.000đ - 12.000.000đ, Hoặc 35K/giờ..."
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 placeholder-slate-650 focus:outline-none"
                  />
                </div>

                {/* Work Type Selection */}
                <div>
                  <label className="block font-bold text-slate-350 mb-1.5">Hình thức làm việc *</label>
                  <select
                    value={form.workType}
                    onChange={(e) => setForm({ ...form, workType: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 focus:outline-none"
                  >
                    <option value="Toàn thời gian">💼 Toàn thời gian</option>
                    <option value="Bán thời gian">🕒 Bán thời gian</option>
                    <option value="Theo giờ">⏱️ Theo giờ</option>
                  </select>
                </div>

                {/* DYNAMIC FORM FOR JOB: SALARY PERIOD */}
                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 animate-scaleUp">
                  <label className="block font-bold text-blue-400 mb-2">Hình thức trả lương *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                      <input
                        type="radio"
                        name="salaryPeriod"
                        value="Theo giờ"
                        checked={form.salaryPeriod === "Theo giờ"}
                        onChange={() => setForm({ ...form, salaryPeriod: "Theo giờ" })}
                        className="h-4 w-4 border-slate-800 text-blue-600 focus:ring-0"
                      />
                      <span>Trả lương theo giờ ⏱️</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                      <input
                        type="radio"
                        name="salaryPeriod"
                        value="Theo tháng"
                        checked={form.salaryPeriod === "Theo tháng"}
                        onChange={() => setForm({ ...form, salaryPeriod: "Theo tháng" })}
                        className="h-4 w-4 border-slate-800 text-blue-600 focus:ring-0"
                      />
                      <span>Trả lương theo tháng 📅</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-350 mb-1.5">Mô tả chi tiết *</label>
              <textarea
                required
                rows={5}
                placeholder="Mô tả công việc tuyển dụng, hoặc chi tiết các gói dịch vụ, chính sách bảo hành..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 placeholder-slate-650 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* isEmergency 24/7 Option Toggle */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/40">
              <input
                type="checkbox"
                id="isEmergency"
                checked={form.isEmergency}
                onChange={(e) => setForm({ ...form, isEmergency: e.target.checked })}
                className="h-4.5 w-4.5 rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <div>
                <label htmlFor="isEmergency" className="block font-bold text-slate-200 cursor-pointer">
                  🚨 Hỗ trợ khẩn cấp 24/7 (Emergency Service)
                </label>
                <span className="block text-4xs text-slate-500 mt-0.5">Bật tùy chọn này nếu bạn hỗ trợ cứu hộ xe, sửa ống nước hỏng hoặc gọi xe gấp lúc đêm muộn.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-850">
              <Link
                href="/"
                className="rounded-xl px-4 py-2 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 font-semibold"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 font-bold text-white shadow-md shadow-blue-600/15 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4.5 w-4.5" />
                    <span>Đăng bài ngay</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
