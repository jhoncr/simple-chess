# Simple Chess Web App

## Overview

This is a simple web application for playing chess. It generates a sharable link for the game, which can be shared with another player to play in real-time. 

Game state is stored in a Firestore database and the game logic is implemented in Google Cloud Functions.


This project is divided into three main parts: the ***backend*** logic, the ***database*** and the ***frontend***.

```plaintext
                            +-------------------------------------+
                            |          Client (ReactJS)           | <-----+
                            +-------------------------------------+       |
                                |                                         |
                                | requests                                |
                                v                                         |
                            +-------------------------------------+       |
                            | Backend (Google Callable Functions) |       | read only
                            +-------------------------------------+       |
                                |                                         |
                                | modify state                            |
                                v                                         |
                            +-------------------------------------+       |
                            |        Database (Firestore)         | ------+
                            +-------------------------------------+
```
## Database (Firestore)
The database is a Firestore database with only one collection called **games**. So all documents (aka chess games), can be access with with path **/games/<docid>** The database schema is as follows:
```json
{
    id: "string",
    gameState: "fen string",
    status: "active" | "finished" | "quit" | "waiting",
    createdAt: firestore.Timestamp,
    finishedAt: firestore.Timestamp | null,
    players: {
        [uid]: {
            pstatus: "active" | "quit" | "finished",
            peace: "w" | "b",
            name: string,
        }
    }
}
```

the **game['players']** object is a map of the players in the game. The key is the user id (max of 2 players). The ID is takem from the google auth token.

## Backend

The backend is a Firebase project, which includes Firestore and Cloud Functions. The configuration for Firestore is in `firestore.indexes.json` and `firestore.rules`. The Cloud Functions are in the `functions` directory.



### Functions

The Cloud Functions are written in TypeScript. The source code is in the `src` directory and the compiled JavaScript is in the `lib` directory. The project dependencies and scripts are defined in `package.json`.

## Frontend

The frontend is a React application. The entry point is `src/index.js`. The main application component is in `src/App.jsx`. The `public` directory contains static files served by the application.

### Components

The React components are in the `src/components` directory. 

### Assets

The `src/assets` directory contains static assets like images and stylesheets.

### Authentication and Database Handlers

The `auth_handler.js` and `db_handler.js` files handle authentication and database operations, respectively.

## Getting Started

To get started with this project, you need to install the dependencies. Run `npm install` in both the `backend/functions` and `frontend` directories.

## Building and Running

To build and run the backend, navigate to the `backend/functions` directory and run `npm run build`. To start the frontend, navigate to the `frontend` directory and run `npm start`.

## Contributing

If you want to contribute to this project, please follow the contribution guidelines.

## License

This project is licensed under the MIT License.