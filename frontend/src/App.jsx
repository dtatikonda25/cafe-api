import { useEffect, useState } from "react";
import { api } from "./api";

export default function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", is_available: true, category: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setErr("");
      const { data } = await api.get("/items");
      setItems(data);
    } catch (e) {
      setErr(String(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setForm({ name: "", price: "", is_available: true, category: "" });
    setEditingId(null);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      await api.post("/items", payload);
      resetForm();
      await load();
    } catch (e) {
      setErr(String(e?.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      price: item.price,
      is_available: item.is_available,
      category: item.category ?? "",
    });
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {};
      // only send changed fields (optional, but nice)
      // for simplicity, we’ll just send all fields here:
      payload.name = form.name;
      payload.price = Number(form.price);
      payload.is_available = form.is_available;
      payload.category = form.category || null;

      await api.put(`/items/${editingId}`, payload);
      resetForm();
      await load();
    } catch (e) {
      setErr(String(e?.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`/items/${id}`);
      await load();
    } catch (e) {
      setErr(String(e?.response?.data?.detail || e.message));
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Cafe Menu</h1>

      {err && <div style={{ background: "#fee", padding: 12, border: "1px solid #f99", marginBottom: 16 }}>{err}</div>}

      <form onSubmit={editingId ? submitUpdate : submitCreate} style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
          <input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={onChange} required />
          <input name="category" placeholder="Category (optional)" value={form.category} onChange={onChange} />
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input name="is_available" type="checkbox" checked={form.is_available} onChange={onChange} />
            Available
          </label>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={loading}>{editingId ? "Update Item" : "Add Item"}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel Edit</button>}
        </div>
      </form>

      <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f3f3" }}>
            <th align="left">ID</th>
            <th align="left">Name</th>
            <th align="left">Price</th>
            <th align="left">Category</th>
            <th align="left">Available</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} style={{ borderTop: "1px solid #ddd" }}>
              <td>{it.id}</td>
              <td>{it.name}</td>
              <td>${it.price.toFixed(2)}</td>
              <td>{it.category ?? "-"}</td>
              <td>{it.is_available ? "Yes" : "No"}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(it)}>Edit</button>
                <button onClick={() => remove(it.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={6} style={{ padding: 16, textAlign: "center", color: "#666" }}>No items yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
