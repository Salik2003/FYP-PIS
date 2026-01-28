# Toolbox 2.0 - Universal Data Engine & UI

Toolbox 2.0 is a comprehensive platform designed to unify data from various sources (Shopify, Odoo, etc.) into a single, cohesive interface. It consists of a powerful backend engine and a modern React-based frontend.

## 📂 Project Structure

-   **toolbox-engine-be-main**: The component-based backend engine (NestJS). Handles data fetching, synchronization, and API exposure.
-   **toolbox-ui**: The frontend dashboard (React, Material-UI). Provides data visualization, PIS (Product Information System), and administrative controls.
-   **toolbox-ds-shopify-main**: Data source connector for Shopify.
-   **toolbox-ds-odoo-babylon-main**: Data source connector for Odoo.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v16 or higher)
-   npm or yarn

### 1. Backend Setup (`toolbox-engine-be-main`)

1.  Navigate to the backend directory:
    ```bash
    cd toolbox-engine-be-main
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    -   Create a `.env` file in the root.
    -   Add necessary keys (e.g., `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_SHOP_URL`, `SHOPIFY_ACCESS_TOKEN`).
4.  Start the server:
    ```bash
    npm run start:dev
    ```
    The server will run on `http://localhost:3000` (or your configured port).
    
### 2. Frontend Setup (`toolbox-ui`)

1.  Navigate to the frontend directory:
    ```bash
    cd toolbox-ui
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The UI will be accessible at `http://localhost:5173`.

## ✨ Key Features

-   **Dashboard**: Real-time overview of products, orders, and integration status with visual metrics.
-   **PIS (Product Information System)**: 
    -   **Product View**: Custom columns for Vendor, SKU, Quantity, and Type. Detail drawer for quick insights.
    -   **Order View**: Specialized table for Orders showing Customer, Total, Payment & Fulfillment Status.
    -   **Deep Dive Details**: "View" action opens a side drawer with line items, shipping address, and customer details.
-   **Data Engine**: Configurable Job Runners to pull data from multiple sources.

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
