import axios from 'axios';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

export class PdfService {
  /**
   * Downloads a PDF from a URL and extracts its text content.
   * @param url The URL of the PDF to download
   * @returns The extracted text content or an empty string if failed
   */
  static async extractTextFromUrls(urls: string[]): Promise<string> {
    let combinedText = '';
    
    for (const url of urls) {
      try {
        console.log(`Downloading and parsing PDF: ${url}`);
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
        const data = await pdf(response.data);
        combinedText += `\n--- Document Source: ${url} ---\n${data.text}\n`;
      } catch (error: any) {
        console.error(`Failed to parse PDF from ${url}:`, error.message);
      }
    }
    
    return combinedText.trim();
  }

  /**
   * Simple downloader to check if a content type is PDF
   */
  static isPdf(contentType: string | undefined): boolean {
    return contentType?.toLowerCase().includes('application/pdf') || false;
  }
}
