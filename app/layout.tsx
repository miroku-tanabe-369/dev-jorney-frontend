import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AmplifyProvider } from "./amplify-provider";
import { AuthGuard } from "./auth-guard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevJourney - Track Your Learning Path",
  description: "Professional learning management for developers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <AmplifyProvider>
          <AuthGuard>{children}</AuthGuard>
        </AmplifyProvider>
      </body>
    </html>
  );
}
