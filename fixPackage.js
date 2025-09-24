
const fs = require("fs");
const path = require("path");

// Path to package.json
const packagePath = path.join(__dirname, "package.json");

// Read package.json
let pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

// Overwrite scripts section
pkg.scripts = {
  client: "react-scripts start",
  server: "node server.js",
  dev: "concurrently \"npm run server\" \"npm run client\""
};

// Save changes
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));

console.log("✅ package.json scripts fixed! Now run: npm run dev");
