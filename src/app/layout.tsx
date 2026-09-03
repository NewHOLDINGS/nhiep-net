import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://nhiep.net'),
  title: 'nhiep.net — Đặt Lịch Quay Phim Chụp Hình, Hậu Kỳ',
  description: 'ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
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
        url: 'https://nhiep.net/og-image.png',
        width: 1200,
        height: 1200,
        alt: 'nhiep.net — ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ',
        type: 'image/png'
      },
      {
        url: 'https://nhiep.net/nhiep.jpg',
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
    images: ['https://nhiep.net/og-image.png']
  },
  other: {
    'og:image:secure_url': 'https://nhiep.net/og-image.png',
    'og:image:type': 'image/png',
    'og:image:width': '1200',
    'og:image:height': '1200'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-content',
  themeColor: '#09090b'
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
        {/* Universal Social Sharing Meta Tags (Facebook, Zalo, X, Messenger, WhatsApp, YouTube, Telegram) */}
        <meta property="og:title" content="nhiep.net — Đặt Lịch Quay Phim Chụp Hình, Hậu Kỳ" />
        <meta property="og:description" content="ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ" />
        <meta property="og:image" content="https://nhiep.net/og-image.png" />
        <meta property="og:image:secure_url" content="https://nhiep.net/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta property="og:image:alt" content="nhiep.net — ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ" />
        <meta property="og:url" content="https://nhiep.net" />
        <meta property="og:site_name" content="nhiep.net" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="nhiep.net — Đặt Lịch Quay Phim Chụp Hình, Hậu Kỳ" />
        <meta name="twitter:description" content="ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ" />
        <meta name="twitter:image" content="https://nhiep.net/og-image.png" />
        <meta name="description" content="ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ" />
        <meta name="thumbnail" content="https://nhiep.net/og-image.png" />
        <link rel="image_src" href="https://nhiep.net/og-image.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-brand selection:text-black">
        {children}
      </body>
    </html>
  );
}
