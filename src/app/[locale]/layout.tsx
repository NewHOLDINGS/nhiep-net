import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Locale } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingContacts from '@/components/FloatingContacts';
import StickyMobileNav from '@/components/StickyMobileNav';
import Providers from '@/components/Providers';
import { getDictionary } from '@/data/translations';

export function generateStaticParams() {
  return [{ locale: 'vi' }, { locale: 'en' }, { locale: 'zh' }];
}

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = (params.locale || 'vi') as Locale;
  const dict = getDictionary(locale);

  const title = `${dict.hero.badge} | nhiep.net`;
  const desc = dict.hero.subtitle;

  const geoPlaceName =
    locale === 'zh'
      ? '岘港, 顺化, 广治, 芽庄, 越南'
      : locale === 'en'
      ? 'Da Nang, Hue, Quang Tri, Nha Trang, Vietnam'
      : 'Đà Nẵng, Thừa Thiên Huế, Quảng Trị, Khánh Hòa, Việt Nam';

  return {
    metadataBase: new URL('https://nhiep.net'),
    title: {
      default: title,
      template: '%s | nhiep.net'
    },
    description: desc,
    alternates: {
      canonical: `https://nhiep.net/${locale}`,
      languages: {
        vi: 'https://nhiep.net/vi',
        en: 'https://nhiep.net/en',
        zh: 'https://nhiep.net/zh',
        'x-default': 'https://nhiep.net/vi'
      }
    },
    openGraph: {
      title,
      description: desc,
      url: `https://nhiep.net/${locale}`,
      siteName: 'nhiep.net',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'en' ? 'en_US' : 'vi_VN',
      type: 'website',
      images: [
        {
          url: 'https://nhiep.net/logo.jpg',
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: ['https://nhiep.net/logo.jpg']
    },
    other: {
      'geo.region': 'VN-DN;VN-26;VN-25;VN-34',
      'geo.placename': geoPlaceName,
      'geo.position': '16.0594;108.1492',
      ICBM: '16.0594, 108.1492',
      'DC.Language': locale
    }
  };
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
  const dict = getDictionary(validLocale);

  // Global JSON-LD LocalBusiness Schema localized per language & GEO region
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name:
      validLocale === 'zh'
        ? 'nhiep.net — 越南中部专业影视录像与摄影平台'
        : validLocale === 'en'
        ? 'nhiep.net — Central Vietnam Cinema & Photography Platform'
        : 'nhiep.net — Nền Tảng Đặt Lịch Quay Chụp & Điện Ảnh Miền Trung',
    description: dict.footer.about,
    image: 'https://nhiep.net/logo.jpg',
    '@id': 'https://nhiep.net',
    url: `https://nhiep.net/${validLocale}`,
    telephone: '+84932513678',
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
      {
        '@type': 'AdministrativeArea',
        name: validLocale === 'zh' ? '岘港市' : validLocale === 'en' ? 'Da Nang City' : 'TP. Đà Nẵng'
      },
      {
        '@type': 'AdministrativeArea',
        name: validLocale === 'zh' ? '承天顺化省' : validLocale === 'en' ? 'Thua Thien Hue Province' : 'Tỉnh Thừa Thiên Huế'
      },
      {
        '@type': 'AdministrativeArea',
        name: validLocale === 'zh' ? '广治省' : validLocale === 'en' ? 'Quang Tri Province' : 'Tỉnh Quảng Trị'
      },
      {
        '@type': 'AdministrativeArea',
        name: validLocale === 'zh' ? '庆和省 (芽庄)' : validLocale === 'en' ? 'Khanh Hoa Province (Nha Trang)' : 'Tỉnh Khánh Hòa (Nha Trang)'
      }
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
