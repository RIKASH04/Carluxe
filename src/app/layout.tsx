import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carluxe — Smart Car Wash & Detailing",
  description:
    "Premium car wash and detailing booking platform. Book your slot, track your queue in real-time, and enjoy a luxury experience.",
  keywords: ["car wash", "detailing", "booking", "carluxe", "premium"],
  openGraph: {
    title: "Carluxe — Smart Car Wash & Detailing",
    description: "Premium car wash and detailing booking platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
