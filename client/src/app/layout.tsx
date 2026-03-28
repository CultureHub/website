import type { Metadata } from "next";
import { MillingFont, BrookFont } from "@/atoms/text";
import Menu from "@/components/Menu";
import "./globals.css";

export const metadata: Metadata = {
  title: "CULTUREHUB",
  description:
    "A global art & technology community founded by SeoulArts & La MaMa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${MillingFont.className} ${MillingFont.variable} ${BrookFont.variable} antialiased`}
      >
        <Menu />
        {children}
      </body>
    </html>
  );
}
