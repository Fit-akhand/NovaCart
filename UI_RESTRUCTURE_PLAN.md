# NovaCart UI/UX restructure plan

Direction: keep the purple brand and dark mode, make it consistent and simple.
Approach: rebuild in place on the Pages Router. Split big pages into small
shared components; the app keeps working after every phase.

Target customer flow: Home -> Browse/Search -> Product -> Cart -> Delivery -> Pay -> Order confirmation -> My orders.

## Phases
1. **Checkout flow** (done): Cart -> Delivery -> Payment stepper, always-visible
   order summary, shared Input/Button. `components/checkout/*`, `src/pages/cart.js` (1.7k -> ~450 lines).
2. **Shared foundation** (done: Field/Input/Textarea/Select/Card/PageHeader, dead files removed; legacy CSS in `styles/` still to retire as pages migrate): one set of form fields (Input, Textarea, Select), page header,
   card, badge, empty/error/loading states; delete duplicates (`components/Modal.js`,
   `components/Loading.js`, legacy CSS in `styles/`).
3. **Navigation + layout** (done: role-based `navConfig.js`, header 939->330 lines, mobile drawer 663->164, footer 262->76): simplify StoreHeader (939 lines) and MobileNav (663):
   logo, search, cart, account. Role-aware account menu. Footer trimmed.
4. **Browse flow**: home (1.6k lines) into section components, products page filters,
   product card, product detail page, deals.
5. **Account flow**: sign in / register (1.2k each) into one auth form component;
   profile (1.1k), address manager, order list and order detail with a status timeline.
6. **Seller + admin**: one dashboard layout, shared data table and form components;
   split categories (2.2k), heroes (1.8k), create product (1.3k), users (0.9k).
