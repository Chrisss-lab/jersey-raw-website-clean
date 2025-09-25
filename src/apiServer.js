import express from "express";
import { google } from "googleapis";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Google Sheets info
const SPREADSHEET_ID = "1oSyu-xaWxzfiOB4X-gYu9DiGu3Lj4f-cqT2xBt3mPs0";
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});
const sheets = google.sheets({ version: "v4", auth });

// ------------------------
// Fetch Recipes
// ------------------------
app.get("/api/recipes", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Recipes!A2:Y"
    });
    const rows = response.data.values || [];
    const recipes = rows.map(row => ({
      Description: row[0] || "",
      Price: row[1] || "",
      Name: row[2] || "",
      Ingredients: row.slice(3, 27)
    }));
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching Recipes sheet");
  }
});

// ------------------------
// Fetch Packages
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
    console.error(err);
    res.status(500).send("Error fetching Packages sheet");
  }
});

// ------------------------
// Fetch Orders
// ------------------------
app.get("/api/orders", async (req, res) => {
  try {
    const ordersResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Orders!A2:J"
    });
    const orders = ordersResp.data.values || [];

    res.json(orders.map(o => ({
      date: o[0],
      phone: o[1],
      name: o[2],
      email: o[3],
      address: o[4],
      recipe: o[5],
      amount: o[6],
      packaging: o[7],
      coupon: o[8],
      total: o[9]
    })));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching Orders sheet");
  }
});

// ------------------------
// POST new Order
// ------------------------
app.post("/api/order", async (req, res) => {
  try {
    const { phone, name, email, address, recipe, pounds, packaging, coupon, total } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Orders!A:J",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [new Date().toLocaleString(), phone, name, email, address, recipe, pounds, packaging, coupon, total]
        ]
      }
    });

    res.status(200).json({ message: "Order added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding order");
  }
});

// ------------------------
// Start server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
