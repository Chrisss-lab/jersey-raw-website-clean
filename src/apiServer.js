import express from "express";
import { google } from "googleapis";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Google Sheets info
const SPREADSHEET_ID = "1oSyu-xaWxzfiOB4X-gYu9DiGu3Lj4f-cqT2xBt3mPs0";
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY), // use env variable
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});

const sheets = google.sheets({ version: "v4", auth });

// ------------------------
// Route to test any sheet
// ------------------------
app.get("/test-sheets", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Orders!A2:J"
    });
    const rows = response.data.values || [];
    res.json(rows.length ? rows : { message: "No orders found" });
  } catch (err) {
    console.error("Error fetching Orders sheet:", err);
    res.status(500).send("Error fetching Orders sheet");
  }
});

// ------------------------
// Route to fetch all recipes
// ------------------------
app.get("/api/recipes", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Recipes!A2:Y"
    });

    const rows = response.data.values || [];
    const recipes = rows.map(row => ({
      description: row[0] || "",
      price: row[1] || "",
      Name: row[2] || "",
      Ingredients: row.slice(3, 27)
    }));

    res.json(recipes);

  } catch (err) {
    console.error("Error fetching Recipes sheet:", err);
    res.status(500).send("Error fetching Recipes sheet");
  }
});

// ------------------------
// Route to fetch packaging options
// ------------------------
app.get("/api/packages", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Packages!A2:C"
    });

    const rows = response.data.values || [];
    const packages = rows.map(row => ({
      Type: row[0] || "",
      Size: row[1] || "",
      Discount: row[2] || "0%"
    }));

    res.json(packages);

  } catch (err) {
    console.error("Error fetching Packages sheet:", err);
    res.status(500).send("Error fetching Packages sheet");
  }
});

// ------------------------
// Route to fetch orders with enriched recipe & packaging info
// ------------------------
app.get("/api/orders", async (req, res) => {
  try {
    const sheetsApi = sheets.spreadsheets.values;

    const ordersResp = await sheetsApi.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Orders!A2:J"
    });
    const orders = ordersResp.data.values || [];

    const recipesResp = await sheetsApi.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Recipes!A2:Y"
    });
    const recipesMap = {};
    (recipesResp.data.values || []).forEach(r => {
      recipesMap[r[2]] = {
        description: r[0],
        price: r[1],
        Ingredients: r.slice(3, 27)
      };
    });

    const packagesResp = await sheetsApi.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Packages!A2:C"
    });
    const packagesMap = {};
    (packagesResp.data.values || []).forEach(p => {
      packagesMap[p[0]] = { Size: p[1], Discount: p[2] || "0%" };
    });

    const enrichedOrders = orders.map(o => {
      const recipeName = o[5] || "";
      const packageType = o[7] || "";
      return {
        date: o[0],
        phone: o[1],
        name: o[2],
        email: o[3],
        address: o[4],
        recipeName,
        recipe: recipesMap[recipeName] || {},
        amount: o[6],
        packaging: packagesMap[packageType] || {},
        coupon: o[8] || ""
      };
    });

    res.json(enrichedOrders);

  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Error fetching orders");
  }
});

// ------------------------
// Start server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
