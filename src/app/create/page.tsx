"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/context/AuthContext";
import { useDarkMode } from "@/context/DarkModeContext";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";
import UserMenu from "@/components/UserMenu";

type QRType = "url" | "text" | "wifi" | "phone" | "email" | "whatsapp" | "vcard" | "event" | "sms" | "location";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

interface WiFiData {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
}

interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  website: string;
}

interface EventData {
  title: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

interface LocationData {
  latitude: string;
  longitude: string;
}

const qrTypes: { id: QRType; label: string; icon: string }[] = [
  { id: "url", label: "Website URL", icon: "🌐" },
  { id: "text", label: "Plain Text", icon: "📝" },
  { id: "wifi", label: "WiFi Network", icon: "📶" },
  { id: "phone", label: "Phone Number", icon: "📞" },
  { id: "email", label: "Email Address", icon: "✉️" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬" },
  { id: "vcard", label: "Contact Card", icon: "👤" },
  { id: "event", label: "Calendar Event", icon: "📅" },
  { id: "sms", label: "SMS Message", icon: "💭" },
  { id: "location", label: "Google Maps", icon: "📍" },
];

const inputClass = "w-full px-3 sm:px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition touch-manipulation";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

export default function CreateQRPage() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [qrType, setQrType] = useState<QRType>("url");
  const [value, setValue] = useState("");
  const [fgColor, setFgColor] = useState("#1e293b");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>("M");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20);
  const qrRef = useRef<SVGSVGElement>(null);

  const [wifiData, setWifiData] = useState<WiFiData>({ ssid: "", password: "", encryption: "WPA" });
  const [vcardData, setVCardData] = useState<VCardData>({ firstName: "", lastName: "", phone: "", email: "", organization: "", website: "" });
  const [eventData, setEventData] = useState<EventData>({ title: "", location: "", startDate: "", startTime: "", endDate: "", endTime: "" });
  const [locationData, setLocationData] = useState<LocationData>({ latitude: "", longitude: "" });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [smsNumber, setSmsNumber] = useState("");
  const [smsBody, setSmsBody] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingQRId, setEditingQRId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  // Load QR data from localStorage for editing and handle QR type from URL
  useEffect(() => {
    // Check for QR type in URL query params
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type') as QRType | null;
    if (typeParam && qrTypes.some(t => t.id === typeParam)) {
      setQrType(typeParam);
    }
    
    if (params.get("edit") === "true") {
      const editData = localStorage.getItem("editQR");
      if (editData) {
        try {
          const qr = JSON.parse(editData);
          setQrType(qr.qr_type);
          setFgColor(qr.fg_color || "#1e293b");
          setBgColor(qr.bg_color || "#ffffff");
          setErrorCorrectionLevel(qr.error_correction || "M");
          setLogo(qr.logo_url);
          setLogoSize(qr.logo_size || 20);
          setEditingQRId(qr.id);

          if (qr.content) {
            if (qr.content.value) setValue(qr.content.value);
            if (qr.content.wifiData) setWifiData(qr.content.wifiData);
            if (qr.content.phoneNumber) setPhoneNumber(qr.content.phoneNumber);
            if (qr.content.emailAddress) setEmailAddress(qr.content.emailAddress);
            if (qr.content.whatsappNumber) setWhatsappNumber(qr.content.whatsappNumber);
            if (qr.content.vcardData) setVCardData(qr.content.vcardData);
            if (qr.content.eventData) setEventData(qr.content.eventData);
            if (qr.content.smsNumber) setSmsNumber(qr.content.smsNumber);
            if (qr.content.smsBody) setSmsBody(qr.content.smsBody);
            if (qr.content.locationData) setLocationData(qr.content.locationData);
          }

          localStorage.removeItem("editQR");
          window.history.replaceState({}, "", "/create");
        } catch (e) {
          console.error("Error parsing edit data:", e);
        }
      }
    }
  }, []);

