import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from '@/components/ui/navigation'; // Import Navigation
import Footer from '@/components/footer/footer';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TruckFlow - Smart Logistics Management',
  description: 'Efficient trucking and logistics management platform for modern fleet operations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navigation /> {/* Added Navigation here */}
          <main>{children}</main>
        </ThemeProvider>
      <Footer/>
      </body>
    </html>
  );
}
