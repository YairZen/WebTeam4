import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamInsight - Team Project Monitoring",
  description: "AI-powered team analytics and reflection platform for project management",
  keywords: ["team management", "project monitoring", "AI reflection", "team health"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
