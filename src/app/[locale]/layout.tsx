import React from 'react';
import { notFound } from 'next/navigation';
import { Locale } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingContacts from '@/components/FloatingContacts';
import StickyMobileNav from '@/components/StickyMobileNav';
import Providers from '@/components/Providers';

export function generateStaticParams() {
  return [{ locale: 'vi' }, { locale: 'en' }, { locale: 'zh' }];
}

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!['vi', 'en', 'zh'].includes(locale)) {
    notFound();
  }

  const validLocale = locale as Locale;

  // Global JSON-LD LocalBusiness Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'nhiep.net — Photography & Videography Platform',
    image: 'https://nhiep.net/logo.jpg',
    '@id': 'https://nhiep.net',
    url: `https://nhiep.net/${validLocale}`,
    telephone: '0932513678',
    priceRange: '1500000VND - 28000000VND',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '522 Tôn Đức Thắng',
      addressLocality: 'Hoà Khánh',
      addressRegion: 'Đà Nẵng',
      postalCode: '550000',
      addressCountry: 'VN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 16.0594,
      longitude: 108.1492
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '00:00',
      closes: '23:59'
    },
    sameAs: [
      'https://zalo.me/0932513678',
      'https://wa.me/84932513678'
    ],
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Đà Nẵng' },
      { '@type': 'AdministrativeArea', name: 'Thừa Thiên Huế' },
      { '@type': 'AdministrativeArea', name: 'Quảng Trị' },
      { '@type': 'AdministrativeArea', name: 'Khánh Hòa' }
    ]
  };

  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header locale={validLocale} />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer locale={validLocale} />
        <FloatingContacts locale={validLocale} />
        <StickyMobileNav locale={validLocale} />
      </div>
    </Providers>
  );
}
