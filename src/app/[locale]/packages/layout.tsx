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

  const title = `${dict.packages.title} | nhiep.net`;
  const desc = `${dict.packages.subtitle} - Báo giá chụp ảnh cưới, TVC, sự kiện, flycam tại Đà Nẵng, Huế, Quảng Trị, Nha Trang.`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: `https://nhiep.net/${locale}/packages`,
      languages: {
        vi: 'https://nhiep.net/vi/packages',
        en: 'https://nhiep.net/en/packages',
        zh: 'https://nhiep.net/zh/packages',
        'x-default': 'https://nhiep.net/vi/packages'
      }
    },
    openGraph: {
      title,
      description: desc,
      url: `https://nhiep.net/${locale}/packages`,
      siteName: 'nhiep.net',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'en' ? 'en_US' : 'vi_VN',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc
    },
    other: {
      'geo.region': 'VN-DN;VN-26;VN-25;VN-34',
      'geo.placename':
        locale === 'zh'
          ? '岘港, 顺化, 广治, 芽庄, 越南'
          : locale === 'en'
          ? 'Da Nang, Hue, Quang Tri, Nha Trang, Vietnam'
          : 'Đà Nẵng, Thừa Thiên Huế, Quảng Trị, Khánh Hòa, Việt Nam',
      'geo.position': '16.0594;108.1492',
      ICBM: '16.0594, 108.1492',
      'DC.Language': locale
    }
  };
}

export default function PackagesLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
