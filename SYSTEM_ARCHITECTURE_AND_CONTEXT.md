# AI-Powered Multilingual E-Learning and Course Recommendation Platform

---

# 1. Project Overview

This project is a cloud-deployed AI-powered multilingual e-learning platform.

The platform supports:

- Students
- Instructors
- Admins

Core features include:

- Multilingual courses
- AI-based recommendations
- Course enrollment
- Quiz system
- Progress tracking
- Certificate generation
- AI-generated content enhancement
- Search recommendations
- Dashboard recommendations

---

# 2. Main Goals

The main objectives of the system are:

1. Personalized learning
2. AI-powered recommendations
3. Multilingual education support
4. Scalable cloud deployment
5. Instructor course management
6. Quiz-based evaluation
7. Student progress analytics
8. AI-assisted content generation

---

# 3. Technology Stack

## Frontend

- React.js
- Tailwind CSS
- Zustand

Purpose:
Handles:
- UI
- dashboards
- search
- course player
- quizzes
- recommendations

---

## Main Backend

- Node.js
- Express.js

Purpose:
Handles:
- authentication
- business logic
- course APIs
- enrollments
- payments
- notifications
- Gemini API integration
- communication with ML backend

Deployment:
- AWS EC2

---

## ML Recommendation Backend

- Python
- FastAPI
- scikit-learn
- sentence-transformers

Purpose:
Handles:
- dashboard recommendations
- search recommendations
- weekly retraining
- recommendation model serving

Deployment:
- Separate AWS EC2

Reason for separate deployment:
- independent scaling
- isolated ML dependencies
- easier retraining workflow

---

## Database

- MongoDB Atlas

Reason:
- flexible schema
- multilingual nested content
- hierarchical course structure

---

## Storage

- AWS S3

Stores:
- videos
- PDFs
- thumbnails
- certificates
- profile images

---

## External APIs

### Gemini API

Used for:
- summarization
- elaboration
- AI-generated learning assistance

### Razorpay API

Used for:
- payments
- order creation
- verification

---

# 4. Deployment Architecture

## Frontend Deployment

- S3 + CloudFront

---

## Backend Deployment

- EC2 instance running Node.js backend

---

## ML Deployment

- Separate EC2 instance running FastAPI

---

## Networking

To reduce cost:
- No NAT Gateway
- No private subnet

Security handled using:
- Security Groups
- Restricted inbound rules

---

# 5. User Roles

## Student

Can:
- enroll in courses
- watch videos
- attempt quizzes
- receive recommendations
- track progress
- receive certificates

---

## Instructor

Can:
- create courses
- upload videos
- create quizzes
- manage modules/submodules

---

## Admin

Can:
- verify instructors
- manage categories
- upload certificate templates
- moderate platform

---

# 6. Course Structure

A course is organized as:

Course
→ Modules
→ Submodules
→ Content Blocks

Content Block types:
- TEXT
- VIDEO
- QUIZ

---

# 7. Multilingual Support

Supported languages:
- English (en)
- Hindi (hi)
- Marathi (mr)

Multilingual fields are stored as:

```json
{
  "title": {
    "en": "Java Basics",
    "hi": "जावा बेसिक्स",
    "mr": "जावा मूलतत्त्वे"
  }
}
```

---

# 8. Recommendation System

The recommendation engine provides:

## Dashboard Recommendations

Based on:
- enrollments
- activity
- ratings
- interests
- search history

---

## Search Recommendations

Provides:
- autocomplete
- personalized suggestions
- related courses

---

# 9. Recommendation Training Flow

## Step 1 — Collect Data

Sources:
- user_activity
- enrollments
- ratings
- recommendation_feedback

---

## Step 2 — Generate Features

Features:
- keywords
- stream
- skill level
- category
- user interests

---

## Step 3 — Train Model

Techniques:
- TF-IDF
- cosine similarity
- sentence-transformers embeddings

---

## Step 4 — Save Model

Generated files:
- .pkl
- .joblib

---

## Step 5 — Serve Recommendations

FastAPI endpoints:

- /recommend/dashboard
- /recommend/search

---

# 10. Weekly Retraining

A cron job runs weekly on ML EC2.

Purpose:
- retrain model
- update recommendation quality
- generate latest model files

---

# 11. Database Schema

Main MongoDB collections:

1. users
2. courses
3. categories
4. quizzes
5. enrollments
6. payments
7. ratings
8. user_activity
9. recommendation_feedback
10. certificate_templates
11. certificates
12. notifications

---

# 12. Important Architectural Decisions

## Why Separate Python Backend?

Because:
- ML libraries work better in Python
- independent deployment
- isolated dependencies
- easier retraining

---

## Why MongoDB?

Because:
- nested multilingual structures
- flexible schema
- hierarchical content support

---

## Why S3?

Because:
- videos should not be stored in database
- scalable file storage

---

# 13. Future Scalability

Future improvements may include:

- Redis caching
- Docker/Kubernetes
- microservices
- WebSockets
- AI chatbot
- live classes
- mobile app
- vector database
- semantic search

