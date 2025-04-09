import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { Toaster } from "sonner";
import NavbarWrapper from "@/components/NavbarWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Mushi Templates",
  description: "Your go-to platform for beautiful templates",
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
