import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import UserProvider from "@/components/providers/user-provider";
import { Toaster } from "sonner";
import NavbarWrapper from "@/components/NavbarWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "MUSHI: Static Templates",
  description: "Your go-to platform for high-converting templates",
  icons: {
    icon: {
      url: '/favicon.png',
      type: 'image/png',
      sizes: '32x32',
    },
    shortcut: '/favicon.png',
    apple: {
      url: '/favicon.png',
      type: 'image/png',
      sizes: '180x180',
    },
  },
};

// Force dynamic rendering to ensure session state is always fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
      </head>
      <body className={`${poppins.variable} font-poppins antialiased min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <NavbarWrapper>
              {children}
            </NavbarWrapper>
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
