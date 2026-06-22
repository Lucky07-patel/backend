const express = require("express");
const { body } = require("express-validator");
const {
  createLead,
  getLeads,
} = require("../controllers/lead.controller");

const router = express.Router();

const leadValidation = [
  body("fullName").trim().notEmpty().withMessage("Full Name is required"),
  body("email").trim().isEmail().withMessage("Valid Email is required"),
  body("businessName").trim().notEmpty().withMessage("Business Name is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
];

router.post("/", leadValidation, createLead);
router.get("/", getLeads);

module.exports = router;