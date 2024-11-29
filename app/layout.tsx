import Navbar from '@/components/Navbar';
import './globals.css';
export const metadata = {
  title: 'RailMadad',
  description: 'Rail Madad Chat Bot'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen w-full flex-col text-black">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
