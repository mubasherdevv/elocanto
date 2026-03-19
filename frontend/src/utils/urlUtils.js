
export const generateAdSlug = (ad) => {
  if (!ad || !ad.title || !ad._id) return '';
  const slug = ad.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${slug}-${ad._id}`;
};

export const extractIdFromSlug = (slug) => {
  if (!slug) return '';
  // MongoDB IDs are 24 character hex strings
  // We expect the ID to be at the end of the slug: some-title-24charid
  const parts = slug.split('-');
  const id = parts[parts.length - 1];
  if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
    return id;
  }
  return slug; // Return original if it looks like a raw ID
};
