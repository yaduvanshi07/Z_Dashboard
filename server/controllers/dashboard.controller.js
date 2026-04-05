const catchAsync = require("../utils/catchAsync");
const dashboardService = require("../services/dashboard.service");

const summary = catchAsync(async (req, res) => {
  const data = await dashboardService.getSummary(req.user, req.query);
  res.json({ success: true, data });
});

module.exports = { summary };