  const generateQRValue = useCallback(() => {
    switch (qrType) {
      case "url":
        return value.startsWith("http") ? value : `https://${value}`;
      case "text":
        return value;
      case "wifi":
        return `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`;
      case "phone":
        return `tel:${phoneNumber}`;
      case "email":
        return `mailto:${emailAddress}`;
      case "whatsapp":
        return `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
      case "vcard":
        return `BEGIN:VCARD
VERSION:3.0
N:${vcardData.lastName};${vcardData.firstName}
FN:${vcardData.firstName} ${vcardData.lastName}
TEL:${vcardData.phone}
EMAIL:${vcardData.email}
ORG:${vcardData.organization}
URL:${vcardData.website}
END:VCARD`;
      case "event":
        return `BEGIN:VEVENT
SUMMARY:${eventData.title}
LOCATION:${eventData.location}
DTSTART:${eventData.startDate.replace(/-/g, "")}${eventData.startTime.replace(/:/g, "")}
DTEND:${eventData.endDate.replace(/-/g, "")}${eventData.endTime.replace(/:/g, "")}
END:VEVENT`;
      case "sms":
        return `sms:${smsNumber}${smsBody ? `?body=${encodeURIComponent(smsBody)}` : ""}`;
      case "location":
        return `geo:${locationData.latitude},${locationData.longitude}`;
      default:
        return value;
    }
  }, [qrType, value, wifiData, phoneNumber, emailAddress, whatsappNumber, vcardData, eventData, smsNumber, smsBody, locationData]);

  const qrValue = generateQRValue();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => setLogo(null);

  const downloadPNG = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current;
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
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 400, 400);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = "qrcode.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [bgColor]);

  const downloadSVG = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "qrcode.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  }, []);

  const saveQRCode = useCallback(async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!qrValue) return;

    setSaving(true);
    setSaveMessage("");

    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: user.id,
          username: user.email?.split("@")[0] || "User",
        });
      }

      if (editingQRId) {
        const { error } = await supabase
          .from("qr_codes")
          .update({
            qr_type: qrType,
            content: {
              value,
              wifiData,
              phoneNumber,
              emailAddress,
              whatsappNumber,
              vcardData,
              eventData,
              smsNumber,
              smsBody,
              locationData,
            },
            fg_color: fgColor,
            bg_color: bgColor,
            error_correction: errorCorrectionLevel,
            logo_url: logo,
            logo_size: logoSize,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingQRId);

        if (error) throw error;
        setSaveMessage("QR Code updated successfully!");
        setEditingQRId(null);
      } else {
        const { error } = await supabase.from("qr_codes").insert({
          user_id: user.id,
          qr_type: qrType,
          content: {
            value,
            wifiData,
            phoneNumber,
            emailAddress,
            whatsappNumber,
            vcardData,
            eventData,
            smsNumber,
            smsBody,
            locationData,
          },
          fg_color: fgColor,
          bg_color: bgColor,
          error_correction: errorCorrectionLevel,
          logo_url: logo,
          logo_size: logoSize,
        });

        if (error) throw error;
        setSaveMessage("QR Code saved to your library!");
      }
    } catch (error: unknown) {
      console.error("Error saving QR code:", error);
      const err = error as { message?: string; details?: string };
      setSaveMessage(err?.message || err?.details || "Failed to save QR code. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [user, qrValue, qrType, value, wifiData, phoneNumber, emailAddress, whatsappNumber, vcardData, eventData, smsNumber, smsBody, locationData, fgColor, bgColor, errorCorrectionLevel, logo, logoSize, editingQRId]);

  const renderTypeFields = () => {
    switch (qrType) {
      case "url":
        return (
          <div>
            <label className={labelClass}>Website URL</label>
            <input type="url" value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://example.com" className={inputClass} />
          </div>
        );
      case "text":
        return (
          <div>
            <label className={labelClass}>Text Content</label>
            <textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter your text here..." rows={4} className={`${inputClass} resize-none`} />
          </div>
        );
      case "wifi":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Network Name (SSID)</label>
              <input type="text" value={wifiData.ssid} onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })} placeholder="MyWiFiNetwork" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input type="text" value={wifiData.password} onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })} placeholder="Password" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Encryption</label>
              <div className="flex gap-2">
                {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                  <button key={enc} onClick={() => setWifiData({ ...wifiData, encryption: enc })} className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${wifiData.encryption === enc ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                    {enc === "nopass" ? "None" : enc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case "phone":
        return (
          <div>
            <label className={labelClass}>Phone Number</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1 234 567 8900" className={inputClass} />
          </div>
        );
      case "email":
        return (
          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} placeholder="email@example.com" className={inputClass} />
          </div>
        );
      case "whatsapp":
        return (
          <div>
            <label className={labelClass}>WhatsApp Number</label>
            <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+1 234 567 8900" className={inputClass} />
            <p className="text-xs text-gray-500 mt-1">Enter number with country code</p>
          </div>
        );
      case "vcard":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input type="text" value={vcardData.firstName} onChange={(e) => setVCardData({ ...vcardData, firstName: e.target.value })} placeholder="John" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input type="text" value={vcardData.lastName} onChange={(e) => setVCardData({ ...vcardData, lastName: e.target.value })} placeholder="Doe" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={vcardData.phone} onChange={(e) => setVCardData({ ...vcardData, phone: e.target.value })} placeholder="+1 234 567 8900" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={vcardData.email} onChange={(e) => setVCardData({ ...vcardData, email: e.target.value })} placeholder="john@example.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Organization</label>
              <input type="text" value={vcardData.organization} onChange={(e) => setVCardData({ ...vcardData, organization: e.target.value })} placeholder="Company Name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input type="url" value={vcardData.website} onChange={(e) => setVCardData({ ...vcardData, website: e.target.value })} placeholder="https://example.com" className={inputClass} />
            </div>
          </div>
        );
      case "event":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Event Title</label>
              <input type="text" value={eventData.title} onChange={(e) => setEventData({ ...eventData, title: e.target.value })} placeholder="Meeting, Birthday, etc." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input type="text" value={eventData.location} onChange={(e) => setEventData({ ...eventData, location: e.target.value })} placeholder="Conference Room A" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" value={eventData.startDate} onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Start Time</label>
                <input type="time" value={eventData.startTime} onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>End Date</label>
                <input type="date" value={eventData.endDate} onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Time</label>
                <input type="time" value={eventData.endTime} onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>
        );
      case "sms":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="tel" value={smsNumber} onChange={(e) => setSmsNumber(e.target.value)} placeholder="+1 234 567 8900" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Message (optional)</label>
              <textarea value={smsBody} onChange={(e) => setSmsBody(e.target.value)} placeholder="Your message here..." rows={3} className={`${inputClass} resize-none`} />
            </div>
          </div>
        );
      case "location":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Latitude</label>
              <input type="text" value={locationData.latitude} onChange={(e) => setLocationData({ ...locationData, latitude: e.target.value })} placeholder="40.7128" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input type="text" value={locationData.longitude} onChange={(e) => setLocationData({ ...locationData, longitude: e.target.value })} placeholder="-74.0060" className={inputClass} />
            </div>
            <p className="text-xs text-gray-500">Enter coordinates (e.g., New York: 40.7128, -74.0060)</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen py-4 sm:py-8 px-2 sm:px-4 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-indigo-100 via-white to-purple-100'}`}>
        <div className="max-w-6xl mx-auto overflow-hidden">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-10">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <a href="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:inline">QRCode Pro</span>
              </a>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/ Create</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
              <UserMenu />
              {!user && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:from-indigo-600 hover:to-purple-600 transition-all"
                >
                  Sign In
                </button>
              )}
              <button
                onClick={() => toggleDarkMode()}
                className={`p-2 sm:p-2.5 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </header>

          <div className="text-center mb-6 sm:mb-8">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create Your QR Code
            </h1>
            <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Fill in the details below
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Input Panel */}
            <div className={`p-3 sm:p-6 lg:p-8 rounded-2xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>QR Code Details</h3>
              
              {/* QR Type Selection - Scrollable on mobile */}
              <div className="mb-6">
                <label className={labelClass}>QR Code Type</label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                  {qrTypes.map((type) => (
                    <button 
                      key={type.id} 
                      onClick={() => setQrType(type.id)} 
                      className={`flex-shrink-0 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${qrType === type.id ? 'bg-indigo-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <span className="mr-1">{type.icon}</span> {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Input Fields */}
              <div className="mb-6">{renderTypeFields()}</div>

              {/* Color Options - Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelClass}>Foreground</label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg cursor-pointer border-0 flex-shrink-0" />
                    <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className={`flex-1 px-2 sm:px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Background</label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg cursor-pointer border-0 flex-shrink-0" />
                    <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className={`flex-1 px-2 sm:px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  </div>
                </div>
              </div>

              {/* Error Correction */}
              <div className="mb-6">
                <label className={labelClass}>Error Correction Level</label>
                <div className="flex gap-2">
                  {(["L", "M", "Q", "H"] as const).map((level) => (
                    <button key={level} onClick={() => setErrorCorrectionLevel(level)} className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${errorCorrectionLevel === level ? 'bg-indigo-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {level} {level === "L" ? "(7%)" : level === "M" ? "(15%)" : level === "Q" ? "(25%)" : "(30%)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div className="mb-6">
                <label className={labelClass}>Add Logo (optional)</label>
                <div className="flex items-center gap-4">
                  <label className={`flex-1 py-3 px-4 rounded-lg border-2 border-dashed cursor-pointer transition text-center ${darkMode ? 'border-gray-600 hover:border-indigo-500 text-gray-400' : 'border-gray-300 hover:border-indigo-500 text-gray-500'}`}>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <span className="text-sm">Click to upload logo</span>
                  </label>
                  {logo && (
                    <button onClick={removeLogo} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {logo && (
                  <div className="mt-2">
                    <label className={labelClass}>Logo Size</label>
                    <input type="range" min="10" max="30" value={logoSize} onChange={(e) => setLogoSize(Number(e.target.value))} className="w-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Preview Panel */}
            <div className={`p-3 sm:p-6 lg:p-8 rounded-2xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Preview</h3>
              
              <div className="flex flex-col items-center">
                <div className={`p-3 sm:p-6 lg:p-8 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} mb-4 sm:mb-6`}>
                  {qrValue ? (
                    <QRCodeSVG
                      ref={qrRef}
                      value={qrValue}
                      size={180}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level={errorCorrectionLevel}
                      imageSettings={logo ? { src: logo, height: logoSize * 5, width: logoSize * 5, excavate: true } : undefined}
                    />
                  ) : (
                    <div className={`w-[180px] h-[180px] flex items-center justify-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Enter content to generate QR code
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                  <button onClick={downloadPNG} disabled={!qrValue} className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Download PNG
                  </button>
                  <button onClick={downloadSVG} disabled={!qrValue} className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    Download SVG
                  </button>
                </div>

                <button onClick={saveQRCode} disabled={!qrValue || saving} className="w-full mt-2 sm:mt-3 py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? "Saving..." : "Save to Library"}
                </button>

                {saveMessage && (
                  <div className={`mt-4 p-3 rounded-lg w-full text-center text-sm ${saveMessage.includes("success") || saveMessage.includes("saved") ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {saveMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-8 mt-8 ${darkMode ? 'bg-gray-900 border-t border-gray-800' : 'bg-white border-t border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            © {new Date().getFullYear()} QRCode Pro. All rights reserved.
          </p>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
