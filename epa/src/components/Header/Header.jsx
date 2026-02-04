export default function Header({ title = "Dashboard" }) {
  return (
    <header
      style={{
        background: "#0f172a",
        color: "white",
        padding: "1rem 2rem",
      }}
    >
      <h1>{title}</h1>
    </header>
  );
}
