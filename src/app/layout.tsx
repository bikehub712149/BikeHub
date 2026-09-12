import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Bike Hub",
  description: "Bike Hub is a comprehensive platform for managing and tracking bike inventory, sales, and customer transactions. It provides an intuitive interface for users to view detailed information about bikes, including technical specifications, financial details, and ownership history. The platform also offers features for editing bike details, managing customer interactions, and ensuring a seamless experience for both buyers and sellers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
<html
      lang="en"
  className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}
        <Toaster richColors position="top-right" />
      </body>
      
    </html>
    </ClerkProvider>
    
  );
}
