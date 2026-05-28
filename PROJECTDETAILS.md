# EdTech: Project Details & Technical Architecture Guide

This document serves as the comprehensive technical reference, developer onboarding guide, and architectural blueprint for the EdTech platform. It details the implemented systems, database schemas, routing logic, machine learning pipelines, and deployment strategies.

---

## 1. PROJECT INTRODUCTION

### 1.1 Platform Overview
EdTech is a production-grade, AI-powered, multilingual e-learning platform. It enables instructors to architect hierarchical courses and allows students to consume content, take quizzes, and track progress. The platform natively supports English, Hindi, and Marathi.

### 1.2 Problem Statement & Solutions
* **Limitation:** Traditional LMS platforms enforce rigid, monolingual content delivery.
  **Solution:** A unified `localizedTextSchema` at the database layer allowing dynamic language switching on the frontend without reloading.
* **Limitation:** Course discovery relies on basic keyword matching.
  **Solution:** A FastAPI-driven Machine Learning microservice utilizing TF-IDF and Cosine Similarity to analyze semantic relationships and user behavior for targeted recommendations.
* **Limitation:** Static content lacks interactive learning support.
  **Solution:** An embedded Generative AI Chatbot (Gemini) that injects module-specific context into prompts to answer student queries, summarize content, and elaborate on complex topics without revealing quiz answers.

---

## 2. COMPLETE SYSTEM ARCHITECTURE

The platform utilizes a microservices-inspired Monolithic Core paired with an ML Microservice.

### 2.1 Layered Architecture
1. **Frontend (Presentation Layer):** React 19, Vite, TailwindCSS, Redux Toolkit. Unified rendering engine for student playback and admin/instructor previews.
2. **Backend (Core Logic Layer):** Node.js, Express.js. Handles RBAC, business logic, payment verification (Razorpay), AWS S3 bridging, and AI proxying.
3. **ML Backend (Intelligence Layer):** Python, FastAPI, scikit-learn. Handles matrix operations, vectorization, and recommendation serving.
4. **Database (Persistence Layer):** MongoDB Atlas (NoSQL) for high-read throughput and flexible nested document storage (Courses -> Modules -> Submodules -> Blocks).

### 2.2 System Flow
* **Authentication Flow:** Client sends credentials -> Node.js verifies via bcrypt -> Returns JWT -> Client stores token -> Attaches to Axios interceptor.
* **Course Playback Flow:** Client requests module -> Node.js validates enrollment/RBAC -> Returns unified block data (Text/Video/Quiz) -> Client renders via `ContentBlockViewer`.
* **Recommendation Flow:** Client requests dashboard -> Node.js queries FastAPI ML Service with `userId` -> ML calculates affinities -> Returns `courseIds` -> Node.js populates course metadata -> Client renders.

---

## 3. FRONTEND STRUCTURE

### 3.1 Directory Organization
* `src/api/`: Centralized Axios instances (`axios.js`) and domain-specific API wrappers (`studentApi.js`, `adminApi.js`).
* `src/components/`: Modular UI elements.
  * `student/`: `CoursePlayer`, `ContentBlockViewer`, `CourseSidebar`.
  * `admin/`: `StatCard`, `UserDetailModal`.
  * `ui/`: Reusable primitives (`LanguageSwitcher`).
* `src/context/`: `AuthContext` (JWT session lifecycle), `ThemeContext` (Dark/Light/Language defaults).
* `src/store/`: Redux Toolkit (`courseSlice.js`) for complex state management (e.g., deeply nested course editor).
* `src/pages/`: Route-level components grouped by role (`auth/`, `student/`, `instructor/`, `admin/`).

### 3.2 State Management & Rendering
* **Redux Toolkit:** Used exclusively for the Course Editor to handle complex drag-and-drop, deep nesting mutations, and draft saving without prop-drilling.
* **Context API:** Handles global, rarely mutating state (Current User, Theme).
* **Unified Rendering:** `ContentBlockViewer.jsx` acts as the single source of truth for rendering lessons. It accepts an `isPreview` prop to disable quiz submissions for admins while maintaining UI fidelity.

---

## 4. COMPLETE ROUTING DOCUMENTATION

### 4.1 Public Routes
| Route Path | Component | Purpose | Auth Required | API Integration |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `Home` | Landing page / marketing | None | None |
| `/login` | `Login` | User authentication | None | `POST /api/auth/login` |
| `/register/student` | `StudentRegister` | Student onboarding | None | `POST /api/auth/register` |
| `/register/instructor`| `InstructorRegister`| Instructor onboarding | None | `POST /api/auth/register` |
| `/courses` | `CoursesPage` | Public catalog browsing | None | `GET /api/courses` |

