export interface PortalConfig {
  id: string;
  name: string;
  region: string;
}

export const PLANET_BIDS_PORTALS: PortalConfig[] = [
  { id: '17950', name: 'City of San Diego', region: 'San Diego' },
  { id: '15300', name: 'City of Los Angeles', region: 'Los Angeles' },
  { id: '40238', name: 'LAUSD', region: 'Los Angeles' },
  { id: '29554', name: 'City of San Jose', region: 'Bay Area' },
  { id: '10038', name: 'City of Oakland', region: 'Bay Area' },
  { id: '15924', name: 'BART', region: 'Bay Area' },
  { id: '16725', name: 'San Diego Airport Authority', region: 'San Diego' },
  { id: '43764', name: 'San Diego Unified School District', region: 'San Diego' },
  { id: '31812', name: 'City of Sacramento', region: 'Sacramento' },
  { id: '31424', name: 'Sacramento Regional Transit', region: 'Sacramento' },
  { id: '14769', name: 'City of Fresno', region: 'Central Valley' },
];
