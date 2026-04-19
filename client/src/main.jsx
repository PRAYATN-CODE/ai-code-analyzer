import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { store } from "./store";

// Apply theme on initial load
const theme = localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.documentElement.classList.toggle("dark", theme === "dark");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(223, 39%, 8%)",
              color: "hsl(214, 32%, 91%)",
              border: "1px solid hsl(222, 25%, 14%)",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              fontFamily: "'DM Sans', sans-serif",
            },
            success: {
              iconTheme: { primary: "#06B6D4", secondary: "hsl(222, 47%, 5%)" },
            },
            error: {
              iconTheme: { primary: "#F43F5E", secondary: "hsl(222, 47%, 5%)" },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
