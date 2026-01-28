This repository, `Toolbox-2.0`, is a comprehensive project designed to provide a robust backend and a dynamic frontend client. It leverages modern technologies to create a scalable and efficient application. This README aims to provide a detailed overview of the project's structure, setup, and key components.

## Project Structure

The project is organized into two main directories: `backend` and `client`, along with several configuration files at the root level. This separation allows for independent development and deployment of the backend API and the frontend user interface.

### Root Directory Files

- `.env`: Environment variables for the project.
- `Dockerfile`: Dockerfile for the backend application.
- `Dockerfile.client`: Dockerfile for the client application.
- `docker-compose.yml`: Docker Compose file for orchestrating the backend and client services.

### `backend/` Directory

This directory contains the server-side application, built with Node.js given the `package-lock.json` and `nest-cli.json` files observed. It handles data processing, API endpoints, and business logic.

- `prisma/`: Contains Prisma schema and migrations for database management.
- `src/`: Source code for the backend application.
- `test/`: Unit and integration tests for the backend.
- `.babelrc`: Babel configuration file.
- `.env`: Environment variables specific to the backend.
- `.gitignore`: Specifies intentionally untracked files to ignore by Git.
- `.prettierrc`: Prettier configuration for code formatting.
- `README.md`: README file for the backend (if present, will be incorporated).
- `index.js`: Main entry point for the backend application.
- `jsconfig.json`: JavaScript language service configuration file.
- `nest-cli.json`: Configuration for the NestJS CLI.
- `nodemon.json`: Nodemon configuration for automatic server restarts during development.
- `package-lock.json`: Records the exact versions of dependencies.

### `backend/src/` Directory

This directory contains the server-side controllers, built with Node.js, controller and modules files observed. It handles data processing, API endpoints, and business logic.

- `common/environment`: Includes shared services such as the Shopify configuration service, which provides global access to environment variables through .env.
- `shopify-apis/inventory`: Contains the Inventory module and its controller, responsible for handling inventory-related API operations.
- `shopify-apis/marketing`: Houses the Marketing module and its controller, managing Shopify marketing data and related endpoints.
- `shopify-apis/order`: Includes the Order module and controller, which handle Shopify order data and transactions.
- `shopify-apis/product`: Manages product-related operations through its respective module and controller.
- `shopify-apis/shipping`: Contains the Shipping module and controller, responsible for shipping logic and integration with Shopify’s delivery systems.
- `shopify-apis/entity`: Contains the entities module and controller, responsible for entities logic and integration with Shopify’s delivery systems.
- `shopify-apis/product`: Manages product-related operations through its respective module and controller.
  {
  SKU
  Description
  Quantity
  }
- `shopify-apis/product/prices`: Manages product-related prices operations through its respective module and controller.
  {
  Country
  State
  Currency
  Price
  }
- `shopify-apis/product/quantities`: Manages product-related quantities operations through its respective module and controller.
  {
  SKU
  Channel
  Product location
  Quantities
  }
- `shopify-apis/product/locations`: Manages product-related locations operations through its respective module and controller.
  {
  Channel
  Stock location
  Inventory location
  }

### `client/` Directory

This directory houses the frontend application, which appears to be a React project based on the observed files like `vite.config.ts` and `tsconfig.app.json`. It provides the user interface and interacts with the backend API.

- `public/`: Static assets served directly by the web server.
- `src/`: Source code for the frontend application.
- `.gitignore`: Specifies intentionally untracked files to ignore by Git.
- `README.md`: README file for the client (if present, will be incorporated).
- `eslint.config.js`: ESLint configuration for code linting.
- `index.html`: Main HTML file for the frontend application.
- `package-lock.json`: Records the exact versions of dependencies.
- `package.json`: Defines project metadata and dependencies.
- `tsconfig.app.json`: TypeScript configuration for the application.
- `tsconfig.json`: Base TypeScript configuration.
- `vite.config.ts`: Vite configuration file.

## Getting Started

To get a copy of the project up and running on your local machine for development and testing purposes, follow these steps:

### Prerequisites

- Docker
- Docker Compose
- Node.js (for local development outside Docker)
- npm or Yarn (for local development outside Docker)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Our-Babylon-LLC/Toolbox-2.0.git
    cd Toolbox-2.0
    ```

2.  **Set up environment variables:**

    Create a `.env` file in the root directory and populate it with necessary environment variables. Refer to `config.txt` or any `.env.example` files within `backend/` or `client/` for required variables.

3.  **Build and run with Docker Compose:**

    ```bash
    docker-compose up --build
    ```

    This command will build the Docker images for both backend and client, and then start the services.

## Usage

Once the services are running, you can access the frontend application in your web browser, typically at `http://localhost:3000` (or as configured in your `docker-compose.yml`). The backend API will be accessible on a different port, usually `http://localhost:5000` (or as configured).

## Technologies Used

- **Backend:** Node.js, NestJS (inferred from `nest-cli.json`), Prisma
- **Frontend:** React, TypeScript, Vite
- **Containerization:** Docker, Docker Compose

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
