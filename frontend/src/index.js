import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// This creates the React root inside the public/index.html file.
const root = ReactDOM.createRoot(document.getElementById("root"));

// This renders the whole React app into the browser.
root.render(<App />);
