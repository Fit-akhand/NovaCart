import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "NovaCart",
    template: "%s | NovaCart",
  },
  description:
    "NovaCart is a premium full-stack e-commerce platform built with Next.js, MongoDB, and modern web technologies.",
  keywords: [
    "NovaCart",
    "Next.js",
    "React",
    "E-commerce",
    "MongoDB",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}