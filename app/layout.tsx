import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./providers";
import DatabaseInitializer from "./components/DatabaseInitializer";

export const metadata: Metadata = {
  title: "DiplomaChain - Secure Diploma Verification",
  description: "Issue, verify, and manage academic diplomas with blockchain technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConvexClientProvider>
          <DatabaseInitializer />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
