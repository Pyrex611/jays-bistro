# Data model (Sprint 2: JSON in S3)

> **Postgres/Supabase design (Sprint 1 draft) is superseded by [ADR-0005](adr/0005-s3-storage-and-password-lock.md).** It is kept at the bottom as an archive.

## Objects

### `data/menu.json` — the published menu (one versioned document)
```json
{
  "version": 3, "updatedAt": "2026-10-26T09:00:00Z",
  "categories": [{ "name": "Meals", "icon": "meals" }],
  "items": [{ "id": 1, "category": "Meals", "name": "Party Jollof Rice", "price": 1500, "description": "…",
              "image": "menu/party-jollof-rice.png | https://…/images/x.webp", "imageStyle": "cutout|photo",
              "featured": true, "isActive": true, "isAvailable": true }],
  "layout": { "heroIds": [1, 36], "subheroIds": [21, 51] },
  "settings": { "acceptingOrders": true, "deliveryEnabled": true, "deliveryFee": 0, "minOrder": 0 }
}
```
Validated by `src/lib/menuDoc.js` (browser + server). Limits: name 2–80, description ≤ 280, whole-naira price, https/`menu/` images only, hero ≤ 6, sub-hero ≤ 2, ≤ 500 items. Saves need the `baseVersion` the editor loaded (409 otherwise).

### `invoices/pending/<id>.json` → `receipts/<yyyy>/<mm>/<id>.json`
```json
{ "id": "20261026abcdefghijklmnop", "code": "JB-ABCDE", "status": "pending|paid", "channel": "web|whatsapp",
  "createdAt": "…", "expiresAt": "… (+24h)",
  "items": [{ "id": 1, "name": "…", "unitPrice": 1500, "quantity": 2, "lineTotal": 3000 }],
  "subtotal": 3000, "deliveryFee": 500, "total": 3500, "fulfilment": "pickup|delivery",
  "customer": { "name": "", "email": "", "phone": "234…", "address": "", "note": "" },
  "attempts": [{ "reference": "<id>-1", "at": "…", "fulfilment": "…", "deliveryFee": 0, "total": 3500, "amountKobo": 350000 }],
  "payment": { "reference": "<id>-1", "channel": "card|bank_transfer|ussd|…", "paidAt": "…", "amount": 3500, "currency": "NGN", "mode": "live|mock" } }
```
`id` = date (8 digits) + 16 base32 chars (80 random bits). Item names and prices are **snapshotted** so receipts never change when the menu does.

### `config/merchant.json`
`{ "algo": "scrypt", "N": 16384, "r": 8, "p": 1, "salt": "<b64>", "hash": "<b64>", "updatedAt": "…" }`

## Lifecycle rules (S3)
`invoices/pending/` → expire after 3 days · `config/attempts/` → expire after 1 day · everything else kept.

## Analytics definitions (Orders tab)
Sales = Σ `total` of receipts in range · Orders = count · Average = sales ÷ orders · Top sellers = Σ quantity and revenue per item · Daily = by Lagos date of `payment.paidAt`. Unpaid invoices never count.

---
## Archive: Sprint 1 Postgres draft (superseded)
## Tables

```sql
-- Roles
create type app_role as enum ('owner','staff');
create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  role app_role not null,
  display_name text
);

create table categories (
  id serial primary key,
  name text unique not null,
  icon text not null default '🍽️',
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table menu_items (
  id serial primary key,              -- keeps today's ids (1..64): chatbot + history stay valid
  category_id int not null references categories,
  name text not null check (length(name) between 2 and 80),
  description text not null default '' check (length(description) <= 280),
  price int not null check (price > 0),
  image_url text,
  image_style text not null default 'photo' check (image_style in ('cutout','photo')),
  tags text[] not null default '{}',
  featured boolean not null default false,
  is_active boolean not null default true,     -- shown on the menu at all
  is_available boolean not null default true,  -- "sold out today" toggle (staff may flip this)
  sort_order int not null default 0,
  archived_at timestamptz,                     -- soft delete
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table layout_slots (
  id serial primary key,
  slot text not null check (slot in ('hero','subhero')),
  position int not null,
  kind text not null check (kind in ('item','promo')),
  item_id int references menu_items,
  -- promo fields (kind = 'promo')
  title text, subtitle text, image_url text,
  cta_type text check (cta_type in ('item','category','link')), cta_value text,
  starts_at timestamptz, ends_at timestamptz,
  is_active boolean not null default true,
  check ((kind = 'item' and item_id is not null) or (kind = 'promo' and title is not null))
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                   -- e.g. JB-4821, echoed in the WhatsApp message
  status text not null default 'sent' check (status in ('sent','confirmed','delivered','cancelled')),
  total int not null,
  via_concierge boolean not null default false,
  customer_name text, customer_phone text,     -- optional, consented
  session_id text,                             -- anonymous
  created_at timestamptz default now(),
  confirmed_at timestamptz
);

create table order_items (
  order_id uuid references orders on delete cascade,
  item_id int references menu_items,
  name text not null,        -- snapshot: history survives edits/archival
  unit_price int not null,   -- snapshot
  quantity int not null check (quantity between 1 and 20),
  primary key (order_id, item_id)
);

create table events (
  id bigserial primary key,
  session_id text not null,
  name text not null,        -- product_view, add_to_cart, cart_open, checkout_click, chat_open, chat_message, promo_click
  props jsonb not null default '{}',
  created_at timestamptz default now()
);

create table audit_log (
  id bigserial primary key,
  actor uuid references auth.users,
  action text not null, entity text not null, entity_id text,
  before jsonb, after jsonb,
  created_at timestamptz default now()
);
```

## RLS policy sketch
| Table | Anonymous | Staff | Owner |
|---|---|---|---|
| categories, menu_items, layout_slots | `select` where active & not archived (& within schedule) | `update menu_items.is_available` only | full |
| orders, order_items | none (create only via `create_order` RPC) | read, update `status` | full |
| events | `insert` only (rate-limited) | none | read |
| audit_log | none | none | read |
| profiles | none | read self | full |

Helper functions: `is_staff()` / `is_owner()` read `profiles` by `auth.uid()`. A trigger writes `audit_log` on every change to `menu_items`, `categories`, `layout_slots`.

## Storage
Bucket `menu-images`: public read, write owner only. Path `items/{id}-{hash}.webp`. Client resizes to ≤ 1000 px and encodes WebP before upload; cutouts must be PNG/WebP with alpha.

## Analytics definitions
| Metric | Definition |
|---|---|
| Revenue | Σ `orders.total` where status ∈ (confirmed, delivered) |
| Orders | count of the same set |
| AOV | revenue ÷ orders |
| Intent revenue | Σ `total` of `sent` orders (shown separately, never mixed into revenue) |
| Top items | Σ `order_items.quantity` and Σ `quantity × unit_price`, confirmed orders |
| Funnel | distinct `session_id` per stage: visit → product_view → add_to_cart → cart_open → checkout_click → confirmed order |
| Concierge-assisted share | orders with `via_concierge` ÷ orders |
| Peak times | confirmed orders grouped by hour (Africa/Lagos) × weekday |
| Dead items | active items with 0 units in the last 30 days |

## Migration from Sprint 1 data
`src/data/menu.js` → seed script; ids preserved; local images uploaded to Storage; `data/layout.js` → `layout_slots`.
