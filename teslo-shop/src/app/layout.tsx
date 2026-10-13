import type { Metadata } from "next";
import "./globals.css";
import { titleFont } from "@/config/fonts";
import { Provider } from "@/components";

export const metadata: Metadata = {
  title: {
    template: '%s - Teslo | Shop',
    default: 'Home - Teslo | Shop'
  },
  description: "Tienda virtual de ropa de Tesla",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={titleFont.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
