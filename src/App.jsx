import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MenuProvider from "./context/MenuProvider.jsx";
import StorefrontPage from "./pages/StorefrontPage.jsx";

// Vite's BASE_URL is "/" by default, or "/jays-bistro/" for GitHub Pages builds (npm run build:ghpages).
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <MenuProvider>
        <Routes>
          <Route path="/" element={<StorefrontPage />} />
          {/* /menu is kept for SEO continuity (it is in sitemap.xml); it renders the same page scrolled to the menu. */}
          <Route path="/menu" element={<StorefrontPage scrollToMenu />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MenuProvider>
    </BrowserRouter>
  );
}
