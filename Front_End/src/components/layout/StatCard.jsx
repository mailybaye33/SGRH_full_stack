// Components/layaut/StatCard.jsx

export default function StatCard({ icon, label, value, color = "#3b82f6" }) {
  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "20px 24px",
      display: "flex", alignItems: "center", gap: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)", flex: 1
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: color + "18", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 24, flexShrink: 0
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{value}</div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}