import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { preconnect } from "react-dom";
import AuthSessionProvider from "@/components/AuthSessionProvider";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Akvera — инженерное оборудование",
    template: "%s | Akvera",
  },
  description:
    "Akvera — поставщик сантехнического и инженерного оборудования.",
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  preconnect("https://s3.regru.cloud");

  return (
    <html
      lang="ru"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}