### 4.2 Student Routes (`role: "student"`)
| Route Path | Component | Purpose | Auth Required | API Integration |
| :--- | :--- | :--- | :--- | :--- |
| `/student-dashboard` | `StudentDashboard` | Personalized overview | Student | `GET /api/student/dashboard` |
| `/student-dashboard/courses/:id` | `CourseDetails` | Curriculum & purchase | Student | `GET /api/student/courses/:id` |
| `/student-dashboard/courses/:id/player`| `CoursePlayer` | Unified learning interface | Student/Admin/Instructor| `GET /api/student/courses/:id/player` |
| `/student-dashboard/payment/success` | `PaymentSuccess` | Post-enrollment screen | Student | `POST /api/student/courses/:id/payment/verify`|

### 4.3 Instructor Routes (`role: "instructor"`)
| Route Path | Component | Purpose | Auth Required | API Integration |
| :--- | :--- | :--- | :--- | :--- |
| `/instructor-dashboard` | `CoursesPage` | Workspace / Course List | Instructor | `GET /api/instructor/courses` |
| `/instructor-dashboard/courses/:id` | `DashboardPage` | Course analytics & feedback | Instructor | `GET /api/instructor/stats` |
| `/courses/:id/edit` | `CourseEditor` | Content block authoring | Instructor/Admin | `PUT /api/submodules/:id/blocks` |

### 4.4 Admin Routes (`role: "admin"`)
| Route Path | Component | Purpose | Auth Required | API Integration |
| :--- | :--- | :--- | :--- | :--- |
| `/admin-dashboard` | `AdminLayout` | Overview metrics | Admin | `GET /api/admin/stats` |
| `/admin-dashboard/courses` | `CoursesSection` | Moderation & approvals | Admin | `PATCH /api/admin/courses/:id/status` |
| `/admin-dashboard/verification`| `VerificationSection` | Instructor approvals | Admin | `PATCH /api/admin/instructors/:id/verify` |
| `/admin-dashboard/users` | `StudentsSection` | User management | Admin | `GET /api/admin/users` |

---

## 5. ROLE-BASED ACCESS CONTROL (RBAC)

### 5.1 Middleware Implementation
* **`protect` Middleware:** Extracts token from headers, verifies using `jsonwebtoken`, attaches decrypted payload to `req.user`.
* **`authorizeRoles(...roles)` Middleware:** Checks if `req.user.role` exists in the allowed array. Rejects with 403 Forbidden if mismatched.

### 5.2 Access Resolution Logic (`accessControl.js`)
Calculates highly specific permissions for course data:
* **Admin Preview:** If `req.user.role === 'admin'`, full access is granted without enrollment.
* **Instructor Ownership:** If `course.instructorId === req.user._id`, edit and preview access granted.
* **Student Enrollment:** If `Enrollment.findOne({ userId, courseId })` exists, progress-tracked access granted.

---

## 6. DATABASE DESIGN (MONGODB ATLAS)

### 6.1 Users Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `name`, `email` | String | User identity (email indexed, unique) |
| `password` | String | bcrypt hashed |
| `role` | String | Enum: `student`, `instructor`, `admin` |
| `profile` | Object | ML features: age, skill, goals |

### 6.2 Courses Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `title`, `description`| LocalizedText| Multilingual `{ en, hi, mr }` objects |
| `status` | String | Enum: `DRAFT`, `PENDING_REVIEW`, `PUBLISHED` |
| `modules` | Array[Module] | Nested array of module schemas |
| `modules.submodules` | Array[Submodule]| Nested array of submodule schemas |
| `contentBlocks` | Array[Block] | TEXT, VIDEO, or QUIZ pointers |

### 6.3 Quizzes Collection
Separated from courses to prevent massive document limits and enable quiz reusability.
| Field | Type | Description |
| :--- | :--- | :--- |
| `courseId`, `moduleId`| ObjectId | Relationships back to curriculum |
| `questions` | Array[Object] | Contains `questionText`, `options` (Localized) |
| `correctOptionId` | ObjectId | Secure pointer to the correct answer |
| `passingMarks` | Number | Threshold for completion |

### 6.4 Enrollments Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `userId`, `courseId` | ObjectId | Compound index for fast lookup |
| `completedBlocks` | Array[Object] | Tracks `blockId` and `completedAt` |
| `quizResults` | Array[Object] | Stores historical attempt scores |
| `progressPercentage` | Number | Pre-calculated 0-100 metric |

---

## 7. COURSE MANAGEMENT SYSTEM

