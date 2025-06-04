# VideoGame API

A comprehensive REST API for managing the greatest video games, featuring:

- **Authentication** with JSON Web Tokens (JWT)
- **Image upload** and processing (resize) with `sharp`
- **Storage** of images on Netlify Blobs CDN (`@netlify/blobs`)
- **CRUD** operations for games, including filtering, pagination, and Algolia-powered search
- **OpenAPI (Swagger)** documentation
- **Unit tests** with Jest and Supertest
- **Code organized** into controllers, routes, middleware, and models
- Built with **Node.js**, **Express**, and **MongoDB** (Mongoose)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Variables](#environment-variables)
4. [Project Structure](#project-structure)
5. [Usage](#usage)
    - [Seeding the Database](#seeding-the-database)
    - [Starting the Server](#starting-the-server)
    - [API Documentation (Swagger)](#api-documentation-swagger)
6. [API Endpoints](#api-endpoints)
    - [Auth Routes](#auth-routes)
    - [Games Routes](#games-routes)
7. [Algolia Integration](#algolia-integration)
8. [Netlify Blobs Integration](#netlify-blobs-integration)
9. [Testing](#testing)
10. [License](#license)

---

## Prerequisites

- **Node.js** (v16+ recommended, Node 18+ tested)
- **npm** (comes with Node.js)
- **MongoDB** (local or Atlas cluster)
- **Algolia Account** (for search, free tier available)
- **Netlify Account** (for Blobs, free tier available)

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd videogame-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Fill in the environment variables** in `.env` (see the next section).

---

## Environment Variables

Rename `.env.example` to `.env` and set the following:

```env
# MongoDB connection URI (local or Atlas)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/videogames?retryWrites=true&w=majority

# JWT secret key
JWT_SECRET=YourSuperSecretKey

# Algolia credentials
ALGOLIA_APP_ID=YourAlgoliaAppID
ALGOLIA_ADMIN_KEY=YourAlgoliaAdminAPIKey
ALGOLIA_SEARCH_KEY=YourAlgoliaSearchOnlyAPIKey

# Netlify Blobs token
NETLIFY_BLOBS_TOKEN=YourNetlifyBlobsAccessToken
```

- **MONGO_URI**: Connection string to MongoDB. For Atlas, include database name (e.g., `videogames`).
- **JWT_SECRET**: A random string to sign JWT tokens.
- **ALGOLIA_APP_ID / ALGOLIA_ADMIN_KEY / ALGOLIA_SEARCH_KEY**: Credentials from your Algolia dashboard.
- **NETLIFY_BLOBS_TOKEN**: Token from your Netlify Blobs settings.

---

## Project Structure

```
videogame-api/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── gamesController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── permissions.js
│   ├── models/
│   │   ├── Game.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── games.js
│   ├── swagger.js
│   └── app.js
├── scripts/
│   ├── seed.js
│   └── syncAlgolia.js
├── tests/
│   ├── auth.test.js
│   └── games.test.js
├── babel.config.cjs
├── jest.config.js
├── package.json
├── .env.example
└── README.md
```

- **src/controllers/**: Request handlers (business logic) for Auth and Games.
- **src/middleware/**: Authentication (JWT verification) and permission checks.
- **src/models/**: Mongoose schemas for `User` and `Game`.
- **src/routes/**: Route definitions that delegate to controllers and middleware.
- **src/swagger.js**: Swagger/OpenAPI setup.
- **src/app.js**: Entry point; configures Express, connects to MongoDB, and mounts routes.
- **scripts/**:
    - `seed.js`: Seed the database with 100 sample games.
    - `syncAlgolia.js`: Sync MongoDB data to Algolia index.
- **tests/**: Unit tests written with Jest + Supertest.
- **babel.config.cjs**: Babel configuration for Jest.
- **jest.config.js**: Jest configuration (transform, test matching, ignore patterns).

---

## Usage

### Seeding the Database

Before starting, populate the MongoDB database with sample data:

```bash
npm run seed
```

This script (`scripts/seed.js`) will:

1. Connect to MongoDB using `process.env.MONGO_URI`.
2. Delete all existing documents in the `games` collection.
3. Insert 100 sample game documents.

---

### Starting the Server

To start in development mode (using `nodemon`):

```bash
npm run dev
```

To start in production mode:

```bash
npm start
```

The server listens on port **3000** by default (`process.env.PORT || 3000`).  
Visit `http://localhost:3000` once running.

---

### API Documentation (Swagger)

After starting the server, Swagger UI is available at:

```
http://localhost:3000/api-docs
```

You will see all endpoints, request parameters, response schemas, and security requirements.

---

## API Endpoints

### Auth Routes

- **POST** `/auth/register`  
  Register a new user.

  **Request Body (JSON)**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
  **Responses**:
    - `201`: User created
    - `400`: Missing fields or user already exists

- **POST** `/auth/login`  
  Login and receive a JWT token.

  **Request Body (JSON)**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
  **Responses**:
    - `200`: Returns `{ "token": "JWT_TOKEN" }`
    - `400`: Invalid credentials

---

### Games Routes

**All `/games` requests return/accept JSON, except `POST /games` which uses `multipart/form-data` for image upload.**

- **GET** `/games`  
  Get a paginated list of games (with optional filters).

  **Query Parameters**:
    - `page` (integer, default `1`)
    - `limit` (integer, default `10`)
    - `genre` (string)
    - `platform` (string)
    - `developer` (string)
    - `minScore` (integer)
    - `maxScore` (integer)
    - `q` (string): Title search (regex)

  **Response**:
  ```json
  {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "games": [
      {
        "_id": "string",
        "title": "string",
        "platform": ["string"],
        "releaseYear": 2020,
        "genre": "string",
        "developer": "string",
        "metascore": 85,
        "imageUrl": "https://...",
        "createdBy": "userId"
      }
    ],
    "_links": {
      "self": "http://localhost:3000/games?page=1&limit=10",
      "first": "...",
      "last": "...",
      "prev": "...",
      "next": "..."
    }
  }
  ```

- **GET** `/games/search?q=searchterm`  
  Search games via Algolia index.

  **Query Parameter**:
    - `q` (string, required)

  **Response**:
  ```json
  [
    {
      "objectID": "string",
      "title": "string",
      "platform": ["string"]
    }
  ]
  ```

- **GET** `/games/:id`  
  Get a single game by its ID.

  **Path Parameter**:
    - `id` (string, Game ObjectId)

  **Response**:
  ```json
  {
    "_id": "string",
    "title": "string",
    "platform": ["string"],
    "releaseYear": 2020,
    "genre": "string",
    "developer": "string",
    "metascore": 85,
    "imageUrl": "https://...",
    "createdBy": "userId"
  }
  ```
    - `404` if not found.

- **POST** `/games`  
  Create a new game. **Requires Authorization header**: `Bearer JWT_TOKEN`.

  **Content-Type**: `multipart/form-data`

  **Form Data Fields**:
    - `title` (string, required)
    - `platform` (string, required)
    - `releaseYear` (integer, required)
    - `genre` (string, required)
    - `developer` (string, required)
    - `metascore` (integer, required)
    - `image` (file, optional): JPEG/PNG image

  **Response**:
  ```json
  {
    "_id": "string",
    "title": "string",
    "platform": ["string"],
    "releaseYear": 2020,
    "genre": "string",
    "developer": "string",
    "metascore": 85,
    "imageUrl": "https://cdn.netlify.com/...",
    "createdBy": "userId"
  }
  ```
    - `401` if not authenticated.

- **PUT** `/games/:id`  
  Update an existing game. **Requires Authorization header**: `Bearer JWT_TOKEN`.

  **Path Parameter**:
    - `id` (string, Game ObjectId)

  **Request Body (JSON)**:
    - Any of: `title`, `platform`, `releaseYear`, `genre`, `developer`, `metascore`

  **Response**:
  ```json
  {
    "_id": "string",
    "title": "updated string"
  }
  ```
    - `401` if not authenticated.
    - `403` if not the creator.
    - `404` if not found.

- **DELETE** `/games/:id`  
  Delete a game. **Requires Authorization header**: `Bearer JWT_TOKEN`.

  **Path Parameter**:
    - `id` (string, Game ObjectId)

  **Response**:
  ```json
  { "message": "Game deleted" }
  ```
    - `401` if not authenticated.
    - `403` if not the creator.
    - `404` if not found.

---

## Algolia Integration

1. **Create an Algolia account** (https://www.algolia.com) and obtain:
    - `ALGOLIA_APP_ID`
    - `ALGOLIA_ADMIN_API_KEY`
    - `ALGOLIA_SEARCH_ONLY_API_KEY`

2. **Set these keys** in `.env`:
   ```
   ALGOLIA_APP_ID=your_app_id
   ALGOLIA_ADMIN_KEY=your_admin_key
   ALGOLIA_SEARCH_KEY=your_search_key
   ```

3. **Sync data** after seeding the database:
   ```bash
   npm run sync:algolia
   ```
    - This script (`scripts/syncAlgolia.js`) fetches all games from MongoDB, formats them with an `objectID` and uploads to Algolia index named `videogames`.

4. **Search endpoint** `/games/search?q=term` uses the `ALGOLIA_SEARCH_KEY` to query the index.

---

## Netlify Blobs Integration

1. **Create a Netlify account** (https://www.netlify.com) and enable **Netlify Large Media / Blobs**.
2. **Generate a personal access token** for Blobs (in Netlify site settings “Blobs”).
3. **Set `NETLIFY_BLOBS_TOKEN`** in `.env`.
4. **When creating a game with an image**, the controller:
    - Resizes the uploaded image with `sharp`.
    - Uploads the buffer to Netlify Blobs via `@netlify/blobs.put(...)`.
    - Stores the returned `blob.url` in the `imageUrl` field of the `Game` document.

---

## Testing

Unit tests are written with **Jest** and **Supertest**. A **Babel** pipeline handles ESM imports.

1. **Ensure MongoDB is running** (local or Atlas, matching `MONGO_URI`).
2. **Run tests**:
   ```bash
   npm test
   ```
   This executes all `*.test.js` files under `tests/`.

### Important Configurations

- **`jest.config.js`**:
  ```js
  export default {
    testEnvironment: "node",
    transform: {
      "^.+\.js$": "babel-jest"
    },
    testMatch: ["<rootDir>/tests/**/*.test.js"],
    moduleFileExtensions: ["js", "json", "node"],
    transformIgnorePatterns: [
      "/node_modules/(?!(?:@netlify/blobs)/)"
    ],
    testPathIgnorePatterns: ["/node_modules/"]
  };
  ```
    - Uses **`babel-jest`** to transform ESM syntax.
    - Includes `@netlify/blobs` in the transformation pipeline.

- **`babel.config.cjs`**:
  ```js
  module.exports = {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: { node: "current" },
          modules: "auto"
        }
      ]
    ]
  };
  ```

- **Directory of test files**:  
  `tests/auth.test.js` and `tests/games.test.js`.

---

## License

This project is licensed under the **MIT License**.

---

**Enjoy building with the VideoGame API!**