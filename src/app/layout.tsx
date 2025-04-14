import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"; // Assuming you have this utility

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

const sora = Sora({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-sora',
  weight: ['400', '600', '700']
});

export const metadata: Metadata = {
  title: "CloudMap - AI Cloud Architecture Generator",
  description: "Generate AWS microservices architecture diagrams with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${sora.variable}`}>
      <body className={cn("h-full font-sans antialiased bg-white text-black", inter.className)}>
        {children}
      </body>
    </html>
  );
}
