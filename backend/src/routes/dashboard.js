const express = require("express");
const { Lead } = require("../models/Lead");

const router = express.Router();

router.get("/", async (_req, res) => {
  const leads = await Lead.find({});

  const summary = leads.reduce(
    (acc, lead) => {
      acc.totalLeads += 1;
      acc.totalEstimatedDealValue += lead.estimatedDealValue;

      if (lead.status === "New") acc.newLeads += 1;
      if (lead.status === "Qualified") acc.qualifiedLeads += 1;
      if (lead.status === "Won") {
        acc.wonLeads += 1;
        acc.totalWonDealValue += lead.estimatedDealValue;
      }
      if (lead.status === "Lost") acc.lostLeads += 1;
      return acc;
    },
    {
      totalLeads: 0,
      newLeads: 0,
      qualifiedLeads: 0,
      wonLeads: 0,
      lostLeads: 0,
      totalEstimatedDealValue: 0,
      totalWonDealValue: 0,
    }
  );

  return res.json(summary);
});

module.exports = router;
