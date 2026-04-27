import { Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
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
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/commission/:id" element={<Navigate to="/" replace />} />
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
