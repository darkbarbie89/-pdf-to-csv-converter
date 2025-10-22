"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [csvUrl, setCsvUrl] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setCsvUrl("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Connect to your FastAPI backend URL:
      const res = await fetch("https://pdf2csv-backend2.onrender.com/convert", {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to extract table");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setCsvUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        fontFamily: "sans-serif",
        padding: "2rem",
        maxWidth: 600,
        margin: "auto",
      }}
    >
      <h1>PDF to CSV Converter</h1>
      <p>Extract tables from any PDF instantly.</p>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}
        >
          {loading ? "Converting…" : "Convert"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {csvUrl && (
        <p>
          ✅ Done!{" "}
          <a href={csvUrl} download="converted.csv">
            Download CSV
          </a>
        </p>
      )}
    </main>
  );
}
