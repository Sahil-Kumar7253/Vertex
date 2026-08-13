# Real-Time Collaborative Workspace

## Overview
A high-concurrency, real-time collaborative workspace designed to enable multiple users to edit and manage content simultaneously. This application serves as a unified environment for live document editing and state synchronization, built with a modern Next.js frontend and a robust Spring Boot backend.

## Core Features
*   **Live Synchronization:** Bidirectional data flow ensuring that content edits, cursor movements, and state changes reflect instantly across all connected clients.
*   **User Presence:** Real-time tracking of active users within a workspace session.
*   **Optimized User Profile Interface:** The user profile and settings interface utilizes a clean, single-column stacked layout with bounded, scrollable sections to maximize readability and avoid dashboard clutter.
*   **Persistent Storage:** Robust relational data modeling to handle version history and user relationships securely.
*   **Containerized Deployment:** The backend services and database are fully containerized for seamless execution across different environments.

## Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend** | Next.js (React), Tailwind CSS |
| **Backend** | Java, Spring Boot, Spring Security |
| **Real-Time** | Spring WebSockets / STOMP |
| **Database** | PostgreSQL, Spring Data JPA (Hibernate) |
| **DevOps** | Docker, Docker Compose |

## Getting Started

### Prerequisites
Ensure you have the following installed on your system (tested on Ubuntu/Linux environments):
*   Java Development Kit (JDK 17+)
*   Node.js (v18+)
*   Docker and Docker Compose
*   Git

### Installation & Setup

1.  **Clone the repository:**
    `git clone https://github.com/yourusername/collaborative-workspace.git`
    `cd collaborative-workspace`

2.  **Environment Configuration:**
    Set up your environment variables for both the frontend and backend by copying the template files.
    `cp .env.example .env` (for Docker/Backend configuration)
    `cp frontend/.env.example frontend/.env.local` (for Next.js)

3.  **Start the Backend and Database (Docker):**
    Spin up the PostgreSQL database and the Spring Boot application container. Spring Data JPA will automatically handle the database schema initialization based on your entity models.
    `sudo docker-compose up -d`

4.  **Frontend Setup:**
    Open a new terminal window, navigate to the frontend directory, install dependencies, and start the development server.
    `cd frontend`
    `npm install`
    `npm run dev`

## Architecture Highlights
The application leverages Next.js for initial server-side rendering to optimize performance and SEO. The frontend seamlessly connects to a highly concurrent Spring Boot backend via STOMP over WebSockets for real-time updates. Spring Data JPA acts as the bridge to the PostgreSQL container, ensuring type-safe, object-relational mapping and secure database queries.