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
  
  // Try multiple detection strategies and return the best result
  const strategies = [
    detectComplexTables,      // For complex tables like the disability one
    detectSimpleTables,       // For simple tables with clear structure
    detectDataExamples,       // For the tutoring examples format
  ];
  
  let bestTables = [];
  let bestScore = 0;
  
  for (const strategy of strategies) {
    const result = strategy(lines);
    if (result.tables.length > 0 && result.score > bestScore) {
      bestTables = result.tables;
      bestScore = result.score;
    }
  }
  
  return bestTables;
}

// Strategy 1: Complex tables with multi-line cells (disability table)
function detectComplexTables(lines) {
  const tables = [];
  const tableData = [];
  let score = 0;
  
  // Look for disability table pattern
  const disabilityPattern = /^(Blind|Low Vision|Dexterity|Mobility|Disability)/i;
  const hasDisabilityTable = lines.some(line => disabilityPattern.test(line));
  
  if (hasDisabilityTable) {
    let headerFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for header
      if (line.includes('Disability') && line.includes('Category')) {
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
        score = 10; // High score for specific pattern match
        continue;
      }
      
      if (headerFound) {
        if (line.match(/^(Blind|Low Vision|Dexterity|Mobility)/)) {
          const rowData = parseDisabilityRow(line);
          if (rowData) {
            tableData.push(rowData);
          }
        } else if (line.includes('n=') || line.includes('sec')) {
          // Handle continuation lines
          if (tableData.length > 1) {
            const lastRow = tableData[tableData.length - 1];
            if (line.includes('%') && (!lastRow[4] || lastRow[4] === '')) {
              lastRow[4] = line.trim();
            } else if (line.includes('sec') && (!lastRow[5] || lastRow[5] === '')) {
              lastRow[5] = line.trim();
            }
          }
        }
      }
    }
    
    if (tableData.length >= 2) {
      tables.push({ rows: normalizeTable(tableData) });
    }
  }
  
  return { tables, score };
}

// Strategy 2: Simple tables with clear delimiters
function detectSimpleTables(lines) {
  const tables = [];
  let currentTable = [];
  let inTable = false;
  let score = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip title lines
    if (line.match(/^Example.*(Table|Graph)/i)) {
      if (currentTable.length >= 2) {
        tables.push({ rows: normalizeTable(currentTable) });
        score += currentTable.length;
      }
      currentTable = [];
      inTable = false;
      continue;
    }
    
    // Parse table row
    const row = parseSimpleTableRow(line);
    if (row && row.length >= 2) {
      currentTable.push(row);
      inTable = true;
    } else if (inTable && (line === '' || i === lines.length - 1)) {
      if (currentTable.length >= 2) {
        tables.push({ rows: normalizeTable(currentTable) });
        score += currentTable.length;
      }
      currentTable = [];
      inTable = false;
    }
  }
  
  // Don't forget last table
  if (currentTable.length >= 2) {
    tables.push({ rows: normalizeTable(currentTable) });
    score += currentTable.length;
  }
  
  return { tables, score };
}

// Strategy 3: Data examples format (tutoring PDF)
function detectDataExamples(lines) {
  const tables = [];
  let score = 0;
  
  // Look for Example patterns
  let inExample = false;
  let exampleData = [];
  let currentHeaders = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for Example headers
    if (line.match(/^Example \d+:/)) {
      if (exampleData.length >= 2) {
        tables.push({ rows: normalizeTable(exampleData) });
        score += 5;
      }
      exampleData = [];
      inExample = true;
      continue;
    }
    
    if (inExample) {
      // Look for table structures within examples
      if (line.includes('Number of Coils') || line.includes('Number of Paperclips')) {
        currentHeaders = ['Number of Coils', 'Number of Paperclips'];
        exampleData.push(currentHeaders);
      } else if (line.includes('Time (drops') || line.includes('Distance (cm)')) {
        currentHeaders = ['Time (drops of water)', 'Distance (cm)'];
        exampleData.push(currentHeaders);
      } else if (line.includes('Speed (mph)') || line.includes('Driver')) {
        // Speed records table
        currentHeaders = ['Speed (mph)', 'Driver', 'Car', 'Engine', 'Date'];
        exampleData.push(currentHeaders);
      } else {
        // Try to parse as data row
        const dataRow = parseExampleDataRow(line, currentHeaders);
        if (dataRow) {
          exampleData.push(dataRow);
        }
      }
    }
  }
  
  // Don't forget last example
  if (exampleData.length >= 2) {
    tables.push({ rows: normalizeTable(exampleData) });
    score += 5;
  }
  
  return { tables, score };
}

function parseDisabilityRow(line) {
  const match = line.match(/^(Blind|Low Vision|Dexterity|Mobility)\s+(\d+)\s+(\d+)\s+(\d+)\s+(.+?)(\d+(?:\.\d+)?\s*sec.*)$/);
  
  if (match) {
    return [
      match[1],           // Disability Category
      match[2],           // Participants
      match[3],           // Ballots Completed
      match[4],           // Ballots Incomplete
      match[5].trim(),    // Accuracy
      match[6].trim()     // Time
    ];
  }
  
  // Fallback parsing
  const parts = line.split(/\s+/);
  if (parts.length >= 4 && parts[0].match(/^(Blind|Low Vision|Dexterity|Mobility)/)) {
    const category = parts[0] + (parts[0] === 'Low' ? ' ' + parts[1] : '');
    const startIdx = category.split(' ').length;
    
    return [
      category,
      parts[startIdx] || '',
      parts[startIdx + 1] || '',
      parts[startIdx + 2] || '',
      parts.slice(startIdx + 3).filter(p => p.includes('%') || p.includes('n=')).join(' ') || '',
      parts.slice(startIdx + 3).filter(p => p.includes('sec')).join(' ') || ''
    ];
  }
  
  return null;
}

function parseSimpleTableRow(line) {
  // Try different delimiters
  let segments;
  
  // Tab-separated
  segments = line.split('\t').filter(s => s.trim());
  if (segments.length >= 2) return segments;
  
  // Multiple spaces
  segments = line.split(/\s{3,}/).filter(s => s.trim());
  if (segments.length >= 2) return segments;
  
  // Two or more spaces
  segments = line.split(/\s{2,}/).filter(s => s.trim());
  if (segments.length >= 2) return segments;
  
  // Special patterns for water samples
  if (line.includes('water') || line.includes('milk')) {
    const match = line.match(/^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)$/);
    if (match) return match.slice(1);
    
    // For percentage data
    const pctMatch = line.match(/^(.+?)\s+([\d/]+\s*=\s*\d+%?)\s+([\d/]+\s*=\s*\d+%?)\s+([\d/]+\s*=\s*\d+%?)$/);
    if (pctMatch) return pctMatch.slice(1);
  }
  
  return null;
}

function parseExampleDataRow(line, headers) {
  if (!headers || headers.length === 0) return null;
  
  // For electromagnet data
  if (headers.includes('Number of Coils')) {
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match) return [match[1], match[2]];
  }
  
  // For time/distance data  
  if (headers.includes('Time (drops of water)')) {
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match) return [match[1], match[2]];
  }
  
  // For speed records
  if (headers.includes('Speed (mph)')) {
    const segments = line.split(/\s{2,}/).filter(s => s.trim());
    if (segments.length >= 5) return segments;
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
      console.log('PDF text length:', data.text.length);
      
      // Detect tables using adaptive strategies
      tables = detectTablesFromText(data.text);
      
      console.log('Tables found:', tables.length);
      
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