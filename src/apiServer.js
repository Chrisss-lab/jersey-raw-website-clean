import express from "express";
import cors from "cors";
import { google } from "googleapis";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Google Sheets setup
const SPREADSHEET_ID = "1oSyu-xaWxzfiOB4X-gYu9DiGu3Lj4f-cqT2xBt3mPs0";

const auth = new google.auth.GoogleAuth({
  keyFile: "./src/service-account.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// ==========================
// GET /api/recipes
// ==========================
app.get("/api/recipes", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Recipes!A2:Z",
    });

    const rows = response.data.values || [];
    const recipes = rows.map((row) => {
      const ingredients = [];
      for (let i = 3; i < row.length; i++) {
        if (row[i]) {
          const parts = row[i].split(",").map((s) => s.trim());
          ingredients.push(...parts);
        }
      }
      return {
        Name: row[2] || "",
        Description: row[0] || "",
        Price: row[1] || "0",
        Ingredients: ingredients,
      };
    });

    res.json(recipes);
  } catch (err) {
    console.error("❌ Error fetching recipes:", err);
    res.status(500).send("Error fetching recipes");
  }
});

// ==========================
// GET /api/packages
// ==========================
app.get("/api/packages", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Packages!A2:D",
    });

    const rows = response.data.values || [];
    const packages = rows.map((row, i) => ({
      Type: row[0] || "",
      Size: row[1] || "",
      Discount: row[2] || "0",
      PricePerLb: row[3] || "0",
      RowNumber: i + 2,
    }));

    res.json(packages);
  } catch (err) {
    console.error("❌ Error fetching packages:", err);
    res.status(500).send("Error fetching packages");
  }
});

// ==========================
// POST /api/order
// ==========================
app.post("/api/order", async (req, res) => {
  const { phone, name, email, address, recipe, pounds, packaging, coupon, total } = req.body;

  if (!phone || !name || !email || !address || !recipe || !pounds || !packaging) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const now = new Date().toLocaleString();

    const row = [
      now,
      phone,
      name,
      email,
      address,
      recipe,
      pounds,
      packaging,
      coupon || "",
      total
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Orders!A2:J",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    console.log("✅ Order saved to Google Sheets with total in Column J");
    res.status(200).send({ message: "Order submitted successfully!" });
  } catch (err) {
    console.error("❌ Error saving order:", err);
    res.status(500).send("Error saving order");
  }
});

// ==========================
// Serve React build (frontend)
// ==========================
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ==========================
// Start server
// ==========================
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
