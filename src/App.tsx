import { Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Labs from "./pages/Labs";
import LabDetail from "./pages/LabDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import { AIAssistantWidget } from "./components/ai/AIAssistantWidget";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/commission/:id" element={<Navigate to="/" replace />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/labs/:toolId" element={<LabDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AIAssistantWidget />
    </>
  );
}

