import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress ResizeObserver error (benign error from Recharts)
const resizeObserverError = window.console.error;
window.console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ResizeObserver loop')
  ) {
    return;
  }
  resizeObserverError(...args);
};

createRoot(document.getElementById("root")!).render(<App />);
