# QR Code Generator

A modern, fully-featured QR Code Generator built with Next.js, React, and Tailwind CSS. Create beautiful, customizable QR codes for any purpose with support for multiple QR types, custom colors, logos, and export options.

![QR Code Generator](https://img.shields.io/badge/Next.js-16-black) ![React-19](https://img.shields.io/badge/React-19-61DAFB) ![Tailwind-CSS-v4](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D1) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E)

## Live Demo

Check out the live version: [https://qr-code-generator-sigma-beige-66.vercel.app/](https://qr-code-generator-sigma-beige-66.vercel.app/)

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

### User Features (With Account)
- 💾 **Save to Library** - Save your generated QR codes
- 📚 **Dashboard** - View all your saved QR codes
- ✏️ **Edit** - Modify existing QR codes
- 🗑️ **Delete** - Remove QR codes you no longer need
- 👤 **Profile** - Manage your account settings

### Additional Features
- 🌓 **Light/Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Live Preview** - See changes in real-time

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for user authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/ImmaculateEben/Qr-Code-Generator.git

# Navigate to the project directory
cd qr-generator

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  username text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Create qr_codes table
create table qr_codes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  title text default 'Untitled QR',
  qr_type text not null,
  content jsonb not null,
  fg_color text default '#1e293b',
  bg_color text default '#ffffff',
  error_correction text default 'M',
  logo_url text,
  logo_size integer default 20,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table qr_codes enable row level security;

-- Create RLS policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own QR codes" on qr_codes for select using (auth.uid() = user_id);
create policy "Users can create QR codes" on qr_codes for insert with check (auth.uid() = user_id);
create policy "Users can update own QR codes" on qr_codes for update using (auth.uid() = user_id);
create policy "Users can delete own QR codes" on qr_codes for delete using (auth.uid() = user_id);
```

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
- **Auth & Database**: Supabase

## Project Structure

```
qr-generator/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main QR Generator component
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Global styles
│   │   ├── dashboard/        # User dashboard page
│   │   └── profile/          # User profile page
│   ├── components/           # Reusable components
│   │   ├── AuthModal.tsx     # Login/Signup modal
│   │   ├── UserMenu.tsx      # User dropdown menu
│   │   └── Toast.tsx         # Toast notifications
│   ├── context/              # React context
│   │   └── AuthContext.tsx   # Authentication context
│   └── lib/                  # Utilities
│       └── supabase.ts       # Supabase client
├── public/                   # Static assets
├── package.json              # Dependencies
├── next.config.ts           # Next.js configuration
└── tsconfig.json            # TypeScript configuration
```

## Usage

1. **Select QR Type**: Choose from 10 different QR code types
2. **Enter Information**: Fill in the required fields for your selected type
3. **Customize**: Adjust colors, add a logo, or change error correction level
4. **Preview**: See your QR code update in real-time
5. **Download**: Export as PNG or SVG
6. **Save**: Create an account to save QR codes to your library
7. **Manage**: View, edit, and delete your saved QR codes from the dashboard

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

**Built with ❤️ by [Ebenezer](https://www.immaculatedesigns.com.ng)**

---

<div align="center">
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
