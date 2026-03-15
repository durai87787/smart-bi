// const express = require("express");
// const sql = require("mssql");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const config = {
//   user: "ups",
//   password: "ups",
//   server: "26.14.83.241",
//   port: 5899,
//   database: "Retailpos",
//    requestTimeout: 60000,   // 60 seconds
//   options: {
//     encrypt: false,
//     trustServerCertificate: true
//   }
// };

// // API Example
// // app.get("/users", async (req, res) => {
// //   try {
// //     await sql.connect(config);
// //     const result = await sql.query("select * from tblInvDepartment");
// //     res.json(result.recordset);
// //   } catch (err) {
// //     res.send(err);
// //   }
// // });

// // app.listen(3000, () => {
// //   console.log("Server running on port 3000");
// // });



// app.post("/department-sales", async (req, res) => {
//   try {

//     console.log("Request Body:", req.body);

//     const { FromDate, ToDate, loctCode } = req.body;

//     const pool = await sql.connect(config);

//     const request = pool.request();

//     request.input("FromDate", sql.DateTime, FromDate);
//     request.input("ToDate", sql.DateTime, ToDate);
//     request.input("loctCode", sql.NVarChar(10), loctCode);

//     request.queryTimeout = 60000;   // 60 seconds timeout

//     const result = await request.execute("sp_bi_DepartmentWiseSales");

//     res.json(result.recordset);

//   } catch (err) {

//     console.error("SQL ERROR:", err);

//     res.status(500).json({ error: err.message });

//   }
// });

const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// SQL Server configuration (for :contentReference[oaicite:0]{index=0})
const config = {
  user: "ups",
  password: "ups",
  server: "26.14.83.241",
  port: 5899,
  database: "Retailpos",

  requestTimeout: 60000, // 60 seconds timeout

  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};


app.get("/users", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query("select * from tblInvDepartment");
    res.json(result.recordset);
  } catch (err) {
    res.send(err);
  }
});
// Department Sales API
app.post("/department-sales", async (req, res) => {
  try {

    console.log("Request Body:", req.body);

    const { FromDate, ToDate, loctCode } = req.body;

    const pool = await sql.connect(config);

    const request = pool.request();

    request.input("FromDate", sql.DateTime, FromDate);
    request.input("ToDate", sql.DateTime, ToDate);
    request.input("loctCode", sql.NVarChar(10), loctCode);

    request.queryTimeout = 60000;

    const result = await request.execute("sp_bi_DepartmentWiseSales");

    res.json(result.recordset);

  } catch (err) {

    console.error("SQL ERROR:", err);

    res.status(500).json({
      error: err.message
    });

  }
});

// Start server (missing in your code)
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


///purchase

app.post("/purchase-summary", async (req, res) => {
  try {

    const { FromDate, ToDate } = req.body;

    const pool = await sql.connect(config);

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

app.post("/dept-purchase", async (req, res) => {
  try {

    const { FromDate, ToDate, loctCode } = req.body;

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input("FromDate", sql.DateTime, FromDate)
      .input("ToDate", sql.DateTime, ToDate)
      .input("loctCode", sql.NVarChar(10), loctCode)
      .execute("sp_bi_DeptWisePurchase");

    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/////paymode breakup screen


// Paymode Breakup API
app.get("/paymode-breakup", async (req, res) => {
  try {

    const pool = await sql.connect(config);   // ✅ fixed here

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

    const pool = await sql.connect(config);

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

    const pool = await sql.connect(config);

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

app.post("/vendor-purchase", async (req,res)=>{

const {FromDate,ToDate} = req.body;

const result = await pool.request()
.input("FromDate",sql.DateTime,FromDate)
.input("ToDate",sql.DateTime,ToDate)
.execute("sp_VendorWisePurchase");

res.json(result.recordset);

});