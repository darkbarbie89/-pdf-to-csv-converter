import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BlogPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">Our Blog</h1>
      <p className="text-gray-600 text-lg mb-12">
        Explore the latest insights, guides, and tutorials on PDF tools, AI automation, and data workflows.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div className="group bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            How AI Improves PDF Data Extraction
          </h3>
          <p className="text-gray-600 mb-6">
            Discover how AI algorithms detect and extract complex tables from messy PDFs with precision.
          </p>
          <Link
            href="/blog/ai-pdf-extraction"
            className="inline-flex items-center text-blue-600 font-semibold hover:gap-2 transition-all"
          >
            Read More
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
      </div>
    </main>
  );
}
