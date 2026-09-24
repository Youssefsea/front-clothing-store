import { Archivo, Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Providers from "@/components/Providers";

const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ar",
  display: "swap",
});

export const metadata = {
  title: "VANTA — Modern essentials",
  description:
    "A focused collection of modern essentials. Sharp cuts, honest materials and pieces built to live in your rotation.",
};

// Applied before paint so there is no theme or language flash. Reads the
// persisted preferences out of localStorage and syncs <html> attributes.
const noFlashScript = `(function(){try{
  var lang=localStorage.getItem("vanta.lang");
  var theme=localStorage.getItem("vanta.theme");
  var d=document.documentElement;
  if(lang==="ar"||lang==="en"){d.lang=lang;d.dir=lang==="ar"?"rtl":"ltr";}
  if(theme==="dark"){d.setAttribute("data-theme","dark");}
  else if(theme==="light"){d.setAttribute("data-theme","light");}
  else{d.setAttribute("data-theme",matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");}
}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${arabic.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}