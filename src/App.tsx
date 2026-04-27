import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CommissionDetail from "./pages/CommissionDetail";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Tools from "./pages/Tools";
import ToolDetail from "./pages/ToolDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { ChatWidget } from "./components/ChatWidget";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/commission/:id" element={<CommissionDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/:toolId" element={<ToolDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatWidget />
    </>
  );
}
