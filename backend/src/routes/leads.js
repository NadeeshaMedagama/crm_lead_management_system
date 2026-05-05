const express = require("express");
const { body, query, param } = require("express-validator");
const { Lead, LEAD_STATUSES, LEAD_SOURCES } = require("../models/Lead");
const Note = require("../models/Note");
const validate = require("../middleware/validate");

const router = express.Router();

const leadValidationRules = [
  body("leadName").isString().trim().notEmpty(),
  body("companyName").isString().trim().notEmpty(),
  body("email").isEmail(),
  body("phoneNumber").isString().trim().notEmpty(),
  body("leadSource").isIn(LEAD_SOURCES),
  body("assignedSalesperson").isString().trim().notEmpty(),
  body("status").optional().isIn(LEAD_STATUSES),
  body("estimatedDealValue").optional().isFloat({ min: 0 }),
];

router.get(
  "/",
  [
    query("status").optional().isIn(LEAD_STATUSES),
    query("leadSource").optional().isIn(LEAD_SOURCES),
    query("assignedSalesperson").optional().isString(),
    query("search").optional().isString(),
  ],
  validate,
  async (req, res) => {
    const { status, leadSource, assignedSalesperson, search } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (leadSource) filters.leadSource = leadSource;
    if (assignedSalesperson) filters.assignedSalesperson = assignedSalesperson;

    if (search) {
      const pattern = new RegExp(search, "i");
      filters.$or = [{ leadName: pattern }, { companyName: pattern }, { email: pattern }];
    }

    const leads = await Lead.find(filters).sort({ createdAt: -1 });
    return res.json(leads);
  }
);

router.post("/", leadValidationRules, validate, async (req, res) => {
  const lead = await Lead.create(req.body);
  return res.status(201).json(lead);
});

router.get("/meta/options", async (_req, res) => {
  const assignedSalespeople = await Lead.distinct("assignedSalesperson");
  return res.json({
    statuses: LEAD_STATUSES,
    sources: LEAD_SOURCES,
    assignedSalespeople,
  });
});

router.put("/:id", [param("id").isMongoId(), ...leadValidationRules], validate, async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }
  return res.json(lead);
});

router.patch(
  "/:id/status",
  [param("id").isMongoId(), body("status").isIn(LEAD_STATUSES)],
  validate,
  async (req, res) => {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { returnDocument: "after", runValidators: true }
    );
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    return res.json(lead);
  }
);

router.delete("/:id", [param("id").isMongoId()], validate, async (req, res) => {
  const deleted = await Lead.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Lead not found" });
  }
  await Note.deleteMany({ leadId: req.params.id });
  return res.status(204).send();
});

router.post(
  "/:id/notes",
  [param("id").isMongoId(), body("content").isString().trim().notEmpty()],
  validate,
  async (req, res) => {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    const note = await Note.create({
      leadId: lead._id,
      content: req.body.content,
      createdBy: req.user.name || req.user.email,
    });
    return res.status(201).json(note);
  }
);

router.get("/:id", [param("id").isMongoId()], validate, async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }
  const notes = await Note.find({ leadId: lead._id }).sort({ createdAt: -1 });
  return res.json({ ...lead.toObject(), notes });
});

module.exports = router;
