const STORAGE_PREFIX = 'olg_';

export function getStorageSize() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_PREFIX)) {
      total += localStorage.getItem(key).length * 2; // UTF-16
    }
  }
  return total;
}

export function getStorageSizeMB() {
  return (getStorageSize() / (1024 * 1024)).toFixed(2);
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function removeFromStorage(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export function clearAllStorage() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

export function isImageStorable(base64String) {
  // 500KB limit for localStorage images
  return base64String.length * 2 < 500 * 1024;
}
