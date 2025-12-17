import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Redirect from Lovable domain to official domain
const OFFICIAL_DOMAIN = 'nutriflow.inf.br';
const currentHost = window.location.hostname;

if (currentHost.includes('lovable.app') || currentHost.includes('lovableproject.com')) {
  const newUrl = `https://${OFFICIAL_DOMAIN}${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(newUrl);
} else {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
