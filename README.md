# Employee App Backend

This project serves the supplied Angular build unchanged and provides its employee API using Express and MongoDB Atlas.

## Setup

1. Install Node.js.
2. In this directory, install dependencies: `npm install`.
3. Create a local `.env` file containing `MONGODB_URI=your Atlas connection string`.
4. In MongoDB Atlas, allow your current IP address and create a database user. Keep the URI private; `.env` is ignored by Git.
5. Start the app with `npm start`, then open `http://localhost:3000`.

The API stores employee records with `name`, `position`, `location`, and `salary` fields.
