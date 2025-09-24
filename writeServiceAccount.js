// writeServiceAccount.js
const fs = require("fs");
const path = require("path");

// Path to write the service account JSON inside src folder (for local dev only)
const filePath = path.join(__dirname, "src", "service-account.json");

// Check for environment variable first
if (!process.env.SERVICE_ACCOUNT_JSON) {
  console.error("❌ SERVICE_ACCOUNT_JSON environment variable not set. Cannot write file.");
  process.exit(1);
}

try {
  const serviceAccountJSON = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);

  fs.writeFileSync(filePath, JSON.stringify(serviceAccountJSON, null, 2));
  console.log(`✅ service-account.json created at ${filePath}`);
} catch (err) {
  console.error("❌ Failed to parse SERVICE_ACCOUNT_JSON:", err);
  process.exit(1);
}
