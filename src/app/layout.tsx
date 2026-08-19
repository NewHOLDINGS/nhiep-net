import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://nhiep.net'),
  title: 'nhiep.net — Photography & Videography Platform Central Vietnam',
  description: 'Nền tảng đặt lịch chụp ảnh, quay phim, hậu kỳ & sự kiện chuyên nghiệp tại Đà Nẵng, Huế, Quảng Trị, Khánh Hòa.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://nhiep.net',
    siteName: 'nhiep.net',
    title: 'nhiep.net — Photography & Videography Platform',
    description: 'Nền tảng đặt lịch quay chụp chuyên nghiệp hàng đầu miền Trung',
    images: [{ url: '/logo.jpg', width: 800, height: 800, alt: 'nhiep.net Logo' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'nhiep.net — Photography & Videography Platform',
    description: 'Nền tảng đặt lịch quay chụp chuyên nghiệp hàng đầu miền Trung',
    images: ['/logo.jpg']
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
