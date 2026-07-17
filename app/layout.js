import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "GENIUS — Evidence-backed AI Operations Workspace",
  description:
    "GENIUS finds where a business is losing money, proves it with source evidence, prepares the next action, and waits for human approval before anything is executed.",
  icons: {
    icon: "/genius-logo.png",
    shortcut: "/genius-logo.png",
    apple: "/genius-logo.png",
  },
};

export const viewport = {
  themeColor: "#06080a",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className={`${inter.variable} bg-background text-foreground antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
