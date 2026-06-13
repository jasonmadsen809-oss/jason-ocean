import './globals.css';

export const metadata = {
  title: 'Jason + Ocean AI',
  description: 'RunPod-powered AI for Jason',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
