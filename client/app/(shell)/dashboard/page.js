"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api("/dashboard/summary");
        if (!cancelled) setData(res.data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="muted">Loading dashboard…</p>;
  }
  if (error) {
    return <p className="error-text">{error}</p>;
  }

  const { totals, healthScore, spendingInsights, topExpenseCategories, recentActivity } =
    data || {};

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p className="muted">
        Aggregations run in MongoDB; health score and insights are computed in the service layer.
        {isAdmin ? " As Admin you see organization-wide totals unless you filter by user in the API." : ""}
      </p>

      <div className="grid cols-3" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <div className="muted">Income</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{totals?.income?.toFixed(2) ?? "0"}</div>
        </div>
        <div className="card">
          <div className="muted">Expense</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{totals?.expense?.toFixed(2) ?? "0"}</div>
        </div>
        <div className="card">
          <div className="muted">Net</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{totals?.net?.toFixed(2) ?? "0"}</div>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginTop: "1rem" }}>
        <div className="card">
          <div className="muted">Financial health score</div>
          <div className="score-ring">{healthScore ?? "—"}</div>
          <p className="muted" style={{ marginBottom: 0 }}>
            Based on income vs total cash flow in your visible scope.
          </p>
        </div>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="muted">Spending insights</div>
          <ul className="insight-list">
            {(spendingInsights || []).map((i, idx) => (
              <li key={idx}>{i.message}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <div className="muted">Top expense categories</div>
        <div className="table-wrap" style={{ marginTop: "0.75rem", border: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {(topExpenseCategories || []).map((c) => (
                <tr key={c.category}>
                  <td>{c.category}</td>
                  <td>{c.total.toFixed(2)}</td>
                  <td>{c.shareOfExpense}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <div className="muted">Recent activity</div>
        <div className="table-wrap" style={{ marginTop: "0.75rem", border: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentActivity || []).map((r) => (
                <tr key={`${r._id || r.date}-${r.amount}`}>
                  <td>{r.type}</td>
                  <td>{r.amount?.toFixed(2)}</td>
                  <td>{r.category}</td>
                  <td>{r.date ? new Date(r.date).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
