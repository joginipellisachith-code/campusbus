# CampusRide - College Bus Booking System

A full-stack bus booking and management system built with React, Express, Firebase, and Stripe.

## Features

- **Real-time Seat Availability**: Live updates on bus occupancy.
- **Secure Payments**: Integrated Stripe payment gateway (INR support).
- **Admin Dashboard**: Manage routes, view analytics, and track revenue.
- **Student Portal**: Book seats and view booking history.
- **Authentication**: Google Login via Firebase.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Firebase Project
- Stripe Account (for API keys)

### 2. Environment Variables
Create a `.env` file in the root directory and add the following:
```env
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Firebase Configuration
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google Provider).
3. Create a **Firestore Database**.
4. Copy your Firebase config and create a `firebase-applet-config.json` file in the root:
```json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "...",
  "firestoreDatabaseId": "(default)"
}
```

### 4. Installation
```bash
npm install
```

### 5. Running the App
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## Deployment

This app is designed to be deployed to platforms like **Cloud Run** or **Heroku** that support Node.js servers.

### GitHub Export
To export this project from Google AI Studio to GitHub:
1. Click on the **Settings** (gear icon) in the top right of the AI Studio interface.
2. Select **Export to GitHub**.
3. Follow the prompts to connect your account and create a repository.
