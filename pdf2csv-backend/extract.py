import camelot
import pandas as pd
import os

def extract_tables(pdf_path):
    # Try lattice (with lines)
    tables = []
    try:
        tables = camelot.read_pdf(pdf_path, pages='1-end', flavor='lattice')
    except:
        pass

    # Fallback: stream (no visible lines)
    if not tables or tables.n == 0:
        try:
            tables = camelot.read_pdf(pdf_path, pages='1-end', flavor='stream')
        except:
            return None

    if not tables or tables.n == 0:
        return None

    dfs = [t.df for t in tables]
    combined = pd.concat(dfs, ignore_index=True)
    csv_path = pdf_path.replace(".pdf", ".csv")
    combined.to_csv(csv_path, index=False)
    return csv_path
