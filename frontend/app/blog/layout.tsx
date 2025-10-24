import "../globals.css";
import Link from "next/link";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* HEADER */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            PDF2CSV
          </Link>

          <div className="hidden md:flex items-center gap-8 text-gray-700">
            <Link href="/" className="hover:text-indigo-600 transition">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-indigo-600 transition">
              Pricing
            </Link>
            <Link href="/api" className="hover:text-indigo-600 transition">
              API
            </Link>
            <Link href="/blog" className="text-indigo-600 font-medium">
              Blog
            </Link>
          </div>

          <Link
            href="/"
            className="hidden md:inline-block bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Get Started Free
          </Link>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center md:text-left">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">PDF2CSV</h3>
              <p className="text-gray-600 text-sm">
                Extract structured data from PDFs into clean, ready-to-use CSV files — fast and accurate.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 hover:text-indigo-600">Home</Link></li>
                <li><Link href="/features" className="text-gray-600 hover:text-indigo-600">Features</Link></li>
                <li><Link href="/api" className="text-gray-600 hover:text-indigo-600">API</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-indigo-600">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Stay Connected</h4>
              <p className="text-gray-600 text-sm mb-4">
                Join 50,000+ professionals using PDF2CSV for data extraction.
              </p>
              <Link
                href="/"
                className="inline-block bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Start Free
              </Link>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6 text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} PDF2CSV. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
