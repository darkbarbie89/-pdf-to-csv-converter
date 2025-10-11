import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Download, X, CheckCircle, AlertCircle, Table } from 'lucide-react';

const PdfToCsvConverter = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle');
  const [extractedData, setExtractedData] = useState([]);
  const [allTables, setAllTables] = useState([]); // Store all detected tables
  const [selectedTableIndex, setSelectedTableIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Load PDF.js library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);
    
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library not loaded yet. Please try again in a moment.');
      }

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let allText = [];
      const totalPages = pdf.numPages;

      // Extract text from all pages
      for (let i = 1; i <= totalPages; i++) {
        setProcessingProgress(Math.round((i / totalPages) * 50)); // 0-50% for text extraction
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items.map(item => ({
          text: item.str,
          x: Math.round(item.transform[4]),
          y: Math.round(item.transform[5]),
          width: Math.round(item.width),
          height: Math.round(item.height)
        }));
        
        allText.push(...pageText);
      }

      setProcessingProgress(60);

      // Smart detection: Separate regular text from tables
      // Step 1: Analyze text distribution to detect table regions
      const rowMap = {};
      const yTolerance = 8;
      
      allText.forEach(item => {
        if (item.text.trim()) {
          let foundRow = false;
          for (const yKey in rowMap) {
            if (Math.abs(Number(yKey) - item.y) <= yTolerance) {
              rowMap[yKey].push(item);
              foundRow = true;
              break;
            }
          }
          if (!foundRow) {
            rowMap[item.y] = [item];
          }
        }
      });

      setProcessingProgress(65);

      // Detect which rows are likely table rows vs regular text
      // Table rows typically have: multiple items, consistent spacing, numbers/data
      const sortedYKeys = Object.keys(rowMap).map(Number).sort((a, b) => b - a);
      
      const rowAnalysis = sortedYKeys.map(yKey => {
        const items = rowMap[yKey];
        const itemCount = items.length;
        const hasNumbers = items.some(item => /\d/.test(item.text));
        const avgSpacing = items.length > 1 
          ? items.slice(1).reduce((sum, item, i) => sum + (item.x - items[i].x), 0) / (items.length - 1)
          : 0;
        
        return {
          yKey,
          items,
          itemCount,
          hasNumbers,
          avgSpacing,
          // More lenient: consider rows with 2+ items OR rows with numbers as table-related
          isLikelyTableRow: itemCount >= 2 && hasNumbers
        };
      });

      setProcessingProgress(70);

      // Find continuous table regions (including ALL header rows above)
      const tableRegions = [];
      let currentRegion = [];
      
      rowAnalysis.forEach((row, idx) => {
        if (row.isLikelyTableRow) {
          currentRegion.push(row);
        } else {
          if (currentRegion.length >= 2) {
            // Include ALL rows above table that have 2+ items as potential headers
            const firstTableRowIdx = rowAnalysis.indexOf(currentRegion[0]);
            
            // Look back up to 5 rows for headers
            for (let lookback = 1; lookback <= 5; lookback++) {
              const headerIdx = firstTableRowIdx - lookback;
              if (headerIdx >= 0 && headerIdx < rowAnalysis.length) {
                const potentialHeader = rowAnalysis[headerIdx];
                if (potentialHeader && potentialHeader.itemCount >= 1) {
                  currentRegion.unshift(potentialHeader);
                } else {
                  break; // Stop if we hit an empty row
                }
              }
            }
            
            tableRegions.push(currentRegion);
          }
          currentRegion = [];
        }
      });
      
      // Don't forget last region
      if (currentRegion.length >= 2) {
        const firstTableRowIdx = rowAnalysis.indexOf(currentRegion[0]);
        
        for (let lookback = 1; lookback <= 5; lookback++) {
          const headerIdx = firstTableRowIdx - lookback;
          if (headerIdx >= 0 && headerIdx < rowAnalysis.length) {
            const potentialHeader = rowAnalysis[headerIdx];
            if (potentialHeader && potentialHeader.itemCount >= 1) {
              currentRegion.unshift(potentialHeader);
            } else {
              break;
            }
          }
        }
        
        tableRegions.push(currentRegion);
      }

      setProcessingProgress(75);

      // If no clear table detected, fall back to treating everything as table
      if (tableRegions.length === 0) {
        console.log('No clear table detected, using all content');
        tableRegions.push(rowAnalysis);
      }

      setProcessingProgress(75);

      // Process ALL table regions (for multi-table PDFs)
      const allTablesData = tableRegions.map(region => {
        // Detect column positions from this table region
        const allXPositions = [];
        region.forEach(row => {
          row.items.forEach(item => {
            allXPositions.push(item.x);
          });
        });
        
        const xClusters = [];
        const sortedX = [...new Set(allXPositions)].sort((a, b) => a - b);
        const xTolerance = 50;
        
        sortedX.forEach(x => {
          let foundCluster = false;
          for (let cluster of xClusters) {
            if (Math.abs(cluster[0] - x) <= xTolerance) {
              cluster.push(x);
              foundCluster = true;
              break;
            }
          }
          if (!foundCluster) {
            xClusters.push([x]);
          }
        });
        
        const columnPositions = xClusters.map(cluster => {
          return cluster.reduce((a, b) => a + b, 0) / cluster.length;
        }).sort((a, b) => a - b);

        // Convert table region to structured data
        const tableData = region.map(row => {
          const rowItems = row.items.sort((a, b) => a.x - b.x);
          const rowData = new Array(columnPositions.length).fill('');
          
          rowItems.forEach(item => {
            let closestCol = 0;
            let minDistance = Math.abs(item.x - columnPositions[0]);
            
            for (let i = 1; i < columnPositions.length; i++) {
              const distance = Math.abs(item.x - columnPositions[i]);
              if (distance < minDistance) {
                minDistance = distance;
                closestCol = i;
              }
            }
            
            if (rowData[closestCol]) {
              rowData[closestCol] += ' ' + item.text;
            } else {
              rowData[closestCol] = item.text;
            }
          });
          
          return rowData;
        });

        return tableData;
      });

      setProcessingProgress(85);

      setProcessingProgress(90);

      // Process each table: separate intro, headers, data
      const processedTables = allTablesData.map(tableData => {
        let headerRows = [];
        let dataRows = [];
        
        let foundFirstDataRow = false;
        
        tableData.forEach((row, idx) => {
          const hasData = row.some(cell => /\d/.test(cell));
          const cellCount = row.filter(cell => cell && cell.trim()).length;
          
          if (hasData && cellCount >= 2) {
            foundFirstDataRow = true;
            dataRows.push(row);
          } else if (foundFirstDataRow) {
            dataRows.push(row);
          } else if (cellCount >= 2) {
            headerRows.push(row);
          }
        });

        // Merge multi-row headers
        let mergedHeader = [];
        if (headerRows.length > 0) {
          const numCols = Math.max(...headerRows.map(r => r.length));
          
          for (let col = 0; col < numCols; col++) {
            const columnParts = headerRows
              .map(row => row[col] || '')
              .filter(text => text.trim())
              .join(' ');
            mergedHeader.push(columnParts);
          }
        }

        const combined = mergedHeader.length > 0 
          ? [mergedHeader, ...dataRows]
          : dataRows;

        // Normalize column count
        const maxCols = Math.max(...combined.map(row => row.length));
        return combined.map(row => {
          const normalized = [...row];
          while (normalized.length < maxCols) {
            normalized.push('');
          }
          return normalized.slice(0, maxCols);
        });
      }).filter(table => table.length >= 2); // At least header + 1 data row

      if (processedTables.length === 0) {
        throw new Error('No table data found in PDF. The PDF might be image-based or empty.');
      }

      setProcessingProgress(95);
      
      // Store all tables and show the first one
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
    // Use currently selected table
    const dataToDownload = allTables[selectedTableIndex] || extractedData;
    // Convert array to CSV with proper escaping
    const csvContent = dataToDownload
      .map(row => row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
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
    link.setAttribute('download', `${file.name.replace('.pdf', '')}.csv`);
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDF to CSV Converter</h1>
              <p className="text-sm text-gray-600">Free • Fast • Secure • No file upload required</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Upload Area */}
        {status === 'idle' && (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Drop your PDF file here
            </h2>
            <p className="text-gray-500 mb-6">or click to browse</p>
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <Upload className="w-5 h-5" />
              Choose PDF File
            </label>
            <p className="text-xs text-gray-400 mt-4">
              Your files are processed locally in your browser. Nothing is uploaded to our servers.
            </p>
          </div>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="text-center mb-6">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Processing your PDF...</h2>
              <p className="text-gray-500">Extracting text and tables</p>
              <p className="text-sm text-gray-400 mt-2">{file?.name}</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-2 transition-all duration-300 ease-out"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">{processingProgress}% complete</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Processing PDF</h2>
                <p className="text-gray-600 mb-4">{errorMessage}</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Common issues:</strong>
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1 ml-4 list-disc">
                    <li>PDF is password-protected</li>
                    <li>PDF contains only images (scanned documents)</li>
                    <li>PDF is corrupted or damaged</li>
                  </ul>
                </div>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Another File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success State with Preview */}
        {status === 'success' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Success Header */}
            <div className="bg-green-50 border-b border-green-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">Conversion Complete!</h2>
                  <p className="text-sm text-gray-600">{file?.name}</p>
                </div>
                <button
                  onClick={reset}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                  title="Convert another file"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <button
                onClick={downloadCSV}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download CSV File
              </button>
            </div>

            {/* Data Preview */}
            <div className="p-6">
              {/* Table Selector (if multiple tables) */}
              {allTables.length > 1 && (
                <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <span className="text-sm font-medium text-blue-900">
                    {allTables.length} tables detected:
                  </span>
                  <div className="flex gap-2">
                    {allTables.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTableIndex(idx);
                          setExtractedData(allTables[idx]);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedTableIndex === idx
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        Table {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Table className="w-4 h-4" />
                  <span>{extractedData.length} rows × {extractedData[0]?.length || 0} columns</span>
                </div>
              </div>
              
              <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 border-r border-gray-200">
                        Row
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
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-xs text-gray-500 font-medium sticky left-0 bg-white hover:bg-gray-50 border-r border-gray-200">
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
              
              {extractedData.length > 100 && (
                <p className="text-xs text-gray-500 mt-3">
                  Showing first 100 rows. Download CSV to see all {extractedData.length} rows.
                </p>
              )}
              
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Review the data preview carefully. PDF extraction might need manual cleanup in your spreadsheet app.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">100% Private</h3>
            <p className="text-sm text-gray-600">
              All conversion happens in your browser. Your files never leave your device.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast & Free</h3>
            <p className="text-sm text-gray-600">
              Convert PDFs to CSV instantly. No registration, no limits, completely free.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Easy Export</h3>
            <p className="text-sm text-gray-600">
              Preview your data before download. Get clean, formatted CSV files ready to use.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload Your PDF</h3>
                <p className="text-gray-600 text-sm">Drag and drop or click to select your PDF file with tables or data.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Automatic Extraction</h3>
                <p className="text-gray-600 text-sm">Our tool extracts text and organizes it into rows and columns automatically.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Preview & Download</h3>
                <p className="text-gray-600 text-sm">Review the extracted data and download your CSV file instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>© 2025 PDF to CSV Converter. Built with privacy in mind. All processing happens locally in your browser.</p>
        </div>
      </footer>
    </div>
  );
};

export default PdfToCsvConverter;