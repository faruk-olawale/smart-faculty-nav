# Smart Faculty WebAR Navigation System
## Kwara State University, Malete
## Faculty of Engineering & Technology — MVP

## Architecture

MOBILE APP (React Native + Expo)
         │
         ├── Map Screen       (OpenStreetMap + Markers)
         ├── AR Screen        (WebXR + Three.js + AR.js)
         ├── QR Screen        (Expo Camera + Scanner)
         ├── Search Screen    (Autocomplete + Results)
         ├── Navigation       (Route + Turn-by-Turn)
         └── AI Assistant     (Chat Interface)
         │
         │  HTTP REST + WebSocket
         ▼
BACKEND API (Node.js + Express + TypeScript)
         │
         ├── /api/v1/buildings
         ├── /api/v1/faculties
         ├── /api/v1/departments
         ├── /api/v1/route      → OSRM
         ├── /api/v1/search
         ├── /api/v1/qr
         ├── /api/v1/assistant
         └── /ws                → Live GPS
         │
         │  Prisma ORM
         ▼
DATABASE (PostgreSQL)
         │
         ├── faculties
         ├── departments
         ├── buildings
         └── qr_locations
         │
         │  External
         ▼
SERVICES
         ├── OSRM  (router.project-osrm.org)
         └── OSM   (tile.openstreetmap.org)

## Scalability

MVP:        1 faculty  (Engineering & Technology)
Phase 2:    All KWASU faculties
Phase 3:    Full campus (hostels, hospital, sports)
Phase 4:    Multi-university platform
