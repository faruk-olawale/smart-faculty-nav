import { Router } from 'express';
import * as ctrl from '../controllers';

const r = Router();

// Buildings
r.get('/buildings', ctrl.getBuildings);
r.get('/buildings/emergency', ctrl.getEmergencyBuildings);
r.get('/buildings/:id', ctrl.getBuildingById);
r.post('/buildings', ctrl.createBuilding);
r.put('/buildings/:id', ctrl.updateBuilding);
r.delete('/buildings/:id', ctrl.deleteBuilding);

// Faculties
r.get('/faculties', ctrl.getFaculties);
r.get('/faculties/:id', ctrl.getFacultyById);
r.post('/faculties', ctrl.createFaculty);
r.put('/faculties/:id', ctrl.updateFaculty);
r.delete('/faculties/:id', ctrl.deleteFaculty);

// Departments
r.get('/departments', ctrl.getDepartments);
r.post('/departments', ctrl.createDepartment);
r.put('/departments/:id', ctrl.updateDepartment);
r.delete('/departments/:id', ctrl.deleteDepartment);

// QR
r.get('/qr', ctrl.getQRLocations);
r.get('/qr/:id/generate', ctrl.generateQRCode);
r.post('/qr/scan', ctrl.scanQRCode);

// Route
r.post('/route', ctrl.postRoute);

// Search
r.get('/search', ctrl.search);

// AI Assistant
r.post('/assistant', ctrl.aiQuery);

export default r;
