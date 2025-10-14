// pages/api/convert.js
import formidable from 'formidable';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

function detectTablesFromText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const tables = [];
  
  // First, always try the fallback detection which is more accurate for your PDF format
  const detectedTables = fallbackTableDetection(lines);
  
  if (detectedTables.length > 0) {
    return detectedTables;
  }
  
  // If that didn't work, use the original detection logic
  // ... (rest of the original function remains for other PDF formats)
  
  return tables;
}

function intelligentSplit(line) {
  // For lines like "Blind 5 1 4 34.5%, n=1 1199 sec, n=1"
  const segments = [];
  
  // Special handling for your table format
  const patterns = [
    /^(Blind|Low Vision|Dexterity|Mobility)\s+(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/,
    /^(\w+(?:\s+\w+)?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/
  ];
  
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      // Extract matched groups
      segments.push(match[1]); // Category
      segments.push(match[2]); // Participants
      segments.push(match[3]); // Ballots Completed
      segments.push(match[4]); // Ballots Incomplete
      
      // Split the results part
      const results = match[5];
      const resultParts = results.split(/\s{2,}/).filter(s => s.trim());
      if (resultParts.length >= 2) {
        segments.push(resultParts[0]); // Accuracy
        segments.push(resultParts[1]); // Time
      } else {
        // Try to split by looking for time pattern
        const timeMatch = results.match(/(.+?)(\d+\s*sec.*)$/);
        if (timeMatch) {
          segments.push(timeMatch[1].trim());
          segments.push(timeMatch[2].trim());
        } else {
          segments.push(results);
        }
      }
      return segments;
    }
  }
  
  // Fallback to space-based splitting
  return line.split(/\s{2,}/).filter(s => s.trim());
}

function specialTableParsing(line, headers) {
  // Handle special cases like continuation lines
  if (line.includes('n=') && line.includes('%')) {
    // This is likely accuracy data
    return ['', '', '', '', line, ''];
  } else if (line.includes('sec')) {
    // This is likely time data
    return ['', '', '', '', '', line];
  }
  
  // Default: try to match the column count
  const segments = line.split(/\s+/).filter(s => s.trim());
  const result = new Array(headers.length || 6).fill('');
  segments.forEach((seg, i) => {
    if (i < result.length) {
      result[i] = seg;
    }
  });
  return result;
}

function fallbackTableDetection(lines) {
  // More aggressive table detection for difficult PDFs
  const tables = [];
  const tableData = [];
  
  // Look for the specific table structure in your PDF
  let headerFound = false;
  let headerLine = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for header patterns
    if (line.includes('Disability') && line.includes('Category')) {
      headerFound = true;
      // Find the complete header line (might be split across lines)
      let fullHeader = line;
      
      // Check next lines for continuation of headers
      if (i + 1 < lines.length && lines[i + 1].includes('Participants')) {
        fullHeader += ' ' + lines[i + 1];
        i++; // Skip the next line since we've processed it
      }
      if (i + 1 < lines.length && (lines[i + 1].includes('Ballots') || lines[i + 1].includes('Results'))) {
        fullHeader += ' ' + lines[i + 1];
        i++; // Skip the next line
      }
      
      // Create proper headers
      const headers = [
        'Disability Category', 
        'Participants', 
        'Ballots Completed', 
        'Ballots Incomplete/Terminated', 
        'Accuracy', 
        'Time to complete'
      ];
      tableData.push(headers);
      continue;
    }
    
    // Also check for simpler header patterns
    if (!headerFound && (
      (line.includes('Participants') && line.includes('Ballots')) ||
      (line.includes('Category') && line.includes('Results')) ||
      (line.includes('Accuracy') && line.includes('Time'))
    )) {
      headerFound = true;
      const headers = [
        'Disability Category', 
        'Participants', 
        'Ballots Completed', 
        'Ballots Incomplete/Terminated', 
        'Accuracy', 
        'Time to complete'
      ];
      tableData.push(headers);
      continue;
    }
    
    if (headerFound) {
      // Parse data rows
      if (line.match(/^(Blind|Low Vision|Dexterity|Mobility)/)) {
        const rowData = parseDataRow(line);
        if (rowData) {
          tableData.push(rowData);
        }
      } else if (line.includes('n=') || line.includes('sec')) {
        // This might be a continuation of previous row
        if (tableData.length > 1) { // > 1 because first row is headers
          const lastRow = tableData[tableData.length - 1];
          if (line.includes('%')) {
            // This is accuracy data
            if (!lastRow[4] || lastRow[4] === '') {
              lastRow[4] = line.trim();
            } else {
              lastRow[4] = (lastRow[4] + ' ' + line).trim();
            }
          } else if (line.includes('sec')) {
            // This is time data
            if (!lastRow[5] || lastRow[5] === '') {
              lastRow[5] = line.trim();
            } else {
              lastRow[5] = (lastRow[5] + ' ' + line).trim();
            }
          }
        }
      }
    }
  }
  
  if (tableData.length >= 2) {
    tables.push({ rows: normalizeTable(tableData) });
  }
  
  return tables;
}

