import "./globals.css";
import { GeistSans } from "geist/font/sans";

import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

import type { Metadata } from "next";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Social",
  description: "Social on web3.",
};

const ClientUserContextProvider = dynamic(
  () => import("../lib/ClientUserContextProvider"),
  { ssr: false }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <Head>
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png" />
      </Head>
      <body>
        <ClientUserContextProvider>
            {children}
            <Toaster />
        </ClientUserContextProvider>
      </body>
    </html>
  );
}
