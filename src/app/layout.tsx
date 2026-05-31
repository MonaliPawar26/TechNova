import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'SynergyAI - Intelligent Human-AI Workplace Collaboration Platform',
  description: 'Where Human Intelligence Meets Artificial Intelligence. Eliminate workplace communication delays, poor task tracking, and approval bottlenecks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
