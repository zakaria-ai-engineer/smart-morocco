import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppDataProvider } from "./context/AppDataContext";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./hooks/useLanguage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <FavoritesProvider>
            <BrowserRouter>
              <AppDataProvider>
                <App />
              </AppDataProvider>
            </BrowserRouter>
          </FavoritesProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
