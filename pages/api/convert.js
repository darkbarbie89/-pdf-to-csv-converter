// pages/api/convert.js
import formidable from 'formidable';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import pdf2table from 'pdf2table';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

// ---------------- TEXT-BASED DETECTOR ----------------
function detectTablesFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const tables = [];
  let currentTable = [];
  let headerFound = false;

  const rowPattern = /^([A-Za-z].*?)\s+(\d+(?:\.\d+)?)(?:\s+(\d+(?:\.\d+)?))?(?:\s+(\d+(?:\.\d+)?))?(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect a possible header line
    if (!headerFound && line.split(/\s{2,}/).length >= 2 && !line.match(/sec|%|n=/i)) {
      const headers = line.replace(/\s{2,}/g, ',').split(',').map(h => h.trim());
      currentTable.push(headers);
      headerFound = true;
      continue;
    }

    const match = line.match(rowPattern);
    if (match) {
      const row = [match[1]?.trim() || '', match[2] || '', match[3] || '', match[4] || '', match[5]?.trim() || ''];
      currentTable.push(row);
    } else if (headerFound && line.match(/[%()n=sec]/i)) {
      const last = currentTable[currentTable.length - 1];
      last[last.length - 1] = (last[last.length - 1] + ' ' + line.trim()).replace(/\s+/g, ' ');
    } else if (headerFound && line === '') {
      if (currentTable.length > 1) tables.push({ rows: normalizeTable(currentTable) });
      currentTable = [];
      headerFound = false;
    }
  }

  if (currentTable.length > 1) tables.push({ rows: normalizeTable(currentTable) });
  return tables;
}

function normalizeTable(rows) {
  const max = Math.max(...rows.map(r => r.length));
  return rows.map(r => [...r, ...Array(max - r.length).fill('')]);
}

// ---------------- MAIN HANDLER ----------------
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let filePath = null;
  try {
    // Parse uploaded file
    const form = formidable({ maxFileSize: 50 * 1024 * 1024 });
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    if (!file) return res.status(400).json({ error: 'No PDF file provided' });
    filePath = file.filepath;

    const buffer = await fs.readFile(filePath);

    // --- Step 1: Text-based parsing ---
    let tables = [];
    try {
      const data = await pdf(buffer);
      tables = detectTablesFromText(data.text);
    } catch (err) {
      console.error('pdf-parse failed:', err.message);
    }

    // --- Step 2: Fallback to pdf2table if no tables found ---
    if (!tables.length) {
      console.log('Trying fallback (pdf2table)...');
      tables = await new Promise((resolve, reject) => {
        pdf2table.parseFile(filePath, (err, rows) => {
          if (err) return reject(err);
          if (rows && rows.length > 0) {
            resolve([{ rows: rows.map(r => r.map(c => c.trim())) }]);
          } else resolve([]);
        });
      });
    }

    await fs.unlink(filePath).catch(() => {});

    if (!tables.length) {
      return res.status(400).json({
        error: 'No table data found in PDF',
        details: 'The PDF might be image-based or unstructured.',
      });
    }

    res.status(200).json({ success: true, tableCount: tables.length, tables });
  } catch (error) {
    console.error('Server error:', error);
    if (filePath) await fs.unlink(filePath).catch(() => {});
    res.status(500).json({ error: 'Failed to process PDF', details: error.message });
  }
}
