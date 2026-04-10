export interface Bid {
  id?: string;
  title: string;
  agency: string;
  region: string;
  portal: string;
  portal_url: string;
  est_value: string;
  deadline: Date | null;
  posted_at: Date | null;
  set_aside: string;
  naics: string;
  doc_urls: string[];
  raw_text?: string;
  hash: string;
  is_new?: boolean;
  alerted?: boolean;
  created_at?: Date;
}
