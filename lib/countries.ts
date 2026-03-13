export const COUNTRIES = [
  { code: 'ARE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'AUS', name: 'Australia', flag: '🇦🇺' },
  { code: 'BEL', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CAN', name: 'Canada', flag: '🇨🇦' },
  { code: 'CHE', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'CHN', name: 'China', flag: '🇨🇳' },
  { code: 'DEU', name: 'Germany', flag: '🇩🇪' },
  { code: 'ESP', name: 'Spain', flag: '🇪🇸' },
  { code: 'FRA', name: 'France', flag: '🇫🇷' },
  { code: 'GBR', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'HKG', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'IDN', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IND', name: 'India', flag: '🇮🇳' },
  { code: 'ITA', name: 'Italy', flag: '🇮🇹' },
  { code: 'JPN', name: 'Japan', flag: '🇯🇵' },
  { code: 'KOR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'LKA', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'MAC', name: 'Macau', flag: '🇲🇴' },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'MYS', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'NLD', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NZL', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'PHL', name: 'Philippines', flag: '🇵🇭' },
  { code: 'RUS', name: 'Russia', flag: '🇷🇺' },
  { code: 'SAU', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'SGP', name: 'Singapore', flag: '🇸🇬' },
  { code: 'SWE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'THA', name: 'Thailand', flag: '🇹🇭' },
  { code: 'TWN', name: 'Chinese Taipei', flag: '🇹🇼' }, // 🚩 เปลี่ยนชื่อเป็น Chinese Taipei แล้ว!
  { code: 'USA', name: 'United States', flag: '🇺🇸' },
  { code: 'VNM', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'ZAF', name: 'South Africa', flag: '🇿🇦' },
];

export const getFlagByCode = (code: string | null) => {
  if (!code) return '🏳️';
  const country = COUNTRIES.find(c => c.code === code);
  return country ? country.flag : '🏳️';
};