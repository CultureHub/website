import localFont from "next/font/local";

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
