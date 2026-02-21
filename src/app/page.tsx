"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import UserMenu from "@/components/UserMenu";

type QRType = "url" | "text" | "wifi" | "phone" | "email" | "whatsapp" | "vcard" | "event" | "sms" | "location";

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

export default function Home() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navigateToCreate = (qrType?: QRType) => {
    if (qrType) {
      window.location.href = `/create?type=${qrType}`;
    } else {
      window.location.href = '/create';
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>QRCode Pro</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection("home")} className={`text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Home</button>
              <button onClick={() => scrollToSection("features")} className={`text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Features</button>
              <button onClick={() => scrollToSection("how-it-works")} className={`text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>How It Works</button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
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
              <UserMenu />
              {!user && (
                <button onClick={() => setShowAuthModal(true)} className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:from-indigo-600 hover:to-purple-600 transition-all">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className={`pt-24 pb-12 sm:pt-32 sm:pb-20 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-indigo-100 via-white to-purple-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create Beautiful QR Codes{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">In Seconds</span>
            </h1>
            <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Generate custom QR codes for your business, events, or personal use. Free, fast, and fully customizable with your brand colors and logo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => window.location.href = '/create'} className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl">
                Start Creating Free
              </button>
              <button onClick={() => scrollToSection("features")} className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all border-2 ${darkMode ? 'border-gray-600 text-white hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                Learn More
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { label: "QR Codes Created", value: "50,000+" },
              { label: "Active Users", value: "10,000+" },
              { label: "QR Types", value: "10+" },
              { label: "Download Formats", value: "2" },
            ].map((stat, index) => (
              <div key={index} className={`text-center p-6 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm`}>
                <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>{stat.value}</div>
                <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-16 sm:py-24 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Powerful QR Code Generator
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create any type of QR code you need with our versatile generator
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {qrTypes.map((type) => (
              <button key={type.id} onClick={() => navigateToCreate(type.id)} className={`p-6 rounded-2xl transition-all hover:shadow-xl group ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-white'} border-2 border-transparent hover:border-indigo-500`}>
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{type.icon}</div>
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{type.label}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Generate QR for {type.label.toLowerCase()}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`py-16 sm:py-24 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              How It Works
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Creating QR codes is simple - just follow these three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Choose Type", description: "Select from 10+ QR code types including URLs, WiFi, vCards, and more", icon: "🎯" },
              { step: "2", title: "Customize", description: "Add your content, choose colors, upload your logo, and adjust settings", icon: "🎨" },
              { step: "3", title: "Download", description: "Download your QR code in PNG or SVG format, ready to use anywhere", icon: "⬇️" },
            ].map((item, index) => (
              <div key={index} className={`relative p-8 rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">{item.step}</div>
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`py-16 sm:py-24 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Why Choose QRCode Pro?
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Everything you need to create professional QR codes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Completely Free", description: "No credit card required. Create unlimited QR codes at no cost.", icon: "💯" },
              { title: "Customizable Design", description: "Choose colors, add logos, and customize error correction levels.", icon: "✨" },
              { title: "High Quality Output", description: "Download in PNG or SVG format with crisp, print-ready quality.", icon: "🖨️" },
              { title: "Multiple QR Types", description: "Support for URLs, text, WiFi, vCards, events, locations, and more.", icon: "📱" },
              { title: "Save Your Codes", description: "Create an account to save and manage your QR codes library.", icon: "💾" },
              { title: "Instant Download", description: "Get your QR code immediately after creation, no waiting required.", icon: "⚡" },
            ].map((benefit, index) => (
              <div key={index} className={`flex gap-4 p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="text-4xl">{benefit.icon}</div>
                <div>
                  <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{benefit.title}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 sm:py-24 ${darkMode ? 'bg-gray-800' : 'bg-gray-900'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Create your free account to save your QR codes and access them from anywhere. It only takes a minute to sign up!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setShowAuthModal(true)} className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl">
              Create Free Account
            </button>
            <button onClick={() => window.location.href = '/create'} className="px-8 py-4 rounded-xl font-semibold text-lg text-white border-2 border-gray-600 hover:bg-gray-700 transition-all">
              Try Without Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 ${darkMode ? 'bg-gray-900 border-t border-gray-800' : 'bg-white border-t border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>QRCode Pro</span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Create beautiful, custom QR codes for your business or personal use. Free and easy to use.
              </p>
            </div>

            <div>
              <h4 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection("home")} className={`text-sm hover:text-indigo-600 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Home</button></li>
                <li><button onClick={() => scrollToSection("features")} className={`text-sm hover:text-indigo-600 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Features</button></li>
                <li><button onClick={() => scrollToSection("how-it-works")} className={`text-sm hover:text-indigo-600 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>How It Works</button></li>
                <li><button onClick={() => window.location.href = '/create'} className={`text-sm hover:text-indigo-600 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Generator</button></li>
              </ul>
            </div>

            <div>
              <h4 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setShowAuthModal(true)} className={`text-sm hover:text-indigo-600 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sign In</button></li>
                <li><button onClick={() => { if (user) window.location.href = '/dashboard'; else setShowAuthModal(true); }} className={`text-sm hover:text-indigo-600 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dashboard</button></li>
                <li><button onClick={() => { if (user) window.location.href = '/profile'; else setShowAuthModal(true); }} className={`text-sm hover:text-indigo-600 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Profile</button></li>
              </ul>
            </div>

            <div>
              <h4 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Contact</h4>
              <ul className="space-y-2">
                <li className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>support@qrcodepro.com</li>
                <li className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Help Center</li>
                <li className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Privacy Policy</li>
                <li className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className={`pt-8 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} text-center`}>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              © {new Date().getFullYear()} QRCode Pro. All rights reserved. Built with ❤️ for everyone.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
