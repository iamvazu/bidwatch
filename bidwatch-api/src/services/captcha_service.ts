import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class CaptchaService {
  private static readonly API_KEY = process.env.CAPTCHA_API_KEY;

  /**
   * Solves Amazon WAF Captcha using 2Captcha API
   */
  static async solveAmazonWaf(pageUrl: string, siteKey: string, iv: string, context: string): Promise<string | null> {
    if (!this.API_KEY) {
      console.warn('CAPTCHA_API_KEY not found in environment. Skipping auto-solve.');
      return null;
    }

    try {
      console.log(`Submitting Amazon WAF captcha to 2Captcha for ${pageUrl}...`);
      
      const submitResponse = await axios.post('https://2captcha.com/in.php', null, {
        params: {
          key: this.API_KEY,
          method: 'amazon_waf',
          sitekey: siteKey,
          iv: iv,
          context: context,
          pageurl: pageUrl,
          json: 1
        }
      });

      if (submitResponse.data.status !== 1) {
        throw new Error(`2Captcha submission failed: ${submitResponse.data.request}`);
      }

      const requestId = submitResponse.data.request;
      console.log(`Captcha request ID: ${requestId}. Waiting for solution...`);

      // Poll for solution
      for (let attempt = 0; attempt < 12; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const resultResponse = await axios.get('https://2captcha.com/res.php', {
          params: {
            key: this.API_KEY,
            action: 'get',
            id: requestId,
            json: 1
          }
        });

        if (resultResponse.data.status === 1) {
          console.log('Captcha solved successfully.');
          return resultResponse.data.request; // This is the solution token
        }

        if (resultResponse.data.request !== 'CAPCHA_NOT_READY') {
          throw new Error(`2Captcha error: ${resultResponse.data.request}`);
        }
      }

      throw new Error('2Captcha solution timeout after 60 seconds.');
    } catch (error: any) {
      console.error('Amazon WAF solver error:', error.message);
      return null;
    }
  }

  /**
   * Checks if the page has an Amazon WAF captcha
   */
  static async detectWaf(page: any): Promise<{ siteKey: string, iv: string, context: string } | null> {
    const isWaf = await page.evaluate(() => {
      return document.title.includes('Confirm you are human') || 
             document.body.innerText.includes('Let\'s confirm you are human') ||
             !!document.querySelector('script[src*="aws-waf-token"]');
    });

    if (!isWaf) return null;

    // These parameters are usually found in the window.awsWafConfig or similar script
    const params = await page.evaluate(() => {
      // Logic to extract parameters from script tags or window objects
      // This is often site-specific but PlanetBids follows a pattern
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const s of scripts) {
        const text = s.innerText || '';
        const siteKeyMatch = text.match(/siteKey:\s*["']([^"']+)["']/);
        const ivMatch = text.match(/iv:\s*["']([^"']+)["']/);
        const contextMatch = text.match(/context:\s*["']([^"']+)["']/);
        
        if (siteKeyMatch && ivMatch && contextMatch) {
          return {
            siteKey: siteKeyMatch[1],
            iv: ivMatch[1],
            context: contextMatch[1]
          };
        }
      }
      return null;
    });

    return params;
  }
}
