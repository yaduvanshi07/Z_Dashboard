const mongoose = require("mongoose");

const TYPES = ["income", "expense"];

const financialRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: TYPES, required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true },
    description: { type: String, default: "", trim: true },
    receiptUrl: { type: String, default: null },
  },
  { timestamps: true }
);

financialRecordSchema.index({ userId: 1, date: -1 });

module.exports = {
  FinancialRecord: mongoose.model("FinancialRecord", financialRecordSchema),
  RECORD_TYPES: TYPES,
};
