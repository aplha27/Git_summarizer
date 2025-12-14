import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitGrade - AI-Powered Repository Analysis",
  description: "Transform your GitHub repositories into comprehensive evaluation reports with AI-powered analysis, scoring, and actionable improvement roadmaps.",
  keywords: "github, repository, analysis, code quality, ai, developer tools",
  authors: [{ name: "GitGrade Team" }],
  openGraph: {
    title: "GitGrade - AI-Powered Repository Analysis",
    description: "Get instant AI-powered feedback on your GitHub repositories with comprehensive scoring and improvement roadmaps.",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}
