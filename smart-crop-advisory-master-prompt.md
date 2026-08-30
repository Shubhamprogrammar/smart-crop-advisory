# MASTER PROMPT — SMART CROP ADVISORY SYSTEM FOR SMALL & MARGINAL FARMERS

You are a senior full-stack engineer, AI/ML engineer, software architect, UI/UX designer, and hackathon technical lead.

I want you to help me BUILD a complete production-quality hackathon project called:

# SMART CROP ADVISORY SYSTEM FOR SMALL & MARGINAL FARMERS

The system should help small and marginal farmers make better farming decisions using AI, weather data, soil data, crop information, disease detection, market prices, profitability analysis, multilingual assistance, and personalized recommendations.

This is a HACKATHON PROJECT, so the application must be:

* Functional
* Impressive
* Demo-ready
* Mobile-friendly
* Easy for farmers to use
* Technically credible
* AI-powered
* Modular
* Deployable
* Well documented

Do NOT create a fake UI-only prototype. Build real working APIs, database models, AI integrations, validation, authentication, and frontend functionality wherever possible.

============================================================

1. TECHNOLOGY STACK
   ============================================================

Frontend:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Recharts
* TanStack Query where useful
* Zustand where useful
* Leaflet + OpenStreetMap for maps

Backend:

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT authentication
* bcrypt/argon2
* Redis
* BullMQ for background jobs

AI/ML:

* Python
* FastAPI
* Hugging Face
* PyTorch / scikit-learn where appropriate
* OpenCV where appropriate
* OCR for soil reports
* RAG for agricultural knowledge

Storage:

* Cloudinary for uploaded crop/leaf/soil images

External services:

* Weather API
* Agricultural/market-price data source
* OpenStreetMap
* Hugging Face APIs/models

Deployment:

* Next.js → Vercel
* Node.js backend → DigitalOcean/AWS/Render
* Python AI service → DigitalOcean/AWS/Render
* MongoDB → MongoDB Atlas
* Redis → Redis Cloud or hosted Redis
* Images → Cloudinary

============================================================
2. IMPORTANT ARCHITECTURE DECISION
==================================

Use Node.js + Express as the MAIN backend.

Use Python + FastAPI ONLY for AI/ML/computer-vision/OCR workloads.

Architecture:

Farmer
↓
Next.js Frontend
↓
Node.js + Express API
↓
MongoDB / Redis
↓
Python FastAPI AI Service
↓
Hugging Face / ML Models

Do NOT unnecessarily move normal backend functionality into Python.

Node.js should handle:

* Authentication
* Users
* Farms
* Soil records
* Crops
* Crop cycles
* Weather
* Market prices
* Advisories
* Notifications
* Profit calculations
* AI orchestration
* Chat history
* Admin
* Expert functionality

Python should handle:

* Crop recommendation ML
* Disease image detection
* Disease-risk prediction
* OCR
* ML preprocessing
* ML inference
* Other computer-vision tasks

============================================================
3. CORE FEATURES
================

The application MUST contain all of the following.

A. Authentication

* Farmer registration
* Farmer login
* Logout
* JWT
* Password hashing
* Protected routes
* Role-based authorization
* Farmer
* Agriculture Expert
* Admin

B. Farmer Profile

* Name
* Phone/email
* Preferred language
* Location
* Farming experience
* Profile information

C. Farm Management

* Add farm
* Edit farm
* Delete farm
* Land area
* Location
* Latitude
* Longitude
* Soil type
* Irrigation type
* Current crop
* Multiple farms per farmer

D. Soil Management

* Manual soil entry
* Soil test report upload
* Soil image/report storage
* OCR extraction
* NPK
* pH
* Organic carbon
* Moisture
* Soil health score
* Soil interpretation
* Fertilizer recommendation

E. Weather

* Current weather
* Forecast
* Temperature
* Humidity
* Rainfall
* Rain probability
* Wind speed
* Weather condition
* Location-specific weather
* Weather caching using Redis

F. Crop Recommendation
Recommend crops based on:

* N
* P
* K
* pH
* Temperature
* Humidity
* Rainfall
* Season
* Location
* Soil type
* Water availability
* Market conditions
* Expected profitability

Return:

* Recommended crops
* Suitability score
* Explanation
* Benefits
* Risks

