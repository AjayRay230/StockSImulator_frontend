export const isMarketOpen = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  // Monday–Friday
  if (day === 0 || day === 6) return false;

  const currentMinutes = hour * 60 + minutes;

  const open = 9 * 60 + 30;  // 9:30 AM
  const close = 16 * 60;     // 4:00 PM

  return currentMinutes >= open && currentMinutes <= close;
};