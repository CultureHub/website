import localFont from "next/font/local";
import { Baskervville } from "next/font/google";

export const MillingFont = localFont({
  src: [
    {
      path: "/../../public/fonts/milling/205TF-Milling-Triplex1,5mm.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "/../../public/fonts/milling/205TF-Milling-Duplex1mm.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "/../../public/fonts/milling/205TF-Milling-Duplex1mmItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "/../../public/fonts/milling/205TF-Milling-Simplex1mm.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "/../../public/fonts/milling/205TF-Milling-Simplex1mmItalic.woff2",
      weight: "100",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-milling",
  preload: false,
});

export const BrookFont = localFont({
  src: [
    {
      path: "/../../public/fonts/brook/brook-regular-web.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "/../../public/fonts/brook/brook-italic-web.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-brook",
  preload: false,
});

// "Miller Text" (the article serif) is NOT in the Typekit kit (qwz8mrs only
// loads fig-script, schoolbook, schoolbook-condensed) and no local files exist,
// so it is exposed as a CSS font stack (`--font-miller`) in globals.css that
// falls back to Baskervville. Baskervville is loaded here as a real webfont.
export const BaskervvilleFont = Baskervville({
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-baskervville",
});
