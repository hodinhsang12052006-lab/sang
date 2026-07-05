const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env");
let databaseUrl = "";
let authToken = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] ? match[2].trim() : "";
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      if (key === "TURSO_DATABASE_URL") databaseUrl = val;
      if (key === "TURSO_AUTH_TOKEN") authToken = val;
    }
  });
}

if (!databaseUrl) {
  databaseUrl = "libsql://pawbook-db-hodinhsang12052006.aws-ap-northeast-1.turso.io";
  authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODMwMTU1MzIsImlkIjoiMDE5ZjI0MDEtNWMwMS03N2RkLWFhOGItMWM4OTMwZmU5ODE1Iiwia2lkIjoiT3N1bk0wdXVRaXJ3azBiczhZd1pmRm1HMUhUaW9WRjNzcHJmZTU4T1lPRSIsInJpZCI6ImI3MjAwODI0LWVlMGMtNDlkMi1hMTA0LTFhZGZkMWZhMzE2MyJ9.9x9z0Cu9PiG8ztNB15JjcL5l2WzEFfrM9kdRd-NNWjMb9OEHQIKzmKNvo1wLyDRSOrj2tOcuLlxP7t4ha52kCA";
}

async function run() {
  console.log("Connecting to Turso Cloud DB:", databaseUrl);
  const client = createClient({ url: databaseUrl, authToken: authToken });
  
  // Job table changes
  const jobColumns = [
    { name: "priceRange", type: "TEXT" },
    { name: "vehicleInfo", type: "TEXT" },
    { name: "isEmergency", type: "BOOLEAN DEFAULT 0" },
    { name: "workType", type: "TEXT" }
  ];

  for (const col of jobColumns) {
    try {
      console.log(`Adding '${col.name}' column to 'Job' table...`);
      await client.execute(`ALTER TABLE Job ADD COLUMN ${col.name} ${col.type};`);
      console.log(`Success: Added '${col.name}' to 'Job'.`);
    } catch (error) {
      console.log(`Job table info check for '${col.name}':`, error.message);
    }
  }

  // Service table changes
  const serviceColumns = [
    { name: "vehicleInfo", type: "TEXT" },
    { name: "isEmergency", type: "BOOLEAN DEFAULT 0" },
    { name: "workType", type: "TEXT" }
  ];

  for (const col of serviceColumns) {
    try {
      console.log(`Adding '${col.name}' column to 'Service' table...`);
      await client.execute(`ALTER TABLE Service ADD COLUMN ${col.name} ${col.type};`);
      console.log(`Success: Added '${col.name}' to 'Service'.`);
    } catch (error) {
      console.log(`Service table info check for '${col.name}':`, error.message);
    }
  }

  client.close();
  console.log("Turso remote database altered successfully!");
}

run();
