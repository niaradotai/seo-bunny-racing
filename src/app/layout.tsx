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
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
    title: "SEO Bunny Racing",
    description: "Race against your competitor's website!",
    icons: {
        icon: "/assets/favicon/apple-touch-icon.png",
        shortcut: "/assets/favicon/apple-touch-icon.png",
        apple: "/assets/favicon/apple-touch-icon.png",
    },
    openGraph: {
        title: "SEO Bunny Racing",
        description: "Race against your competitor's website!",
        url: process.env.NEXT_PUBLIC_BASE_URL,
        siteName: "SEO Bunny Racing",
        images: [
            {
                url: "/assets/favicon/apple-touch-icon.png",
                width: 512,
                height: 512,
                alt: "SEO Bunny Racing",
            },
        ],
        locale: "en",
        type: "website",
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    twitter: {
        card: "summary_large_image",
        title: "SEO Bunny Racing",
        description: "Race against your competitor's website!",
        creator: "@niaradotai",
        images: ["/assets/favicon/apple-touch-icon.png"],
    },
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
