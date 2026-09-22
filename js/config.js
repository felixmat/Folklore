export const LOCATION_PRESETS = {
  "Market": { name: "Market", requiredItem: null },
  "Temple": { name: "Temple", requiredItem: "Kedavilakku" },
  "Paddy Fields": { name: "Paddy Fields", requiredItem: "Palm Toddy" },
  "Forest": { name: "Forest", requiredItem: "Choottu" },
  "Mountain": { name: "Mountain", requiredItem: "Metal Rod" },
  "Pond": { name: "Pond", requiredItem: "Wooden Cane" },
  "Chudukadu": { name: "Chudukadu", requiredItem: "Raw Rice Grains" },
  "Kalari": { name: "Kalari", requiredItem: "Urumi" },
  "Karimpanathottam": { name: "Karimpanathottam", requiredItem: "Lime Paste" },
  "Palace": { name: "Palace", requiredItem: "Gold" }
};

export const GOLDEN_ITEMS = [
    "Gold", 
    "Kedavilakku", 
    "Palm Toddy", 
    "Urumi", "Choottu", 
    "Metal Rod", 
    "Wooden Cane", 
    "Lime Paste", 
    "Raw Rice Grains"
];

export const NORMAL_CATEGORIES = [
  { name: "Weapons & Defence", cat: "weapon" },
  { name: "Food & Offerings", cat: "food" },
  { name: "Sacred & Ritual", cat: "sacred" },
  { name: "Tools & Utility", cat: "tool" }
];


export const IC_CARDS = [
  // Positive Category
  { name: "Chathan", cat: "positive" },
  { name: "Thendan", cat: "positive" },
  { name: "Arukola", cat: "positive" },
  { name: "Kappiri Muthappan", cat: "positive" },
  { name: "Ana Marutha", cat: "positive" },
  { name: "Karinthandan", cat: "positive" },
  { name: "Kulappurathu Bheeman", cat: "positive" },
  { name: "Kadamattathu Kathanar", cat: "positive" },

  // Negative Category
  { name: "Kollippishashu", cat: "negative" },
  { name: "Marutha", cat: "negative" },
  { name: "Brahmarakshas", cat: "negative" },
  { name: "Eenampechi", cat: "negative" },
  { name: "Djinn", cat: "negative" },
  { name: "Ottamulachi", cat: "negative" },
  { name: "Kallijankattu Neeli", cat: "negative" },
  { name: "Ettuveettil Pillamar", cat: "negative" },

  // Neutral Category
  { name: "Odiyan", cat: "neutral" },
  { name: "Hermit", cat: "neutral" },
  { name: "Astrologer", cat: "neutral" },
  { name: "Begger", cat: "neutral" },
  { name: "Theif", cat: "neutral" },
  { name: "Marchant", cat: "neutral" },
  { name: "Soldier", cat: "neutral" },
  { name: "Vaidyan", cat: "neutral" },
  { name: "Kayamkulam Kochunni", cat: "neutral" },
  { name: "Kunjaman Potti", cat: "neutral" }
];