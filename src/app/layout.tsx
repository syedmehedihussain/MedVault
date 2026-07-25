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
  title: "MedVault — Your lifelong medical record",
  description:
    "A secure, searchable home for your medical reports. Photograph a report; MedVault extracts the data so you never lose it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-zinc-500">
            MedVault is not a medical device and does not provide medical
            advice. It helps you store and organise your records — always
            consult a qualified clinician for medical decisions.
          </div>
        </footer>
      </body>
    </html>
  );
}
