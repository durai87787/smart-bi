require("dotenv").config(); // ✅ load env

const express = require("express");
const cors = require("cors");
const { sql, poolPromise } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

console.log("ENV CHECK 👉", process.env.DB_SERVER);

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

app.get("/test", (req, res) => {
  res.send("TEST OK ✅");
});

// ================= DASHBOARD =================

app.get("/dashboard/location", async (req, res) => {
  try {
    const { from, to } = req.query;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("fromDate", sql.DateTime, from)
      .input("toDate", sql.DateTime, to)
      .execute("sp_bi_dashboard_location_withoutlive_code");

    res.json(result.recordset || []);

  } catch (err) {
    console.log("Location Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/dashboard/buttons", async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "Missing from/to date" });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("fromDate1", sql.Date, from)
      .input("toDate1", sql.Date, to)
      .execute("sp_bi_dashboard_button_withoutlive_location_code");

    res.json(result.recordset || []);

  } catch (err) {
    console.error("BUTTON API ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/dashboard/pie", async (req, res) => {
  try {
    const { from, to } = req.query;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("fromDate", sql.DateTime, from)
      .input("toDate", sql.DateTime, to)
      .execute("sp_bi_piChart_withoutlive_location_code");

    res.json(result.recordset || []);

  } catch (err) {
    console.log("Pie Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/dashboard/bar", async (req, res) => {
  try {
    const { from, to } = req.query;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("fromDate", sql.DateTime, from)
      .input("toDate", sql.DateTime, to)
      .execute("sp_bi_barChart_without_location_code");

    res.json(result.recordset || []);

  } catch (err) {
    console.log("Bar Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= USERS =================

app.get("/users", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .query("select * from tblInvDepartment");

    res.json(result.recordset || []);

  } catch (err) {
    console.error("Users Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= PAYMODE =================

app.get("/paymode-breakup", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT Paymode, SUM(Amount) AS TotalAmount
      FROM vw_POS_PaymodeDetail
      GROUP BY Paymode
    `);

    res.json(result.recordset || []);

  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= PORT =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});