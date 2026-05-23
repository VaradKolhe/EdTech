# Testing Guide

This project uses an automated test suite based on 44 predefined test cases (TC-01 to TC-44).

## Commands

Run these from the project root:

- **Run all tests:** `npm run test:all`
- **Backend only:** `npm run test:backend` (Jest + Supertest)
- **Frontend only:** `npm run test:frontend` (Vitest)

## Test Architecture

- **Backend:** Located in `backend/tests/`. Uses a dedicated In-Memory MongoDB server.
- **Frontend:** Located in `frontend/src/tests/`. Uses Vitest for fast UI logic validation.

## Interpreting Results

- ✅ **PASSED:** Feature works as expected.
- ❌ **FAILED:** A regression occurred or a bug was introduced.
- ⚠️ **NOT IMPLEMENTED:** The test is present but the feature does not exist in the codebase yet. These are logged in the console during execution.

## Adding New Tests

1. Identify the Module (Auth, Course, etc.).
2. Open the corresponding `.test.js` (backend) or `.test.jsx` (frontend) file.
3. Add a new test using the following format:
   ```javascript
   test("TC-XX: Scenario description", async () => {
     // implementation
   });
   ```
4. Update the mapping table in `GEMINI.md` to reflect the new coverage.
