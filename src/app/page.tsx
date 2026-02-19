"use client";

import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";

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

export default function Home() {
  const [qrType, setQrType] = useState<QRType>("url");
  const [value, setValue] = useState("");
  const [fgColor, setFgColor] = useState("#1e293b");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>("M");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20);
  const [darkMode, setDarkMode] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  const [wifiData, setWifiData] = useState<WiFiData>({ ssid: "", password: "", encryption: "WPA" });
  const [vcardData, setVcardData] = useState<VCardData>({ firstName: "", lastName: "", phone: "", email: "", organization: "", website: "" });
  const [eventData, setEventData] = useState<EventData>({ title: "", location: "", startDate: "", startTime: "", endDate: "", endTime: "" });
  const [locationData, setLocationData] = useState<LocationData>({ latitude: "", longitude: "" });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [smsNumber, setSmsNumber] = useState("");
  const [smsBody, setSmsBody] = useState("");

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
                <input type="text" value={vcardData.firstName} onChange={(e) => setVcardData({ ...vcardData, firstName: e.target.value })} placeholder="John" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input type="text" value={vcardData.lastName} onChange={(e) => setVcardData({ ...vcardData, lastName: e.target.value })} placeholder="Doe" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={vcardData.phone} onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })} placeholder="+1 234 567 8900" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={vcardData.email} onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })} placeholder="john@example.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Organization</label>
              <input type="text" value={vcardData.organization} onChange={(e) => setVcardData({ ...vcardData, organization: e.target.value })} placeholder="Company Name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input type="url" value={vcardData.website} onChange={(e) => setVcardData({ ...vcardData, website: e.target.value })} placeholder="https://example.com" className={inputClass} />
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
      <div className={`min-h-screen py-4 sm:py-8 px-3 sm:px-4 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-indigo-100 via-white to-purple-100'}`}>
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-6 sm:mb-10">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
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
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-indigo-500/30">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>QR Code Generator</h1>
          <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Create beautiful, customizable QR codes for any purpose</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-full overflow-hidden">
          {/* Input Section */}
          <div className={`rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 border max-w-full overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="mb-5 sm:mb-6">
              <label className={`block text-sm font-medium mb-2 sm:mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Select QR Type</label>
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
                {qrTypes.map((type) => (
                  <button key={type.id} onClick={() => setQrType(type.id)} className={`py-2 px-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 flex flex-col items-center gap-0.5 sm:gap-1 flex-1 sm:flex-none min-w-[60px] sm:min-w-auto ${qrType === type.id ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg" : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}`}>
                    <span className="text-sm sm:text-lg">{type.icon}</span>
                    <span className="text-[9px] sm:text-xs font-medium truncate w-full text-center hidden xs:block">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">{renderTypeFields()}</div>

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-sm font-medium mb-3 sm:mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Style Options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Foreground</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200" />
                    <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-mono uppercase" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200" />
                    <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-mono uppercase" />
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Error Correction</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["L", "M", "Q", "H"] as ErrorCorrectionLevel[]).map((level) => (
                    <button key={level} onClick={() => setErrorCorrectionLevel(level)} className={`py-2.5 sm:py-2 px-2 sm:px-3 rounded-lg font-medium text-sm transition ${errorCorrectionLevel === level ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-600 dark:text-gray-200 text-gray-700 hover:bg-gray-300 dark:hover:bg-gray-500"}`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Logo (optional)</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm file:mr-3 file:py-1.5 file:px-3 sm:file:py-2 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-700 dark:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800 transition" />
                {logo && (
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Size:</label>
                      <input type="range" min="10" max="40" value={logoSize} onChange={(e) => setLogoSize(Number(e.target.value))} className="w-24 accent-indigo-600" />
                      <span className="text-sm text-gray-600">{logoSize}%</span>
                    </div>
                    <button onClick={removeLogo} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className={`rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 border flex flex-col max-w-full overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Live Preview
            </h2>
            
            <div className="flex-1 flex items-center justify-center min-h-[280px]">
              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl" style={{ backgroundColor: bgColor }}>
                {qrValue ? (
                  <QRCodeSVG ref={qrRef} value={qrValue} size={200} bgColor={bgColor} fgColor={fgColor} level={errorCorrectionLevel} includeMargin={true} imageSettings={logo ? { src: logo, height: logoSize * 2, width: logoSize * 2, excavate: true } : undefined} />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400 text-center p-4 text-sm sm:text-base">Enter data to generate QR code</div>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-3">
              <button onClick={downloadPNG} disabled={!qrValue} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:shadow-none text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span className="hidden xs:inline">Download </span>PNG
              </button>
              <button onClick={downloadSVG} disabled={!qrValue} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:shadow-none text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span className="hidden xs:inline">Download </span>SVG
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-4">
          {[{ icon: "🎨", title: "Custom Colors", desc: "Personalize colors" }, { icon: "🖼️", title: "Logo Support", desc: "Add your brand" }, { icon: "📱", title: "All Devices", desc: "Scan with any phone" }, { icon: "⬇️", title: "High Quality", desc: "PNG & SVG export" }].map((feature, idx) => (
            <div key={idx} className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 border text-center shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{feature.icon}</div>
              <div className={`font-medium text-xs sm:text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{feature.title}</div>
              <div className={`text-[10px] sm:text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{feature.desc}</div>
            </div>
          ))}
        </div>

        <footer className={`mt-8 sm:mt-10 text-center text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>Generated QR codes work with any QR scanner</p>
          <p className="mt-1 sm:mt-2">
            Developed by <a href="https://www.immaculatedesigns.com.ng" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">Immaculate Designs</a>
          </p>
        </footer>
      </div>
      </div>
    </div>
  );
}
