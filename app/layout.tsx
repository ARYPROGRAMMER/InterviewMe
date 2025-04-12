import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
});

export const metadata: Metadata = {
  title: "Interview ME",
  description: "AI Interviewer for Technical Interviews",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#171532",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${comfortaa.className} antialiased pattern`}
      >
        {children}

        <Toaster/>
      </body>
    </html>
  );
}
