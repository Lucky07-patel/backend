# Lead Capture Backend

This is the backend API for the Lead Capture project built using Node.js, Express.js, PostgreSQL, and Groq AI.

## Features

* REST API using Express.js
* PostgreSQL database integration
* Lead form data storage
* Server-side validation using express-validator
* AI lead qualification
* AI-generated first-response email draft
* Admin API to list all submitted leads
* Global error handling
* Request logging using Morgan

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* pg
* dotenv
* cors
* morgan
* express-validator
* Groq AI API

---

## GitHub Repository

Clone the repository using the following command:

```bash
git clone https://github.com/your-username/lead-capture-backend.git
```

Move into the project directory:

```bash
cd lead-capture-backend
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment Variables

Create a `.env` file in the root directory and add:

```env
PORT=5000

DB_USER=postgres
DB_HOST=localhost
DB_NAME=lead_capture_db
DB_PASSWORD=your_password
DB_PORT=5432

GROQ_API_KEY=your_groq_api_key
```

### 3. Create PostgreSQL Database

Open PostgreSQL and create a database:

```sql
CREATE DATABASE lead_capture_db;
```

Create the leads table:

```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  message TEXT NOT NULL,
  lead_score VARCHAR(20),
  qualification_reason TEXT,
  email_draft TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Start the Server

Development Mode:

```bash
npm run dev
```

Production Mode:

```bash
npm start
```

Server will run at:

```bash
http://localhost:5000
```

---

## API Endpoints

### Create Lead

```http
POST /leads
```

### Get All Leads

```http
GET /leads
```

### Dashboard Statistics

```http
GET /leads/dashboard
```

---

## Frontend Deployment

Frontend is deployed on Vercel:

```text
https://your-vercel-app.vercel.app
```

---

## Notes

* Backend requires PostgreSQL to be running locally or on a cloud database provider.
* Groq API key is required for AI lead qualification.
* All setup instructions are included above for local execution.
