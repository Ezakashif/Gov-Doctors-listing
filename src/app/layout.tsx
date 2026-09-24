import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Sehat Directory Pakistan — Find a government facility",
    description:
      "An independent directory for locating government medical facilities and, when verified, PMDC-checked doctors for Hajj medical forms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
