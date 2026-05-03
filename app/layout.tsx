import type { Metadata } from "next";
import { Space_Grotesk, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import StarField from "@/components/StarField";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
});

const body = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Arting — Journey Through Art",
  description:
    "Book oil painting, manga drawing, miniature designing and sculpting classes in Kuwait.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${display.variable} ${body.variable}`}>
      <body className="font-body-md text-on-background min-h-screen relative">
        <StarField />
        {children}
      </body>
    </html>
  );
}
