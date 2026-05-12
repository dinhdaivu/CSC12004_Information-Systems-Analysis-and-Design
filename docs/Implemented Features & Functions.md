# Implemented Features & Functions

**Project:** HomeStay Dorm Management System (CSC12004)  
**Stack:** Angular 21 (Frontend) · Express.js \+ TypeScript (Backend) · Supabase (PostgreSQL \+ Realtime)

---

## **1\. Authentication Module**

**Backend:** POST/GET /api/auth/\* | **Frontend:** auth/ feature

| \# | Function / Feature | Description |
| ----- | ----- | :---- |
| 1 | **User Registration** | New users register with email, password, and full name. Email verification is sent automatically. |
| 2 | **Email Verification** | Users verify their account via a 6-digit OTP code sent to their email. |
| 3 | **Resend Verification Email** | Users can request a new OTP if the first one expires. |
| 4 | **Login** | Authenticates user with email \+ password; returns a JWT access token. Rate-limited to prevent brute force. |
| 5 | **Forgot Password** | Sends a password-reset OTP to the user's email. |
| 6 | **Reset Password** | User submits OTP \+ new password to reset their credentials. |
| 7 | **Logout** | Invalidates the current session server-side. |
| 8 | **Get Current User (/me)** | Returns the authenticated user's profile. |
| 9 | **Update Profile (PATCH /me)** | Allows a user to update their own personal info (name, phone, gender, etc.). |
| 10 | **Role-Based Access Control (RBAC)** | Routes are protected by roles: customer, sale, accountant, manager, admin. |
| 11 | **Auth Guard (Frontend)** | Angular route guard that redirects unauthenticated users to the login page. |

---

## **2\. Room Management Module**

**Backend:** GET/POST/PATCH/DELETE /api/rooms | **Frontend:** rooms/ \+ admin/rooms-management

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **List Rooms (with Filters)** | Fetch all rooms with optional filters: branch, zone, status, type, bed status, capacity, price range, and keyword search. |
| 2 | **Search Rooms** | Keyword search across room number, branch name, room type, and bed number. |
| 3 | **Get Room Detail** | Fetch a single room with its full details including beds and branch. |
| 4 | **Create Room** | Admin/manager can create a new room with type, capacity, price, amenities, and images. |
| 5 | **Update Room** | Admin/manager can update room details (partial update supported). |
| 6 | **Delete Room** | Admin can delete a room (returns 404 if not found). |
| 7 | **Room Listing Page** | Customer-facing page showing available rooms with filter UI. |
| 8 | **Room Detail Page** | Detailed view of a single room with beds, images, and amenities. |
| 9 | **Admin Rooms Management Page** | Admin UI to view, create, edit, and delete rooms with a management table. |

---

## **3\. Bed Management Module**

**Backend:** POST/PATCH /api/beds

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **Create Bed** | Add a new bed to a room with bed number, price, and status. |
| 2 | **Update Bed** | Update bed details (price, status, etc.). |

---

## **4\. Rental Request Module**

**Backend:** POST/GET/PATCH /api/rental-requests | **Frontend:** admin/rental-requests

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **Submit Rental Request** | Customer submits a request to rent a specific room or bed, with budget range and notes. |
| 2 | **Availability Check** | Before submitting, the system verifies the target room/bed is still available. |
| 3 | **View My Requests** | Customer views their own submitted rental requests. |
| 4 | **Admin: List All Requests** | Staff/admin sees all rental requests with filters. |
| 5 | **Admin: View Request Detail** | View full details of a specific rental request. |
| 6 | **Admin: Update Request Status** | Staff approves, rejects, or progresses a rental request through statuses. |

---

## **5\. Booking Module**

**Backend:** GET/POST /api/my-bookings | **Frontend:** bookings/

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **View My Bookings** | Customer views all their active and past bookings. |
| 2 | **Booking Detail** | View full detail for a single booking (room, dates, status, payments). |
| 3 | **Perform Booking Actions** | Customer can perform lifecycle actions on a booking (e.g., confirm, cancel). |
| 4 | **New Booking Form** | Dedicated form page for initiating a new booking. |

---

## **6\. Contract Module**

**Backend:** GET/POST/PATCH /api/contracts | **Frontend:** contracts/ \+ admin/contracts

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **List Contracts (Admin)** | Admin/staff sees all contracts with search and filter. |
| 2 | **Get Contract Detail** | View a single contract's full information. |
| 3 | **Create Contract** | Admin creates a new rental contract for a customer. |
| 4 | **Update Contract** | Admin can update contract terms or status. |
| 5 | **Customer Contracts Page** | Customer views their own contracts. |

---

## 

## **7\. Payment & Deposit Module**

**Backend:** GET/PATCH /api/payments, GET/PATCH /api/deposits | **Frontend:** admin/payments, accountant/

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **List Payments (Admin)** | Admin/accountant views all payment records. |
| 2 | **List Deposits** | View all deposit records with filters. |
| 3 | **Get Deposit Detail** | View a specific deposit record. |
| 4 | **Approve Deposit** | Staff marks a deposit as approved. |
| 5 | **Reject Deposit** | Staff rejects a deposit with a reason. |
| 6 | **Accountant: Monthly Billing** | Accountant screen to manage monthly billing cycles. |
| 7 | **Accountant: Transactions** | View and manage all financial transactions. |
| 8 | **Accountant: Final Settlement** | Process final settlement when a tenant leaves. |
| 9 | **Accountant: Refund Execution** | Execute refund payments for eligible cases. |