---

# 14. Current Database Schema

Final Collections:
1. users
2. courses
3. categories
4. quizzes
5. enrollments
6. payments
7. ratings
8. user_activity
9. recommendation_feedback
10. certificate_templates
11. certificates
12. notifications
1. users Collection

Stores students, instructors, and admins.

{
  _id: ObjectId,

  name: String,
  email: String,
  passwordHash: String,

  role: "student" | "instructor" | "admin",

  profileImageUrl: String,

  profile: {
    ageGroup: "13-17" | "18-24" | "25-34" | "35+",
    educationLevel: "School" | "Diploma" | "Undergraduate" | "Postgraduate" | "Working Professional",
    preferredStreams: [String],
    skillLevel: "Beginner" | "Intermediate" | "Advanced",
    careerGoal: String,
    budgetPreference: "Free" | "Paid" | "Both",
    preferredDifficulty: "Beginner" | "Intermediate" | "Advanced",
    preferredLanguage: "en" | "hi" | "mr"
  },

  instructorProfile: {
    bio: {
      en: String,
      hi: String,
      mr: String
    },

    expertise: [String],

    verification: {
      status: "NOT_APPLIED" | "PENDING" | "APPROVED" | "REJECTED",
      documents: [String],
      reviewedBy: ObjectId,
      reviewedAt: Date,
      rejectionReason: String
    },

    rating: Number,
    totalCourses: Number
  },

  stats: {
    totalCoursesEnrolled: Number,
    totalCoursesCompleted: Number,
    averageRatingGiven: Number,
    totalTimeSpentMinutes: Number
  },

  isActive: Boolean,

  createdAt: Date,
  updatedAt: Date
}
2. courses Collection

Main collection. Stores multilingual course details and ordered learning content.

{
  _id: ObjectId,

  title: {
    en: String,
    hi: String,
    mr: String
  },

  description: {
    en: String,
    hi: String,
    mr: String
  },

  shortDescription: {
    en: String,
    hi: String,
    mr: String
  },

  languageAvailable: ["en", "hi", "mr"],

  categoryId: ObjectId,

  tags: {
    en: [String],
    hi: [String],
    mr: [String]
  },

  difficulty: "Beginner" | "Intermediate" | "Advanced",

  price: Number,
  currency: "INR",
  isPaid: Boolean,

  instructorId: ObjectId,

  thumbnailUrl: String,

  certificateTemplateId: ObjectId,

  completionRules: {
    requireAllContentBlocksCompleted: Boolean,
    requireAllQuizzesPassed: Boolean,
    minimumQuizPassingPercentage: Number
  },

  modules: [
    {
      moduleId: ObjectId,
      order: Number,

      moduleTitle: {
        en: String,
        hi: String,
        mr: String
      },

      moduleDescription: {
        en: String,
        hi: String,
        mr: String
      },

      submodules: [
        {
          submoduleId: ObjectId,
          order: Number,

          submoduleTitle: {
            en: String,
            hi: String,
            mr: String
          },

          submoduleDescription: {
            en: String,
            hi: String,
            mr: String
          },

          contentBlocks: [
            {
              blockId: ObjectId,
              order: Number,

              type: "TEXT" | "VIDEO" | "QUIZ",

              title: {
                en: String,
                hi: String,
                mr: String
              },

              textContent: {
                en: String,
                hi: String,
                mr: String
              },

              videoUrl: String,
              videoFileName: String,
              durationMinutes: Number,
              isPreview: Boolean,

              quizId: ObjectId,

              isRequiredForCompletion: Boolean
            }
          ]
        }
      ]
    }
  ],

  recommendationFeatures: {
    stream: String,
    skillLevel: "Beginner" | "Intermediate" | "Advanced",
    targetAgeGroups: [String],
    targetEducationLevels: [String],
    careerGoals: [String],
    keywords: [String]
  },

  translationStatus: {
    hi: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
    mr: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  },

  metrics: {
    averageRating: Number,
    totalRatings: Number,
    totalEnrollments: Number,
    completionRate: Number,
    popularityScore: Number,
    feedbackScore: Number
  },

  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",

  createdAt: Date,
  updatedAt: Date
}
3. categories Collection

Stores course categories.

{
  _id: ObjectId,

  name: {
    en: String,
    hi: String,
    mr: String
  },

  slug: String,

  description: {
    en: String,
    hi: String,
    mr: String
  },

  isActive: Boolean,

  createdAt: Date,
  updatedAt: Date
}
4. quizzes Collection

Stores quiz questions for quiz content blocks.

{
  _id: ObjectId,

  courseId: ObjectId,
  moduleId: ObjectId,
  submoduleId: ObjectId,

  title: {
    en: String,
    hi: String,
    mr: String
  },

  questions: [
    {
      questionId: ObjectId,

      questionText: {
        en: String,
        hi: String,
        mr: String
      },

      options: [
        {
          optionId: ObjectId,

          text: {
            en: String,
            hi: String,
            mr: String
          }
        }
      ],

      correctOptionId: ObjectId,
      marks: Number
    }
  ],

  totalMarks: Number,
  passingMarks: Number,
  timeLimitMinutes: Number,

  createdAt: Date,
  updatedAt: Date
}
5. enrollments Collection

