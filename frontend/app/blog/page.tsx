import Link from "next/link";

export default function BlogPage() {
  const posts = [
    {
      slug: "ai-pdf-extraction",
      title: "How AI Transforms PDF Data Extraction",
      category: "Data Automation",
      description:
        "Explore how artificial intelligence can identify and extract structured tables from messy PDFs with near-human accuracy.",
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      slug: "data-workflow-automation",
      title: "5 Ways to Speed Up Your Data Workflow",
      category: "Workflow",
      description:
        "Learn practical ways to automate PDF-to-CSV tasks and cut hours from manual data processing routines.",
      color: "bg-green-50 text-green-700",
    },
    {
      slug: "clean-csv-export",
      title: "The Ultimate Guide to Clean CSV Exports",
      category: "Productivity",
      description:
        "Discover how to handle messy formatting, merged cells, and numeric alignment issues when converting PDFs to CSV.",
      color: "bg-pink-50 text-pink-700",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-bold text-center mb-6">
        Our <span className="text-indigo-600">Blog</span>
      </h1>
      <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
        Explore tutorials, best practices, and insights on PDF data extraction and workflow automation.
      </p>

      <div className="grid md:grid-cols-3 gap-10">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block border rounded-2xl p-8 hover:shadow-xl transition"
          >
            <div
              className={`inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 ${post.color}`}
            >
              {post.category}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition">
              {post.title}
            </h2>
            <p className="text-gray-600 mb-4">{post.description}</p>
            <span className="text-indigo-600 font-medium text-sm">Read More →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
