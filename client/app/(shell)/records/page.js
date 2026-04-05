"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const emptyForm = {
  type: "expense",
  amount: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  receiptUrl: "",
};

export default function RecordsPage() {
  const { isAnalystUp, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ type: "", category: "" });
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "8" });
      if (filters.type) params.set("type", filters.type);
      if (filters.category) params.set("category", filters.category);
      const res = await api(`/records?${params.toString()}`);
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.category]);

  useEffect(() => {
    load(1);
  }, [load]);

  async function onCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/records", {
        method: "POST",
        body: {
          type: form.type,
          amount: Number(form.amount),
          category: form.category,
          date: form.date,
          description: form.description,
          receiptUrl: form.receiptUrl || null,
        },
      });
      setForm(emptyForm);
      await load(pagination.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this record?")) return;
    setError("");
    try {
      await api(`/records/${id}`, { method: "DELETE" });
      await load(pagination.page);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onUpload(file) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api("/upload/receipt", { method: "POST", body: fd });
      setForm((f) => ({ ...f, receiptUrl: res.data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Records</h1>
      <p className="muted">
        Viewer: read only. Analyst/Admin: create, update, delete (Admin across all users).
      </p>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="muted">Filters</div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            placeholder="Category (exact match)"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          />
          <button type="button" className="btn ghost" onClick={() => load(1)}>
            Apply
          </button>
        </div>
      </div>

      {isAnalystUp ? (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="muted">New record</div>
          <form onSubmit={onCreate} style={{ marginTop: "0.75rem" }}>
            <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Category</label>
                <input
                  required
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Receipt (Cloudinary)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onUpload(e.target.files?.[0])}
                disabled={uploading}
              />
              {form.receiptUrl ? (
                <span className="muted" style={{ display: "block", marginTop: "0.35rem" }}>
                  Linked:{" "}
                  <a href={form.receiptUrl} target="_blank" rel="noreferrer">
                    view
                  </a>
                </span>
              ) : null}
            </div>
            <button className="btn" type="submit" disabled={saving || uploading}>
              {saving ? "Saving…" : "Add record"}
            </button>
            {isAdmin ? (
              <p className="muted" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                Admin can set <code>userId</code> via API for records owned by another user; this UI creates for you.
              </p>
            ) : null}
          </form>
        </div>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Receipt</th>
                  {isAnalystUp ? <th /> : null}
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r._id}>
                    <td>{r.type}</td>
                    <td>{Number(r.amount).toFixed(2)}</td>
                    <td>{r.category}</td>
                    <td>{r.date ? new Date(r.date).toLocaleDateString() : "—"}</td>
                    <td>
                      {r.receiptUrl ? (
                        <a href={r.receiptUrl} target="_blank" rel="noreferrer">
                          link
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    {isAnalystUp ? (
                      <td>
                        <button type="button" className="btn danger" onClick={() => onDelete(r._id)}>
                          Delete
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pager">
            <button
              type="button"
              className="btn ghost"
              disabled={pagination.page <= 1}
              onClick={() => load(pagination.page - 1)}
            >
              Prev
            </button>
            <span className="muted">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              className="btn ghost"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => load(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
