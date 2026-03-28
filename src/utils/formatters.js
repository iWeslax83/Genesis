/**
 * Sayıyı binlik ayırıcıyla formatla
 */
export function formatNumber(num, decimals = 0) {
  if (num === undefined || num === null || isNaN(num)) return '—';
  return num.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Saat:Dakika formatı
 */
export function formatTime(hour, minute) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Yüzde formatı
 */
export function formatPercent(value, decimals = 1) {
  if (value === undefined || value === null || isNaN(value)) return '—%';
  return `%${value.toFixed(decimals)}`;
}

/**
 * Durum rengini döndür
 */
export function getStatusColor(status) {
  switch (status) {
    case 'nominal': return '#4ead5b';
    case 'warning': return '#d4903a';
    case 'critical': return '#d45555';
    default: return '#6c6e78';
  }
}

/**
 * Sensör değerine göre renk (0-1 aralığında normalize)
 */
export function getValueColor(value, min, max) {
  const ratio = (value - min) / (max - min);
  if (ratio < 0.3) return '#4ead5b';
  if (ratio < 0.7) return '#d4903a';
  return '#d45555';
}
