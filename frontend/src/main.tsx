import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import RoutesPages from "./Routes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        {/* <App /> */}
        <RoutesPages/>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);