
# Sweety 💗 – Blood Glucose Tracker

A full-stack blood glucose tracking application built using React, Node.js, Express.js, and PostgreSQL.

## Features

### Authentication
- User registration and login
- Password hashing using bcrypt
- JWT-based authentication
- Users can access only their own readings

### Glucose Reading Management
- Add, view, update, and delete glucose readings
- Four daily time slots:
  - Morning (fasting)
  - After breakfast
  - After lunch
  - After dinner
- Input validation:
  - Glucose value must be a whole number between 40 and 600 mg/dL
  - No future dates
  - Only one reading per time slot per day
  - Maximum four readings per day

### Reports
- Daily glucose report
- Month-to-date report
- Previous-month report
- Highest, lowest, average glucose, and total readings
- Empty state when no readings are available

## Technologies Used

- Frontend: React.js, Vite, CSS
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Authentication: JWT
- Password Security: bcrypt
- API Requests: Axios

## Project Structure

```text
sweety/
├── client/
│   └── src/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── .env.example
│   ├── seed.js
│   └── server.js
└── README.md
```

## Requirements

- Node.js
- npm
- PostgreSQL

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd sweety
```

### 2. Create the PostgreSQL database

Open PostgreSQL and execute:

```sql
CREATE DATABASE sweety_db;
```

Create the following tables inside `sweety_db`:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL,
    glucose_value INTEGER NOT NULL
        CHECK (glucose_value BETWEEN 40 AND 600),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, reading_date, time_slot),
    CHECK (time_slot IN (
        'Morning (fasting)',
        'After breakfast',
        'After lunch',
        'After dinner'
    ))
);
```

### 3. Configure the backend

Navigate to the server folder:

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` as a reference and enter your local PostgreSQL credentials and a private JWT secret.

### 4. Seed sample data

```bash
node seed.js
```

Demo login:

- Email: `demo@sweety.com`
- Password: `Demo@123`

### 5. Start the backend

```bash
npm run dev
```

Backend runs at:

`http://localhost:5000`

### 6. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login |
| GET | `/api/readings` | Get user's readings |
| POST | `/api/readings` | Add a reading |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |
| GET | `/api/readings/daily-report` | Daily report |
| GET | `/api/readings/month-to-date-report` | Month-to-date report |
| GET | `/api/readings/previous-month-report` | Previous-month report |

Reading endpoints require a valid JWT Bearer token.

## Testing

The API endpoints and validation rules were tested manually using Postman.

Test cases include:
- User registration and login
- Adding and retrieving readings
- Updating and deleting readings
- Invalid glucose values
- Duplicate time slots
- Future dates
- Daily and monthly reports
- Empty report states

## Notes

### Assumptions
- Each user manages their own glucose readings.
- A maximum of four readings can be recorded per day.
- Each of the four time slots can have only one reading per day.
- Glucose values are stored in mg/dL.
- Reports calculate statistics from the selected reporting period.

### Future Improvements
- Add pagination for readings.
- Add glucose trend charts.
- Add automated frontend and backend tests.
- Add Docker support.

## Author

Developed as a full-stack development assignment.
