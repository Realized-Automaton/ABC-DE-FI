
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google'; // Import Roboto
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

// Configure Roboto font
const roboto = Roboto({
  weight: ['400', '500', '700'], // Added 500 weight for more flexibility
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-roboto', // Define CSS variable name
  display: 'swap',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply the font variable class to the html tag
    <html lang="en" className={`${roboto.variable} font-sans`} suppressHydrationWarning>
      {/* font-sans will now use roboto variable defined in tailwind.config.ts */}
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
