import type { Metadata } from 'next';
import { DM_Sans, Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const dmSans = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const playfair = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'], style: ['normal', 'italic'], weight: ['500', '600'] });

export const metadata: Metadata = {
  title: 'Legacy Goods | Designed & Crafted in Pakistan',
  description: 'Artisanal clothing and carry goods, designed and crafted in Pakistan.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
