<div align="center">

# 🌍 Smart Morocco
### AI-Powered Travel Platform for the Kingdom of Morocco

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

*Discover Morocco like never before — powered by AI, curated by passion.*

</div>

---

## 📖 About The Project

**Smart Morocco** is a full-stack digital travel platform dedicated to Moroccan tourism. It combines a cinematic dark-mode UI with an AI-driven backend to offer travelers personalized city guides, curated destination galleries, and intelligent itinerary generation — all in one seamless experience.

Whether you're planning a week in Marrakech's medina, a desert adventure in Merzouga, or a coastal escape in Essaouira, Smart Morocco has you covered.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🏙️ **20 Moroccan City Gallery** | Interactive destination cards for all 20 major Moroccan cities, fetched live from MongoDB |
| 🤖 **AI Itinerary Generator** | Powered by **Groq Cloud LLM** — type a natural query and receive a full day-by-day travel plan |
| 🗺️ **Interactive Map** | Mapbox-powered map with live city markers and location data |
| 🌙 **Dark Mode UI** | Premium cinematic dark aesthetic with glassmorphism and smooth animations |
| 📸 **Cinematic Photography** | Real, high-quality images served from the backend static directory |
| 👥 **Plan With Friends** | Collaborative trip planning with shared workspaces |
| 🔐 **Authentication** | JWT-based user registration and login system |
| ❤️ **Favorites** | Save and manage your favourite destinations and trips |
| 🌤️ **Live Weather** | Real-time weather widget for Moroccan cities |

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (TypeScript) — Component-based UI
- **Tailwind CSS** — Utility-first dark-mode styling
- **Axios** — HTTP client for API communication
- **React Router** — Client-side navigation
- **Mapbox GL** — Interactive map integration

### Backend
- **FastAPI** (Python) — High-performance async REST API
- **Motor** — Async MongoDB driver
- **PyJWT** — JSON Web Token authentication
- **Uvicorn** — ASGI server

### Database & Cloud
- **MongoDB Atlas** — Cloud NoSQL database
  - Collections: `media`, `cities`, `trips`, `users`, `favorites`, `reviews`

### AI Integration
- **Groq Cloud LLM** — Ultra-fast inference for personalized travel plan generation
- **Google Gemini AI** — Supplementary AI features

---

## 📸 Screenshots

> *Screenshots coming soon — UI is dark-themed with cinematic city photography.*

| Home Page | Cities Gallery | AI Trip Planner |
|-----------|---------------|-----------------|
| ![Home](#) | ![Cities](#) | ![AI Planner](#) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Python 3.10+**
- **Node.js 18+** and **npm**
- **MongoDB Atlas** account (or local MongoDB instance)

---

### ⚙️ Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Configure environment variables
# Copy the example and fill in your credentials
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/
MONGODB_DB_NAME=travel

# JWT Authentication
JWT_SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=60

# AI APIs
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

```bash
# 5. Start the FastAPI backend
uvicorn app.main:app --reload --port 8001
```

The API will be live at **http://localhost:8001**  
Interactive docs available at **http://localhost:8001/docs**

> 💡 **Note:** The database seeds automatically on first startup. The `media` collection is always refreshed to ensure all 20 city documents are present.

---

### 💻 Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the React development server
npm run dev
```

The app will be live at **http://localhost:5173**

---

### 🗄️ Database Recovery

If your MongoDB collections become corrupted or incomplete, run the recovery script from the `backend/` directory:

```bash
python recover_db.py
```

This script:
- Reads all `.jpg` images from `static/images/`
- Drops and rebuilds the `cities`, `media`, and `trips` collections
- Re-creates all necessary indexes

---

## 📁 Project Structure

```
smart-morocco/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   ├── connection.py       # MongoDB connection manager
│   │   │   ├── mongo_seed.py       # Auto-seeder for all collections
│   │   │   └── repositories.py     # Data access layer
│   │   ├── routes/
│   │   │   ├── cities.py           # /cities endpoints
│   │   │   ├── media.py            # /media endpoints (image gallery)
│   │   │   ├── trips.py            # /trips endpoints
│   │   │   ├── auth.py             # /auth endpoints
│   │   │   └── ai.py               # /ai endpoints (Groq LLM)
│   │   ├── schemas/                # Pydantic models
│   │   ├── services/               # Business logic layer
│   │   └── main.py                 # FastAPI app entrypoint
│   ├── static/
│   │   └── images/                 # 20 Moroccan city photos
│   ├── recover_db.py               # One-shot DB recovery script
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/
│   │   │   ├── HomePage.tsx        # Hero + Top Destinations
│   │   │   ├── CitiesPage.tsx      # Full 20-city gallery
│   │   │   ├── PlanTripPage.tsx    # AI itinerary generator
│   │   │   └── ...
│   │   ├── context/                # React Context providers
│   │   └── config/                 # App configuration
│   └── package.json
│
└── README.md
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/media` | Fetch all 20 city images |
| `GET` | `/media/category/{city}` | Fetch media by city |
| `GET` | `/cities` | Fetch all city documents |
| `GET` | `/cities/{id}` | Fetch single city |
| `GET` | `/trips` | Fetch all trips |
| `POST` | `/ai/generate` | Generate AI travel itinerary |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Authenticate and get JWT |

Full interactive API documentation: **http://localhost:8001/docs**

---

## 🇲🇦 Featured Destinations

The platform features **20 iconic Moroccan cities**:

> Agadir · Al Hoceima · Asilah · Casablanca · Chefchaouen · Dakhla · El Jadida · Essaouira · Fes · Ifrane · Marrakech · Merzouga · Ouarzazate · Rabat · Safi · Tafraoute · Tangier · Taroudant · Tetouan · Zagora

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

**Smart Morocco Team**

- 🌐 Project Link: [https://github.com/yourusername/smart-morocco](https://github.com/yourusername/smart-morocco)

---

<div align="center">

Made with ❤️ for the Kingdom of Morocco 🇲🇦

*"Travel is the only thing you buy that makes you richer."*

</div>
