import isiEwuImg from '../assets/images/Isi-Ewu.jpg';
import arabianImg from '../assets/images/classic-arabian.jpg';
import ceasarImg from '../assets/images/IMG_2113.PNG';
import basmatiImg from '../assets/images/IMG_2134.PNG';
import samosaImg from '../assets/images/IMG_2135.PNG';
import bunsImg from '../assets/images/IMG_2136.PNG';
import jollofImg from '../assets/images/IMG_2138.PNG';
import yamEggImg from '../assets/images/IMG_1989.PNG';

export const WHATSAPP_NUMBER = "2348062624447";
export const CHATBOT_API_KEY = "PLACEHOLDER_GEMINI_API_KEY_A1B2C3D4E5F6G7H8I9";

export const CATEGORIES = [
  { key: "All", label: "All" },
  { key: "Meals", label: "Meals" },
  { key: "Beverages", label: "Beverages" },
  { key: "Protein", label: "Protein" },
  { key: "Starters", label: "Starters" },
  { key: "Bites", label: "Bites" },
  { key: "Soups", label: "Soups" },
];

export const INITIAL_MENU_ITEMS = [
  /* ============================================================
     MAIN HERO CAROUSEL SPECIALS (Defaults: Shawarma, Wings, Basmati, Jollof, Isi-Ewu)
     ============================================================ */
  {
    id: 21,
    name: "Chicken Shawarma (SS)",
    tagline: "Juicy wrap with single sausage & garlic glaze",
    category: "Bites",
    price: 3500,
    description: "Thinly sliced grilled chicken fillet wrapped in freshly baked flatbread with creamy garlic sauce, crisp cabbage, and a smoky sausage.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800",
    isHero: true,
    isDualGrid: null,
    featured: true
  },
  {
    id: 51,
    name: "Bistro Chicken Wings",
    tagline: "Succulent grilled wings in spiced honey glaze",
    category: "Protein",
    price: 5000,
    description: "Jumbo chicken wings marinated in scotch bonnet, ginger, garlic, and wild honey, fire-grilled to crispy caramelized perfection.",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=800",
    isHero: true,
    isDualGrid: null,
    featured: true
  },
  {
    id: 36,
    name: "Basmati Fried Rice",
    tagline: "Premium aromatic stir-fry with liver & sweet peas",
    category: "Meals",
    price: 3500,
    description: "Premium long-grain Basmati stir-fried with farm-fresh garden peas, sweet corn, diced carrots, seasoned liver, and rich herb broth.",
    image: basmatiImg,
    isHero: true,
    isDualGrid: null,
    featured: true
  },
  {
    id: 1,
    name: "Party Jollof Rice",
    tagline: "Firewood smoky Lagos recipe with seasoned beef",
    category: "Meals",
    price: 1500,
    description: "Authentic wood-smoked party jollof rice simmered in rich tomato-habanero reduction, served with succulent seasoned beef.",
    image: jollofImg,
    isHero: true,
    isDualGrid: null,
    featured: true
  },
  {
    id: 2,
    name: "Isi-Ewu Royal",
    tagline: "Traditional goat head delicacy with utazi leaves",
    category: "Protein",
    price: 6000,
    description: "Tender goat head slow-cooked and simmered in a spiced potash, palm oil, and calabash nutmeg sauce, garnished with fresh utazi leaves.",
    image: isiEwuImg,
    isHero: true,
    isDualGrid: null,
    featured: true
  },

  /* ============================================================
     SUB-HERO DUAL SPOTLIGHT (Defaults: Classic Arabian Blend & Double Root)
     ============================================================ */
  {
    id: 3,
    name: "Classic Arabian Blend",
    tagline: "Heritage cardamom & rosewater infusion (1L)",
    category: "Beverages",
    price: 3000,
    description: "Our signature 1L heritage spice infusion slowly steeped with crushed green cardamom, saffron threads, dried rosewater petals, and organic honey.",
    image: arabianImg,
    isHero: false,
    isDualGrid: "left",
    featured: true
  },
  {
    id: 4,
    name: "Double Root (1L)",
    tagline: "Vitality herbal blend for strength & wellness",
    category: "Beverages",
    price: 3500,
    description: "Potent traditional root tonic brewed with ginger root, ginseng extract, and natural botanical bark.",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=800",
    isHero: false,
    isDualGrid: "right",
    featured: true
  },

  /* ============================================================
     CATALOG ITEMS (Complete and Unabridged)
     ============================================================ */
  {
    id: 5,
    name: "Ginger, Lemon & Cinnamon Tea",
    tagline: "Zesty, spicy, and soothing",
    category: "Beverages",
    price: 2000,
    description: "Hot comforting aromatic tea infused with crushed ginger, fresh lemon slices, and Ceylon cinnamon.",
    image: "https://images.unsplash.com/photo-1596332152435-0b0c26da4290?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 6,
    name: "Arabian Tea (1/2L)",
    tagline: "Half-liter signature spiced tea",
    category: "Beverages",
    price: 1500,
    description: "A half-liter serving of our famous aromatic spiced blend, lightly sweetened with honey.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 7,
    name: "Arabian Double",
    tagline: "Extra strength spiced tea",
    category: "Beverages",
    price: 2000,
    description: "Double-steeped Arabian spice blend crafted for tea enthusiasts seeking bold herbal warmth.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 8,
    name: "Pure Honey (1L)",
    tagline: "Raw organic Makurdi honey",
    category: "Beverages",
    price: 10000,
    description: "Directly harvested from Makurdi bee farms, unfiltered and naturally sweet.",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 9,
    name: "Date Powder",
    tagline: "Natural organic sweetener",
    category: "Beverages",
    price: 30000,
    description: "Finely ground premium Northern dates. High in dietary fiber and ideal for healthy sweetening.",
    image: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 10,
    name: "Arabian Tea Pack",
    tagline: "DIY take-home tea pack",
    category: "Beverages",
    price: 6000,
    description: "Dry tea blend pack containing cardamom pods, cinnamon bark, and premium tea leaves for home brewing.",
    image: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 11,
    name: "Maca Root Pack",
    tagline: "Raw organic wellness powder",
    category: "Beverages",
    price: 6000,
    description: "Finely pulverized organic Maca root known for vitality and sustained energy.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 12,
    name: "Spiced Meat Samosa",
    tagline: "Golden crispy triangular pastry",
    category: "Starters",
    price: 1500,
    description: "Crispy pastry pockets loaded with seasoned minced beef, scallions, and chili flakes.",
    image: samosaImg
  },
  {
    id: 13,
    name: "Spring Roll",
    tagline: "Crunchy vegetable & beef roll",
    category: "Starters",
    price: 3000,
    description: "Golden fried rolls filled with julienned cabbage, carrots, minced beef, and sweet soy notes.",
    image: "https://images.unsplash.com/photo-1548507200-dd918f830371?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 14,
    name: "Puff Puff",
    tagline: "Sweet golden fried dough spheres",
    category: "Starters",
    price: 1500,
    description: "Fluffy and airy deep-fried yeast dough flavored with grated nutmeg and light brown sugar.",
    image: bunsImg
  },
  {
    id: 15,
    name: "Fish Roll",
    tagline: "Savory pastry with spiced fish",
    category: "Bites",
    price: 1000,
    description: "Baked flaky dough rolled around seasoned mackerel flakes and aromatic pepper mix.",
    image: "https://images.unsplash.com/photo-1606335543042-57c525922933?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 16,
    name: "Doughnut",
    tagline: "Glazed pillowy doughnut",
    category: "Bites",
    price: 500,
    description: "Soft sweet doughnut dusted with powdered confectioners sugar.",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 17,
    name: "Palmia",
    tagline: "Caramelized heart-shaped puff pastry",
    category: "Bites",
    price: 500,
    description: "French style elephant-ear pastry baked till golden and crunchy with caramelized sugar.",
    image: "https://images.unsplash.com/photo-1612182062633-9524ca862134?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 18,
    name: "Meat Pie",
    tagline: "Buttery pastry loaded with meat & potatoes",
    category: "Bites",
    price: 1000,
    description: "Flaky shortcrust pastry stuffed with minced beef, cubed potatoes, and carrots in seasoned gravy.",
    image: "https://images.unsplash.com/photo-1572383672419-ab47799d1d39?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 19,
    name: "6' Personal Pizza",
    tagline: "Cheesy personal pan pizza",
    category: "Bites",
    price: 12000,
    description: "Baked with herb tomato marinara, mozzarella cheese melt, beef chunks, and bell peppers.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 20,
    name: "12' Family Pizza",
    tagline: "Large pizza with double cheese pull",
    category: "Bites",
    price: 15000,
    description: "Large 12-inch pizza loaded with pepperoni, grilled chicken slices, black olives, and double mozzarella.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 22,
    name: "Chicken Shawarma (DS)",
    tagline: "Loaded chicken wrap with double sausage",
    category: "Bites",
    price: 4000,
    description: "Double the sausage, loaded with chicken shawarma meat and spicy garlic sauce.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 23,
    name: "Beef Shawarma",
    tagline: "Tender spiced beef strips in pita",
    category: "Bites",
    price: 4500,
    description: "Slow roasted sirloin beef strips seasoned with sumac and garlic wrapped in warm flatbread.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 24,
    name: "Combo Shawarma",
    tagline: "Chicken and beef combo loaded wrap",
    category: "Bites",
    price: 6000,
    description: "The ultimate bistro wrap packed with grilled chicken chunks, tender beef strips, and creamy dressings.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 25,
    name: "Chicken Caesar Salad",
    tagline: "Crisp romaine with grilled chicken & croutons",
    category: "Bites",
    price: 7000,
    description: "Crispy salad greens tossed with creamy Caesar dressing, garlic croutons, and grilled chicken breast.",
    image: ceasarImg
  },
  {
    id: 26,
    name: "Creamy Coleslaw",
    tagline: "Shredded cabbage and carrots in dressing",
    category: "Bites",
    price: 1000,
    description: "Crunchy green cabbage, purple cabbage, and sweet carrots tossed in house cream dressing.",
    image: "https://images.unsplash.com/photo-1628156627622-426b384f7000?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 27,
    name: "Garden Vegetable Salad",
    tagline: "Fresh harvest greens with vinaigrette",
    category: "Bites",
    price: 6000,
    description: "Cucumbers, cherry tomatoes, sweet bell peppers, red onions, and sweet corn on crisp lettuce.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 28,
    name: "Moi-Moi Deluxe",
    tagline: "Steamed bean cake with boiled egg",
    category: "Meals",
    price: 3000,
    description: "Pureed black-eyed beans blended with red bell peppers, crayfish, and spices, steamed to velvety perfection.",
    image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 29,
    name: "Classic Noodles",
    tagline: "Stir-fried noodles with scallions",
    category: "Meals",
    price: 2000,
    description: "Noodles flash-cooked in rich broth with scallions and chili seasoning.",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 30,
    name: "Garnished Noodles",
    tagline: "Noodles with beef sausages & vegetables",
    category: "Meals",
    price: 3500,
    description: "Indomie noodles stir-fried with diced hotdog sausages, carrots, sweet peas, and fried egg.",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 31,
    name: "Nigerian Fried Rice",
    tagline: "Classic party fried rice with vegetables",
    category: "Meals",
    price: 1500,
    description: "Seasoned rice tossed with curry, thyme, beef liver bits, carrots, and sweet green peas.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 32,
    name: "Coconut Rice",
    tagline: "Rice slow-cooked in fresh coconut milk",
    category: "Meals",
    price: 2000,
    description: "Aromatic white rice simmered in freshly extracted rich coconut milk with dry fish flakes and chili.",
    image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 33,
    name: "Local Ofada Rice",
    tagline: "Indigenous unpolished rice with ayamase",
    category: "Meals",
    price: 3000,
    description: "Indigenous fermented grain rice celebrated for its earthy fragrance, served with Ayamase relish.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 34,
    name: "Honey Beans (Ewa)",
    tagline: "Soft honey beans in palm oil sauce",
    category: "Meals",
    price: 1500,
    description: "Slow-cooked honey beans stewed in spicy red palm oil reduction.",
    image: "https://images.unsplash.com/photo-1582283083592-31ce60ea8fb2?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 35,
    name: "Fried Sweet Plantain (Dodo)",
    tagline: "Caramelized ripe plantain slices",
    category: "Meals",
    price: 1000,
    description: "Ripe plantains sliced and fried to a deep golden, caramelized sweetness.",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 37,
    name: "Spicy Bistro Spaghetti",
    tagline: "Spaghetti in spicy beef & pepper sauce",
    category: "Meals",
    price: 3500,
    description: "Italian spaghetti tossed in a fiery Nigerian pepper puree with minced beef and fresh basil.",
    image: "https://images.unsplash.com/photo-1597393437299-1307682970c3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 38,
    name: "Gizdodo Special",
    tagline: "Spicy chicken gizzard and plantain toss",
    category: "Meals",
    price: 4000,
    description: "Deep fried ripe plantain cubes and tender diced gizzards smothered in rich bell pepper salsa.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 39,
    name: "Chips & Omelette",
    tagline: "Crispy fries with two-egg herb omelette",
    category: "Meals",
    price: 3500,
    description: "Golden fried potato batons served with fluffy two-egg omelette made with tomatoes and onions.",
    image: "https://images.unsplash.com/photo-1599120666014-930d774a350c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 40,
    name: "Asaro (Porridge Yam)",
    tagline: "Mashed yam simmered with palm oil & fish",
    category: "Meals",
    price: 3000,
    description: "Yam tubers boiled and simmered in palm oil with dried smoked fish, crayfish, and aromatic spinach.",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 41,
    name: "Masa Cakes",
    tagline: "Northern rice cakes pan-fried",
    category: "Meals",
    price: 1000,
    description: "Crispy puffed rice sourdough cakes cooked in specialized pans, served with spicy yaji pepper.",
    image: "https://images.unsplash.com/photo-1626505927329-373a0332308e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 42,
    name: "Pounded Yam (Iyan)",
    tagline: "Smooth stretchy pounded yam",
    category: "Meals",
    price: 1200,
    description: "Velvety smooth pounded white yam, the ultimate pairing for any authentic native soup.",
    image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 43,
    name: "Semovita (Semo)",
    tagline: "Light and fluffy semolina swallow",
    category: "Meals",
    price: 1000,
    description: "Carefully stirred semolina wheat flour, soft and pillowy.",
    image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 44,
    name: "Amala Dudu",
    tagline: "Classic dark yam flour swallow",
    category: "Meals",
    price: 1000,
    description: "Traditional sun-dried yam flour whipped into silky dark morsels.",
    image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 45,
    name: "Fresh Fufu (Akpu)",
    tagline: "Freshly made cassava swallow",
    category: "Meals",
    price: 1000,
    description: "Authentic fermented cassava cooked into a satisfying dense swallow.",
    image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 46,
    name: "Eba (Yellow Garri)",
    tagline: "Firm fermented cassava mash",
    category: "Meals",
    price: 1000,
    description: "Smoothly turned yellow Ijebu garri prepared with boiling spring water.",
    image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 47,
    name: "Yam Sticks",
    tagline: "Crispy fried yam batons",
    category: "Meals",
    price: 1500,
    description: "White yam sliced into fingers and fried until crunchy outside and fluffy inside.",
    image: "https://images.unsplash.com/photo-1623594611048-3608cc78949f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 48,
    name: "Boiled Yam & Egg Sauce",
    tagline: "Steamed yam with spicy egg relish",
    category: "Meals",
    price: 3000,
    description: "Fluffy white yam slices accompanied by scrambled eggs in sautéed tomato and habanero relish.",
    image: yamEggImg
  },
  {
    id: 49,
    name: "Fresh Farm Eggs (2)",
    tagline: "Two fried or boiled eggs",
    category: "Meals",
    price: 400,
    description: "Two farm-fresh eggs prepared sunny side up, boiled, or scrambled with onions.",
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 50,
    name: "Smoky Goat Pepper Soup",
    tagline: "Hot aromatic pepper broth with tender goat",
    category: "Protein",
    price: 3000,
    description: "Rich herbal broth infused with alligator pepper, uziza seeds, and tender chunks of goat meat.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 52,
    name: "Full Flame Grilled Chicken",
    tagline: "Whole rotisserie chicken",
    category: "Protein",
    price: 20000,
    description: "An entire farm chicken rubbed in our secret bistro spice blend and slow-roasted over wood charcoal.",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 53,
    name: "Portion O' Chicken",
    tagline: "Generous quarter fried or grilled chicken",
    category: "Protein",
    price: 6000,
    description: "A large portion of succulent chicken breast or thigh, spiced and grilled to perfection.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 54,
    name: "Spicy Goat Meat Chunk",
    tagline: "Tender seasoned goat cutlet",
    category: "Protein",
    price: 1500,
    description: "A single large cutlet of tender goat meat braised with scotch bonnets and onions.",
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 55,
    name: "Bistro Beef Cutlet",
    tagline: "Fried tender beef chunk",
    category: "Protein",
    price: 1500,
    description: "Succulent cut of beef deep-fried and tossed in pepper reduction.",
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 56,
    name: "Assorted Meat Bowl",
    tagline: "Bowl of seasoned beef, tripe & goat",
    category: "Protein",
    price: 4500,
    description: "A delicious mix of beef, shaki (tripe), and tender goat meat in rich pepper gravy.",
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 57,
    name: "Golden Fried Turkey",
    tagline: "Generous seasoned turkey wing",
    category: "Protein",
    price: 6000,
    description: "Generous meaty turkey wing seasoned in garlic, ginger, and bouillon, fried crispy.",
    image: "https://images.unsplash.com/photo-1598511726623-d09994539a95?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 58,
    name: "Cat Fish Cutlet",
    tagline: "Fresh catfish slice in aromatic sauce",
    category: "Protein",
    price: 1000,
    description: "Fresh Benue River catfish cutlet steamed in spicy aromatic sauce.",
    image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 59,
    name: "Whole Croaker Fish",
    tagline: "Deep fried or grilled ocean fish",
    category: "Protein",
    price: 4000,
    description: "Whole scaled croaker seasoned with dry pepper and grilled tender.",
    image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 60,
    name: "Spicy Nkwobi",
    tagline: "Cow foot chunks in thick native sauce",
    category: "Protein",
    price: 10000,
    description: "Cooked cow foot tossed in traditional spicy palm oil paste with utazi leaves.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 61,
    name: "Vegetable Chicken Sauté",
    tagline: "Chicken breast stir-fried with vegetables",
    category: "Protein",
    price: 20000,
    description: "Family portion of shredded chicken breast stir-fried with bell peppers, sweet carrots, and broccoli.",
    image: "https://images.unsplash.com/photo-1598511726623-d09994539a95?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 62,
    name: "Rich Egusi Soup",
    tagline: "Thick melon seed soup with spinach",
    category: "Soups",
    price: 500,
    description: "Hand-rolled melon seed cakes simmered in palm oil with stockfish, crayfish, and tender greens.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 63,
    name: "Vegetable Soup (Edikang Ikong)",
    tagline: "Nutritious ugu and waterleaf soup",
    category: "Soups",
    price: 1500,
    description: "Nutritious combination of fresh ugu and waterleaf leaves simmered with dried fish and periwinkles.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 64,
    name: "Ofe Nsala (White Soup)",
    tagline: "Spicy traditional soup without palm oil",
    category: "Soups",
    price: 2000,
    description: "Delicate and spicy broth thickened with pounded yam, flavored with uyayak and fresh catfish.",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800"
  }
];