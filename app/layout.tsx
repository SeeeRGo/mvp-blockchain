import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./providers";
import DatabaseInitializer from "./components/DatabaseInitializer";

export const metadata: Metadata = {
  title: "DiplomaChain - Безопасная верификация дипломов",
  description: "Выпускайте, проверяйте и управляйте академическими дипломами с использованием блокчейн-технологий",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <ConvexClientProvider>
          <DatabaseInitializer />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