---

## **8\. Viewing Appointments Module**

**Backend:** POST/GET/PATCH /api/viewing-appointments

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **Schedule Viewing Appointment** | Customer books a room viewing appointment. |
| 2 | **List Appointments** | Staff/admin views all scheduled appointments. |
| 3 | **Get Appointment by ID** | View detail of a specific appointment. |
| 4 | **Approve Appointment** | Staff confirms a viewing appointment. |
| 5 | **Reject/Cancel Appointment** | Staff rejects or customer cancels an appointment. |
| 6 | **Admin: Scheduled Management Page** | UI for admin to review and act on viewing requests. |

---

## **9\. Real-Time Chat Module** 

**Backend:** POST/GET/PATCH /api/chat/\* | **Frontend:** admin/chat-inbox \+ chat-widget

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **Customer Chat Widget** | Floating chat button on every customer page; opens an in-app chat panel. |
| 2 | **Create / Resume Conversation** | Customer starts a new conversation or resumes an existing open one automatically. |
| 3 | **Send Message** | Both customers and staff can send text messages in a conversation. |
| 4 | **Real-Time Message Delivery** | Messages appear instantly on both sides via Supabase Realtime WebSocket (no page refresh needed). |
| 5 | **Admin Chat Inbox** | Admin/staff screen to see all open conversations and select one to reply. |
| 6 | **Read Receipts** | Messages are marked as "Read" when the other party views them. |
| 7 | **Close Conversation** | Staff can close a completed conversation; customer sees a "closed" notice. |
| 8 | **Role-Based Access** | Only customers can start conversations; only staff can list all conversations and close them. |

---

## **10\. User Management Module (Admin)**

**Backend:** GET/PATCH/DELETE /api/users | **Frontend:** admin/users-management

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **List Users (Paginated)** | Admin views all users with search, role filter, status filter, and pagination. |
| 2 | **Get User Detail** | View full profile of a specific user. |
| 3 | **Update User Role / Status** | Admin changes a user's role or activates/deactivates/bans them. |
| 4 | **Soft Delete User** | Admin deactivates a user account (sets status to inactive). |

---

## **11\. Branch & Zone Module**

**Backend:** GET /api/branches, GET /api/zones

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **List Branches** | Returns all available dormitory branches. |
| 2 | **Get Branch Detail** | Returns details for a single branch. |
| 3 | **List Zones** | Returns all zones (used for room organization). |

---

## **12\. Admin Dashboard**

**Backend:** GET /api/admin/dashboard | **Frontend:** admin/dashboard

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **Dashboard Summary** | Displays key metrics: total users, rooms, active bookings, revenue, pending requests, etc. |

---

## **13\. Lodging Eligibility Module**

**Backend:** GET/POST /api/lodging-eligibility

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **Check Eligibility** | Verifies whether a customer meets the requirements for a specific lodging. |
| 2 | **Submit Eligibility Request** | Customer submits their eligibility information for review. |

---

## **14\. Customer Dashboard & Profile**

**Frontend:** dashboard/, profile/

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **Customer Dashboard** | Overview of the customer's current booking, upcoming payments, and quick actions. |
| 2 | **Profile Management** | Customer views and edits their personal information (name, phone, avatar, etc.). |

---

## **15\. Public-Facing Pages**

**Frontend:** about/, contact/, guidelines/

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **About Page** | Displays information about the dormitory and the management company. |
| 2 | **Contact Page** | Contact form and address information. |
| 3 | **Guidelines Page** | Lists dormitory rules and living guidelines for residents. |

---

## **16\. Internationalization (i18n)**

**Frontend:** core/i18n/

| \# | Function / Feature | Description |
| :---- | :---- | :---- |
| 1 | **Multi-Language Support** | The UI supports switching between Vietnamese and English via a language selector. |
| 2 | **Language Persistence** | Selected language is saved and restored across sessions. |

---

## **17\. Cross-Cutting Technical Features**

| \# | Feature | Description |
| :---- | :---- | :---- |
| 1 | **JWT Authentication** | All protected API endpoints require a valid Bearer token. |
| 2 | **Rate Limiting** | Login and auth endpoints are rate-limited to prevent abuse. |
| 3 | **Error Handling Middleware** | Centralized Express error handler returns consistent JSON error responses. |
| 4 | **HTTP Interceptor (Frontend)** | Automatically attaches the auth token and handles 401 responses globally. |
| 5 | **Angular Route Guards** | Auth guard and role-based guards protect frontend routes. |
| 6 | **NgZone / Change Detection** | All async Supabase Realtime callbacks are wrapped in NgZone.run() for reliable Angular UI updates. |
| 7 | **Supabase Realtime** | WebSocket-based subscriptions power real-time updates in the chat module. |
| 8 | **Responsive Layout** | Admin and customer layouts are built with responsive design for different screen sizes. |
| 9 | **Test Coverage** | Unit and integration tests written with Jest for 16+ backend modules (services, controllers, routes, middleware). |

