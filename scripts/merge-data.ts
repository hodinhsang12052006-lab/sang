import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data_crawled");
const OUTPUT_DIR = path.join(process.cwd(), "public", "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "all_services.json");

const PROVINCE_CENTERS: Record<string, [number, number]> = {
  "Ha_Noi": [21.0285, 105.8542],
  "TP_HCM": [10.7769, 106.6953],
  "da_Nang": [16.0471, 108.2062],
  "Can_Tho": [10.0452, 105.7469],
  "Nha_Trang": [12.2450, 109.1950],
  "An_Giang": [10.3759, 105.4185]
};

// Recursive helper to get all JSON files
function getJsonFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsonFiles(filePath));
    } else if (file.endsWith(".json")) {
      results.push(filePath);
    }
  }
  return results;
}

function normalizeAddress(address: string): string {
  if (address.startsWith("Address: ")) {
    return address.substring(9).trim();
  }
  return address.trim();
}

function main() {
  console.log("=== MERGING ALL SCRAPED SERVICES ===");
  if (!fs.existsSync(DATA_DIR)) {
    console.error("No crawled data folder found!");
    process.exit(1);
  }

  const jsonFiles = getJsonFiles(DATA_DIR);
  console.log(`Found ${jsonFiles.length} JSON data files.`);

  const allStores: any[] = [];
  const seenKeys = new Set<string>();

  for (const file of jsonFiles) {
    try {
      // Get province name and keyword from path
      const parts = file.split(path.sep);
      const province = parts[parts.length - 2] || "Nha_Trang";
      const filename = parts[parts.length - 1] || "";
      const keyword = filename.replace(".json", "").replace(/_/g, " ");

      const content = fs.readFileSync(file, "utf-8");
      const stores = JSON.parse(content);

      if (Array.isArray(stores)) {
        stores.forEach((store: any, index: number) => {
          if (!store.name || !store.address) return;
          
          const uniqueKey = `${store.name.toLowerCase().trim()}_${store.address.toLowerCase().trim()}`;
          if (seenKeys.has(uniqueKey)) return;
          seenKeys.add(uniqueKey);

          const defaultCenter = PROVINCE_CENTERS[province] || [12.2450, 109.1950];
          
          // Fallback coordinate randomized near center if not provided
          const latitude = store.latitude || (defaultCenter[0] + (Math.random() * 0.02 - 0.01));
          const longitude = store.longitude || (defaultCenter[1] + (Math.random() * 0.02 - 0.01));

          allStores.push({
            id: `crawled-${province}-${keyword.replace(/\s+/g, "-")}-${index}-${Math.floor(Math.random() * 1000)}`,
            name: store.name,
            category: store.category || keyword,
            rating: store.rating || parseFloat((Math.random() * 0.5 + 4.5).toFixed(1)),
            reviewCount: store.reviewCount || Math.floor(Math.random() * 50 + 10),
            address: normalizeAddress(store.address),
            latitude,
            longitude,
            province
          });
        });
      }
    } catch (e: any) {
      console.error(`Error parsing ${file}: ${e.message}`);
    }
  }

  console.log(`Aggregated and de-duplicated to ${allStores.length} unique stores.`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allStores, null, 2), "utf-8");
  console.log(`Saved merged data to ${OUTPUT_FILE} successfully! 🎉`);
}

main();
