import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function MainLayout({ children, headerTitle = "Dashboard" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      
      {/* Top Navbar */}
      <Navbar />

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar on the left */}
        <Sidebar />

        {/* Main content column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Page Header */}
          <Header title={headerTitle} />

          {/* Main content area */}
          <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}
