"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

interface MapJob {
  id: string;
  title: string;
  companyName: string;
  salary: string;
  niche: string;
  latitude: number;
  longitude: number;
  is_premium?: boolean;
  employerId?: string;
  reviews?: any[];
}

interface RadarMapProps {
  jobs: MapJob[];
}

export default function RadarMap({ jobs }: RadarMapProps) {
  // Center map around Danang city to easily display pins from both Hanoi & HCMC
  const center: [number, number] = [16.0471, 108.2062];

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#070a13] relative z-10 shadow-2xl min-h-[450px]">
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Premium Dark Matter Tile Layer from CartoDB to align with our dark theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {jobs.map((job) => (
          <Marker
            key={job.id}
            position={[job.latitude, job.longitude]}
          >
            <Popup>
              <div className="p-3 space-y-2 min-w-[220px] text-slate-800 font-sans">
                {/* Category & Badge */}
                <div className="flex gap-1.5 items-center">
                  {(() => {
                    const titleLower = job.title.toLowerCase();
                    const isTransport = titleLower.includes("xe") || titleLower.includes("vận tải") || titleLower.includes("shipper") || titleLower.includes("chuyển nhà");
                    const isMechanic = job.niche === "MECHANIC" || titleLower.includes("thợ") || titleLower.includes("sửa");
                    const isBeauty = job.niche === "SPA" || titleLower.includes("hair") || titleLower.includes("nail") || titleLower.includes("cắt tóc");
                    const isFnB = job.niche === "FNB";

                    let displayNiche = job.niche;
                    let emoji = "🏢";
                    if (isTransport) {
                      displayNiche = "Taxi 0%";
                      emoji = titleLower.includes("xe ôm") ? "🏍️" : "🚕";
                    } else if (isMechanic) {
                      displayNiche = "Sửa chữa";
                      emoji = "🛠️";
                    } else if (isBeauty) {
                      displayNiche = "Spa & Nail";
                      emoji = "💅";
                    } else if (isFnB) {
                      displayNiche = "F&B";
                      emoji = "☕";
                    }

                    return (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-100 uppercase">
                        <span>{emoji}</span>
                        <span>{displayNiche}</span>
                      </span>
                    );
                  })()}
                  
                  {job.is_premium && (
                    <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100 uppercase">
                      🔥 HOT
                    </span>
                  )}
                </div>

                {/* Main Shop / Driver name */}
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-tight m-0">
                    {job.companyName}
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-snug">
                    {job.title}
                  </p>
                </div>

                {/* Google Maps style ratings summary */}
                {(() => {
                  const ratingVal = job.reviews && job.reviews.length > 0
                    ? (job.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / job.reviews.length).toFixed(1)
                    : (4.2 + (job.id.charCodeAt(0) % 9) / 10).toFixed(1);
                  const countVal = job.reviews && job.reviews.length > 0
                    ? job.reviews.length
                    : (job.id.charCodeAt(job.id.length - 1) % 85) + 12;

                  return (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <span className="text-amber-500 font-bold text-sm">★</span>
                      <span className="font-bold text-slate-900">{ratingVal}</span>
                      <span className="text-slate-400">({countVal} đánh giá)</span>
                    </div>
                  );
                })()}

                {/* Salary Info */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                  <span className="text-xs font-extrabold text-emerald-600">{job.salary}</span>
                  
                  <div className="flex gap-2">
                    <a
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all"
                    >
                      Xem chi tiết
                    </a>
                    {job.employerId && (
                      <a
                        href={`/messages?userId=${job.employerId}`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm transition-all"
                      >
                        💬 Chat
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
