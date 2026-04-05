const catchAsync = require("../utils/catchAsync");
const authService = require("../services/auth.service");

const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ success: true, data: { user, token } });
});

const login = catchAsync(async (req, res) => {
  const token = authService.issueTokenForUser(req.user);
  const user = req.user.toSafeJSON();
  res.json({ success: true, data: { user, token } });
});

const me = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.json({ success: true, data: { user } });
});

module.exports = { register, login, me };
