import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://nhiep.net'),
  title: 'nhiep.net — Đặt Lịch Quay Phim Chụp Hình, Hậu Kỳ',
  description: 'ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ',
  manifest: '/manifest.json',
  icons: {
    icon: '/nhiep.jpg',
    shortcut: '/nhiep.jpg',
    apple: '/nhiep.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://nhiep.net',
    siteName: 'nhiep.net',
    title: 'nhiep.net — Đặt Lịch Quay Phim Chụp Hình, Hậu Kỳ',
    description: 'ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ',
    images: [
      {
        url: 'https://nhiep.net/nhiep.jpg',
        width: 1200,
        height: 1200,
        alt: 'nhiep.net — ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ',
        type: 'image/jpeg'
      },
      {
        url: 'https://nhiep.net/logo.jpg',
        width: 1200,
        height: 1200,
        alt: 'nhiep.net — ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ',
        type: 'image/jpeg'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'nhiep.net — Đặt Lịch Quay Phim Chụp Hình, Hậu Kỳ',
    description: 'ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ',
    images: ['https://nhiep.net/nhiep.jpg']
  },
  other: {
    'og:image:secure_url': 'https://nhiep.net/nhiep.jpg',
    'og:image:type': 'image/jpeg',
    'og:image:width': '1200',
    'og:image:height': '1200'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ff7a00'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-brand selection:text-black">
        {children}
      </body>
    </html>
  );
}
