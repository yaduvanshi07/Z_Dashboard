const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { FinancialRecord } = require("../models/financialRecord.model");

function buildOwnerFilter(user, queryUserId) {
  if (user.role === "Admin") {
    if (queryUserId && mongoose.isValidObjectId(queryUserId)) {
      return { userId: new mongoose.Types.ObjectId(queryUserId) };
    }
    return {};
  }
  return { userId: user._id };
}

function canMutateRecord(user, record) {
  if (user.role === "Admin") return true;
  if (user.role === "Analyst" && record.userId.equals(user._id)) return true;
  return false;
}

async function listRecords(user, query) {
  const {
    page = 1,
    limit = 10,
    type,
    category,
    dateFrom,
    dateTo,
    userId: filterUserId,
  } = query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const filter = buildOwnerFilter(user, filterUserId);

  if (type) filter.type = type;
  if (category) {
    const safe = String(category).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.category = new RegExp(`^${safe}$`, "i");
  }
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  const [items, total] = await Promise.all([
    FinancialRecord.find(filter)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

async function getRecordById(user, id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid record id", 400);
  }
  const record = await FinancialRecord.findById(id);
  if (!record) {
    throw new AppError("Record not found", 404);
  }
  if (user.role !== "Admin" && !record.userId.equals(user._id)) {
    throw new AppError("Forbidden", 403);
  }
  return record;
}

async function createRecord(user, payload) {
  if (user.role === "Viewer") {
    throw new AppError("Forbidden", 403);
  }

  let ownerId = user._id;
  if (user.role === "Admin" && payload.userId) {
    if (!mongoose.isValidObjectId(payload.userId)) {
      throw new AppError("Invalid userId", 400);
    }
    ownerId = payload.userId;
  }

  const doc = await FinancialRecord.create({
    userId: ownerId,
    type: payload.type,
    amount: payload.amount,
    category: payload.category,
    date: payload.date,
    description: payload.description || "",
    receiptUrl: payload.receiptUrl || null,
  });
  return doc;
}

async function updateRecord(user, id, payload) {
  const record = await getRecordById(user, id);
  if (!canMutateRecord(user, record)) {
    throw new AppError("Forbidden", 403);
  }

  const allowed = ["type", "amount", "category", "date", "description", "receiptUrl"];
  for (const key of allowed) {
    if (payload[key] !== undefined) {
      record[key] = payload[key];
    }
  }
  await record.save();
  return record;
}

async function deleteRecord(user, id) {
  const record = await getRecordById(user, id);
  if (!canMutateRecord(user, record)) {
    throw new AppError("Forbidden", 403);
  }
  await record.deleteOne();
  return { id };
}

module.exports = {
  listRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
};
