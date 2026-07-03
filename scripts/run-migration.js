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
  'DROP TABLE IF EXISTS "Review"',
  'CREATE TABLE "Review" ( "id" TEXT NOT NULL PRIMARY KEY, "rating" INTEGER NOT NULL, "content" TEXT NOT NULL, "comment" TEXT, "reviewerId" TEXT NOT NULL, "targetUserId" TEXT, "gigId" TEXT, "jobId" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "Review_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "Review_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE )'
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
