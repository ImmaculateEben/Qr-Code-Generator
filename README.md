# QR Code Generator

A modern, fully-featured QR Code Generator built with Next.js, React, and Tailwind CSS. Create beautiful, customizable QR codes for any purpose with support for multiple QR types, custom colors, logos, and export options.

![QR Code Generator](https://img.shields.io/badge/Next.js-16-black) ![React-19](https://img.shields.io/badge/React-19-61DAFB) ![Tailwind-CSS-v4](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D1)

## Features

### Multiple QR Code Types
- 🌐 **Website URL** - Generate QR codes for any website
- 📝 **Plain Text** - Create QR codes with custom text
- 📶 **WiFi Network** - Share WiFi credentials instantly
- 📞 **Phone Number** - Create QR codes for phone calls
- ✉️ **Email Address** - Generate QR codes for email
- 💬 **WhatsApp** - Create direct WhatsApp links
- 👤 **Contact Card (vCard)** - Share contact information
- 📅 **Calendar Event** - Add events to calendars
- 💭 **SMS Message** - Generate SMS QR codes
- 📍 **Google Maps Location** - Share coordinates

### Customization Options
- 🎨 **Custom Colors** - Choose foreground and background colors
- 🖼️ **Logo Support** - Add your brand logo to QR codes
- 📐 **Error Correction** - Four levels (L, M, Q, H)
- ⬇️ **Export Options** - Download as PNG or SVG

### Additional Features
- 🌓 **Light/Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Live Preview** - See changes in real-time

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/qr-generator.git

# Navigate to the project directory
cd qr-generator

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **QR Code**: qrcode.react
- **Language**: TypeScript
- **Fonts**: Geist

## Project Structure

```
qr-generator/
├── src/
│   └── app/
│       ├── page.tsx      # Main QR Generator component
│       ├── layout.tsx    # Root layout
│       └── globals.css   # Global styles
├── public/               # Static assets
├── package.json          # Dependencies
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── tailwind.config      # Tailwind configuration
```

## Usage

1. **Select QR Type**: Choose from 10 different QR code types
2. **Enter Information**: Fill in the required fields for your selected type
3. **Customize**: Adjust colors, add a logo, or change error correction level
4. **Preview**: See your QR code update in real-time
5. **Download**: Export as PNG or SVG

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

**Developed by [Immaculate Designs](https://www.immaculatedesigns.com.ng)**

---

<div align="center">
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
