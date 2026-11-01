# INTENT: Jay's Bistro E-Commerce Modernization Platform

## 1. Executive Summary & Problem Statement
Jay's Bistro is a premier dining and culinary destination based in Makurdi, Benue State, Nigeria, specializing in smoky Nigerian hearth delicacies (Party Jollof Rice, Isi-Ewu, Agbado Asun) and intercontinental favorites. 

The previous platform suffered from:
1. **Low Mobile Conversion Velocity**: Overly verbose multi-page desktop paradigms that felt detached on mobile smartphones where over 92% of Nigerian orders originate.
2. **Disconnected Visual Hierarchy**: The browsing experience did not celebrate the visual beauty of the food or support rapid discovery.
3. **Operational Blind Spots**: Lack of an integrated dashboard for store managers to adjust real-time pricing, feature special dishes on carousels, or monitor demand.

## 2. Core Strategic Goals
- **Adopt the Bonti Mobile-First UX Blueprint**: Implement an ultra-responsive, app-like mobile frame with fluid snap-scrolling hero carousels, asymmetrical dual-spotlight feature grids, fast category pills, and high-contrast culinary cards.
- **Maintain Omnichannel Ordering via WhatsApp**: Generate clean, itemized WhatsApp order payloads directed to Jay's Bistro ordering line (`+234 806 262 4447`).
- **Retain the Gemini-Powered AI Concierge**: Provide an interactive culinary assistant capable of answering dietary queries and directly modifying the customer's tray in real time via structured JSON actions.
- **Integrated Merchant Control & Sales Analytics**: Provide a zero-friction store management dashboard allowing bistro managers to:
  - Add, edit, and remove menu items.
  - Designate dishes as Hero Carousel slides or Dual Spotlight highlights.
  - Review live sales statistics, average order values, and inventory performance.

## 3. Brand Identity & Design System
- **Primary Palette**: Warm Caramel (`#BE7C3F`, `#DEB077`, `#4E2F19`) and Deep Pearl Ash (`#1A1A1A`, `#2C1A10`, `#5E3D28`) reflecting rich palm oils, grilled spices, and artisan wood-fired presentation.
- **Typography**: Inter / Plus Jakarta Sans for legibility and clear numerical hierarchy.
- **Currency**: Nigerian Naira (₦) with clean thousand-separator formatting.

## 4. Multi-Sprint Phasing
- **Sprint 1 (Current)**:
  - Comprehensive layout modernization to the Bonti mobile-first frame.
  - Integration of Jay's Bistro assets, catalog (all 64 items), and Gemini AI chatbot.
  - Client-side Admin Dashboard with item management and sales analytics engine.
  - Unabridged codebase and automated packaging.
- **Sprint 2 (Next)**:
  - Persistent REST / Cloud Database backend for dynamic multi-terminal menu synchronization.
  - Manager authentication (Role-Based Access Control).
- **Sprint 3**:
  - Live kitchen display system (KDS) and automated SMS/WhatsApp order tracking.