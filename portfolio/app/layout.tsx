import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rio Allen - AI Automation Specialist & Product Builder",
  description: "Full-stack product builder with film background. 40+ production apps built using AI-assisted development. Former cinematographer turned tech builder.",
  openGraph: {
    title: "Rio Allen - AI Automation Specialist & Product Builder",
    description: "Full-stack product builder with film background. 40+ production apps built using AI-assisted development.",
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
