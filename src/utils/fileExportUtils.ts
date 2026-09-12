/**
 * Universal Fail-Proof CSV & Excel Export Utility for Web, PWA, and Android WebViews
 */

export interface ExportDataOptions {
  filename: string;
  title?: string;
  csvContent: string;
}

/**
 * Downloads a CSV/Excel file safely without causing Android WebView / AppsGeyser app crashes.
 */
export async function downloadOrShareCSV(options: ExportDataOptions): Promise<boolean> {
  const { filename, csvContent } = options;
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  // Prepend UTF-8 BOM so MS Excel renders hindi/english characters perfectly
  const bomCsv = '\uFEFF' + csvContent;

  // 1. Try safe Blob Object URL download first
  try {
    const blob = new Blob([bomCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanFilename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {}
    }, 1500);
    return true;
  } catch (blobErr) {
    console.warn('Blob URL download failed, trying data URI fallback:', blobErr);
  }

  // 2. Fallback: Data URI
  try {
    const encodedUri = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', cleanFilename);
    link.setAttribute('target', '_blank');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
    }, 1500);
    return true;
  } catch (dataUriErr) {
    console.error('Data URI download failed:', dataUriErr);
  }

  // 3. Fallback: Copy to clipboard if download is blocked by Android WebView
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(csvContent);
      alert('File download is restricted by Android WebView. CSV data has been copied to your clipboard! You can paste it in Excel or Google Sheets.');
      return true;
    }
  } catch {}

  return false;
}

