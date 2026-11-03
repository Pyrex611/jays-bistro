import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MenuProvider from "../context/MenuProvider.jsx";
import StorefrontPage from "../pages/StorefrontPage.jsx";
import ProductModal from "../components/storefront/ProductModal.jsx";
import ItemEditor from "../components/merchant/ItemEditor.jsx";
import { getDishUrl } from "../lib/format.js";

describe("Dish direct link & modal integration", () => {
  it("generates a canonical link for a dish with ?dish=:id", () => {
    const url = getDishUrl(1);
    expect(url).toContain("/menu?dish=1");
  });

  it("renders StorefrontPage with ProductModal open when ?dish=1 is in the URL", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/menu?dish=1"]}>
        <MenuProvider>
          <StorefrontPage />
        </MenuProvider>
      </MemoryRouter>,
    );
    expect(html).toContain('id="product-modal-title"');
    expect(html).toContain("Party Jollof Rice");
    expect(html).toContain("Share link");
    expect(html).toContain('aria-label="Share link for Party Jollof Rice"');
  });

  it("renders StorefrontPage with ProductModal open when using the direct /dish/:id route", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/dish/2"]}>
        <MenuProvider>
          <Routes>
            <Route path="/dish/:id" element={<StorefrontPage />} />
          </Routes>
        </MenuProvider>
      </MemoryRouter>,
    );
    expect(html).toContain('id="product-modal-title"');
    expect(html).toContain("Isi-ewu");
    expect(html).toContain("Share link");
  });

  it("ProductModal displays the dish details and action buttons", () => {
    const item = {
      id: 36,
      name: "Basmati Fried Rice",
      price: 3500,
      category: "Meals",
      image: "menu/basmati-fried-rice.png",
      imageStyle: "cutout",
      isAvailable: true,
      description: "Premium long-grain Basmati stir-fry.",
    };

    const html = renderToStaticMarkup(
      <ProductModal item={item} quantity={0} onClose={() => {}} onAdd={() => {}} onDecrement={() => {}} />,
    );

    expect(html).toContain("Basmati Fried Rice");
    expect(html).toContain("₦3,500");
    expect(html).toContain("Add to tray · ₦3,500");
    expect(html).toContain('aria-label="Share link for Basmati Fried Rice"');
  });

  it("ItemEditor in dashboard provides copyable direct customer link for existing meals", () => {
    const item = {
      id: 48,
      name: "Yam and Egg Sauce",
      price: 3000,
      category: "Meals",
      image: "menu/yam-and-egg-sauce.png",
      imageStyle: "cutout",
      isAvailable: true,
      description: "Boiled yam paired with savory egg sauce.",
    };

    const categories = [{ name: "Meals", icon: "meals" }];

    const html = renderToStaticMarkup(
      <ItemEditor item={item} categories={categories} onSave={() => {}} onDelete={() => {}} onClose={() => {}} />,
    );

    expect(html).toContain("Direct meal link");
    expect(html).toContain("/menu?dish=48");
    expect(html).toContain("Copy");
  });

  it("ItemEditor allows creating a new meal with image upload", () => {
    const blankItem = {
      id: 0,
      category: "Protein",
      name: "",
      price: 0,
      description: "",
      image: "",
      imageStyle: "cutout",
      featured: false,
      isActive: true,
      isAvailable: true,
    };

    const categories = [{ name: "Protein", icon: "protein" }];

    const html = renderToStaticMarkup(
      <ItemEditor item={blankItem} categories={categories} onSave={() => {}} onDelete={() => {}} onClose={() => {}} />,
    );

    expect(html).toContain("Add a dish");
    expect(html).toContain("Upload photo");
    expect(html).toContain("Add to menu");
  });
});