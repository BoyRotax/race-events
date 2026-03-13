// lib/countries.ts

export const COUNTRIES = [
  { code: 'THA', name: 'Thailand', flag: '🇹🇭' },
  { code: 'MYS', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'SGP', name: 'Singapore', flag: '🇸🇬' },
  { code: 'IDN', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PHL', name: 'Philippines', flag: '🇵🇭' },
  { code: 'VNM', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'CHN', name: 'China', flag: '🇨🇳' },
  { code: 'HKG', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'MAC', name: 'Macau', flag: '🇲🇴' },
  { code: 'TWN', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'JPN', name: 'Japan', flag: '🇯🇵' },
  { code: 'KOR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'IND', name: 'India', flag: '🇮🇳' },
  { code: 'LKA', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'AUS', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZL', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'GBR', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'USA', name: 'United States', flag: '🇺🇸' },
  { code: 'FRA', name: 'France', flag: '🇫🇷' },
  { code: 'ITA', name: 'Italy', flag: '🇮🇹' },
  { code: 'DEU', name: 'Germany', flag: '🇩🇪' },
  { code: 'ESP', name: 'Spain', flag: '🇪🇸' },
  { code: 'CHE', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'NLD', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SWE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'BEL', name: 'Belgium', flag: '🇧🇪' },
  { code: 'ZAF', name: 'South Africa', flag: '🇿🇦' },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CAN', name: 'Canada', flag: '🇨🇦' },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'RUS', name: 'Russia', flag: '🇷🇺' },
  { code: 'ARE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SAU', name: 'Saudi Arabia', flag: '🇸🇦' },
];

// ฟังก์ชันสำหรับดึงธงชาติไปโชว์ในหน้าอื่นๆ
export const getFlagByCode = (code: string | null) => {
  if (!code) return '🏳️';
  const country = COUNTRIES.find(c => c.code === code);
  return country ? country.flag : '🏳️';
};