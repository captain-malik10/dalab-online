// Normalize Products.image_urls into a flat array of URL strings.
// mysql2 returns JSON columns already parsed; older rows may hold a JSON string or a bare URL.
export const parseImageUrls = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flat(Infinity).filter(Boolean);
  if (typeof value === 'string') {
    try {
      return parseImageUrls(JSON.parse(value));
    } catch {
      return [value];
    }
  }
  return [];
};
