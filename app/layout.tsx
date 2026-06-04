import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CotizaPro SaaS",
  description: "SaaS multi-tenant para cotizaciones comerciales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