### 7.1 Block-Based Architecture
Courses are not monolithic rich-text blobs. They are highly structured:
* **Level 1:** Course (Metadata, Pricing, Thumbnail)
* **Level 2:** Modules (Chapters)
* **Level 3:** Submodules (Lessons)
* **Level 4:** Content Blocks (The actual learning material)

### 7.2 Block Types
* **TEXT:** Contains HTML generated by the Rich Text Editor.
* **VIDEO:** Contains metadata (`url`, `provider`, `duration`). Supports external links (YouTube) or S3 uploads.
* **QUIZ:** Contains a reference `quizId` pointing to the standalone Quiz document.

### 7.3 State Persistence (Instructor Editor)
Modifying deep arrays in MongoDB is error-prone. The frontend Redux `courseSlice` maintains a normalized flat draft of the active Submodule's blocks. On "Save", a unified payload is sent to `PUT /api/submodules/:id/blocks`, completely overwriting the blocks array for that specific submodule to guarantee order integrity.

---

## 8. MULTILINGUAL TRANSLATION SYSTEM

### 8.1 Data Structure (`localizedTextSchema`)
All text-heavy fields utilize a custom Mongoose schema:
```javascript
const localizedTextSchema = new mongoose.Schema({
  en: { type: String, default: "" },
  hi: { type: String, default: "" },
  mr: { type: String, default: "" }
}, { _id: false });
```

### 8.2 Frontend Resolution
The `getLocalizedValue(field, language)` utility extracts the requested language string. If the string is empty or missing, it safely falls back to English to prevent UI breakage.

### 8.3 Translation Pipeline (AWS Translate)
1. Content saved in English triggers the `courseTranslation.service.js`.
2. Service queues translation requests to AWS Translate via `aws-sdk`.
3. Translated strings (Hindi, Marathi) are injected directly into the localized object fields in MongoDB.

---

## 9. AI CHATBOT SYSTEM

### 9.1 Contextual RAG (Retrieval-Augmented Generation)
The chatbot does not query the entire database. It is highly contextualized.
1. User clicks "AI Assist" inside a specific Text block.
2. Frontend sends user query + the specific `moduleText` + `moduleTitle` to the backend.
3. Backend constructs a strictly bounded prompt for Gemini API:
   * "Act as an expert instructor."
   * "Answer the student's question based strictly on the provided lesson text."
   * "Do NOT provide answers to potential quiz questions."
4. Gemini streams response back to the UI.

---

## 10. PAYMENT SYSTEM

### 10.1 Razorpay Integration Flow
1. **Initiation:** Student clicks "Buy". Node.js calls Razorpay API to generate an `order_id`.
2. **Client Processing:** Razorpay SDK opens modal. Student completes payment.
3. **Verification:** Razorpay returns `razorpay_payment_id` and `razorpay_signature`.
4. **Validation:** Backend uses `crypto.createHmac` to hash the `order_id` + `payment_id` using the secret key. If it matches the signature, the payment is valid.
5. **Fulfillment:** An `Enrollment` document is created, unlocking the course.

---

## 11. COMPLETE ML RECOMMENDATION SYSTEM

### 11.1 Architectural Reasoning
**Why TF-IDF + Cosine Similarity?**
Deep learning models (like BERT embeddings) require significant compute (GPU) and suffer from high latency. TF-IDF operates entirely in RAM on sparse matrices, providing lightning-fast inference (sub 50ms) perfect for real-time live-search and dashboard generation, while easily handling domain-specific academic vocabulary without pre-training requirements.

### 11.2 Mathematical Pipeline

#### Step 1: Text Preprocessing & TF-IDF
Course titles, descriptions, categories, and tags are concatenated into a single metadata corpus.
* **Term Frequency (TF):** Measures how frequently a word occurs in a course.
  $$ TF(t,d) = \frac{\text{Count of } t \text{ in } d}{\text{Total words in } d} $$
* **Inverse Document Frequency (IDF):** Penalizes highly common words (like "the", "course") across all courses.
  $$ IDF(t) = \log\left(\frac{N}{df_t}\right) $$
* **TF-IDF Weighting:**
  $$ w_{t,d} = TF(t,d) \times IDF(t) $$

#### Step 2: Cosine Similarity Matrix
The TF-IDF vectors are compared to find the semantic angle between courses.
$$ \text{Similarity}(A, B) = \cos(\theta) = \frac{A \cdot B}{\|A\|_2 \|B\|_2} $$
The result is an $N \times N$ matrix where cell $(i, j)$ represents the similarity score (0.0 to 1.0) between course $i$ and course $j$.

