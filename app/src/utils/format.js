import { MONTHS_TR, DAYS_TR } from '../constants/config';

export const formatTime = (d) =>
  d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const formatDuration = (ms) => {
  const s = Math.floor((ms ?? 0) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const todayDate = () => {
  const d = new Date();
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]}`;
};

export const todayDay = () => DAYS_TR[new Date().getDay()];

export const toFilename = (title) =>
  title.toLowerCase()
    .replace(/[şŞ]/g, 's').replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o').replace(/[ıİ]/g, 'i').replace(/[çÇ]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'toplanti';
