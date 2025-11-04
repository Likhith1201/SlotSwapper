# SlotSwapper - ServiceHive Full Stack Intern Challenge

SlotSwapper is a peer-to-peer time-slot scheduling application built for the ServiceHive technical challenge. Users can manage their calendars, mark busy slots as "swappable," and browse a marketplace to request swaps with other users.

This project features a complete MERN stack implementation, including a secure Node.js/Express backend with JWT authentication and a dynamic React (TypeScript) frontend.

**Live Demo URL:** `[Link to your deployed frontend (e.g., Vercel)]`
**Backend API URL:** `[Link to your deployed backend (e.g., Render)]`

---

## 🚀 Features

* **Full User Authentication:** Secure sign-up and login using JWT (JSON Web Tokens).
* **Calendar Management (CRUD):** Users can create, view, update, and delete their own calendar events.
* **Event Status System:** Events can be `BUSY`, `SWAPPABLE`, or `SWAP_PENDING`.
* **Marketplace:** A "Marketplace" view shows all `SWAPPABLE` slots from *other* users.
* **Core Swap Logic:** Users can request a swap by offering one of their own swappable slots.
* **Request Management:** A "Requests" page shows incoming and outgoing requests.
* **Atomic Swap Responses:** Users can accept or reject incoming swaps. Accepting a swap atomically exchanges the event owners in the database.

---

## 🛠️ Technology Stack

* **Frontend:** React, TypeScript, React Router, Axios, Styled-Components
* **Backend:** Node.js, Express, Mongoose
* **Database:** MongoDB (using MongoDB Atlas)
* **Authentication:** JSON Web Tokens (JWT) & bcrypt.js

---

## 🏁 How to Run Locally

To run this project locally, you will need two terminals.

### Prerequisites

* [Node.js](https://nodejs.org/) (v16 or later)
* [npm](https://www.npmjs.com/)
* A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)

### 1. Backend Setup (Terminal 1)

1.  **Clone the repository:**
    ```bash
    git clone [Your GitHub Repo URL]
    cd SlotSwapper
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root `SlotSwapper` directory.
    ```env
    # Your MongoDB connection string
    MONGO_URI=mongodb+srv://<username>:<password>@cluster...
    
    # A long, random string for signing tokens
    JWT_SECRET=YOUR_SUPER_STRONG_SECRET_KEY
    
    # Token expiration (e.g., 1d, 7d, 1h)
    JWT_EXPIRES_IN=1d
    
    PORT=5000
    ```

4.  **Run the backend server:**
    ```bash
    npm start
    ```
    The API should be running at `http://localhost:5000`.

### 2. Frontend Setup (Terminal 2)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Run the frontend development server:**
    ```bash
    npm start
    ```
    The application will open automatically at `http://localhost:3000`. The `package.json` proxy will handle API requests.

---

## 📁 API Endpoints

All protected routes require a `Bearer <token>` in the Authorization header.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/api/auth/register` | Public | Register a new user. |
| `POST` | `/api/auth/login` | Public | Log in a user and get a token. |
| **Events** | | | |
| `POST` | `/api/events` | Private | Create a new event. |
| `GET` | `/api/events/my-events` | Private | Get all events for the logged-in user. |
| `PUT` | `/api/events/:id` | Private | Update an event (e.g., title, status). |
| `DELETE` | `/api/events/:id` | Private | Delete an event. |
| **Swaps** | | | |
| `GET` | `/api/swaps/swappable-slots` | Private | Get all "Marketplace" slots (not owned by user). |
| `POST` | `/api/swaps/request` | Private | Send a new swap request. |
| `GET` | `/api/swaps/requests` | Private | Get user's incoming/outgoing requests. |
| `POST` | `/api/swaps/response/:id` | Private | Accept or reject an incoming request. |

---

## challenges faced & design choices

* **Design Choice (Atomic Swaps):** The most critical part of the application is accepting a swap. I used **Mongoose Transactions** (`session.startTransaction()`) in the `/api/swaps/response` endpoint. This ensures that the exchange of `owner` IDs on both `Event` documents and the update of the `SwapRequest` status all happen atomically. If any single step fails, the entire transaction is rolled back, preventing data corruption.
* **Design Choice (Frontend State):** I chose React's Context API for global state management (Authentication). While simple, it was perfect for managing the user and token across the app without the overhead of Redux for a project of this scale.
* **Challenge (Async Logic):** Managing the flow of the swap (Fetch slots -> Open modal -> Fetch *my* slots -> Submit request -> Refresh) required careful state management and passing callbacks from the parent page (`MarketplacePage`) to the child modal (`RequestSwapModal`) to trigger a data refresh after submission.