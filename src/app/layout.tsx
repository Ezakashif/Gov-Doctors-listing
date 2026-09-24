import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Sehat Directory Pakistan — Find a government facility",
    description:
      "An independent, unofficial directory of government hospitals and clinics in Pakistan, with officially sourced addresses and switchboards.",
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
