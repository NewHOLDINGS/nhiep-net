import React from 'react';
import { Metadata } from 'next';
import { Locale } from '@/types';
import { getDictionary } from '@/data/translations';

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = (params.locale || 'vi') as Locale;
  const dict = getDictionary(locale);

  const title = `${dict.booking.title} — ${dict.hero.badge} | nhiep.net`;
  const desc = dict.hero.badge;

  return {
    metadataBase: new URL('https://nhiep.net'),
    title,
    description: desc,
    alternates: {
      canonical: `https://nhiep.net/${locale}/booking`,
      languages: {
        vi: 'https://nhiep.net/vi/booking',
        en: 'https://nhiep.net/en/booking',
        zh: 'https://nhiep.net/zh/booking',
        'x-default': 'https://nhiep.net/vi/booking'
      }
    },
    openGraph: {
      title,
      description: desc,
      url: `https://nhiep.net/${locale}/booking`,
      siteName: 'nhiep.net',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'en' ? 'en_US' : 'vi_VN',
      type: 'website',
      images: [
        {
          url: 'https://nhiep.net/nhiep.jpg',
          width: 1200,
          height: 1200,
          alt: `${title} - ${desc}`,
          type: 'image/jpeg'
        },
        {
          url: 'https://nhiep.net/logo.jpg',
          width: 1200,
          height: 1200,
          alt: `${title} - ${desc}`,
          type: 'image/jpeg'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: ['https://nhiep.net/nhiep.jpg']
    },
    other: {
      'og:image:secure_url': 'https://nhiep.net/nhiep.jpg',
      'og:image:type': 'image/jpeg',
      'og:image:width': '1200',
      'og:image:height': '1200',
      'DC.Language': locale
    }
  };
}

export default function BookingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
