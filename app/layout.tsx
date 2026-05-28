import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RPG inventory system",
  description: "Base Next.js project for an RPG inventory system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
