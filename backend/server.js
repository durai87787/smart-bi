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
///login page 

app.post("/api/login", async (req, res) => {
  try {
    let { username, password } = req.body;

    // ✅ validation
    username = username?.trim();
    password = password?.trim();

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and Password required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("UserName", sql.VarChar, username)
      .query(`
        SELECT 
          UserCode,
          UserGroupCode,
          UserName,
          Password,
          ExpiryDate,
          Designation,
          Email,
          Phone
        FROM tblUserMaster
        WHERE LTRIM(RTRIM(UserName)) = @UserName
      `);

    // ❌ user not found
    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    const user = result.recordset[0];

    // ✅ TRIM DB VALUES (VERY IMPORTANT for CHAR)
    const dbUsername = user.UserName?.trim();
    const dbPassword = user.Password?.trim();

    // 🔥 OPTIONAL: case-insensitive username
    if (
      dbUsername.toLowerCase() !== username.toLowerCase() ||
      dbPassword !== password
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    // ✅ expiry check
    if (user.ExpiryDate && new Date(user.ExpiryDate) < new Date()) {
      return res.status(403).json({
        success: false,
        message: "Account expired"
      });
    }

    // ✅ success
    res.json({
      success: true,
      message: "Login successful",
      user: {
        userCode: user.UserCode,
        userGroupCode: user.UserGroupCode?.trim(),
        userName: dbUsername,
        designation: user.Designation?.trim(),
        email: user.Email?.trim(),
        phone: user.Phone?.trim()
      }
    });

  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
});
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
    request.input("fromDate", sql.Date, from);
    request.input("toDate", sql.Date, to);

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


/* ---------------- PIE CHART ---------------- */

app.get("/dashboard/pie", async (req, res) => {
  try {
    const { from, to } = req.query;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("from", sql.DateTime, from)   // ✅ FIXED
      .input("to", sql.DateTime, to)       // ✅ FIXED
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



// with location 

app.get("/dashboard/buttons-location", async (req, res) => {
  try {
    const { from, to, location } = req.query;

    console.log("FROM:", from);
    console.log("TO:", to);
    console.log("LOCATION:", location);

    // ✅ Validate params
    if (!from || !to || !location) {
      return res.status(400).json({
        message: "Missing from/to/location"
      });
    }

    // ✅ Validate date
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date format"
      });
    }

    const pool = await poolPromise;
    const request = pool.request();

    // ✅ Pass inputs to SP
    request.input("loctCode", sql.NVarChar, location);
    request.input("fromDate", sql.DateTime, from);
    request.input("toDate", sql.DateTime, to);

    // 🔥 New SP call
    const result = await request.execute(
      "sp_bi_dashboard_button_withlive_location_code"
    );

    res.json(result?.recordset || []);

  } catch (err) {
    console.error("🔥 BUTTON API ERROR:", err);

    res.status(500).json({
      message: "Buttons API failed",
      error: err.message
    });
  }
});


// ------------------
app.get("/dashboard/pie-location", async (req, res) => {
  try {
    const { from, to, location } = req.query;

    console.log("FROM:", from);
    console.log("TO:", to);
    console.log("LOCATION:", location);

    // ✅ Validate
    if (!from || !to || !location) {
      return res.status(400).json({
        message: "Missing from/to/location"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("loctCode", sql.NVarChar, location) // ✅ NEW
      .input("from", sql.DateTime, from)
      .input("to", sql.DateTime, to)
      .execute("sp_bi_piChart_withlive_location_code"); // ✅ NEW SP

    res.json(result.recordset);

  } catch (err) {
    console.log("Pie Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// --------------------

app.get("/dashboard/bar-location", async (req, res) => {
  try {
    const { from, to, location } = req.query;

    console.log("FROM:", from);
    console.log("TO:", to);
    console.log("LOCATION:", location);

    // ✅ Validate
    if (!from || !to || !location) {
      return res.status(400).json({
        message: "Missing from/to/location"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("loctCode", sql.NVarChar, location) // ✅ NEW
      .input("fromDate", sql.DateTime, from)
      .input("toDate", sql.DateTime, to)
      .execute("sp_bi_barChart_with_location_code"); // ✅ NEW SP

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

// inventory list

app.get("/api/inventory", async (req, res) => {
  try {
    const { DeptCode, CatCode, BCode, FromDate, ToDate } = req.query;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("DeptCode", sql.NVarChar, DeptCode)
      .input("CatCode", sql.NVarChar, CatCode)
      .input("BCode", sql.NVarChar, BCode)
      .input("FromDate", sql.DateTime, new Date(FromDate))
      .input("ToDate", sql.DateTime, new Date(ToDate))
      .execute("sp_bi_InventoryWiseSales");

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
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
app.get("/api/paymode-breakup", async (req, res) => {
  try {
    const { from, to } = req.query;

    // ✅ validation
    if (!from || !to) {
      return res.status(400).json({
        message: "from and to dates are required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("fromDate", sql.DateTime, from)
      .input("toDate", sql.DateTime, to)
      .query(`
        SELECT Paymode, SUM(Amount) AS TotalAmount
        FROM vw_POS_PaymodeDetail
        WHERE InvoiceDate BETWEEN @fromDate AND @toDate
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

// Paymode Breakup API
// app.get("/paymode-breakup", async (req, res) => {
//   try {
// const pool = await poolPromise;
//     //const pool = await sql.connect(config);   // ✅ fixed here

//     const result = await pool.request().query(`
//       SELECT Paymode, SUM(Amount) AS TotalAmount
//       FROM vw_POS_PaymodeDetail
//       GROUP BY Paymode
//     `);


//     res.json(result.recordset);

//   } catch (err) {

//     console.error("SQL ERROR:", err);

//     res.status(500).json({
//       message: "Server Error",
//       error: err.message
//     });

//   }
// });


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


// ================= PORT =================

const PORT = process.env.PORT || 3000;

// const PORT = 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});