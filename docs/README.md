# Documentation - HomeStay Dorm

Reference documentation for the HomeStay Dorm system.

## System Architecture - TODO

Complete system architecture documentation pending implementation.

### Pending Items
- [ ] Document overall system architecture
- [ ] Define component interactions
- [ ] Create architecture diagrams
- [ ] Document design patterns used
- [ ] Define API layer structure
- [ ] Document business logic layer

### Architecture Overview (To Be Completed)

The system will use a Client-Server architecture with:
- **Frontend**: Angular 21 + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Services**: Cloudinary, Resend, VietQR

---

## API Endpoints Documentation

The planned API endpoint specification is maintained in [architecture/api-endpoints.md](./architecture/api-endpoints.md). Use that file as the source of truth for backend API paths used by tasks and SUC sequence diagrams.

### Base URL
```
http://localhost:3000/api
```

### Endpoint Categories
- Authentication
- Rooms and branches
- Rental requests and viewing appointments
- Deposits, contracts, handovers, settlements, and transactions
- Customer booking status
- Admin dashboard and user management

### Pending Items
- [ ] Create request/response examples for each endpoint
- [ ] Document error codes and messages
- [ ] Define rate limiting
- [ ] Document authentication headers
- [ ] Create API testing guide

---

## Reference Files

- `GitHub_Development_Standards.pdf` - Development standards
- `Requirements.pdf` - Project requirements

## Additional Resources

- See [../README.md](../README.md) for project overview
- See [../supabase/README.md](../supabase/README.md) for database setup
- See [../frontend/README.md](../frontend/README.md) for Angular setup
- See [../backend/README.md](../backend/README.md) for Express setup
