/**
 * Menu catalogue — Sprint 1 static data source.
 *
 * - `isActive: true`  → shown on the live storefront (the 12 items the current site sells).
 * - `isActive: false` → kept in the catalogue (from the legacy full menu) but hidden until switched on.
 * - `imageStyle`: "cutout" = transparent PNG shown on the dark card with a drop shadow (Bonti look);
 *                 "photo"  = rectangular photo shown full-bleed.
 *
 * Phase 2 replaces this file with a Supabase-backed source behind the same shape (see docs/DATA_MODEL.md).
 */
import isiEwuImg from "../assets/images/Isi-Ewu.jpg";
import arabianImg from "../assets/images/classic-arabian.jpg";
import caesarImg from "../assets/images/IMG_2113.PNG";
import basmatiImg from "../assets/images/IMG_2134.PNG";
import samosaImg from "../assets/images/IMG_2135.PNG";
import bunsImg from "../assets/images/IMG_2136.PNG";
import jollofImg from "../assets/images/IMG_2138.PNG";
import yamEggImg from "../assets/images/IMG_1989.PNG";

export const CATEGORIES = [
  { name: "Meals", icon: "🍛" },
  { name: "Protein", icon: "🥩" },
  { name: "Starters", icon: "🥟" },
  { name: "Bites", icon: "🍔" },
  { name: "Beverages", icon: "🥤" },
  { name: "Soups", icon: "🥣" },
];

