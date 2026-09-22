import { useState } from 'react';

export const useExport = (title: string, contentHtml: string) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsMarkdown = async () => {
    setIsExporting(true);
    try {
      // Dynamically import Turndown to save initial bundle size
      const TurndownService = (await import('turndown')).default;
      const turndownService = new TurndownService();
      
      const markdown = turndownService.turndown(contentHtml);
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'Untitled_Document'}.md`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export to Markdown failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create a temporary hidden container
      const container = document.createElement('div');
      container.innerHTML = contentHtml;
      
      // Apply the same Tailwind prose styles your TipTap editor uses
      container.className = 'prose prose-sm sm:prose-base max-w-none p-8 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-1'; 
      
      const opt = {
        margin:       0.5,
        filename:     `${title || 'Untitled_Document'}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 }, // <--- Added 'as const' here
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const } // <--- Added 'as const' here too just in case
      };
      
      await html2pdf().set(opt).from(container).save();
    } catch (error) {
      console.error('Export to PDF failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportAsMarkdown, exportAsPDF, isExporting };
};