### 11.3 FastAPI Implementation
* **Memory Loading:** On startup, FastAPI loads `tfidf_vectorizer_en.pkl` and `similarity_matrix_en.pkl` directly into RAM using Python's `pickle`.
* **Search Inference:** Live search queries are vectorized on-the-fly using the loaded TF-IDF vectorizer, then a dot product is calculated against the entire course matrix to return the Top-K closest matches in milliseconds.

### 11.4 Weekly Retraining (Cron Job)
A background script fetches the latest MongoDB course dump weekly, recalculates the TF-IDF vocabulary, rebuilds the $N \times N$ matrix, and hot-swaps the `.pkl` files on the server to incorporate new courses into the recommendation ecosystem without downtime.

---

## 12. API DOCUMENTATION

### 12.1 Core Endpoints
| Method | Endpoint | Purpose | Auth | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user | None | `{ email, password }` | `{ token, user }` |
| `GET` | `/api/student/courses/:id`| Fetch course details | Student | None | `{ course, access }` |
| `PUT` | `/api/submodules/:id/blocks`| Update lesson content| Instr. | `{ blocks: [...] }` | `{ blocks }` |
| `POST` | `/api/student/courses/:id/quizzes/:qId/submit` | Submit quiz answers | Stdnt/Inst | `{ answers: {qId: optId} }`| `{ result: {score, status} }`|
| `GET` | `/api/recommendations/dashboard/:id`| Get ML recommendations| Valid | None | `{ recommendations: [] }` |
| `POST` | `/api/ai/chat` | Contextual Q&A | Valid | `{ prompt, context }` | `{ reply }` |

---

## 13. SECURITY IMPLEMENTATION

* **Data Protection:** `bcrypt` hashing ensures plain-text passwords never touch the database.
* **Token Security:** JWTs are signed with a highly secure `JWT_SECRET`. Expiration times limit exposure windows.
* **NoSQL Injection:** Mongoose ODM strictly enforces schemas, stripping undefined payload fields and preventing `$where` injections.
* **Access Control:** Controllers strictly validate `userId` against document `ownerId` before permitting mutations.

---

## 14. DEPLOYMENT ARCHITECTURE

### 14.1 Infrastructure (AWS)
* **EC2 Instance:** Hosts both Node.js and FastAPI environments.
* **PM2:** Process manager ensuring auto-restarts for both servers upon crash or server reboot.
* **Nginx:** Acts as the reverse proxy. 
  * Routes `domain.com/api/*` -> Node.js (Port 5001)
  * Routes `domain.com/ml/*` -> FastAPI (Port 8000)
  * Handles SSL termination via Let's Encrypt / Certbot.
* **MongoDB Atlas:** Fully managed, highly available database cluster residing outside the EC2 instance for decouple scalability.

---

## 15. PERFORMANCE OPTIMIZATIONS

* **Database Indexing:** Compound indexes on `{ status: 1, categoryId: 1, difficulty: 1 }` drastically speed up filtering for the public catalog.
* **Text Indexing:** MongoDB text indexing on English localized fields accelerates basic keyword searches when the ML service is bypassed.
* **Frontend Debouncing:** Custom `useDebouncedValue` hook delays ML API calls by 500ms during live-typing to prevent network flooding.
* **Submodule Empty States:** `ContentBlockViewer` strips empty option strings and null objects before rendering, minimizing DOM node counts.

---

## 16. ERROR HANDLING STRATEGY

* **Backend Centralization:** A global Express error middleware catches all next(err) invocations, ensuring consistent JSON error responses (`{ message: "..." }`) instead of HTML stack traces in production.
* **ML Service Fallback:** If the FastAPI service times out or crashes, the Node.js proxy catches the error and silently falls back to standard MongoDB keyword querying, ensuring the UI never breaks.
* **Axios Interceptors:** Frontend globally listens for `401 Unauthorized` responses to automatically clear local storage and redirect to `/login`.

---

## 17. FUTURE SCOPE

1. **Vector Database Integration:** Transitioning from Pickle-based Cosine Similarity to a managed Vector DB (like Pinecone) to support Semantic Search via LLM Embeddings.
2. **Automated Certification:** Integrating PDF generation libraries (PDFKit) to email dynamic, verifiable certificates upon course completion.
3. **Adaptive Quiz Engine:** Leveraging Gemini to dynamically generate unique quiz questions per student based on their historical failure patterns.
4. **WebSocket Analytics:** Implementing real-time dashboard analytics for instructors to monitor active student video engagement.

---

## 18. CONCLUSION

EdTech represents an enterprise-grade approach to modern e-learning. By strictly separating content hierarchy from rendering logic, bridging traditional CRUD operations with specialized Machine Learning microservices, and injecting Generative AI strictly where pedagogically valuable, the platform achieves a highly scalable, deeply personalized, and barrier-free multilingual educational environment.
