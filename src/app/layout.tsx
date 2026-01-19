import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DistrictClose - DC FSBO Transaction Manager",
  description: "A collaborative platform for managing For Sale By Owner real estate transactions in Washington, D.C. Track milestones, manage documents, and calculate DC-specific taxes.",
  keywords: ["FSBO", "Washington DC", "real estate", "transaction management", "closing costs", "DC taxes"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
