const mongoose = require("mongoose");
const { FinancialRecord } = require("../models/financialRecord.model");

function matchStageForUser(user, queryUserId) {
  const match = {};
  if (user.role === "Admin") {
    if (queryUserId && mongoose.isValidObjectId(queryUserId)) {
      match.userId = new mongoose.Types.ObjectId(queryUserId);
    }
  } else {
    match.userId = user._id;
  }
  return match;
}

/**
 * Financial health score: normalized ratio of income to total cash flow.
 * Higher is better when income dominates; capped 0–100.
 */
function computeHealthScore(totalIncome, totalExpense) {
  const income = Number(totalIncome) || 0;
  const expense = Number(totalExpense) || 0;
  const flow = income + expense;
  if (flow === 0) return 50;
  const ratio = income / flow;
  return Math.round(Math.min(100, Math.max(0, ratio * 100)));
}

async function getSummary(user, query) {
  const baseMatch = matchStageForUser(user, query.userId);

  const [totals, byCategory, recent] = await Promise.all([
    FinancialRecord.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    FinancialRecord.aggregate([
      { $match: { ...baseMatch, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 12 },
    ]),
    FinancialRecord.find(baseMatch)
      .sort({ date: -1 })
      .limit(5)
      .select("type amount category date description")
      .lean(),
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  for (const row of totals) {
    if (row._id === "income") totalIncome = row.total;
    if (row._id === "expense") totalExpense = row.total;
  }

  const net = totalIncome - totalExpense;
  const healthScore = computeHealthScore(totalIncome, totalExpense);

  const spendingInsights = buildSpendingInsights(
    byCategory,
    totalExpense,
    totalIncome
  );

  return {
    totals: {
      income: totalIncome,
      expense: totalExpense,
      net,
      recordCount: totals.reduce((a, b) => a + b.count, 0),
    },
    healthScore,
    spendingInsights,
    topExpenseCategories: byCategory.map((c) => ({
      category: c._id,
      total: c.total,
      count: c.count,
      shareOfExpense:
        totalExpense > 0 ? Math.round((c.total / totalExpense) * 1000) / 10 : 0,
    })),
    recentActivity: recent,
  };
}

function buildSpendingInsights(byCategory, totalExpense, totalIncome) {
  const insights = [];
  if (totalExpense === 0 && totalIncome === 0) {
    insights.push({
      type: "info",
      message: "Add income and expense records to unlock insights.",
    });
    return insights;
  }

  if (byCategory.length > 0) {
    const top = byCategory[0];
    insights.push({
      type: "top_category",
      message: `Largest spend category: ${top._id} (${top.total.toFixed(2)} total).`,
      category: top._id,
      amount: top.total,
    });
  }

  if (totalIncome > 0 && totalExpense > 0) {
    const burnRate = totalExpense / totalIncome;
    if (burnRate > 1) {
      insights.push({
        type: "warning",
        message: "Expenses exceed income for the selected scope — review discretionary categories.",
        burnRate: Math.round(burnRate * 100) / 100,
      });
    } else if (burnRate < 0.5) {
      insights.push({
        type: "positive",
        message: "Expenses are well below income — strong savings headroom.",
        burnRate: Math.round(burnRate * 100) / 100,
      });
    }
  }

  const longTail = byCategory.filter((c) => c.count === 1).length;
  if (longTail >= 3) {
    insights.push({
      type: "pattern",
      message: `${longTail} categories have only one transaction — consider grouping small recurring spends.`,
    });
  }

  return insights;
}

module.exports = {
  getSummary,
  computeHealthScore,
};