G. Crop Calendar
Stages:

* Sowing
* Germination
* Vegetative
* Flowering
* Fruiting
* Harvest

Provide:

* Tasks
* Fertilizer recommendations
* Irrigation recommendations
* Pest monitoring
* Disease monitoring
* Harvest timing
* Notifications

H. Disease Detection
Farmer uploads a leaf/crop image.

Flow:
Image
→ Cloudinary
→ Node.js
→ Python FastAPI
→ Hugging Face/CV model
→ Disease prediction

Return:

* Disease
* Confidence
* Severity
* Symptoms
* Possible causes
* Prevention
* Treatment
* Recommended next action

Initially support a realistic limited number of crops/diseases rather than pretending to support every crop.

Recommended initial crops:

* Tomato
* Potato
* Rice
* Wheat
* Cotton
* Maize

I. Disease Risk Prediction

This is DIFFERENT from image detection.

Use:

* Temperature
* Humidity
* Rainfall
* Crop
* Crop stage
* Historical information

Return:

* Low/Medium/High risk
* Reason
* Recommended preventive action

J. Smart Advisory Engine

Create a dedicated advisory engine.

Inputs:

* Soil
* Weather
* Crop
* Crop stage
* Disease detection
* Disease risk
* Water availability
* Market data
* Farmer profile

Output:

* Personalized recommendation
* Priority
* Reason
* Action
* Deadline if applicable

Example:

Heavy rainfall expected.

Output:

HIGH PRIORITY:

* Do not irrigate
* Avoid pesticide spraying
* Protect harvested crops

IMPORTANT:
Do NOT let an LLM independently make all agricultural decisions.

Use:
Rules + ML + Data + LLM

LLM should primarily explain/adapt recommendations into farmer-friendly language.

K. AI Farmer Assistant

Build a conversational AI assistant.

Farmer can ask questions such as:

"मेरे टमाटर के पत्ते पीले हो रहे हैं, क्या करूं?"

The assistant should consider:

* Farmer location
* Farm
* Crop
* Soil
* Weather
* Crop stage
* Disease history

Support:

* English
* Hindi
* Marathi
* Gujarati

Responses should use simple farmer-friendly language.

L. RAG Knowledge Base

Create an agricultural knowledge base.

Knowledge should include:

* Crop cultivation
* Disease management
* Fertilizer guidance
* Irrigation
* Pest management
* Soil management
* Crop calendars
* Government agriculture information
* Farming best practices
* Government schemes where reliable information is available

Pipeline:

Documents
→ Text extraction
→ Chunking
→ Embeddings
→ Vector search
→ Relevant context
→ Hugging Face LLM
→ Answer

Prefer MongoDB Vector Search if practical.

If MongoDB Vector Search is not available in the selected environment, use Qdrant.

Do NOT add another database unnecessarily.

M. Profitability Calculator

Input:

* Crop
* Land area
* Seed cost
* Fertilizer cost
* Pesticide cost
* Labour
* Irrigation
* Other expenses
* Expected yield
* Market price

Calculate:

* Total cost
* Expected revenue
* Expected profit
* ROI

N. Market Intelligence

Provide:

* Crop market price
* Historical prices
* Price trends
* Nearby mandis/markets
* Market comparison
* Selling recommendation

Clearly distinguish:
REAL MARKET DATA
from
AI PREDICTIONS

Never present fabricated prices as real data.

O. Smart Irrigation

Use:

* Soil moisture
* Temperature
* Humidity
* Rain probability
* Crop
* Crop stage

Return:

* Irrigation required or not
* Recommended amount/frequency where data supports it
* Reason

Also design the system so that IoT soil-moisture sensors could be integrated later.

P. Notifications

Notification types:

* Weather
* Disease
* Irrigation
* Fertilizer
* Pest
* Harvest
* Market
* General

Support browser notifications.

Optional:

* Email
* SMS
* WhatsApp

Do not make optional notification services mandatory for the core application.

Q. Multilingual System

Languages:

* English
* Hindi
* Marathi
* Gujarati

The UI and AI assistant should respect the selected language.

R. Farmer Dashboard

Create a beautiful, simple, mobile-first dashboard showing:

