const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

// Manually parse .env variables
const envPath = path.join(__dirname, "../.env");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env file not found.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

const statements = [
  'PRAGMA defer_foreign_keys=ON',
  'PRAGMA foreign_keys=OFF',
  `CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "isBoosted" BOOLEAN NOT NULL DEFAULT false,
    "boostUntil" DATETIME,
    "niche" TEXT NOT NULL DEFAULT 'IT',
    "latitude" REAL,
    "longitude" REAL,
    "ai_tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `INSERT INTO "new_Job" ("boostUntil", "companyName", "createdAt", "description", "employerId", "id", "isBoosted", "salary", "title") SELECT "boostUntil", "companyName", "createdAt", "description", "employerId", "id", "isBoosted", "salary", "title" FROM "Job"`,
  `DROP TABLE "Job"`,
  `ALTER TABLE "new_Job" RENAME TO "Job"`,
  'PRAGMA foreign_keys=ON',
  'PRAGMA defer_foreign_keys=OFF'
];

async function run() {
  console.log("Applying delta migration to Turso Cloud Database...");
  try {
    for (const stmt of statements) {
      console.log("Running statement:", stmt.substring(0, 50) + "...");
      await client.execute(stmt);
    }
    console.log("Migration applied successfully to Turso! 🎉");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

run();
