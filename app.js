const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();
const { body, validationResult } = require("express-validator");
const app = express();
const { qualifyLead } = require("./src/services");

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/", (req, res) => {
  res.send("API Running");
});

app.post(
  "/leads",
  [
    body("fullName").trim().notEmpty().withMessage("Full Name is required"),

    body("email").trim().isEmail().withMessage("Valid Email is required"),

    body("businessName")
      .trim()
      .notEmpty()
      .withMessage("Business Name is required"),

    body("message").trim().notEmpty().withMessage("Message is required"),
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { fullName, email, businessName, message } = req.body;

      // Save lead first
      const leadResult = await pool.query(
        `
        INSERT INTO leads
        (full_name, email, business_name, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [fullName, email, businessName, message],
      );

      const lead = leadResult.rows[0];

      let aiResult = {
        score: "Pending",
        reason: "AI service unavailable",
        emailDraft: "Unable to generate email draft",
      };

      try {
        aiResult = await qualifyLead({
          fullName,
          email,
          businessName,
          message,
        });

        await pool.query(
          `
          UPDATE leads
          SET ai_score = $1,
              ai_reason = $2,
              ai_email_draft = $3
          WHERE id = $4
          `,
          [aiResult.score, aiResult.reason, aiResult.emailDraft, lead.id],
        );
      } catch (aiError) {
        console.error("AI Error:", aiError.message);

        await pool.query(
          `
          UPDATE leads
          SET ai_score = $1,
              ai_reason = $2,
              ai_email_draft = $3
          WHERE id = $4
          `,
          [
            "Pending",
            "AI Service Failed",
            "Email generation unavailable",
            lead.id,
          ],
        );
      }

      const updatedLead = await pool.query(
        `
        SELECT *
        FROM leads
        WHERE id = $1
        `,
        [lead.id],
      );

      res.status(201).json({
        success: true,
        message: "Lead saved successfully",
        data: updatedLead.rows[0],
      });
    } catch (error) {
      console.error("error", error);

      res.status(500).json({
        success: false,
        message: error.message || "Server Error",
      });
    }
  },
);

app.get("/leads", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        full_name,
        email,
        business_name,
        message,
        ai_score,
        ai_reason,
        ai_email_draft,
        created_at
      FROM leads
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
});




app.listen(5000, () => {
  console.log("Server Running on Port 5000");
});
