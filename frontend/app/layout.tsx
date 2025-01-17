import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthUserProvider } from "@/lib/auth_handler";
import { ThemeProvider } from "@/lib/theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Simple chess game",
  description: "Simple chess game to play with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          // defaultTheme="system"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthUserProvider>{children}</AuthUserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
