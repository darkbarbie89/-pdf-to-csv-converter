'use client';

import Link from 'next/link';
import { FileText, Code, Copy, ArrowLeft, Terminal, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const curlCommand = `curl -X POST -F "file=@example.pdf" https://pdf2csv-backend2.onrender.com/convert -o result.csv`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-violet-600/10 rounded-full text-sm font-medium text-gray-900 mb-6">
            <Code className="w-4 h-4 text-blue-600" />
            Developer API
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            PDF2CSV <span className="text-gradient">REST API</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Integrate PDF to CSV conversion directly into your application or automation workflow
            using a simple, secure REST API.
          </p>
        </div>

        {/* API Endpoint */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Endpoint</h2>
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-auto text-sm">
            POST https://pdf2csv-backend2.onrender.com/convert
          </pre>
          <p className="text-gray-600 mt-4">
            This endpoint accepts a single PDF file via <code className="bg-gray-100 px-1 rounded">multipart/form-data</code> and
            returns a CSV file.
          </p>
        </section>

        {/* Example Usage */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Example Request (cURL)</h2>
            <button
              onClick={() => handleCopy(curlCommand)}
              className="text-sm px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-auto text-sm mb-4">
            {curlCommand}
          </pre>
          <p className="text-gray-600">
            The response will be a downloadable CSV file containing the extracted table data.
          </p>
        </section>

        {/* Response Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Response</h2>
          <p className="text-gray-600 mb-6">
            If successful, the response will stream a CSV file.  
            If an error occurs, you’ll receive a JSON object:
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-auto text-sm mb-4">
{`{
  "error": "No tables detected"
}`}
          </pre>
          <ul className="text-gray-600 list-disc pl-6 space-y-2">
            <li>Maximum file size: <strong>50 MB</strong></li>
            <li>Accepted format: <strong>application/pdf</strong></li>
            <li>Output: <strong>CSV file</strong></li>
          </ul>
        </section>

        {/* SDK-style section */}
        <section className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl p-10 text-center shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Start Building with PDF2CSV</h2>
          <p className="text-lg text-blue-100 mb-8">
            Simple. Fast. Secure. Integrate PDF to CSV conversion into any app or automation flow.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
          >
            Try the Converter
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </main>
  );
}
