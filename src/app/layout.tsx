import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Brand } from "@/components/Brand";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.probablybrokeit.com";
const description = "Probably broke it. Let's learn from it. Blameless incident postmortems.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Blameless incident postmortems", template: "%s · probablybrokeit" },
  description,
  openGraph: {
    title: "Blameless incident postmortems",
    description,
    url: siteUrl,
    siteName: "probablybrokeit",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Blameless incident postmortems",
    description,
  },
};

// Applies the saved theme before the page paints. Light is the default, so there is no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark';if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Brand />
        <div className="flex-1">{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
