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
    case 'nominal': return '#00ff88';
    case 'warning': return '#ff8800';
    case 'critical': return '#ff4466';
    default: return '#94a3b8';
  }
}

/**
 * Sensör değerine göre renk (0-1 aralığında normalize)
 */
export function getValueColor(value, min, max) {
  const ratio = (value - min) / (max - min);
  if (ratio < 0.3) return '#00ff88';
  if (ratio < 0.7) return '#ff8800';
  return '#ff4466';
}
