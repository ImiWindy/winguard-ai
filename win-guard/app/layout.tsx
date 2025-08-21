import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWARegister from "@/components/PWARegister";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Win Guard",
  description: "Win Guard app",
};

export const viewport: Viewport = {
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        <PWARegister />
        <AuthProvider protectedRoutes={["/dashboard", "/trades"]} publicRoutes={["/auth", "/auth/login", "/auth/signup"]}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
