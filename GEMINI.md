# EdTech: AI-Powered Multilingual E-Learning Platform

EdTech is a cloud-deployed EdTech platform that combines full-stack web development with machine learning recommendations and AI-driven content generation.

## Project Structure

The project is organized as a monorepo (Core services):

-   `backend/`: Node.js/Express API handling business logic, authentication, and AWS integrations.
-   `frontend/`: React application (Vite, Tailwind CSS) for students, instructors, and admins.
-   `uploads/`: Local storage for certificates and temporary files (mirrored with AWS S3 in production).

*(Note: The ML Recommendation Backend (Python/FastAPI) is deployed as a separate service on AWS EC2.)*

## Core Features & AI Integration

-   **Multilingual Content:** Native support for English (en), Hindi (hi), and Marathi (mr) across courses, modules, and quizzes.
-   **AI Recommendations:** Dual-mode recommendation system (Dashboard & Search) powered by Python/FastAPI using scikit-learn and sentence-transformers.
-   **Generative AI (Gemini):** Backend integration for course content summarization, elaboration, and automated descriptions.
-   **Payment Gateway:** Integrated with Razorpay for secure course enrollments.
-   **Cloud Infrastructure:** Designed for AWS (S3 for storage, EC2 for backends, CloudFront for frontend).

## Technology Stack

### Backend (Node.js/Express)
-   **Authentication:** JWT-based stateless auth with lowercase role-based access (`student`, `instructor`, `admin`).
-   **Database:** MongoDB Atlas (nested multilingual schemas).
-   **Storage:** AWS S3 for videos, PDFs, and certificates.
-   **External APIs:** Gemini AI (content enhancement), Razorpay (payments).

### Frontend (React)
-   **Framework:** React 19 (Vite).
-   **State Management:** Redux Toolkit / Zustand.
-   **Styling:** Tailwind CSS (supports dynamic theme switching).

## Database Schema (MongoDB)

Detailed collections include:
-   `users`: Roles, profiles (age group, skill level), and instructor verification status.
-   `courses`: Hierarchical structure (Course -> Module -> Submodule -> Content Blocks: TEXT, VIDEO, QUIZ).
-   `enrollments`: Tracks progress (`ENROLLED`, `COMPLETED`), quiz results, and certificate status.
-   `user_activity`: Captures clicks, watches, and searches for the recommendation engine.
-   `certificate_templates`: Admin-managed templates for auto-generating completion certificates.

## Development Conventions & Mandates

-   **Lowercase Roles:** All roles MUST be lowercase in the database, API, and frontend (`student`, `instructor`, `admin`).
-   **Semantic Naming:**
    -   Use `instructor` instead of `teacher` for all variables, files, and UI text.
    -   Use `name` instead of `fullName` for user models and components.
    -   Use `isActive` instead of `isDeleted` for soft-delete logic.
-   **Hierarchical Ordering:** When creating Modules, Submodules, or Content Blocks, the `order` field (integer, min 0) is **REQUIRED**. Ensure this is provided or calculated to avoid 400 validation errors.
-   **ES Modules:** Used throughout the backend and frontend.
-   **API Design:** Controller-route-model pattern.
-   **Multilingual Storage:** Fields like `title` and `description` are objects mapping language codes to strings (`en`, `hi`, `mr`). Use `localized()` helper (backend) and `getLocalizedValue()` (frontend).
-   **Vite Proxy:** Frontend calls `/api` which is proxied to `localhost:5001` (backend).

## Key Files
-   `backend/server.js`: Main API entry point.
-   `backend/controllers/courseController.js`: Central logic for course structure and state.
-   `frontend/src/store/courseSlice.js`: Frontend state management for the course editor and player.
-   `frontend/src/pages/Home.jsx`: Main landing page highlighting AI features.
-   `frontend/src/pages/student/StudentDashboard.jsx`: AI-inspired dark-mode student interface.

## Project Status

-   **Phase 1 (Semantic Cleanup):** Completed.
-   **Infrastructure & Build:** Stabilized. Resolved duplicate import errors and API validation bugs in the Course Editor workflow.
-   **UI Audit:** Completed. Identified critical functional gaps in Quiz UI and placeholder stubs.
-   **Current Focus:** Implementing real stateful logic for Quizzes and completing the "Save & Publish" workflow in the Course Editor.
