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

/* ---------------- DASHBOARD LOCATION ---------------- */

app.get("/dashboard/location", async (req, res) => {

  try {

    const { from, to } = req.query;

    // const pool = await connectDB();
    const pool = await poolPromise;

    const result = await pool.request()
      .input("fromDate", sql.DateTime, from)
      .input("toDate", sql.DateTime, to)
      .execute("sp_bi_dashboard_location_withoutlive_code");

    res.json(result.recordset);

  } catch (err) {

    console.log("Location Error:", err);
    res.status(500).json({ error: err.message });

  }

});

/* ---------------- DASHBOARD BUTTONS ---------------- */
app.get("/dashboard/buttons", async (req, res) => {
  try {
    const { from, to } = req.query;

    console.log("FROM:", from);
    console.log("TO:", to);

    // ✅ Validate params
    if (!from || !to) {
      return res.status(400).json({
        message: "Missing from/to date"
      });
    }

    // ✅ Validate date format
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date format"
      });
    }

    // ✅ Connect DB
    // const pool = await sql.connect(config);
    const pool = await poolPromise;
    const request = pool.request();

    // 🔥 BEST PRACTICE (no timezone issues)
    request.input("fromDate1", sql.Date, from);
    request.input("toDate1", sql.Date, to);

    // ✅ Execute SP
    const result = await request.execute(
      "sp_bi_dashboard_button_withoutlive_location_code"
    );

    // ✅ Safe response
    res.json(result?.recordset || []);

  } catch (err) {
    console.error("🔥 BUTTON API ERROR:", err);

    res.status(500).json({
      message: "Buttons API failed",
      error: err.message
    });
  }
});
// app.get("/dashboard/buttons", async (req, res) => {
//   try {

//     const { from, to } = req.query;

//     const pool = await sql.connect(config);

//     const request = pool.request();

//     request.input("fromDate", sql.DateTime, new Date(from));
//     request.input("toDate", sql.DateTime, new Date(to));

//     const result = await request.execute(
//       "sp_bi_dashboard_button_withoutlive_location_code"
//     );

//     res.json(result.recordset);

//   } catch (err) {

//     console.error("BUTTON API ERROR:", err);

//     res.status(500).json({
//       message: "Buttons API failed",
//       error: err.message
//     });

//   }
// });

/* ---------------- PIE CHART ---------------- */

app.get("/dashboard/pie", async (req, res) => {

  try {

    const { from, to } = req.query;

    // const pool = await connectDB();
    const pool = await poolPromise;

    const result = await pool.request()
      .input("fromDate", sql.DateTime, from)
      .input("toDate", sql.DateTime, to)
      .execute("sp_bi_piChart_withoutlive_location_code");

    res.json(result.recordset);

  } catch (err) {

    console.log("Pie Error:", err);
    res.status(500).json({ error: err.message });

  }

});

/* ---------------- BAR CHART ---------------- */

app.get("/dashboard/bar", async (req, res) => {

  try {

    const { from, to } = req.query;

    // const pool = await connectDB();
    const pool = await poolPromise;


    const result = await pool.request()
      .input("fromDate", sql.DateTime, from)
      .input("toDate", sql.DateTime, to)
      .execute("sp_bi_barChart_without_location_code");

    res.json(result.recordset);

  } catch (err) {

    console.log("Bar Error:", err);
    res.status(500).json({ error: err.message });

  }

});

/* ---------------- USERS ---------------- */
//////


app.get("/users", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query("select * from tblInvDepartment");
    res.json(result.recordset);
  } catch (err) {
    res.send(err);
  }
});





