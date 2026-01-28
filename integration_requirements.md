# Live Data Integration Requirements

To switch from "Demo Data" to **Live Production Data**, we need to connect the Toolbox Engine to your actual business systems (ERP, E-commerce, etc.). 

Please provide the following details for the systems you wish to integrate.

## 1. Odoo (ERP)
**Status:** ✅ Connector Ready (Just needs configuration)

We need the following credentials to connect to your Odoo instance:
- **Odoo URL**: (e.g., `https://mycompany.odoo.com`)
- **Database Name**: (e.g., `mycompany_prod`)
- **Username / Login**: (Email address of a user with API access)
- **Password / API Key**: (User password or generated API Key)

> **Note**: Ensure the user has read access to **Products** (`product.template`, `product.product`) and **Inventory**.

---

## 2. Shopify (E-Commerce)
**Status:** 🚧 Requires Development (Connector needs to be activated)

To enable Shopify integration, we need:
- **Shop URL**: (e.g., `my-shop.myshopify.com`)
- **Admin API Access Token**: (Generated from a Custom App in Shopify Admin)
  - **Scopes Required**: `read_products`, `read_orders`, `read_inventory`.

---

## 3. Custom / Legacy Systems (SAP, SQL, Excel, etc.)
**Status:** 🛠 Configurable via API

If your data lives in a legacy service or custom database, we have two options:

### Option A: "Push" Data to Toolbox (Simplest)
Your IT team can write a script to "push" data into our system using our API.
- **Endpoint**: `POST /api/data_source_data/push/:entityId`
- **Format**: JSON Array of objects.

### Option B: "Pull" Data (We fetch from you)
We need:
- **API Documentation**: How to fetch your data.
- **Authentication**: (API Key, Basic Auth, or OAuth details).
- **Firewall Whitelist**: If your server is private, we may need our IP whitelisted.
