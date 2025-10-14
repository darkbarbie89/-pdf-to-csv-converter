import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, CheckCircle, AlertCircle, Table, Shield, Zap, Globe } from 'lucide-react';

const PdfToCsvConverter = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle');
  const [extractedData, setExtractedData] = useState([]);
  const [allTables, setAllTables] = useState([]);
  const [selectedTableIndex, setSelectedTableIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      processFile(droppedFile);
    } else {
      setErrorMessage('Please upload a PDF file');
      setStatus('error');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      processFile(selectedFile);
    } else {
      setErrorMessage('Please select a PDF file');
      setStatus('error');
    }
  };

  const processFile = async (pdfFile) => {
    setStatus('processing');
    setErrorMessage('');
    setProcessingProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Send to backend API
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProcessingProgress(95);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process PDF');
      }

      if (!result.tables || result.tables.length === 0) {
        throw new Error('No table data found in PDF');
      }

      // Process the tables
      const processedTables = result.tables.map(table => table.rows);

      setAllTables(processedTables);
      setExtractedData(processedTables[0]);
      setSelectedTableIndex(0);
      setProcessingProgress(100);
      setStatus('success');

    } catch (error) {
      console.error('PDF processing error:', error);
      setErrorMessage(error.message || 'Failed to process PDF. The file might be corrupted or password-protected.');
      setStatus('error');
    }
  };

  const downloadCSV = () => {
    const dataToDownload = allTables[selectedTableIndex] || extractedData;
    
    // Convert array to CSV with proper escaping
    const csvContent = dataToDownload
      .map(row => row.map(cell => {
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
      .join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${file.name.replace('.pdf', '')}_table_${selectedTableIndex + 1}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setExtractedData([]);
    setAllTables([]);
    setSelectedTableIndex(0);
    setErrorMessage('');
    setProcessingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDF to CSV Converter</h1>
              <p className="text-sm text-gray-600">Extract tables from PDFs with precision</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Trust Indicators */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Privacy First</p>
              <p className="text-sm font-semibold text-gray-900">100% Secure</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-xs text-gray-500">Processing Speed</p>
              <p className="text-sm font-semibold text-gray-900">Lightning Fast</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Monthly Users</p>
              <p className="text-sm font-semibold text-gray-900">20K+ Active</p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        {status === 'idle' && (
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all bg-white shadow-sm ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop your PDF here
              </h2>
              <p className="text-gray-600 mb-6">or click to browse from your computer</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer transition-colors shadow-sm hover:shadow-md"
              >
                <Upload className="w-5 h-5" />
                Select PDF File
              </label>
              <div className="mt-6 space-y-2">
                <p className="text-xs text-gray-500">
                  Maximum file size: 50MB • PDF format only
                </p>
                <p className="text-xs text-green-600 font-medium">
                  ✓ Files are processed securely and deleted immediately
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center mb-6">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Processing PDF...</h2>
              <p className="text-gray-600 mb-1">Analyzing document structure</p>
              <p className="text-sm text-gray-500">{file?.name}</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2 font-medium">{processingProgress}% complete</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Error</h2>
                <p className="text-gray-700 mb-4">{errorMessage}</p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-amber-900 mb-2">Common issues:</p>
                  <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
                    <li>PDF contains scanned images instead of text</li>
                    <li>File is password-protected</li>
                    <li>Complex layout with nested tables</li>
                    <li>Corrupted or malformed PDF</li>
                  </ul>
                </div>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Try Another File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success State with Preview */}
        {status === 'success' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">Extraction Complete!</h2>
                  <p className="text-sm text-gray-600">{file?.name}</p>
                </div>
                <button
                  onClick={reset}
                  className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                  title="Convert another file"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Table Selector */}
              {allTables.length > 1 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Found {allTables.length} tables in your PDF:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allTables.map((table, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTableIndex(idx);
                          setExtractedData(allTables[idx]);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedTableIndex === idx
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-blue-600 hover:bg-blue-100 border border-blue-300'
                        }`}
                      >
                        Table {idx + 1} ({table.length} rows)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={downloadCSV}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
              >
                <Download className="w-5 h-5" />
                Download CSV File
              </button>
            </div>

            {/* Data Preview */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Table className="w-4 h-4" />
                  <span>{extractedData.length} rows × {extractedData[0]?.length || 0} columns</span>
                </div>
              </div>
              
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 border-r border-gray-200">
                          #
                        </th>
                        {extractedData[0]?.map((_, idx) => (
                          <th
                            key={idx}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            Column {idx + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {extractedData.slice(0, 100).map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                          <td className="px-3 py-3 text-xs text-gray-500 font-medium sticky left-0 bg-inherit border-r border-gray-200">
                            {rowIdx + 1}
                          </td>
                          {row.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="px-4 py-3 text-sm text-gray-900 whitespace-normal"
                            >
                              {cell || <span className="text-gray-400 italic">empty</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {extractedData.length > 100 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Showing first 100 rows of {extractedData.length} total rows
                </p>
              )}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Enterprise Security</h3>
            <p className="text-sm text-gray-600">
              Files are processed on secure servers and immediately deleted. No data retention.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Accurate Extraction</h3>
            <p className="text-sm text-gray-600">
              Advanced algorithms detect and extract complex table structures with high precision.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-sm text-gray-600">
              Preview extracted data and download clean CSV files ready for analysis.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload Your PDF</h3>
                <p className="text-gray-600 text-sm">Drag and drop or click to select your PDF file containing tables.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Automatic Extraction</h3>
                <p className="text-gray-600 text-sm">Our advanced algorithms detect and extract table data accurately.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Download CSV</h3>
                <p className="text-gray-600 text-sm">Preview your data and download clean CSV files instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-sm text-gray-600">Yes, your files are processed securely and deleted immediately after conversion. We never store your data.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What types of PDFs are supported?</h3>
              <p className="text-sm text-gray-600">We support text-based PDFs with table structures. Scanned images or password-protected PDFs may not work properly.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a file size limit?</h3>
              <p className="text-sm text-gray-600">Yes, we support PDFs up to 50MB to ensure fast processing times.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>© 2025 PDF to CSV Converter • Built for accuracy and privacy • All files processed securely</p>
        </div>
      </footer>
    </div>
  );
};

export default PdfToCsvConverter;