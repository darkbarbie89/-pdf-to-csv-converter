import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';

// This would typically come from a CMS or markdown files
const getBlogPost = (slug: string) => {
  // Sample data - replace with actual data fetching
  const posts: Record<string, any> = {
    'how-to-extract-tables-from-pdf': {
      title: 'How to Extract Tables from PDF Files: A Complete Guide',
      author: 'Sarah Chen',
      date: '2024-03-15',
      readTime: '5 min read',
      category: 'Tutorial',
      content: `
        <h2>Introduction</h2>
        <p>Extracting tables from PDF files can be challenging, but with the right tools and techniques, you can efficiently convert your PDF data into usable CSV formats. This comprehensive guide will walk you through everything you need to know.</p>
        
        <h2>Why Extract Tables from PDFs?</h2>
        <p>PDF files are excellent for preserving document formatting and sharing information, but they're not ideal for data analysis. Here's why you might need to extract tables:</p>
        <ul>
          <li>Data Analysis: CSV files can be easily imported into Excel, Google Sheets, or data analysis tools</li>
          <li>Database Import: Structured data in CSV format can be imported into databases</li>
          <li>Automation: CSV files can be processed programmatically</li>
          <li>Accessibility: Plain text formats are more accessible than complex PDFs</li>
        </ul>
        
        <h2>Common Challenges</h2>
        <p>When extracting tables from PDFs, you might encounter several challenges:</p>
        <ol>
          <li><strong>Complex Layouts:</strong> Tables with merged cells or irregular structures</li>
          <li><strong>Multi-page Tables:</strong> Tables that span across multiple pages</li>
          <li><strong>Scanned PDFs:</strong> Image-based PDFs require OCR technology</li>
          <li><strong>Formatting Issues:</strong> Special characters, fonts, and encoding problems</li>
        </ol>
        
        <h2>Step-by-Step Guide</h2>
        <h3>1. Choose the Right Tool</h3>
        <p>For most users, our online PDF to CSV converter provides the easiest solution. Simply upload your PDF, and our AI-powered system will detect and extract tables automatically.</p>
        
        <h3>2. Prepare Your PDF</h3>
        <p>Before conversion, ensure your PDF:</p>
        <ul>
          <li>Is not password-protected</li>
          <li>Contains actual text (not just images)</li>
          <li>Has clear table structures</li>
        </ul>
        
        <h3>3. Upload and Convert</h3>
        <p>The conversion process is straightforward:</p>
        <ol>
          <li>Visit our converter tool</li>
          <li>Upload your PDF file</li>
          <li>Wait for automatic table detection</li>
          <li>Download your CSV file</li>
        </ol>
        
        <h2>Pro Tips for Better Results</h2>
        <ul>
          <li><strong>Quality Matters:</strong> Higher quality PDFs produce better extraction results</li>
          <li><strong>Check Your Data:</strong> Always review the extracted data for accuracy</li>
          <li><strong>Handle Special Characters:</strong> Be aware of encoding issues with special characters</li>
          <li><strong>Use API for Automation:</strong> For bulk conversions, consider using our API</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Extracting tables from PDFs doesn't have to be complicated. With the right approach and tools, you can quickly convert your PDF tables into CSV format for further analysis and processing. Try our free converter today and experience the difference!</p>
      `,
      metaDescription: 'Learn how to extract tables from PDF files efficiently. Step-by-step guide covering tools, techniques, and best practices for PDF to CSV conversion.',
      keywords: ['extract tables from PDF', 'PDF table extraction', 'PDF to CSV guide', 'convert PDF tables'],
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
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
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
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </nav>
      
      {/* Article Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {post.category}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-6 text-gray-600">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span className="font-medium">{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </header>
      
      {/* Article Content */}
      <div 
        className="prose prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
          prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 prose-strong:font-semibold
          prose-ul:my-6 prose-ol:my-6
          prose-li:text-gray-700 prose-li:mb-2"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      {/* CTA Section */}
      <div className="mt-16 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Extract Tables from Your PDFs?
        </h3>
        <p className="text-gray-700 mb-6">
          Try our free PDF to CSV converter and extract your data in seconds.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Start Converting Now
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </Link>
      </div>
      
      {/* Author Bio */}
      <div className="mt-12 p-6 bg-gray-50 rounded-xl">
        <h4 className="font-semibold text-gray-900 mb-2">About the Author</h4>
        <p className="text-gray-700">
          <strong>{post.author}</strong> is a data analyst and technical writer specializing in document processing and data extraction technologies.
        </p>
      </div>
    </article>
  );
}