* Farmer name
* Farm
* Location
* Current crop
* Current weather
* Soil health
* Disease risk
* Today's advisory
* Irrigation recommendation
* Crop stage
* Today's tasks
* Expected profit
* Market price
* Notifications

S. Admin Dashboard

Admin should see:

* Total farmers
* Total farms
* Active crops
* Disease detections
* Advisories
* High-risk farms
* User activity
* Crop distribution
* Disease distribution
* Regional risk
* Market trends

Admin should manage:

* Users
* Crops
* Diseases
* Advisory rules
* Knowledge base

T. Agriculture Expert Module

Allow farmers to escalate a case to an agriculture expert.

Expert should be able to view:

* Farmer
* Farm
* Crop
* Soil
* Weather
* Disease image
* AI diagnosis
* AI recommendation

Expert can:

* Respond
* Add recommendation
* Mark case resolved

============================================================
4. DATABASE DESIGN
==================

Use MongoDB + Mongoose.

Create appropriate schemas/models for:

users
farms
soilReports
crops
cropCycles
cropRecommendations
diseaseDetections
diseaseRisks
weatherData
marketPrices
advisories
notifications
chats
chatMessages
knowledgeDocuments
cropCalendars
expertCases
expertResponses

Design proper:

* References
* Indexes
* Timestamps
* Validation
* Status fields

Avoid unnecessary duplication.

============================================================
5. API DESIGN
=============

Use REST APIs.

Example structure:

/api/auth
/api/users
/api/farms
/api/soil
/api/crops
/api/recommendations
/api/weather
/api/diseases
/api/advisories
/api/irrigation
/api/market
/api/profit
/api/calendar
/api/chat
/api/notifications
/api/expert
/api/admin
/api/knowledge

Use consistent responses:

{
"success": true,
"message": "...",
"data": {}
}

Errors:

{
"success": false,
"message": "...",
"error": {}
}

Implement:

* Validation
* Authentication middleware
* Role middleware
* Error middleware
* Rate limiting
* Logging
* Security headers
* CORS

============================================================
6. PROJECT STRUCTURE
====================

Create a clean monorepo-like structure:

smart-crop-advisory/

frontend/
backend/
ai-service/
docs/

Frontend should have a scalable structure.

Backend should follow:

controllers/
routes/
models/
services/
middlewares/
utils/
config/
validators/
jobs/

AI service:

app/
main.py
routes/
services/
models/
utils/
ml/
rag/

============================================================
7. ENVIRONMENT VARIABLES
========================

Create:

frontend/.env.local
backend/.env
ai-service/.env

Never hardcode:

* API keys
* JWT secret
* MongoDB credentials
* Hugging Face tokens
* Cloudinary credentials
* Weather API keys

Provide .env.example files.

============================================================
8. REDIS
========

Use Redis for:

* Weather caching
* Market caching
* Rate limiting
* AI response caching where appropriate
* Background jobs

Use BullMQ for:

* Weather synchronization
* Market synchronization
* Notifications
* Disease risk calculation
* Heavy AI jobs

============================================================
9. SECURITY
===========

Implement:

* JWT
* Secure password hashing
* Helmet
* CORS
* Rate limiting
* Request validation
* File validation
* File size limits
* Role-based authorization
* Secure environment variables
* Safe error messages
* Input sanitization
* AI prompt injection protection for RAG
* Prevent unauthorized image access
* Prevent unauthorized admin access

Do not expose secrets to the frontend.

============================================================
10. UI/UX REQUIREMENTS
======================

The application is for small and marginal farmers.

Therefore:

* Mobile-first
* Simple navigation
* Large buttons
* Minimal technical terminology
* Clear icons
* High readability
* Farmer-friendly wording
* Multilingual
* Low-bandwidth friendly
* Loading states
* Error states
* Empty states
* Skeleton loaders
* Responsive design

Do not make the UI look like a generic SaaS admin template.

Create a modern agriculture-focused design.

Use cards, charts, farm imagery where appropriate, but don't overdo visual effects.

### 10.1 DESIGN LANGUAGE — PROFESSIONAL, ELEGANT, MODERN, CLEAN, MINIMALISTIC

The visual design of this product is a first-class requirement, not an afterthought. It must look like a **polished, funded agri-tech product**, not a hackathon template or a generic dashboard boilerplate. Every screen must feel intentional.

