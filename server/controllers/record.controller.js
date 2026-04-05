const catchAsync = require("../utils/catchAsync");
const recordService = require("../services/record.service");

const list = catchAsync(async (req, res) => {
  const query = req.validatedQuery || req.query;
  const result = await recordService.listRecords(req.user, query);
  res.json({ success: true, data: result });
});

const getOne = catchAsync(async (req, res) => {
  const record = await recordService.getRecordById(req.user, req.params.id);
  res.json({ success: true, data: { record } });
});

const create = catchAsync(async (req, res) => {
  const record = await recordService.createRecord(req.user, req.body);
  res.status(201).json({ success: true, data: { record } });
});

const update = catchAsync(async (req, res) => {
  const record = await recordService.updateRecord(req.user, req.params.id, req.body);
  res.json({ success: true, data: { record } });
});

const remove = catchAsync(async (req, res) => {
  const result = await recordService.deleteRecord(req.user, req.params.id);
  res.json({ success: true, data: result });
});

module.exports = { list, getOne, create, update, remove };