export const MENU_ITEMS = [
  // ── Live menu (12) ───────────────────────────────────────────
  { id: 36, category: "Meals", name: "Basmati Fried Rice", price: 3500, description: "Premium long-grain Basmati stir-fry.", image: basmatiImg, imageStyle: "cutout", featured: true, isActive: true },
  { id: 3, category: "Beverages", name: "Classic Arabian Blend", price: 3000, description: "Heritage spice infusion with cardamom.", image: arabianImg, imageStyle: "photo", featured: true, isActive: true },
  { id: 1, category: "Meals", name: "Party Jollof Rice", price: 1500, description: "Signature smoky party jollof with grilled beef.", image: jollofImg, imageStyle: "cutout", featured: true, isActive: true },
  { id: 2, category: "Protein", name: "Isi-ewu", price: 6000, description: "Traditional spicy goat head delicacy.", image: isiEwuImg, imageStyle: "photo", featured: true, isActive: true },
  { id: 12, category: "Starters", name: "Spiced Meat Samosa", price: 1500, description: "Crispy pastry filled with spiced minced meat.", image: samosaImg, imageStyle: "cutout", featured: false, isActive: true },
  { id: 14, category: "Starters", name: "Puff Puff", price: 1500, description: "Classic Nigerian sweet fried dough balls.", image: bunsImg, imageStyle: "cutout", featured: false, isActive: true },
  { id: 19, category: "Bites", name: "6' Personal Pizza", price: 12000, description: "Personal size pizza loaded with cheese.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: true },
  { id: 21, category: "Bites", name: "Chicken Shawarma", price: 3500, description: "Creamy Chicken shawarma with Single Sausage.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: true },
  { id: 25, category: "Bites", name: "Chicken Caesar Salad", price: 7000, description: "Fresh greens, grilled chicken breast, and croutons.", image: caesarImg, imageStyle: "cutout", featured: false, isActive: true },
  { id: 48, category: "Meals", name: "Yam and Egg Sauce", price: 3000, description: "Boiled yam paired with savory egg sauce.", image: yamEggImg, imageStyle: "cutout", featured: false, isActive: true },
  { id: 51, category: "Protein", name: "Bistro Chicken Wings", price: 5000, description: "Succulent grilled wings in bistro glaze.", image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: true },
  { id: 62, category: "Soups", name: "Egusi Soup", price: 500, description: "Traditional rich and loaded melon soup.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: true },
  // ── Catalogue, not on the live menu yet (52) ─────────────────
  { id: 4, category: "Beverages", name: "Double Root (1L)", price: 3500, description: "Powerful herbal blend for vitality and wellness.", image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 5, category: "Beverages", name: "Ginger, Lemon & Cinnamon Tea", price: 2000, description: "Zesty, spicy, and soothing aromatic tea.", image: "https://images.unsplash.com/photo-1596332152435-0b0c26da4290?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 6, category: "Beverages", name: "Arabian Tea (1/2L)", price: 1500, description: "A smaller portion of our signature spice tea.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 7, category: "Beverages", name: "Arabian Double", price: 2000, description: "Extra strength Arabian blend for the bold.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 8, category: "Beverages", name: "Pure Honey (1L)", price: 10000, description: "Organic, undiluted locally sourced honey.", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 9, category: "Beverages", name: "Date Powder", price: 30000, description: "Natural sweetener alternative made from premium dates.", image: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 10, category: "Beverages", name: "Arabian Tea Pack", price: 6000, description: "Take home the Jay's experience. DIY Tea pack.", image: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 11, category: "Beverages", name: "Maca Root Pack", price: 6000, description: "Raw Maca root powder supplement.", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 13, category: "Starters", name: "Spring Roll", price: 3000, description: "Crispy rolls filled with fresh vegetables and meat.", image: "https://images.unsplash.com/photo-1548507200-dd918f830371?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 15, category: "Bites", name: "Fish Roll", price: 1000, description: "Flaky pastry rolled with a savory fish filling.", image: "https://images.unsplash.com/photo-1606335543042-57c525922933?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 16, category: "Bites", name: "Doughnut", price: 500, description: "Soft, fluffy, sugar-glazed classic doughnut.", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 17, category: "Bites", name: "Palmia", price: 500, description: "Crunchy, heart-shaped caramelized puff pastry.", image: "https://images.unsplash.com/photo-1612182062633-9524ca862134?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 18, category: "Bites", name: "Meat Pie", price: 1000, description: "Rich minced meat and potato filling in a buttery crust.", image: "https://images.unsplash.com/photo-1572383672419-ab47799d1d39?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 20, category: "Bites", name: "12' Pizza", price: 15000, description: "Large family-sized pizza with the cheesiest pull.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 22, category: "Bites", name: "Chicken Shawarma (DS)", price: 4000, description: "Loaded Chicken shawarma with Double Sausage.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 23, category: "Bites", name: "Beef Shawarma", price: 4500, description: "Tender spiced beef strips wrapped in flatbread.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 24, category: "Bites", name: "Combo Shawarma", price: 6000, description: "The ultimate mix of juicy chicken and beef.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 26, category: "Bites", name: "Coleslaw", price: 1000, description: "Freshly shredded cabbage and carrots in creamy dressing.", image: "https://images.unsplash.com/photo-1628156627622-426b384f7000?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 27, category: "Bites", name: "Vegetable Salad", price: 6000, description: "A healthy mix of fresh garden vegetables.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 28, category: "Meals", name: "Moi-Moi", price: 3000, description: "Rich steamed bean pudding garnished with egg/fish.", image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 29, category: "Meals", name: "Noodles", price: 2000, description: "Stir-fried noodles with signature spices.", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 30, category: "Meals", name: "Garnished Noodles", price: 3500, description: "Noodles stir-fried with vegetables and proteins.", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 31, category: "Meals", name: "Fried Rice", price: 1500, description: "Classic Nigerian fried rice with mixed veggies.", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 32, category: "Meals", name: "Coconut Rice", price: 2000, description: "Rice slow-cooked in fresh, rich coconut milk.", image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 33, category: "Meals", name: "Local Rice", price: 3000, description: "Traditional Ofada-style rice with distinct aroma.", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 34, category: "Meals", name: "Beans", price: 1500, description: "Soft, honey beans cooked to perfection.", image: "https://images.unsplash.com/photo-1582283083592-31ce60ea8fb2?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 35, category: "Meals", name: "Plantain", price: 1000, description: "Sweet fried plantain (Dodo).", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 37, category: "Meals", name: "Spaghetti", price: 3500, description: "Spaghetti in a rich, spicy tomato sauce.", image: "https://images.unsplash.com/photo-1597393437299-1307682970c3?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 38, category: "Meals", name: "Gizz Dodo", price: 4000, description: "Spicy mix of gizzards and fried plantains.", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 39, category: "Meals", name: "Chips & Omelette", price: 3500, description: "Fried potato chips served with a farm-fresh omelette.", image: "https://images.unsplash.com/photo-1599120666014-930d774a350c?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 40, category: "Meals", name: "Porridge Yam", price: 3000, description: "Asaro - Yam cooked in a rich palm oil sauce.", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 41, category: "Meals", name: "Masa", price: 1000, description: "Traditional Northern rice cakes, pan-fried.", image: "https://images.unsplash.com/photo-1626505927329-373a0332308e?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 42, category: "Meals", name: "Pounded Yam", price: 1200, description: "Smooth, stretchy pounded yam.", image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 43, category: "Meals", name: "Semo", price: 1000, description: "Soft Semovita swallow.", image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 44, category: "Meals", name: "Amala", price: 1000, description: "Classic Amala made by pros.", image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 45, category: "Meals", name: "Fufu", price: 1000, description: "Fresh Fufu with the best soups in Town.", image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 46, category: "Meals", name: "Garri", price: 1000, description: "Eba - with the right consistency.", image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 47, category: "Meals", name: "Yam Stick", price: 1500, description: "Fried yam batons, crispy on the outside.", image: "https://images.unsplash.com/photo-1623594611048-3608cc78949f?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 49, category: "Meals", name: "Eggs", price: 400, description: "Boiled or fried egg.", image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 50, category: "Protein", name: "Smoky Goat Pepper Soup", price: 3000, description: "Slow-simmered broth with tender smoked goat.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 52, category: "Protein", name: "Full Chicken", price: 20000, description: "Whole grilled chicken from the flaming grills.", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 53, category: "Protein", name: "Portion O' Chicken", price: 6000, description: "A generous serving of fried or grilled chicken.", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 54, category: "Protein", name: "Goat Meat", price: 1500, description: "Tender, seasoned goat meat.", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 55, category: "Protein", name: "Beef", price: 1500, description: "Succulent fried beef piece.", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 56, category: "Protein", name: "Portion of Beef/Goat", price: 4500, description: "A bowl of assorted savory meats.", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 57, category: "Protein", name: "Turkey", price: 6000, description: "Fried or grilled turkey wings.", image: "https://images.unsplash.com/photo-1598511726623-d09994539a95?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 58, category: "Protein", name: "Cat Fish (Portion)", price: 1000, description: "Fresh catfish slice in sauce.", image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 59, category: "Protein", name: "Croaker Fish", price: 4000, description: "Whole grilled or fried croaker.", image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 60, category: "Protein", name: "Nkwobi", price: 10000, description: "Spicy cow foot delicacy in native sauce.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 61, category: "Protein", name: "Vegetable Chicken", price: 20000, description: "Chicken stir-fry with mixed vegetables.", image: "https://images.unsplash.com/photo-1598511726623-d09994539a95?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 63, category: "Soups", name: "Vegetable Soup", price: 1500, description: "Nutritious Edikang Ikong style soup.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
  { id: 64, category: "Soups", name: "White Soup", price: 2000, description: "Ofe Nsala - Spicy traditional soup.", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800", imageStyle: "photo", featured: false, isActive: false },
];