**Core design principles:**

* Professional, elegant, modern, clean, simplistic, minimalistic — every screen should look deliberate, not decorative.
* Generous white space. Do not cram information. Let sections breathe.
* One clear visual hierarchy per screen — the farmer should know exactly where to look first (today's most important action).
* Consistency above novelty — same spacing scale, same corner radius, same shadow depth, same button style everywhere.
* Restraint over decoration — no gratuitous gradients, no unnecessary animation, no visual noise competing with the data.

**Color system:**

* A calm, earthy, agriculture-appropriate palette — think soil browns, leaf/sage greens, wheat/harvest gold, and sky blue as accents, on a mostly neutral (off-white/light gray) background. Avoid loud, saturated "tech startup" gradients.
* One dominant primary color (green-based, evoking growth/agriculture), one secondary accent (e.g., warm gold/amber for alerts or highlights), and a small, disciplined semantic set: success (healthy/low risk), warning (medium risk), danger (high risk/disease), info (neutral tips).
* Sufficient color contrast for outdoor/bright-sunlight mobile use — farmers will often view this screen outdoors. Prioritize legibility over subtlety.
* Optional dark mode is a nice-to-have, not a priority — outdoor daylight legibility in light mode matters more.

**Typography:**

* One clean, highly legible sans-serif type family (e.g., Inter, Manrope, or similar) for UI and Latin-script text, paired with a font that renders Devanagari/Gujarati script cleanly and legibly for Hindi/Marathi/Gujarati content — this is not optional given the multilingual requirement.
* A clear, limited type scale (e.g., 4–5 sizes total: display, heading, subheading, body, caption). No ad-hoc font sizes.
* Slightly larger base font size than a typical SaaS app, given the audience may include older users and outdoor/glare viewing conditions.

**Components & layout:**

* Rounded, soft-edged cards with a single consistent radius and a subtle, single-level shadow — avoid harsh borders and heavy drop shadows.
* Icon-first navigation with short labels — icons should be simple, filled/rounded (not thin technical line icons that are hard to parse), agriculture-relevant, and consistent in stroke/style across the app.
* Bottom navigation bar on mobile for the farmer app (thumb-reachable), not just a hamburger menu — the primary 4–5 actions (Dashboard, My Farms, Assistant, Market, Profile) should be one tap away.
* Data visualizations (weather, soil health, price trends) should be simple and glanceable — big numbers and simple charts, not dense technical charts.
* A single primary call-to-action per screen, visually dominant; secondary actions visually recessive.
* Empty, loading, and error states should be designed with the same care as populated states — friendly illustrations/icons and plain-language messaging, never a raw technical error.

**Farmer-specific UX considerations (in addition to what's already listed above):**

* Design for one-handed mobile use in a field, possibly in bright sunlight, with muddy/gloved hands — large tap targets (44px+), forgiving touch zones, minimal precision gestures (no complex swipes/drag-and-drop for core flows).
* Prefer icons + short words + optional voice input over long text wherever possible, given potential low literacy.
* Number-first UI for key stats (e.g., a large "₹4,200 expected profit" rather than a paragraph explaining it), with detail available on tap/expand.
* Status should be communicable in under 3 seconds at a glance — color + icon + one short phrase (e.g., a green leaf icon + "Healthy" rather than a paragraph).
* Photography/illustration style, if used, should be authentic and warm (real-feeling farms/crops/hands), not generic stock-photo corporate imagery.

The end result should look like something a real agri-tech startup would ship — the kind of UI that makes judges say "this actually looks like a product," while still being instantly usable by a farmer with a basic smartphone.

============================================================
11. DASHBOARD NAVIGATION
========================

Farmer navigation:

Dashboard
My Farms
Soil Health
Crop Recommendation
My Crops
Disease Detection
Weather
Irrigation
Market
Profitability
Crop Calendar
AI Assistant
Notifications
Ask Expert
Profile

Admin navigation:

Dashboard
Farmers
Farms
Crops
Diseases
Advisories
Knowledge Base
Market Data
Analytics
Experts
Settings

Expert navigation:

Dashboard
Assigned Cases
Farmer Cases
Recommendations
Profile

============================================================
12. AI ARCHITECTURE
===================

Do NOT make one giant AI endpoint.

Create separate AI capabilities:

/ai/crop-recommendation
/ai/disease-detection
/ai/disease-risk
/ai/soil-ocr
/ai/chat
/ai/embeddings

Node.js should communicate with FastAPI.

Example:

Node.js
POST /api/recommendations/crop

↓

FastAPI

POST /ai/crop-recommendation

↓

ML model

↓

FastAPI response

↓

Node.js

↓

MongoDB

↓

Frontend

============================================================
13. CROP RECOMMENDATION MODEL
=============================

Create a baseline ML implementation.

Use a suitable agricultural dataset.

Features can include:

N
P
K
temperature
humidity
ph
rainfall

Train/evaluate a suitable model such as:

* Random Forest
* Gradient Boosting
* XGBoost if appropriate

Do not fabricate model accuracy.

If using a pretrained model/API instead of training:

* Clearly document it.

Return:

* crop
* confidence/suitability
* explanation

============================================================
14. DISEASE MODEL
=================

Use a suitable Hugging Face computer vision model or compatible pretrained model.

Pipeline:

Image
→ preprocessing
→ model inference
→ disease
→ confidence
→ advisory mapping

Create a disease knowledge mapping separately.

Do not hallucinate treatment instructions.

For uncertain predictions:
Return:

"Unable to confidently identify the disease. Please upload a clearer image or consult an agriculture expert."

============================================================
15. RAG IMPLEMENTATION
======================

Create ingestion:

PDF/document
→ extract text
→ clean text
→ chunk
→ embedding
→ vector database

Create retrieval:

Question
→ embedding
→ vector search
→ top K chunks
→ prompt
→ LLM
→ answer

Always instruct the LLM:

* Do not invent agricultural facts.
* Use retrieved information.
* Clearly state uncertainty.
* Encourage expert consultation for serious cases.
* Never invent pesticide dosages.

============================================================
16. WEATHER ADVISORY ENGINE
===========================

Example rules:

High rain probability
→ Avoid unnecessary irrigation.

High humidity + suitable temperature + susceptible crop
→ Increase fungal disease monitoring.

Strong wind
→ Avoid spraying.

Extreme temperature
→ Issue crop protection advisory.

Design rules so they are configurable from the admin system.

============================================================
17. PROFIT ENGINE
=================

Calculate:

totalCost =
seed +
fertilizer +
pesticide +
labour +
irrigation +
otherCosts

revenue =
expectedYield × marketPrice

profit =
revenue - totalCost

ROI =
profit / totalCost × 100

Clearly label estimates as estimates.

============================================================
18. ERROR HANDLING
==================

Handle:

* Weather API failure
* Hugging Face failure
* AI timeout
* Image upload failure
* MongoDB failure
* Redis failure
* Invalid image
* Invalid soil report
* Missing market data
* Low AI confidence

The application should degrade gracefully.

Example:

If weather API fails:
"Weather information is temporarily unavailable."

Do not crash the dashboard.

============================================================
19. TESTING
===========

Backend:

* Jest
* Supertest

Test:

* Auth
* Farm
* Soil
* Weather
* Crop recommendation
* Disease detection
* Advisory
* Market
* Profit
* Admin permissions

AI:

* Unit tests
* Sample prediction tests
* Invalid input tests

Frontend:

* Critical user-flow testing

Create API test documentation.

============================================================
20. DOCKER
==========

Create Dockerfiles for:

frontend
backend
ai-service

Create:

docker-compose.yml

Services:

frontend
backend
ai-service
redis

MongoDB should preferably use MongoDB Atlas.

============================================================
21. DEPLOYMENT
==============

Prepare production deployment.

Frontend:
Vercel

Backend:
DigitalOcean/AWS/Render

AI:
DigitalOcean/AWS/Render

MongoDB:
MongoDB Atlas

Redis:
Redis Cloud

Cloudinary:
Image storage

Create:

* Production environment variables
* Health endpoints
* API health checks
* CORS configuration
* Deployment README

============================================================
22. HEALTH ENDPOINTS
====================

Backend:

GET /health

AI:

GET /health

Return service status.

============================================================
23. DEMO DATA
=============

Create realistic seed data.

Include:

* Farmers
* Farms
* Crops
* Soil reports
* Weather
* Market prices
* Crop calendars
* Disease information
* Advisory rules

Clearly label seed/demo data.

Never represent fake market data as real.

============================================================
24. DEMO SCENARIO
=================

The entire application should support this demo:

A small farmer registers.

↓

Adds a 2-acre farm.

↓

Selects location.

↓

Adds soil information.

↓

System analyzes soil.

↓

Weather is fetched automatically.

↓

AI recommends suitable crops.

↓

Farmer selects tomato.

↓

Crop calendar is created.

↓

System monitors weather.

↓

Disease risk becomes high because of humidity/weather.

↓

Farmer receives notification.

↓

Farmer uploads tomato leaf image.

↓

AI detects disease.

↓

System provides confidence and safe advisory.

↓

Farmer asks AI assistant a question in Hindi/Marathi/Gujarati.

↓

RAG retrieves relevant agricultural information.

↓

AI responds in the selected language.

↓

Farmer checks irrigation recommendation.

↓

Farmer checks market price.

↓

Farmer calculates expected profit.

↓

Farmer can ask an agriculture expert.

This complete flow should work during the hackathon demonstration.

============================================================
25. DEVELOPMENT METHOD — VERY IMPORTANT
=======================================

DO NOT try to generate the entire application in one response.

Build it PHASE BY PHASE.

Use these phases:

PHASE 0:
Architecture + repository setup

PHASE 1:
Database models

PHASE 2:
Authentication

PHASE 3:
Farmer + Farm management

PHASE 4:
Soil management

PHASE 5:
Weather integration

PHASE 6:
Crop recommendation AI

PHASE 7:
Crop calendar

PHASE 8:
Disease detection

PHASE 9:
Disease risk

PHASE 10:
Smart advisory engine

PHASE 11:
AI farmer assistant

PHASE 12:
RAG

PHASE 13:
Profitability

PHASE 14:
Market intelligence

PHASE 15:
Smart irrigation

PHASE 16:
Notifications

PHASE 17:
Multilingual support

PHASE 18:
Farmer dashboard

PHASE 19:
Admin dashboard

PHASE 20:
Expert module

PHASE 21:
Redis + BullMQ

PHASE 22:
Security

PHASE 23:
Testing

PHASE 24:
Docker

PHASE 25:
Deployment

PHASE 26:
Monitoring

PHASE 27:
Final hackathon polish

============================================================
26. GIT & VERSION CONTROL WORKFLOW — VERY IMPORTANT
====================================================

This project uses the following GitHub remote:

```
https://github.com/Shubhamprogrammar/smart-crop-advisory.git
```

**Every feature/phase must be pushed to GitHub as it is completed. Do not accumulate multiple phases/features locally without pushing.**

Rules:

* At Phase 0, initialize the repo and connect the remote:

  ```
  git init
  git remote add origin https://github.com/Shubhamprogrammar/smart-crop-advisory.git
  git branch -M main
  ```
* Work feature-by-feature / phase-by-phase. Each phase (or, within a large phase, each meaningful sub-feature) should be its own commit — never one giant commit at the end.
* Use clear, conventional commit messages, e.g.:

  * `feat(auth): add JWT login and registration`
  * `feat(farm): add farm CRUD APIs and schema`
  * `feat(weather): integrate weather API with Redis caching`
  * `feat(disease): add disease detection pipeline via FastAPI`
  * `fix(...)`, `chore(...)`, `docs(...)`, `test(...)` as appropriate.
* After completing and testing each phase/feature, always:

  ```
  git add .
  git commit -m "feat(<scope>): <short description of what was built>"
  git push origin main
  ```
* If working with feature branches (recommended if team of 3 developers is working in parallel):

  ```
  git checkout -b feature/<feature-name>
  ... work ...
  git add .
  git commit -m "feat(<scope>): <description>"
  git push origin feature/<feature-name>
  ```

  then open a PR into `main` and merge once reviewed.
* Never commit `.env` files or secrets — ensure `.gitignore` is created in Phase 0 covering `node_modules/`, `.env*`, `.next/`, `dist/`, `__pycache__/`, `venv/`, and build artifacts.
* Tag major milestones if useful for the hackathon submission, e.g. `git tag v0.1-mvp` after the MVP demo flow works end-to-end.
* At the end of every phase in this conversation, explicitly give me the exact `git add / commit / push` commands to run for that phase's work — this is already required by Section 25 for each phase, and the commit message must follow the convention above and reference the remote repository.

The GitHub repository must always reflect real, incremental, feature-by-feature progress — not a single bulk upload at the end. This is important both for good engineering practice and for demonstrating real progress to hackathon judges/mentors who may review commit history.

============================================================
27. CODE QUALITY RULES
======================

Write production-quality code.

Use:

* TypeScript for Node.js
* Proper interfaces/types
* Async/await
* Centralized error handling
* Environment validation
* Service/controller architecture
* Reusable components
* Reusable API client
* Proper API response structure
* Input validation
* Logging

Avoid:

* Huge monolithic files
* Duplicate code
* Hardcoded secrets
* Hardcoded URLs
* Hardcoded API keys
* Any/unknown abuse
* Fake API responses
* Fake AI responses
* Unnecessary dependencies
* Unnecessary microservices

============================================================
28. AI SAFETY / RELIABILITY
===========================

Agricultural recommendations can affect real crops and money.

Therefore:

* Never claim certainty when model confidence is low.
* Display confidence.
* Clearly label predictions.
* Distinguish data from AI-generated advice.
* Never fabricate market prices.
* Never fabricate weather.
* Never invent pesticide dosages.
* For serious disease cases, recommend consultation with an agriculture expert.
* Store model version and prediction timestamp where useful.
* Log AI failures.

============================================================
29. PERFORMANCE
===============

Optimize for:

* Mobile devices
* Low bandwidth
* API response time
* Image compression
* Caching
* Lazy loading
* Pagination
* Database indexes
* Redis caching
* Background jobs

Do not perform expensive AI inference synchronously if it can be moved to a background job.

============================================================
30. FINAL DELIVERABLE
=====================

At the end, the project should contain:

1. Complete Next.js frontend
2. Complete Node.js + Express backend
3. Complete Python + FastAPI AI service
4. MongoDB database
5. Redis
6. BullMQ
7. Hugging Face integration
8. Crop recommendation
9. Disease detection
10. Disease-risk prediction
11. Soil analysis
12. OCR
13. Weather
14. Market intelligence
15. Profitability
16. Irrigation recommendation
17. Crop calendar
18. Smart advisory engine
19. RAG
20. AI farmer assistant
21. Multilingual support
22. Notifications
23. Farmer dashboard
24. Admin dashboard
25. Expert module
26. Authentication
27. Security
28. Tests
29. Docker
30. Deployment configuration
31. Seed/demo data
32. Documentation
33. A GitHub repository with clean, feature-by-feature commit history (https://github.com/Shubhamprogrammar/smart-crop-advisory.git)
34. A professional, elegant, modern, clean, minimalistic, farmer-friendly UI throughout

============================================================
31. FIRST RESPONSE
==================

For your FIRST response, DO NOT write implementation code.

Instead give me:

# Smart Crop Advisory System — Technical Blueprint

Include:

1. High-level architecture
2. Detailed architecture
3. Folder structure
4. Database collections and relationships
5. API modules
6. AI services
7. RAG architecture
8. Weather architecture
9. Market architecture
10. Notification architecture
11. Redis/BullMQ architecture
12. Authentication architecture
13. Role permissions
14. Frontend pages
15. Backend routes
16. AI endpoints
17. External APIs/services
18. Environment variables
19. Development phases
20. Hackathon demo flow
21. Team task division for 3 developers
22. Risks and fallback plans
23. MVP vs advanced features
24. Deployment architecture
25. Git workflow and branching strategy for the team
26. UI/UX design system summary (colors, typography, components, layout principles)

After presenting this blueprint, WAIT for my instruction.

Do not start coding until I explicitly say:

"START PHASE 0"

============================================================
IMPORTANT
=========

Remember:

This is not a simple CRUD application.

The key differentiator is:

DATA
+
AI
+
WEATHER
+
SOIL
+
CROP
+
DISEASE
+
MARKET
+
PROFIT
+
PERSONALIZATION
+
ACTIONABLE ADVISORY

The final system should answer:

"What should this farmer do TODAY, and WHY?"

Build the application around that principle — and every screen the farmer sees should look professional, elegant, modern, clean, and minimalistic while remaining instantly usable in a field with one hand.
