// Distinct Unsplash fallback images per tour/destination slug.
// Used when the local file under backend/src/images does not exist.

const unsplash = (id, w = 900) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

// Curated mapping: slug keyword -> Unsplash photo id
const NAMED_IMAGES = {
  // Destinations
  halong: "photo-1528127269322-539801943592",
  "ha-long": "photo-1528127269322-539801943592",
  phuquoc: "photo-1583417319070-4a69db38a482",
  "phu-quoc": "photo-1583417319070-4a69db38a482",
  danang: "photo-1559592413-7cec4d0cae2b",
  "da-nang": "photo-1559592413-7cec4d0cae2b",
  dalat: "photo-1509023464722-18d996393ca8",
  "da-lat": "photo-1509023464722-18d996393ca8",
  sapa: "photo-1580100586938-02822d99c4a8",
  hanoi: "photo-1509030450996-dd1a26dda07a",
  hoian: "photo-1533050487297-09b450131914",
  "hoi-an": "photo-1533050487297-09b450131914",
  hue: "photo-1583417319070-4a69db38a482",

  // Tours
  bali: "photo-1537996194471-e657df975ab4",
  thailand: "photo-1552465011-b4e21bf6e79a",
  europe: "photo-1499856871958-5b9627545d1a",
  dubai: "photo-1512453979798-5ea266f8880c",
  "du-thuyen-ha-long": "photo-1528127269322-539801943592",
  mekong: "photo-1528181304800-259b08848526",
  "nha-trang": "photo-1552465011-b4e21bf6e79a",
  "phan-thiet": "photo-1507525428034-b723cf961d3e",
  "phong-nha": "photo-1506744038136-46273834b3fb",
  singapore: "photo-1525625293386-3f8f99389edd",
  japan: "photo-1493976040374-85c8e12f0c0e",
  fansipan: "photo-1509023464722-18d996393ca8",
  australia: "photo-1523482580672-f109ba8cb9be",
};

// Pool used for unknown slugs so images are never all identical.
const FALLBACK_POOL = [
  "photo-1528127269322-539801943592",
  "photo-1583417319070-4a69db38a482",
  "photo-1559592413-7cec4d0cae2b",
  "photo-1509023464722-18d996393ca8",
  "photo-1580100586938-02822d99c4a8",
  "photo-1533050487297-09b450131914",
  "photo-1552465011-b4e21bf6e79a",
  "photo-1507525428034-b723cf961d3e",
  "photo-1506744038136-46273834b3fb",
  "photo-1469854523086-cc02fe5d8800",
  "photo-1493976040374-85c8e12f0c0e",
  "photo-1528181304800-259b08848526",
];

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickFallbackImage(relativePath = "") {
  const normalized = String(relativePath).toLowerCase().replace(/\\/g, "/");
  const baseName = normalized.split("/").pop() || "";
  const slug = baseName.replace(/\.[a-z0-9]+$/i, "");

  // 1. Exact slug match
  if (NAMED_IMAGES[slug]) {
    return unsplash(NAMED_IMAGES[slug]);
  }

  // 2. Keyword match inside full path
  for (const [keyword, id] of Object.entries(NAMED_IMAGES)) {
    if (normalized.includes(keyword)) {
      return unsplash(id);
    }
  }

  // 3. Deterministic hash pick from pool
  const index = hashString(normalized || slug || "default") % FALLBACK_POOL.length;
  return unsplash(FALLBACK_POOL[index]);
}

module.exports = { pickFallbackImage, NAMED_IMAGES };
