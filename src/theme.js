import { useApp } from './store';
const light = { bg: '#F6F6F6', card: '#FFFFFF', text: '#151616', sub: '#65696F', accent: '#737880', border: '#E3E3E3', sale: '#FE0000', bar: '#151616' };
const dark = { bg: '#101112', card: '#1B1D1F', text: '#F2F2F2', sub: '#9AA0A8', accent: '#9AA0A8', border: '#2B2E31', sale: '#FF5A5A', bar: '#000000' };
export const useTheme = () => (useApp((s) => s.dark) ? dark : light);
export const money = (n) => `${Number(n).toLocaleString('en-US')} ${useApp.getState().lang === 'en' ? 'IQD' : 'د.ع'}`;
