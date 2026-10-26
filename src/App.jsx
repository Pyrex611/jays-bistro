import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MenuProvider from "./context/MenuProvider.jsx";
import StorefrontPage from "./pages/StorefrontPage.jsx";

// The merchant console and the invoice/receipt page are separate chunks: customers browsing the menu never download them.
const MerchantPage = lazy(() => import("./pages/MerchantPage.jsx"));
const InvoicePage = lazy(() => import("./pages/InvoicePage.jsx"));

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

const Loading = () => <div className="flex min-h-svh items-center justify-center bg-cream-100" role="status" aria-label="Loading"><div className="h-8 w-8 animate-spin rounded-full border-2 border-leaf-200 border-t-leaf-700" /></div>;

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <MenuProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<StorefrontPage />} />
            {/* /menu is kept for SEO continuity (it is in sitemap.xml); it renders the same page scrolled to the menu. */}
            <Route path="/menu" element={<StorefrontPage scrollToMenu />} />
            <Route path="/invoice/:id" element={<InvoicePage />} />
            <Route path="/merchant" element={<MerchantPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MenuProvider>
    </BrowserRouter>
  );
}
