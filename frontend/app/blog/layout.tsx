import Link from 'next/link';
import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Blog - PDF to CSV Converter',
  description: 'Learn about PDF data extraction, CSV conversion tips, and best practices for handling document data.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-semibold text-gray-900">PDF2CSV</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/blog" className="text-gray-900 font-medium">
                Blog
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-24">
        {children}
      </main>
    </div>
  );
}