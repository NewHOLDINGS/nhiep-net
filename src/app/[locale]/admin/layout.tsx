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

  return {
    title: `${dict.nav.admin} | nhiep.net`,
    robots: {
      index: false,
      follow: false
    }
  };
}

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
