import { Archivo, Saira_Condensed } from "next/font/google";

export const heavy = Saira_Condensed({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-heavy",
  display: "swap",
});

export const wide = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-wide",
  display: "swap",
});
