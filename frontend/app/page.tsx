'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, FileText, Download, CheckCircle, Loader2, ArrowRight, Shield, Zap, Cloud, Menu, X, Sparkles, Database, Lock, Globe, ChevronRight } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://pdf2csv-backend2.onrender.com';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setDownloadUrl(null);
    } else {
      setError('Please select a PDF file');
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
      setDownloadUrl(null);
    } else {
      setError('Please drop a PDF file');
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsConverting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError('Failed to convert PDF. Please try again.');
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && file) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name.replace('.pdf', '.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetConverter = () => {
    setFile(null);
    setDownloadUrl(null);
    setError(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>PDF to CSV Converter - Extract Tables with AI | PDF2CSV</title>
        <meta name="description" content="Convert PDF tables to CSV files instantly with AI-powered extraction. Enterprise-grade accuracy, secure processing, and lightning-fast results. Try free today." />
        <meta name="keywords" content="PDF to CSV, PDF converter, AI table extraction, enterprise PDF tool, convert PDF tables, PDF data extraction, secure PDF converter" />
        <link rel="canonical" href="https://pdftocsv.app" />
      </head>

      <div className="min-h-screen bg-white">
        {/* Premium Navigation */}
        <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-100 z-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-12">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">PDF2CSV</span>
                </Link>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                  <Link href="/features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                    Features
                  </Link>
                  <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                    Pricing
                  </Link>
                  <Link href="/api" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                    API
                  </Link>
                  <Link href="/blog" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                    Blog
                  </Link>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">
                  Sign in
                </Link>
                <Link href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200">
                  Get Started Free
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100">
              <div className="px-6 py-4 space-y-3">
                <Link href="/features" className="block text-gray-600 hover:text-gray-900 font-medium py-2">
                  Features
                </Link>
                <Link href="/pricing" className="block text-gray-600 hover:text-gray-900 font-medium py-2">
                  Pricing
                </Link>
                <Link href="/api" className="block text-gray-600 hover:text-gray-900 font-medium py-2">
                  API
                </Link>
                <Link href="/blog" className="block text-gray-600 hover:text-gray-900 font-medium py-2">
                  Blog
                </Link>
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <Link href="/login" className="block text-center px-4 py-2 text-gray-700 font-medium">
                    Sign in
                  </Link>
                  <Link href="/signup" className="block text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-lg">
                    Get Started Free
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section with Premium Design */}
        <main className="pt-24">
          <section className="relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-violet-400/20 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-violet-400/20 to-blue-400/20 rounded-full filter blur-3xl" />
            
            <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
              <div className="text-center max-w-4xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-violet-600/10 rounded-full text-sm font-medium text-gray-900 mb-6">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  AI-Powered Table Extraction
                </div>
                
                {/* Main Heading */}
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                  Convert PDF Tables to
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"> CSV in Seconds</span>
                </h1>
                
                {/* Subheading */}
                <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed">
                  Extract structured data from any PDF with enterprise-grade accuracy.
                  <span className="block">No signup required. Process files up to 50MB.</span>
                </p>

                {/* Converter Card */}
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 lg:p-10">
                    {!downloadUrl ? (
                      <>
                        {/* Upload Area with Premium Styling */}
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-10 lg:p-12 transition-all duration-300 ${
                            isDragging
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-violet-50'
                              : 'border-gray-200 hover:border-gray-300 bg-gradient-to-br from-gray-50 to-white'
                          }`}
                          onDragEnter={handleDragEnter}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <div className="text-center">
                            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                              isDragging ? 'bg-gradient-to-br from-blue-500 to-violet-500' : 'bg-gradient-to-br from-gray-100 to-gray-200'
                            }`}>
                              <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                            
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {file ? file.name : 'Drop your PDF here'}
                            </h3>
                            <p className="text-gray-500 mb-8">or browse from your computer</p>
                            
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={handleFileChange}
                              className="hidden"
                              id="file-upload"
                            />
                            <label
                              htmlFor="file-upload"
                              className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                            >
                              <FileText className="w-5 h-5" />
                              Select PDF File
                            </label>
                            
                            {file && (
                              <button
                                onClick={resetConverter}
                                className="block mx-auto mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                Choose different file
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-red-700 font-medium">{error}</p>
                          </div>
                        )}

                        {/* Convert Button */}
                        {file && !isConverting && (
                          <button
                            onClick={handleConvert}
                            className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                          >
                            Convert to CSV
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        )}

                        {/* Converting State */}
                        {isConverting && (
                          <div className="mt-8 text-center">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full animate-spin" style={{ background: 'conic-gradient(from 0deg, #2563eb, #7c3aed, #2563eb)' }} />
                              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                              </div>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">Processing your PDF...</p>
                            <p className="text-gray-600 mt-2">Extracting tables with AI precision</p>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Success State */
                      <div className="text-center py-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Conversion Complete!
                        </h3>
                        <p className="text-gray-600 mb-8">Your CSV file is ready for download</p>
                        
                        <button
                          onClick={handleDownload}
                          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
                        >
                          <Download className="w-5 h-5" />
                          Download CSV File
                        </button>
                        
                        <button
                          onClick={resetConverter}
                          className="block mx-auto mt-6 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Convert Another PDF
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Bank-level encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span>Lightning fast</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <span>No data retention</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-20 lg:py-28">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Enterprise Features,
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"> Free Forever</span>
                </h2>
                <p className="text-xl text-gray-600">
                  Everything you need to extract data from PDFs with confidence
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Extraction</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Advanced algorithms detect and extract complex table structures with 99.9% accuracy
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Bank-Level Security</h3>
                  <p className="text-gray-600 leading-relaxed">
                    256-bit SSL encryption and automatic file deletion after processing
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-7 h-7 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Process PDFs up to 50MB in seconds with our optimized infrastructure
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Database className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple Tables</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Automatically detect and extract multiple tables from a single PDF
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-7 h-7 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">API Access</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Integrate PDF conversion into your workflows with our REST API
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Cloud className="w-7 h-7 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Cloud-Based</h3>
                  <p className="text-gray-600 leading-relaxed">
                    No downloads or installations. Works on any device with a browser
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Ready to Extract Your Data?
              </h2>
              <p className="text-xl text-gray-600 mb-10">
                Join 50,000+ professionals using PDF2CSV for their data extraction needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300">
                  Start Converting Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/api" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-all duration-300">
                  View API Docs
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>
        </main>

       {/* Blog Section */}
<section className="py-20 bg-gradient-to-b from-white via-gray-50 to-gray-100">
  <div className="max-w-7xl mx-auto px-6">
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
        From Our <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Blog</span>
      </h2>
      <p className="text-xl text-gray-600">
        Tips, tutorials, and insights on PDF tools, automation, and AI data extraction
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
      {/* Blog Card 1 */}
      <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300 p-8">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-violet-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Sparkles className="w-7 h-7 text-blue-600" />
        </div>
        <span className="text-sm font-medium text-blue-600">Data Automation</span>
        <h3 className="text-2xl font-bold text-gray-900 mt-3 mb-4 group-hover:text-blue-600 transition-colors">
          How AI Transforms PDF Data Extraction
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          Explore how artificial intelligence can identify and extract structured tables from messy PDFs with near-human accuracy.
        </p>
        <Link
          href="/blog/ai-pdf-extraction"
          className="inline-flex items-center text-blue-600 font-semibold hover:gap-2 transition-all"
        >
          Read More
          <ChevronRight className="w-5 h-5 ml-1" />
        </Link>
      </div>

      {/* Blog Card 2 */}
      <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300 p-8">
        <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Zap className="w-7 h-7 text-green-600" />
        </div>
        <span className="text-sm font-medium text-green-600">Workflow</span>
        <h3 className="text-2xl font-bold text-gray-900 mt-3 mb-4 group-hover:text-green-600 transition-colors">
          5 Ways to Speed Up Your Data Workflow
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          Learn practical ways to automate PDF-to-CSV tasks and cut hours from your manual data processing routines.
        </p>
        <Link
          href="/blog/data-workflow-automation"
          className="inline-flex items-center text-green-600 font-semibold hover:gap-2 transition-all"
        >
          Read More
          <ChevronRight className="w-5 h-5 ml-1" />
        </Link>
      </div>

      {/* Blog Card 3 */}
      <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300 p-8">
        <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <FileText className="w-7 h-7 text-pink-600" />
        </div>
        <span className="text-sm font-medium text-pink-600">Productivity</span>
        <h3 className="text-2xl font-bold text-gray-900 mt-3 mb-4 group-hover:text-pink-600 transition-colors">
          The Ultimate Guide to Clean CSV Exports
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          Discover how to handle messy table formatting, merged cells, and numeric alignment issues when converting PDFs to CSV.
        </p>
        <Link
          href="/blog/clean-csv-export-guide"
          className="inline-flex items-center text-pink-600 font-semibold hover:gap-2 transition-all"
        >
          Read More
          <ChevronRight className="w-5 h-5 ml-1" />
        </Link>
      </div>
    </div>

    {/* CTA below blog */}
    <div className="text-center mt-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
      >
        View All Articles
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  </div>
</section>



        {/* Premium Footer */}
        <footer className="bg-gray-900 text-gray-400 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-5 gap-8 mb-12">
              <div className="md:col-span-2">
                <Link href="/" className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">PDF2CSV</span>
                </Link>
                <p className="text-gray-400 mb-6">
                  The most trusted PDF to CSV converter. Extract tables with AI-powered precision.
                </p>
                <div className="flex gap-4">
                  {/* Social icons would go here */}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-3">
                  <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
                  <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-3">
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                  <li><Link href="/guides" className="hover:text-white transition-colors">Guides</Link></li>
                  <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-3">
                  <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-center text-sm">
              <p>&copy; 2024 PDF2CSV. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}