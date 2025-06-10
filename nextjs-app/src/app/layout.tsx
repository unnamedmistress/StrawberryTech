import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "StrawberryTech Learning Games",
  description:
    "Play engaging games and sharpen your skills in our fruity learning arcade.",
  openGraph: {
    title: "StrawberryTech Learning Games",
    description:
      "Play engaging games and sharpen your skills in our fruity learning arcade.",
    url: "https://strawberry-tech.vercel.app/",
    images:
      "https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "StrawberryTech Learning Games",
    description:
      "Play engaging games and sharpen your skills in our fruity learning arcade.",
    images: [
      "https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png",
    ],
    site: "https://strawberry-tech.vercel.app/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
