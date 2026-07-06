import Footer from "./Footer";
import Navbar from "./Navbar";

export default function PageShell({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
