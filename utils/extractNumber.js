export const extractReading = (text) => {
  const match = text.match(/\d+/g);
  if (!match) return null;

  return Number(match.join(''));
};