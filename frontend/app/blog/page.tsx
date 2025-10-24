'use client';

import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';

export default function BlogPage() {
  const posts = [
    {
      slug: 'how-to-extract-tables-from-pdf',
      title: 'How to Extract Tables from PDF Files: A Complete Guide',
      excerpt:
        'A complete tutorial on converting PDF tables into CSV for analysis — tools, challenges, and pro tips for accurate extraction.',
      category: 'Tutorial',
      date: 'March 15, 2024',
      readTime: '5 min read',
      color: 'text-indigo-600',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-gradient">Blog</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore tutorials, best practices, and insights on PDF data extraction and automation.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="group bg-white rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl bg-gray-50 ${post.color}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <span className={`text-sm font-semibold ${post.color}`}>{post.category}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{post.excerpt}</p>
              <div className="flex justify-between items-center">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-indigo-600 font-semibold hover:gap-2 transition-all"
                >
                  Read More
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
                <span className="text-sm text-gray-500">{post.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
