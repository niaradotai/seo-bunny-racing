import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SEO Bunny Racing",
    description: "Race against your competitor's website!",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased pt-8 px-4`}
            >
                <main className="flex flex-col items-center justify-center relative">
                    {children}
                </main>
                <div className="flex pb-30"></div>
            </body>
        </html>
    );
}
