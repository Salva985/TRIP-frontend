# TripAPI Frontend 🌍✈️

Frontend React app for **TripAPI**, a travel & trip planner.  
It connects to the Spring Boot backend to manage **Trips, Destinations, and Activities** with full CRUD.

---

## 📌 Features

- **Trips**
  - List all trips with filters (upcoming / past).
  - Create new trips (with destinations inline).
  - View, edit, and delete trips (cascade deletes activities).
   - Trip types supported: `LEISURE`, `BUSINESS`, `ADVENTURE`, `OTHER`.
- **Activities**
  - List activities (with server-side search & pagination).
  - Create, edit, delete activities inside trips.
  - Supports multiple types: `SIGHTSEEING`, `ADVENTURE`, `CULTURAL`, `OTHER`.
- **Destinations**
  - Choose from existing destinations.
  - Add new ones inline (with deduplication by city).
- **Health Check**
  - Navbar shows connection state using `/api/health`.
- **UI/UX**
  - Built with **TailwindCSS** for responsive design.
  - Works on desktop & ≤ 360px mobile.
  - Error states, loading states, and empty states included.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite, React Router, Hooks, Fetch)
- **Styling**: TailwindCSS
- **Backend**: Spring Boot + JPA + PostgreSQL/H2 (see backend repo)
- **API**: REST (JSON)
- **Tools**: Postman for testing, npm scripts for dev/build

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Salva985/tripapi-frontend.git
cd tripapi-frontend
````

### 2. Install dependencies
```bash
npm install
````

### 3. Configure environment
```env
VITE_API_BASE_URL=http://localhost:8081
````

### 4. Run locally
```bash
npm run dev

Visit 👉 http://localhost:5173
````

### 5. Build for production
```bash
npm run build
`````

---
## 📂 Project Structure

```bash

src/
  api/
    activitiesApi.js
    destinationsApi.js
    tripsApi.js
    client.js
  ui/
    activities/
      ActivitiesList.jsx
      ActivityDetail.jsx
      ActivityForm.jsx
    trips/
      TripsList.jsx
      TripDetails.jsx
      TripCreatePage.jsx
      TripForm.jsx
    common/
      HealthBadge.jsx
    App.jsx
  assets/
    react.svg
````

---
## 📬 API Endpoints (Backend)

	•	GET /api/health → DB connection check
	•	GET /api/trips?search=&page=&pageSize= → list trips with pagination
	•	POST /api/trips → create trip
	•	GET /api/trips/:id → trip details
	•	PUT /api/trips/:id → update trip
	•	DELETE /api/trips/:id → delete trip (cascade activities)

	•	GET /api/activities?search=&page=&pageSize= → list activities
	•	POST /api/activities → create activity
	•	GET /api/activities/:id → activity details
	•	PUT /api/activities/:id → update activity
	•	DELETE /api/activities/:id → delete activity

	•	GET /api/destinations → list destinations
	•	POST /api/destinations → create destination

---
## 🧪 Testing with Postman
```bash
docs/postman/
  TripAPI.postman_collection.json
  TripAPI.postman_environment.json
````
---
## 👨‍💻 Author

Salvatore Marchese  
· Full-Stack Dev
- [GitHub](https://github.com/Salva985) 
- [LinkedIn](https://www.linkedin.com/in/salvatore-marchese-5736b786/)