// ================================
// 🔹 DEPARTMENT SALES
// ================================
app.post("/department-sales", async (req, res) => {
  try {
    const { FromDate, ToDate, loctCode } = req.body;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("FromDate", sql.DateTime, new Date(FromDate))
      .input("ToDate", sql.DateTime, new Date(ToDate))
      .input("loctCode", sql.NVarChar(10), loctCode || null)
      .execute("sp_bi_DepartmentWiseSales");

    res.json(result.recordset);

  } catch (err) {
    console.error("Dept ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ================================
// 🔹 CATEGORY SALES
// ================================
app.post("/category-sales", async (req, res) => {
  try {
    const { FromDate, ToDate, loctCode, DeptCode } = req.body;

    console.log("DeptCode:", DeptCode);

    if (!DeptCode) {
      return res.status(400).json({ error: "DeptCode required" });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("FromDate", sql.DateTime, new Date(FromDate))
      .input("ToDate", sql.DateTime, new Date(ToDate))
      .input("loctCode", sql.NVarChar(10), loctCode || null)
      // 🔥 FIX HERE
      .input("DeptCode", sql.NVarChar(50), String(DeptCode))
      .execute("sp_bi_CategoryWiseSales");

    res.json(result.recordset);

  } catch (err) {
    console.error("Category ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ================================
// 🔹 BRAND SALES
// ================================
app.post("/brand-sales", async (req, res) => {
  try {
    const { FromDate, ToDate, loctCode, DeptCode, CatCode } = req.body;

    console.log("DeptCode:", DeptCode);
    console.log("CatCode:", CatCode);

    if (!DeptCode || !CatCode) {
      return res.status(400).json({ error: "DeptCode & CatCode required" });
    }

    const pool = await poolPromise;
    

    const result = await pool.request()
      .input("FromDate", sql.DateTime, new Date(FromDate))
      .input("ToDate", sql.DateTime, new Date(ToDate))
      .input("loctCode", sql.NVarChar(10), loctCode || null)

      // 🔥 FINAL FIX
      .input("DeptCode", sql.NVarChar(10), String(DeptCode).trim())
      .input("CatCode", sql.NVarChar(10), String(CatCode).trim())

      .execute("dbo.sp_bi_BrandWiseSales");

    res.json(result.recordset);

  } catch (err) {
    console.error("Brand ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

///purchase

app.post("/purchase-summary", async (req, res) => {
  try {

    const { FromDate, ToDate } = req.body;

    // const pool = await sql.connect(config);
    const pool = await poolPromise;

    const request = pool.request();

    request.input("FromDate", sql.DateTime, FromDate);
    request.input("ToDate", sql.DateTime, ToDate);

    const result = await request.execute("sp_bi_Purchase_totalAndCount_without_code");

    res.json(result.recordset);

  } catch (err) {

    console.error("SQL ERROR:", err);

    res.status(500).json({ error: err.message });

  }
});

////purchase wise sales 

// app.post("/dept-purchase", async (req, res) => {
//   try {

//     const { FromDate, ToDate, loctCode } = req.body;

//     const pool = await sql.connect(config);

//     const result = await pool.request()
//       .input("FromDate", sql.DateTime, FromDate)
//       .input("ToDate", sql.DateTime, ToDate)
//       .input("loctCode", sql.NVarChar(10), loctCode)
//       .execute("sp_bi_DeptWisePurchase");

//     res.json(result.recordset);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
app.post("/dept-purchase", async (req, res) => {
  try {
    const { FromDate, ToDate, loctCode } = req.body;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("FromDate", sql.DateTime, new Date(FromDate))
      .input("ToDate", sql.DateTime, new Date(ToDate))
      .input("loctCode", sql.NVarChar(10), loctCode || null)
      .execute("dbo.sp_bi_DeptWisePurchase");

    res.json(result.recordset);

  } catch (err) {
    console.error("Dept Purchase ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/purchase-category", async (req, res) => {
  try {
    console.log("CATEGORY BODY:", req.body);

    let { FromDate, ToDate, loctCode, DeptCode } = req.body;

    if (!DeptCode) {
      return res.status(400).json({ error: "DeptCode required" });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("FromDate", sql.DateTime, new Date(FromDate))
      .input("ToDate", sql.DateTime, new Date(ToDate))
      .input("loctCode", sql.NVarChar(10), loctCode || null)

      // 🔥 SAFE FIX
      .input("DeptCode", sql.NVarChar(10), String(DeptCode || "").trim())

      .execute("dbo.sp_bi_CategoryWisePurchase");

    res.json(Array.isArray(result.recordset) ? result.recordset : []);

  } catch (err) {
    console.error("Category Purchase ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/purchase-brand", async (req, res) => {
  try {
    console.log("BRAND BODY:", req.body);

    let { FromDate, ToDate, loctCode, DeptCode, CatCode } = req.body;

    if (!DeptCode || !CatCode) {
      return res.status(400).json({ error: "DeptCode & CatCode required" });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("FromDate", sql.DateTime, new Date(FromDate))
      .input("ToDate", sql.DateTime, new Date(ToDate))
      .input("loctCode", sql.NVarChar(10), loctCode || null)

      // 🔥 SUPER SAFE FIX
      .input("DeptCode", sql.NVarChar(10), String(DeptCode || "").trim())
      .input("CatCode", sql.NVarChar(10), String(CatCode || "").trim())

      .execute("dbo.sp_bi_BrandWisePurchase");

    res.json(Array.isArray(result.recordset) ? result.recordset : []);

  } catch (err) {
    console.error("Brand Purchase ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/////paymode breakup screen


// Paymode Breakup API
app.get("/paymode-breakup", async (req, res) => {
  try {
const pool = await poolPromise;
    //const pool = await sql.connect(config);   // ✅ fixed here

    const result = await pool.request().query(`
      SELECT Paymode, SUM(Amount) AS TotalAmount
      FROM vw_POS_PaymodeDetail
      GROUP BY Paymode
    `);

    res.json(result.recordset);

  } catch (err) {

    console.error("SQL ERROR:", err);

    res.status(500).json({
      message: "Server Error",
      error: err.message
    });

  }
});


/////live sales 

app.post("/livesales", async (req, res) => {
  try {

    const { LocationCode, Type } = req.body;

    // const pool = await sql.connect(config);
    const pool = await poolPromise;

    const result = await pool.request()
      .input("LocationCode", sql.NVarChar(10), LocationCode)
      .input("Type", sql.NVarChar(20), Type)
      .execute("sp_GetSalesReport");

    res.json(result.recordset);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }
});

/////invoice 

app.post("/invoice-list", async (req, res) => {

  try {

    const { loctCode, FromDate, ToDate } = req.body;

    // const pool = await sql.connect(config);
    const pool = await poolPromise;

    const result = await pool.request()
      .input("loctCode", sql.NVarChar(10), loctCode)
      .input("FromDate", sql.DateTime, FromDate)
      .input("ToDate", sql.DateTime, ToDate)
      .execute("sp_bi_InvoiceList");

    const invoices = result.recordsets[0];
    const payments = result.recordsets[1];

    const data = invoices.map(inv => {

      const pay = payments.find(p => p.InvoiceNo === inv.InvoiceNo);

      return {
        InvoiceNo: inv.InvoiceNo,
        LocationCode: inv.LocationCode,
        NetTotal: inv.NetTotal,
        DateTime: inv.DateTime || "",
        Paymode: pay?.Paymode || "",
        Amount: pay?.Amount || 0
      };

    });

    res.json(data);

  } catch (err) {

    console.log("Invoice API Error:", err);

    res.status(500).json({
      error: err.message
    });

  }

});

////vendors wise purchase

// app.post("/vendor-purchase", async (req,res)=>{

// const {FromDate,ToDate} = req.body;

// const result = await pool.request()
// .input("FromDate",sql.DateTime,FromDate)
// .input("ToDate",sql.DateTime,ToDate)
// .execute("sp_VendorWisePurchase");

// res.json(result.recordset);

// });
app.post("/vendor-purchase", async (req, res) => {
  try {
    const { FromDate, ToDate } = req.body;

    //const pool = await sql.connect(config); // ✅ FIX HERE
    const pool = await poolPromise;

    const result = await pool.request()
      .input("FromDate", sql.DateTime, new Date(FromDate))
      .input("ToDate", sql.DateTime, new Date(ToDate))
      .query(`
        SELECT 
          p.vendorCode as Code,
          v.VendorName AS Name,
          (CASE 
            WHEN SUM(p.NetTotal) IS NULL THEN 0 
            ELSE CAST(CONVERT(decimal(18,2), CAST(SUM(p.NetTotal) AS money),1) AS decimal(18,2)) 
          END) AS Total,
          COUNT(GidNo) AS GidCount
        FROM tblInvVendor v
        INNER JOIN tblPurchaseGidHeader p 
          ON v.vendorCode = p.vendorCode
        WHERE p.GidDate BETWEEN @FromDate AND @ToDate
        GROUP BY p.vendorCode, v.VendorName
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
