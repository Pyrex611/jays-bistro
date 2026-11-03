import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MenuProvider from "../context/MenuProvider.jsx";
import StorefrontPage from "../pages/StorefrontPage.jsx";
import ProductModal from "../components/storefront/ProductModal.jsx";
import DishPreviewModal from "../components/merchant/DishPreviewModal.jsx";
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

  it("DishPreviewModal renders read-only dish view with Copy dish link button and edit pencil button", () => {
    const item = {
      id: 2,
      name: "Isi-ewu",
      price: 6000,
      category: "Protein",
      image: "menu/isi-ewu.jpg",
      imageStyle: "photo",
      isAvailable: true,
      featured: true,
      description: "Traditional spicy goat head delicacy.",
    };

    const html = renderToStaticMarkup(
      <DishPreviewModal item={item} icon="protein" onClose={() => {}} onEdit={() => {}} />,
    );

    // Read-only modal assertions
    expect(html).toContain("Isi-ewu");
    expect(html).toContain("₦6,000");
    expect(html).toContain("Traditional spicy goat head delicacy.");
    expect(html).toContain("In stock");
    expect(html).toContain("Featured");
    // "Copy dish link" button must be in this view-only modal
    expect(html).toContain("Copy dish link");
    expect(html).toContain("/menu?dish=2");
    // Pencil button heading to edit dish
    expect(html).toContain('aria-label="Edit Isi-ewu"');
    expect(html).toContain("Edit dish");
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