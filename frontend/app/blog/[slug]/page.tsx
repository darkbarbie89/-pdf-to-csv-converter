import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';

// Define all posts here
const getBlogPost = (slug: string) => {
  const posts: Record<string, any> = {
    'how-to-extract-tables-from-pdf': {
      title: 'How to Extract Tables from PDF Files: A Complete Guide',
      author: 'Sarah Chen',
      date: '2024-03-15',
      readTime: '5 min read',
      category: 'Tutorial',
      content: `
        <h2>Introduction</h2>
        <p>Extracting tables from PDF files can be challenging, but with the right tools and techniques, you can efficiently convert your PDF data into usable CSV formats...</p>
      `,
      metaDescription: 'Learn how to extract tables from PDF files efficiently...',
      keywords: ['extract tables from PDF', 'PDF table extraction', 'PDF to CSV guide', 'convert PDF tables'],
    },

    'ai-pdf-extraction': {
      title: 'How AI Transforms PDF Data Extraction',
      author: 'Michael Tan',
      date: '2024-04-10',
      readTime: '4 min read',
      category: 'Data Automation',
      content: `
        <h2>AI Revolution in Document Processing</h2>
        <p>Artificial intelligence has revolutionized how businesses handle PDF data extraction. With machine learning models trained on thousands of document layouts, AI can identify tables, headers, and data relationships with precision far beyond traditional parsing methods.</p>
        <h3>Why It Matters</h3>
        <p>Manual extraction or basic OCR often results in errors, especially with complex structures. AI algorithms adapt to layout variations and detect column alignments automatically.</p>
        <h3>Use Cases</h3>
        <ul>
          <li>Financial report digitization</li>
          <li>Invoice data extraction</li>
          <li>Research data normalization</li>
        </ul>
        <p>With PDF2CSV’s AI backend, you can save hours of manual cleanup while maintaining data accuracy and consistency.</p>
      `,
      metaDescription: 'Explore how AI transforms PDF table extraction and improves data accuracy.',
      keywords: ['AI PDF extraction', 'AI automation', 'document AI', 'table recognition'],
    },

    'data-workflow-automation': {
      title: '5 Ways to Speed Up Your Data Workflow',
      author: 'Sophia Lim',
      date: '2024-04-18',
      readTime: '6 min read',
      category: 'Workflow',
      content: `
        <h2>Optimize Your PDF to CSV Conversion</h2>
        <p>Modern workflows depend on speed. Whether you're processing invoices, forms, or reports, automating repetitive steps can drastically reduce manual workload.</p>
        <ol>
          <li>Batch upload PDFs for automatic conversion.</li>
          <li>Use API integration to process files programmatically.</li>
          <li>Leverage scheduling tools like Zapier or Make.</li>
          <li>Implement validation checks for data consistency.</li>
          <li>Monitor performance with analytics dashboards.</li>
        </ol>
        <p>Automation ensures faster turnaround, fewer human errors, and better scalability for growing datasets.</p>
      `,
      metaDescription: 'Learn how to automate and accelerate your PDF-to-CSV workflow for efficiency and consistency.',
      keywords: ['data automation', 'workflow', 'AI PDF', 'process optimization'],
    },

    'clean-csv-export-guide': {
      title: 'The Ultimate Guide to Clean CSV Exports',
      author: 'David Lee',
      date: '2024-04-25',
      readTime: '7 min read',
      category: 'Productivity',
      content: `
        <h2>Why Clean Data Matters</h2>
        <p>When exporting tables from PDFs, formatting inconsistencies can break downstream analytics. Clean CSV exports eliminate formatting issues, ensuring your data integrates seamlessly with databases or spreadsheets.</p>
        <h3>Common Pitfalls</h3>
        <ul>
          <li>Merged cells or irregular spacing</li>
          <li>Broken numeric columns</li>
          <li>Hidden characters or encoding mismatches</li>
        </ul>
        <h3>How to Fix Them</h3>
        <p>AI-powered extraction tools like PDF2CSV normalize column structures, detect header rows, and align numerical data automatically — producing accurate, analysis-ready CSVs.</p>
      `,
      metaDescription: 'Discover how to export clean, analysis-ready CSVs from complex PDF files.',
      keywords: ['clean CSV export', 'PDF cleanup', 'data formatting', 'CSV quality'],
    },
  };

  return posts[slug] || null;
};

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default function BlogPost({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
        <Link href="/blog" className="text-indigo-600 hover:text-indigo-700 font-medium">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {post.category}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{post.title}</h1>
        <div className="flex items-center gap-6 text-gray-600">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none prose-headings:font-bold prose-p:text-gray-700 prose-a:text-indigo-600 hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* CTA */}
      <div className="mt-16 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Extract Tables from Your PDFs?
        </h3>
        <p className="text-gray-700 mb-6">
          Try our free PDF to CSV converter and extract your data in seconds.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          Start Converting Now
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </Link>
      </div>
    </article>
  );
}
