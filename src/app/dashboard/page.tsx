"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

interface QRContent {
  value?: string;
  wifiData?: {
    ssid: string;
    password: string;
    encryption: string;
  };
  phoneNumber?: string;
  emailAddress?: string;
  whatsappNumber?: string;
  vcardData?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    organization: string;
    website: string;
  };
  eventData?: {
    title: string;
    location: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  };
  smsNumber?: string;
  smsBody?: string;
  locationData?: {
    latitude: string;
    longitude: string;
  };
}

interface QRCode {
  id: string;
  title: string;
  qr_type: string;
  content: QRContent;
  fg_color: string;
  bg_color: string;
  error_correction: string;
  logo_url: string | null;
  logo_size: number;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<QRCode | null>(null);
  const qrRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to home if not logged in
      window.location.href = "/";
      return;
    }

    if (user) {
      fetchQRCodes();
    }
  }, [user, authLoading]);

  const fetchQRCodes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQrCodes(data || []);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteQRCode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this QR code?")) return;

    setDeleting(id);
    try {
      const { error } = await supabase.from("qr_codes").delete().eq("id", id);
      if (error) throw error;
      setQrCodes(qrCodes.filter((qr) => qr.id !== id));
      setSelectedQR(null);
    } catch (error) {
      console.error("Error deleting QR code:", error);
      alert("Failed to delete QR code");
    } finally {
      setDeleting(null);
    }
  };

  const getQRValue = (qr: QRCode): string => {
    const content = qr.content as QRContent;
    switch (qr.qr_type) {
      case "url":
        return content.value?.startsWith("http")
          ? content.value
          : `https://${content.value}`;
      case "text":
        return content.value || "";
      case "wifi":
        return `WIFI:T:${content.wifiData?.encryption};S:${content.wifiData?.ssid};P:${content.wifiData?.password};;`;
      case "phone":
        return `tel:${content.phoneNumber}`;
      case "email":
        return `mailto:${content.emailAddress}`;
      case "whatsapp":
        return `https://wa.me/${String(content.whatsappNumber).replace(/\D/g, "")}`;
      case "vcard":
        return `BEGIN:VCARD
VERSION:3.0
N:${content.vcardData?.lastName};${content.vcardData?.firstName}
FN:${content.vcardData?.firstName} ${content.vcardData?.lastName}
TEL:${content.vcardData?.phone}
EMAIL:${content.vcardData?.email}
ORG:${content.vcardData?.organization}
URL:${content.vcardData?.website}
END:VCARD`;
      case "event":
        return `BEGIN:VEVENT
SUMMARY:${content.eventData?.title}
LOCATION:${content.eventData?.location}
DTSTART:${String(content.eventData?.startDate).replace(/-/g, "")}${String(content.eventData?.startTime).replace(/:/g, "")}
DTEND:${String(content.eventData?.endDate).replace(/-/g, "")}${String(content.eventData?.endTime).replace(/:/g, "")}
END:VEVENT`;
      case "sms":
        return `sms:${content.smsNumber}${content.smsBody ? `?body=${encodeURIComponent(content.smsBody as string)}` : ""}`;
      case "location":
        return `geo:${content.locationData?.latitude},${content.locationData?.longitude}`;
      default:
        return content.value || "";
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      url: "Website URL",
      text: "Plain Text",
      wifi: "WiFi Network",
      phone: "Phone Number",
      email: "Email Address",
      whatsapp: "WhatsApp",
      vcard: "Contact Card",
      event: "Calendar Event",
      sms: "SMS Message",
      location: "Google Maps",
    };
    return labels[type] || type;
  };

  const editQRCode = (qr: QRCode) => {
    // Store the QR data in localStorage for the generator to load
    localStorage.setItem("editQR", JSON.stringify(qr));
    window.location.href = "/?edit=true";
  };

  const downloadPNG = (qr: QRCode) => {
    const svg = document.querySelector(`#qr-${qr.id} svg`) as SVGSVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = qr.bg_color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 400, 400);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${qr.title || "qrcode"}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const downloadSVG = (qr: QRCode) => {
    const svg = document.querySelector(`#qr-${qr.id} svg`) as SVGSVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${qr.title || "qrcode"}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your QR codes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              My QR Codes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your saved QR codes
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
          >
            + Create New QR
          </Link>
        </div>

        {/* QR Codes Grid */}
        {qrCodes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No QR codes yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first QR code and save it to your library!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
            >
              Create QR Code
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {qrCodes.map((qr) => (
              <div
                key={qr.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* QR Preview */}
                <div
                  id={`qr-${qr.id}`}
                  className="p-4 flex items-center justify-center"
                  style={{ backgroundColor: qr.bg_color }}
                >
                  <QRCodeSVG
                    value={getQRValue(qr)}
                    size={120}
                    bgColor={qr.bg_color}
                    fgColor={qr.fg_color}
                    level={qr.error_correction as "L" | "M" | "Q" | "H"}
                    includeMargin
                    imageSettings={
                      qr.logo_url
                        ? {
                            src: qr.logo_url,
                            height: qr.logo_size * 1.2,
                            width: qr.logo_size * 1.2,
                            excavate: true,
                          }
                        : undefined
                    }
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {qr.title || "Untitled QR"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {getTypeLabel(qr.qr_type)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(qr.created_at).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => editQRCode(qr)}
                      className="flex-1 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setSelectedQR(qr)}
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteQRCode(qr.id)}
                      disabled={deleting === qr.id}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                    >
                      {deleting === qr.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Detail Modal */}
        {selectedQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedQR(null)}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <button
                onClick={() => setSelectedQR(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                QR Code Details
              </h2>

              <div
                id={`qr-${selectedQR.id}`}
                className="p-6 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: selectedQR.bg_color }}
              >
                <QRCodeSVG
                  value={getQRValue(selectedQR)}
                  size={200}
                  bgColor={selectedQR.bg_color}
                  fgColor={selectedQR.fg_color}
                  level={selectedQR.error_correction as "L" | "M" | "Q" | "H"}
                  includeMargin
                  imageSettings={
                    selectedQR.logo_url
                      ? {
                          src: selectedQR.logo_url,
                          height: selectedQR.logo_size * 2,
                          width: selectedQR.logo_size * 2,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    Type:
                  </span>{" "}
                  {getTypeLabel(selectedQR.qr_type)}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    Created:
                  </span>{" "}
                  {new Date(selectedQR.created_at).toLocaleString()}
                </p>
              </div>

              {/* Export Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => downloadPNG(selectedQR)}
                  className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PNG
                </button>
                <button
                  onClick={() => downloadSVG(selectedQR)}
                  className="py-2.5 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  SVG
                </button>
              </div>

              <button
                onClick={() => deleteQRCode(selectedQR.id)}
                disabled={deleting === selectedQR.id}
                className="mt-4 w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {deleting === selectedQR.id ? "Deleting..." : "Delete QR Code"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
