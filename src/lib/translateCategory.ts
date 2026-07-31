export function translateCategory(nameOrSlug: string, lang: string): string {
  if (!nameOrSlug) return "";
  if (lang !== "en") return nameOrSlug;

  const map: Record<string, string> = {
    // 1. Batik & Wastra
    "batik-wastra": "Batik & Wastra",
    "batik & wastra": "Batik & Wastra",
    "batik": "Batik & Wastra",
    "batik-tulis": "Solo & Jogja Handpainted Batik",
    "batik tulis solo & jogja": "Solo & Jogja Handpainted Batik",
    "batik-cap": "Printed & Pekalongan Batik",
    "batik cap & pekalongan": "Printed & Pekalongan Batik",
    "tenun-ikat": "NTT & Toraja Woven Fabrics",
    "tenun ikat ntt & toraja": "NTT & Toraja Woven Fabrics",
    "ulos-songket": "Ulos & Songket Fabrics",
    "kain ulos & songket": "Ulos & Songket Fabrics",
    "selendang-etnik": "Ethnic Shawls & Scarves",
    "selendang & syal etnik": "Ethnic Shawls & Scarves",

    // 2. Keramik & Gerabah
    "keramik-gerabah": "Ceramics & Pottery",
    "keramik & gerabah": "Ceramics & Pottery",
    "keramik": "Ceramics",
    "gerabah-kasongan": "Kasongan & Lombok Pottery",
    "gerabah kasongan & lombok": "Kasongan & Lombok Pottery",
    "vas-guci-keramik": "Ceramic Vases & Jars",
    "vas bunga & guci keramik": "Ceramic Vases & Jars",
    "mangkuk-piring-keramik": "Painted Bowls & Plates",
    "mangkuk & piring lukis": "Painted Bowls & Plates",
    "cangkir-teaset-tanah-liat": "Clay Cups & Tea Sets",
    "cangkir & teaset tanah liat": "Clay Cups & Tea Sets",
    "patung-keramik": "Ceramic Statues & Ornaments",
    "patung & pajangan keramik": "Ceramic Statues & Ornaments",

    // 3. Kerajinan Kayu & Ukiran
    "kerajinan-kayu": "Wood Crafts & Carvings",
    "kerajinan kayu & ukiran": "Wood Crafts & Carvings",
    "kerajinan kayu": "Wood Crafts",
    "ukiran-jepara-bali": "Jepara & Bali Wood Carvings",
    "ukiran jepara & bali": "Jepara & Bali Wood Carvings",
    "peralatan-makan-jati": "Teak Tableware & Serveware",
    "peralatan makan & saji jati": "Teak Tableware & Serveware",
    "kotak-perhiasan-kayu": "Wooden Jewelry & Storage Boxes",
    "kotak perhiasan & storage kayu": "Wooden Jewelry & Storage Boxes",
    "hiasan-dinding-kayu": "Wooden Wall Decor & Frames",
    "hiasan dinding & frame kayu": "Wooden Wall Decor & Frames",
    "miniatur-kayu": "Wooden Clocks & Miniatures",
    "jam & miniatur kayu": "Wooden Clocks & Miniatures",

    // 4. Perhiasan & Aksesori
    "perhiasan-aksesori": "Jewelry & Accessories",
    "perhiasan & aksesori": "Jewelry & Accessories",
    "perhiasan": "Jewelry",
    "cincin-perak-bali": "Bali Engraved Silver Rings",
    "cincin perak ukir bali": "Bali Engraved Silver Rings",
    "kalung-etnik": "Ethnic Necklaces & Pendants",
    "kalung & liontin etnik": "Ethnic Necklaces & Pendants",
    "anting-gelang-handmade": "Handmade Earrings & Bracelets",
    "anting & gelang handmade": "Handmade Earrings & Bracelets",
    "bros-pin-etnik": "Ethnic Brooches & Pins",
    "bros & pin etnik": "Ethnic Brooches & Pins",
    "manik-manik-batu-alam": "Bead & Natural Stone Accessories",
    "aksesori manik & batu alam": "Bead & Natural Stone Accessories",

    // 5. Kerajinan Kulit
    "kerajinan-kulit": "Leather Crafts",
    "kerajinan kulit": "Leather Crafts",
    "dompet-kulit": "Full-Grain Leather Wallets",
    "dompet kulit full-grain": "Full-Grain Leather Wallets",
    "tas-kulit": "Handcrafted Leather Bags",
    "tas kulit handcrafted": "Handcrafted Leather Bags",
    "sabuk-kulit": "Leather Belts",
    "sabuk & ikat pinggang kulit": "Leather Belts",
    "case-sleeve-kulit": "Leather Cases & Sleeves",
    "case & sleeve kulit": "Leather Cases & Sleeves",
    "gantungan-kunci-kulit": "Leather Keychains",
    "gantungan kunci kulit": "Leather Keychains",

    // 6. Dekorasi Rumah & Living
    "dekorasi-rumah": "Home Decor & Living",
    "dekorasi rumah & living": "Home Decor & Living",
    "macrame-wall-decor": "Macrame Wall Decor",
    "hiasan dinding macrame": "Macrame Wall Decor",
    "cermin-ukir-anyaman": "Carved & Woven Mirrors",
    "cermin ukir & anyaman": "Carved & Woven Mirrors",
    "bantal-sofa-etnik": "Ethnic Couch Cushion Covers",
    "sarung bantal sofa etnik": "Ethnic Couch Cushion Covers",
    "lilin-aromaterapi": "Aromatherapy Candles & Diffusers",
    "lilin aromaterapi & diffuser": "Aromatherapy Candles & Diffusers",
    "lampu-hias-etnik": "Ethnic & Bamboo Decorative Lamps",
    "lampu hias etnik & bambu": "Ethnic & Bamboo Decorative Lamps",

    // 7. Anyaman & Rotan
    "anyaman-rotan": "Weaving & Rattan",
    "anyaman & rotan": "Weaving & Rattan",
    "anyaman": "Weaving",
    "tas-rotan-bali": "Bali Woven Rattan Bags",
    "tas rotan anyaman bali": "Bali Woven Rattan Bags",
    "keranjang-anyaman": "Water Hyacinth & Bamboo Baskets",
    "keranjang enceng gondok & bambu": "Water Hyacinth & Bamboo Baskets",
    "placemat-coaster-anyaman": "Woven Placemats & Coasters",
    "placemat & coaster anyaman": "Woven Placemats & Coasters",
    "tikar-karpet-pandan": "Pandan Mats & Rugs",
    "tikar & karpet pandan": "Pandan Mats & Rugs",
    "topi-aksesori-anyaman": "Woven Hats & Accessories",
    "topi & aksesori anyaman": "Woven Hats & Accessories",

    // 8. Sulam, Renda & Rajut
    "sulam-rajut": "Embroidery, Lace & Crochet",
    "sulam, renda & rajut": "Embroidery, Lace & Crochet",
    "sulam-hoop-art": "Hand Embroidery Hoop Art",
    "sulam tangan hoop art": "Hand Embroidery Hoop Art",
    "tas-dompet-rajut": "Crochet Bags & Wallets",
    "tas & dompet rajut": "Crochet Bags & Wallets",
    "taplak-meja-sulam": "Embroidered Tablecloths",
    "taplak meja sulam": "Embroidered Tablecloths",
    "pakaian-rajut": "Crochet Clothing & Cardigans",
    "pakaian & cardigan rajut": "Crochet Clothing & Cardigans",
    "boneka-amigurumi": "Amigurumi Dolls",
    "boneka amigurumi": "Amigurumi Dolls",

    // 9. Seni Rupa & Lukisan
    "seni-rupa-lukisan": "Fine Arts & Paintings",
    "seni rupa & lukisan": "Fine Arts & Paintings",
    "lukisan-kanvas": "Oil & Acrylic Canvas Paintings",
    "lukisan minyak & akrilik kanvas": "Oil & Acrylic Canvas Paintings",
    "resin-art": "Resin Art & Flowers",
    "seni resin art & flower": "Resin Art & Flowers",
    "kaligrafi-etnik": "Ethnic Calligraphy & Javanese Script",
    "kaligrafi etnik & aksara jawa": "Ethnic Calligraphy & Javanese Script",
    "sketsa-ilustrasi": "Portraits & Illustrations",
    "sketsa wajah & ilustrasi": "Portraits & Illustrations",
    "patung-seni": "Art Statues & Sculptures",
    "patung seni & sculptures": "Art Statues & Sculptures",

    // 10. Kado Kustom & Souvenir
    "kado-kustom": "Custom Gifts & Souvenirs",
    "kado kustom & souvenir": "Custom Gifts & Souvenirs",
    "hantaran-mahar": "Wedding Dowry & Hampers",
    "hantaran & mahar pernikahan": "Wedding Dowry & Hampers",
    "kado-wisuda": "Personalized Graduation Gifts",
    "kado wisuda personalisasi": "Personalized Graduation Gifts",
    "souvenir-kayu-nama": "Custom Name Engraved Wooden Souvenirs",
    "souvenir kayu ukir nama": "Custom Name Engraved Wooden Souvenirs",
    "gift-box-etnik": "Custom Ethnic Gift Boxes",
    "gift box etnik kustom": "Custom Ethnic Gift Boxes",
    "diorama-miniatur": "Custom Dioramas & Miniatures",
    "diorama & miniatur custom": "Custom Dioramas & Miniatures",
  };

  const lower = nameOrSlug.toLowerCase().trim();
  if (map[lower]) {
    return map[lower];
  }
  
  const hyphenated = lower.replace(/\s+/g, "-");
  if (map[hyphenated]) {
    return map[hyphenated];
  }

  // Fallback: convert slug hyphens to Title Case
  return nameOrSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