Stores student course access, progress, completion, and certificate reference.

{
  _id: ObjectId,

  userId: ObjectId,
  courseId: ObjectId,
  paymentId: ObjectId,

  accessStatus: "ACTIVE" | "LOCKED" | "EXPIRED" | "REFUNDED",

  status: "ENROLLED" | "COMPLETED",

  progressPercentage: Number,

  completedBlocks: [
    {
      moduleId: ObjectId,
      submoduleId: ObjectId,
      blockId: ObjectId,
      blockType: "TEXT" | "VIDEO" | "QUIZ",
      completedAt: Date
    }
  ],

  quizResults: [
    {
      quizId: ObjectId,
      score: Number,
      totalMarks: Number,
      percentage: Number,
      status: "PASSED" | "FAILED",
      attemptedAt: Date
    }
  ],

  completionStatus: {
    allRequiredBlocksCompleted: Boolean,
    allRequiredQuizzesPassed: Boolean,
    completedAt: Date
  },

  certificateId: ObjectId,

  lastAccessed: {
    moduleId: ObjectId,
    submoduleId: ObjectId,
    blockId: ObjectId
  },

  totalTimeSpentMinutes: Number,

  enrolledAt: Date,
  completedAt: Date,
  updatedAt: Date
}
6. payments Collection

Stores Razorpay payment details.

{
  _id: ObjectId,

  userId: ObjectId,
  courseId: ObjectId,

  amount: Number,
  currency: "INR",

  provider: "RAZORPAY",

  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,

  status: "CREATED" | "SUCCESS" | "FAILED" | "REFUNDED",

  paymentMethod: "UPI" | "CARD" | "NETBANKING" | "WALLET" | "UNKNOWN",

  paidAt: Date,
  failureReason: String,

  createdAt: Date,
  updatedAt: Date
}
7. ratings Collection

Stores course ratings and reviews.

{
  _id: ObjectId,

  userId: ObjectId,
  courseId: ObjectId,

  rating: Number,

  review: {
    en: String,
    hi: String,
    mr: String
  },

  createdAt: Date,
  updatedAt: Date
}
8. user_activity Collection

Stores learner behavior for analytics and recommendations.

{
  _id: ObjectId,

  userId: ObjectId,

  activityType:
    "SEARCH" |
    "COURSE_CLICK" |
    "VIDEO_WATCH" |
    "TEXT_READ" |
    "QUIZ_ATTEMPT" |
    "ENROLL" |
    "COMPLETE" |
    "RATING",

  courseId: ObjectId,
  moduleId: ObjectId,
  submoduleId: ObjectId,
  blockId: ObjectId,

  searchQuery: String,

  metadata: {
    language: "en" | "hi" | "mr",
    timeSpentSeconds: Number,
    watchedPercentage: Number,
    page: "dashboard" | "search" | "course_detail" | "course_player"
  },

  createdAt: Date
}
9. recommendation_feedback Collection

Stores whether recommendations were useful.

{
  _id: ObjectId,

  userId: ObjectId,
  courseId: ObjectId,

  recommendationType: "DASHBOARD" | "SEARCH",

  feedback: "RELEVANT" | "NOT_RELEVANT",

  reason:
    "Too Beginner" |
    "Too Advanced" |
    "Not My Stream" |
    "Already Know This" |
    "Too Expensive" |
    "Other",

  createdAt: Date
}
10. certificate_templates Collection

Stores admin-uploaded certificate templates.

{
  _id: ObjectId,

  uploadedByAdminId: ObjectId,

  templateName: String,
  templateUrl: String,

  templateType: "IMAGE" | "PDF",

  placeholders: [
    "studentName",
    "courseTitle",
    "completionDate",
    "certificateId",
    "instructorName"
  ],

  isDefault: Boolean,
  isActive: Boolean,

  createdAt: Date,
  updatedAt: Date
}
11. certificates Collection

Stores generated student certificates.

{
  _id: ObjectId,

  userId: ObjectId,
  courseId: ObjectId,
  enrollmentId: ObjectId,

  templateId: ObjectId,

  certificateId: String,

  studentName: String,
  courseTitle: String,
  instructorName: String,

  certificateUrl: String,

  issuedAt: Date,

  status: "GENERATED" | "REVOKED"
}
12. notifications Collection

Stores in-app notifications.

{
  _id: ObjectId,

  userId: ObjectId,

  title: {
    en: String,
    hi: String,
    mr: String
  },

  message: {
    en: String,
    hi: String,
    mr: String
  },

  type: "COURSE" | "QUIZ" | "CERTIFICATE" | "PAYMENT" | "RECOMMENDATION" | "ADMIN",

  relatedCourseId: ObjectId,
  relatedEnrollmentId: ObjectId,
  relatedCertificateId: ObjectId,

  isRead: Boolean,

  createdAt: Date
}