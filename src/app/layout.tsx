import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { NavHeader } from "@/components/ui/NavHeader";
import { OrbBackground } from "@/components/ui/OrbBackground";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeCITY",
  description: "A living city personality engine where 5 AI agents debate what you should do.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <OrbBackground />
        <NavHeader />
        {children}
      </body>
    </html>
  );
}
