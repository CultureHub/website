import localFont from "next/font/local";

export const MillingFont = localFont({
  src: [
    {
      path: "/../../public/fonts/milling/MillingTrial-Triplex1,5mm.otf",
      weight: "701",
      style: "normal",
    },
    {
      path: "/../../public/fonts/milling/MillingTrial-Duplex1mm.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "/../../public/fonts/milling/MillingTrial-Duplex1mmItalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "/../../public/fonts/milling/MillingTrial-Simplex1mm.otf",
      weight: "103",
      style: "normal",
    },
    {
      path: "/../../public/fonts/milling/MillingTrial-Simplex1mmItalic.otf",
      weight: "103",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-milling",
});

export const BrookFont = localFont({
  src: [
    {
      path: "/../../public/fonts/brook/brooktrial-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "/../../public/fonts/brook/brooktrial-italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-brook",
});
