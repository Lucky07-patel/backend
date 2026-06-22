const { validationResult } = require("express-validator");
const pool = require("../config/db");
const { qualifyLead } = require("../services/ai.service");

const createLead = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { fullName, email, businessName, message } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingLead = await pool.query(
      `
      SELECT id
      FROM leads
      WHERE LOWER(email) = $1
      `,
      [normalizedEmail]
    );

    if (existingLead.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Lead with this email already exists",
      });
    }

    const leadResult = await pool.query(
      `
      INSERT INTO leads
      (full_name, email, business_name, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [fullName.trim(), normalizedEmail, businessName.trim(), message.trim()]
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
        email: normalizedEmail,
        businessName,
        message,
      });
    } catch (aiError) {
      console.error("AI Error:", aiError.message);
    }

    await pool.query(
      `
      UPDATE leads
      SET ai_score = $1,
          ai_reason = $2,
          ai_email_draft = $3
      WHERE id = $4
      `,
      [
        aiResult.score || "Pending",
        aiResult.reason || "AI service unavailable",
        aiResult.emailDraft || "Unable to generate email draft",
        lead.id,
      ]
    );

    const updatedLead = await pool.query(
      `
      SELECT *
      FROM leads
      WHERE id = $1
      `,
      [lead.id]
    );

    res.status(201).json({
      success: true,
      message: "Lead saved successfully",
      data: updatedLead.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const getLeads = async (req, res, next) => {
  try {
    const {
      search = "",
      sortBy = "created_at",
      order = "desc",
    } = req.query;

    const allowedSortFields = [
      "full_name",
      "email",
      "created_at",
    ];

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";

    const sortOrder =
      order.toLowerCase() === "asc" ? "ASC" : "DESC";

    const query = `
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
      WHERE
        full_name ILIKE $1
        OR email ILIKE $1
      ORDER BY ${sortField} ${sortOrder}
    `;

    const result = await pool.query(query, [`%${search}%`]);

    res.status(200).json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const totalResult = await pool.query(`
      SELECT COUNT(*)::int as total
      FROM leads
    `);

    const scoreResult = await pool.query(`
      SELECT
        ai_score,
        COUNT(*)::int as count
      FROM leads
      GROUP BY ai_score
    `);

    const total = totalResult.rows[0].total;

    let hot = 0;
    let warm = 0;
    let cold = 0;
    let pending = 0;

    scoreResult.rows.forEach((row) => {
      switch (row.ai_score) {
        case "Hot":
          hot = row.count;
          break;

        case "Warm":
          warm = row.count;
          break;

        case "Cold":
          cold = row.count;
          break;

        default:
          pending = row.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalLeads: total,
        hotLeads: hot,
        warmLeads: warm,
        coldLeads: cold,
        pendingLeads: pending,

        hotPercentage:
          total > 0
            ? ((hot / total) * 100).toFixed(1)
            : 0,

        warmPercentage:
          total > 0
            ? ((warm / total) * 100).toFixed(1)
            : 0,

        coldPercentage:
          total > 0
            ? ((cold / total) * 100).toFixed(1)
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getLeads,
  getDashboardStats,
};

