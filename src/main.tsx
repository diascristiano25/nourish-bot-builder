import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Redirect from Lovable PUBLISHED domain to official domain (not preview)
const OFFICIAL_DOMAIN = 'nutriflow.inf.br';
const currentHost = window.location.hostname;

// Only redirect from the published lovable.app domain, NOT from lovableproject.com (preview)
const isPublishedLovableDomain = currentHost.endsWith('.lovable.app');

if (isPublishedLovableDomain) {
  const newUrl = `https://${OFFICIAL_DOMAIN}${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(newUrl);
} else {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
