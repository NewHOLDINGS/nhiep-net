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

  const title = `${dict.blog.title} | nhiep.net`;
  const desc = 'ĐẶT LỊCH QUAY PHIM CHỤP HÌNH, HẬU KỲ';

  return {
    metadataBase: new URL('https://nhiep.net'),
    title,
    description: desc,
    alternates: {
      canonical: `https://nhiep.net/${locale}/blog`,
      languages: {
        vi: 'https://nhiep.net/vi/blog',
        en: 'https://nhiep.net/en/blog',
        zh: 'https://nhiep.net/zh/blog',
        'x-default': 'https://nhiep.net/vi/blog'
      }
    },
    openGraph: {
      title,
      description: desc,
      url: `https://nhiep.net/${locale}/blog`,
      siteName: 'nhiep.net',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'en' ? 'en_US' : 'vi_VN',
      type: 'website',
      images: [
        {
          url: 'https://nhiep.net/og-image.png',
          width: 1200,
          height: 1200,
          alt: `${title} — ${desc}`,
          type: 'image/png'
        },
        {
          url: 'https://nhiep.net/nhiep.jpg',
          width: 1200,
          height: 1200,
          alt: `${title} — ${desc}`,
          type: 'image/jpeg'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: ['https://nhiep.net/og-image.png']
    },
    other: {
      'og:image:secure_url': 'https://nhiep.net/og-image.png',
      'og:image:type': 'image/png',
      'og:image:width': '1200',
      'og:image:height': '1200',
      'DC.Language': locale
    }
  };
}

export default function BlogLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
