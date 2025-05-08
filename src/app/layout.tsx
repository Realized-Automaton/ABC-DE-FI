
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { UserProvider } from '@/context/user-context';
import { Providers } from '@/components/providers'; // Import the new Providers component

export const metadata: Metadata = {
  title: 'ABC De-fi', // Updated title
  description:
    'Learn crypto actions safely with interactive tutorials and gamification.',
};

// Configure Inter font with regular (400) and bold (700) weights
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Define CSS variable name
  display: 'swap',
  weight: ['400', '700'], // Include weights
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply the font variable class to the html tag
    <html lang="en" className={`${inter.variable} font-sans`} suppressHydrationWarning>
      {/* Use the new font variable */}
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers> {/* Wrap with the combined Providers component */}
            <UserProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
              <Toaster />
            </UserProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

