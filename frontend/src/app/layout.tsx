import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyberpunk Kanban Board",
  description: "Futuristic and minimal cyberpunk project management board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-cyber-bg text-crisp-text cyber-grid">
        {children}
      </body>
    </html>
  );
}
