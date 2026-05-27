import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Side-effect: applies theme class to <html> before first paint
import "./hooks/useUserPrefs";

createRoot(document.getElementById("root")!).render(<App />);
