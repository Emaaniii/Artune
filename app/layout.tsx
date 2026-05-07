import type { Metadata } from "next";
import { Space_Grotesk, Be_Vietnam_Pro } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import StarField from "@/components/StarField";

// Client-only — never participates in SSR, so it cannot perturb the rendered
// HTML of any page. If either of these ever throws, only its own subtree
// breaks; every other component renders normally on the server.
const ChatBot = dynamic(() => import("@/components/ChatBot"), { ssr: false });
const CursorSparkles = dynamic(
  () => import("@/components/CursorSparkles"),
  { ssr: false },
);

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
  title: "Artune — Journey Through Art",
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
        <ChatBot />
        <CursorSparkles />
      </body>
    </html>
  );
}
