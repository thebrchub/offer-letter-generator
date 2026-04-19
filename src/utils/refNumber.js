import { loadFromStorage, saveToStorage } from './storage';

const COUNTER_KEY = 'ref_counter';

export function generateRefNumber(prefix = 'BRC/OL') {
  const currentYear = new Date().getFullYear();
  let data = loadFromStorage(COUNTER_KEY, { year: currentYear, counter: 0 });

  // Reset counter if year changed
  if (data.year !== currentYear) {
    data = { year: currentYear, counter: 0 };
  }

  data.counter += 1;
  saveToStorage(COUNTER_KEY, data);

  const padded = String(data.counter).padStart(3, '0');
  return `${prefix}/${currentYear}/${padded}`;
}

export function getCurrentCounter() {
  const currentYear = new Date().getFullYear();
  const data = loadFromStorage(COUNTER_KEY, { year: currentYear, counter: 0 });
  return data;
}
