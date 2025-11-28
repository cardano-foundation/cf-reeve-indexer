export const getInitials = (name?: string): string => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  const first = parts[0][0] ?? '';
  const second = parts.length > 1 ? parts[1][0] : parts[0][1] ?? '';
  return (first + second).toUpperCase();
};