function parseDataRow(line) {
  // Specific parsing for your table format
  const match = line.match(/^(Blind|Low Vision|Dexterity|Mobility)\s+(\d+)\s+(\d+)\s+(\d+)\s+(.+?)(\d+(?:\.\d+)?\s*sec.*)$/);
  
  if (match) {
    return [
      match[1],           // Disability Category
      match[2],           // Participants
      match[3],           // Ballots Completed
      match[4],           // Ballots Incomplete
      match[5].trim(),    // Accuracy
      match[6].trim()     // Time to complete
    ];
  }
  
  // Simpler fallback
  const parts = line.split(/\s+/);
  if (parts.length >= 4) {
    const category = parts[0] + (parts[0] === 'Low' ? ' ' + parts[1] : '');
    const startIdx = category.split(' ').length;
    
    return [
      category,
      parts[startIdx] || '',
      parts[startIdx + 1] || '',
      parts[startIdx + 2] || '',
      parts.slice(startIdx + 3).join(' ').split(/(?=\d+(?:\.\d+)?\s*sec)/)[0] || '',
      parts.slice(startIdx + 3).join(' ').match(/\d+(?:\.\d+)?\s*sec.*/)?.[0] || ''
    ];
  }
  
  return null;
}

function normalizeTable(rows) {
  if (rows.length === 0) return rows;
  
  const maxCols = Math.max(...rows.map(row => row.length));
  
  return rows.map(row => {
    const normalized = [...row];
    while (normalized.length < maxCols) {
      normalized.push('');
    }
    return normalized;
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  let filePath = null;
  
  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
    });
    
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    
    if (!file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }
    
    filePath = file.filepath;
    
    // Read file buffer
    const buffer = await fs.readFile(filePath);
    
    // Extract text and detect tables
    let tables = [];
    
    try {
      const data = await pdf(buffer);
      console.log('PDF text extracted:', data.text.substring(0, 500)); // Debug
      
      // Detect tables
      tables = detectTablesFromText(data.text);
      
      console.log('Tables found:', tables.length); // Debug
      
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF content');
    }
    
    // Clean up file immediately
    await fs.unlink(filePath).catch(() => {});
    filePath = null;
    
    if (tables.length === 0) {
      return res.status(400).json({ 
        error: 'No table data found in PDF', 
        details: 'The PDF might be image-based, password-protected, or contain no structured tables.'
      });
    }
    
    res.status(200).json({
      success: true,
      tables: tables,
      tableCount: tables.length,
    });
    
  } catch (error) {
    console.error('Server error:', error);
    
    // Clean up file if error occurred
    if (filePath) {
      await fs.unlink(filePath).catch(() => {});
    }
    
    res.status(500).json({ 
      error: 'Failed to process PDF',
      details: error.message 
    });
  }
}