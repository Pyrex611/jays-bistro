import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import MenuProvider from "../context/MenuProvider.jsx";
import StorefrontPage from "../pages/StorefrontPage.jsx";

const render = (props = {}) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <MenuProvider>
        <StorefrontPage {...props} />
      </MenuProvider>
    </MemoryRouter>,
  );

describe("StorefrontPage (server render smoke test)", () => {
  const html = render();

  it("renders the branded header and the empty-tray state", () => {
    expect(html).toContain("Jay&#x27;s Bistro");
    expect(html).toContain("Open tray");
    expect(html).toContain("Your tray is empty");
  });

  it("renders the hero carousel, sub-hero and category pills", () => {
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html).toContain("More from the kitchen");
    ["All", "Meals", "Protein", "Starters", "Bites", "Beverages", "Soups"].forEach((name) => {
      expect(html).toContain(`<span>${name}</span>`);
    });
  });

  it("renders all 12 live products with a quick-add button each", () => {
    expect(html.match(/aria-label="Add [^"]+ to tray"/g)).toHaveLength(12);
  });

  it("does not render hidden catalogue items", () => {
    expect(html).not.toContain("Double Root");
  });

  it("renders the AI concierge entry point", () => {
    expect(html).toContain("Open AI concierge");
  });

  it("renders the /menu variant with its own title", () => {
    expect(render({ scrollToMenu: true })).toContain("Jay&#x27;s Bistro");
  });
});
