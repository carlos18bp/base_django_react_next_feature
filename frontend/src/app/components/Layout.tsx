import { Outlet } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Montserrat, sans-serif" }}>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
