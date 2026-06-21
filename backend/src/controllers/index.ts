import { Request, Response, NextFunction } from 'express';
import { PrismaClient, BuildingType } from '@prisma/client';
import QRCode from 'qrcode';
import { AppError } from '../middleware/errorHandler';
import { calculateRoute } from '../services/routingService';
import { processAIQuery } from '../services/aiAssistantService';
import { TravelMode } from '../types';

const prisma = new PrismaClient();

// ─── BUILDINGS ───────────────────────────────────────────────

export const getBuildings = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const { type, facultyId, isEmergency, search } = req.query as Record<string, string>;
    const where: any = {};
    if (type) where.type = type as BuildingType;
    if (facultyId) where.facultyId = facultyId;
    if (isEmergency === 'true') where.isEmergency = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const buildings = await prisma.building.findMany({
      where,
      include: {
        faculty: { select: { id: true, name: true, color: true } },
        departments: { select: { id: true, name: true, code: true } },
        qrLocations: { where: { isActive: true }, select: { id: true, label: true, qrCode: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: buildings });
  } catch (e) { next(e); }
};

export const getBuildingById = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const building = await prisma.building.findUnique({
      where: { id: req.params.id },
      include: {
        faculty: true,
        departments: true,
        qrLocations: { where: { isActive: true } },
      },
    });
    if (!building) throw new AppError('Building not found', 404);
    res.json({ success: true, data: building });
  } catch (e) { next(e); }
};

export const getEmergencyBuildings = async (
  _req: Request, res: Response, next: NextFunction
) => {
  try {
    const buildings = await prisma.building.findMany({
      where: { isEmergency: true },
      select: {
        id: true, name: true, type: true,
        latitude: true, longitude: true,
        phone: true, openingHours: true,
      },
    });
    res.json({ success: true, data: buildings });
  } catch (e) { next(e); }
};

export const createBuilding = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const building = await prisma.building.create({ data: req.body });
    res.status(201).json({ success: true, data: building });
  } catch (e) { next(e); }
};

export const updateBuilding = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const building = await prisma.building.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: building });
  } catch (e) { next(e); }
};

export const deleteBuilding = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    await prisma.building.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Building deleted' });
  } catch (e) { next(e); }
};

// ─── FACULTIES ───────────────────────────────────────────────

export const getFaculties = async (
  _req: Request, res: Response, next: NextFunction
) => {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        departments: { select: { id: true, name: true, code: true } },
        buildings: {
          select: { id: true, name: true, type: true, latitude: true, longitude: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: faculties });
  } catch (e) { next(e); }
};

export const getFacultyById = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: req.params.id },
      include: { departments: true, buildings: true },
    });
    if (!faculty) throw new AppError('Faculty not found', 404);
    res.json({ success: true, data: faculty });
  } catch (e) { next(e); }
};

export const createFaculty = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const faculty = await prisma.faculty.create({ data: req.body });
    res.status(201).json({ success: true, data: faculty });
  } catch (e) { next(e); }
};

export const updateFaculty = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const faculty = await prisma.faculty.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: faculty });
  } catch (e) { next(e); }
};

export const deleteFaculty = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    await prisma.faculty.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Faculty deleted' });
  } catch (e) { next(e); }
};

// ─── DEPARTMENTS ─────────────────────────────────────────────

export const getDepartments = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const { facultyId } = req.query;
    const departments = await prisma.department.findMany({
      where: facultyId ? { facultyId: facultyId as string } : undefined,
      include: {
        faculty: { select: { id: true, name: true, color: true } },
        building: { select: { id: true, name: true, latitude: true, longitude: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: departments });
  } catch (e) { next(e); }
};

export const createDepartment = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const dept = await prisma.department.create({ data: req.body });
    res.status(201).json({ success: true, data: dept });
  } catch (e) { next(e); }
};

export const updateDepartment = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const dept = await prisma.department.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: dept });
  } catch (e) { next(e); }
};

export const deleteDepartment = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Department deleted' });
  } catch (e) { next(e); }
};

// ─── QR ──────────────────────────────────────────────────────

export const getQRLocations = async (
  _req: Request, res: Response, next: NextFunction
) => {
  try {
    const qrs = await prisma.qRLocation.findMany({
      include: {
        building: { select: { id: true, name: true, type: true } },
      },
    });
    res.json({ success: true, data: qrs });
  } catch (e) { next(e); }
};

export const generateQRCode = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const qr = await prisma.qRLocation.findUnique({
      where: { id: req.params.id },
      include: { building: true },
    });
    if (!qr) throw new AppError('QR location not found', 404);
    const payload = JSON.stringify({
      type: 'kwasu_nav',
      buildingId: qr.buildingId,
      qrCode: qr.qrCode,
      label: qr.label,
      lat: qr.latitude,
      lng: qr.longitude,
    });
    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: { dark: '#050E1F', light: '#FFFFFF' },
    });
    await prisma.qRLocation.update({
      where: { id: qr.id },
      data: { scanCount: { increment: 1 } },
    });
    res.json({ success: true, data: { qrDataUrl, qrLocation: qr } });
  } catch (e) { next(e); }
};

export const scanQRCode = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const { qrCode } = req.body;
    if (!qrCode) throw new AppError('qrCode is required', 400);
    let payload: any;
    try { payload = JSON.parse(qrCode); } catch { payload = { qrCode }; }
    const qr = await prisma.qRLocation.findFirst({
      where: { qrCode: payload.qrCode || qrCode },
      include: {
        building: {
          include: { faculty: true, departments: true },
        },
      },
    });
    if (!qr) throw new AppError('QR code not recognised', 404);
    await prisma.qRLocation.update({
      where: { id: qr.id },
      data: { scanCount: { increment: 1 } },
    });
    res.json({
      success: true,
      data: {
        qrLocation: qr,
        building: qr.building,
        userPosition: { lat: qr.latitude, lng: qr.longitude },
      },
    });
  } catch (e) { next(e); }
};

// ─── ROUTE ───────────────────────────────────────────────────

export const postRoute = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const { startLat, startLng, endLat, endLng, mode = 'foot' } = req.body;
    if (!startLat || !startLng || !endLat || !endLng) {
      throw new AppError('startLat, startLng, endLat, endLng are required', 400);
    }
    const route = await calculateRoute({
      startLat: +startLat, startLng: +startLng,
      endLat: +endLat, endLng: +endLng,
      mode: mode as TravelMode,
    });
    res.json({ success: true, data: route });
  } catch (e) { next(e); }
};

// ─── SEARCH ──────────────────────────────────────────────────

export const search = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const { q } = req.query;
    if (!q || (q as string).length < 2) {
      return res.json({ success: true, data: [] });
    }
    const term = { contains: q as string, mode: 'insensitive' as const };
    const [buildings, faculties, departments] = await Promise.all([
      prisma.building.findMany({
        where: { OR: [{ name: term }, { description: term }] },
        select: { id: true, name: true, type: true, latitude: true, longitude: true },
        take: 6,
      }),
      prisma.faculty.findMany({
        where: { OR: [{ name: term }, { description: term }] },
        select: { id: true, name: true },
        take: 3,
      }),
      prisma.department.findMany({
        where: { OR: [{ name: term }, { description: term }] },
        include: {
          building: { select: { id: true, latitude: true, longitude: true } },
          faculty: { select: { name: true } },
        },
        take: 6,
      }),
    ]);
    const results = [
      ...buildings.map(b => ({
        id: b.id, name: b.name, type: 'building' as const,
        subtitle: b.type.replace(/_/g, ' '),
        latitude: b.latitude, longitude: b.longitude,
      })),
      ...faculties.map(f => ({
        id: f.id, name: f.name, type: 'faculty' as const,
        subtitle: 'Faculty',
      })),
      ...departments.map(d => ({
        id: d.id, name: d.name, type: 'department' as const,
        subtitle: d.faculty?.name,
        latitude: d.building?.latitude,
        longitude: d.building?.longitude,
        buildingId: d.buildingId ?? undefined,
      })),
    ];
    res.json({ success: true, data: results });
  } catch (e) { next(e); }
};

// ─── AI ASSISTANT ─────────────────────────────────────────────

export const aiQuery = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const { message, context } = req.body;
    if (!message) throw new AppError('message is required', 400);
    const response = await processAIQuery({ message, context });
    res.json({ success: true, data: response });
  } catch (e) { next(e); }
};

// ─── AI ASSISTANT (VOICE) ──────────────────────────────────────────────

export const aiVoiceQuery = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) throw new AppError('audioBase64 is required', 400);
    const { processVoiceQuery } = await import('../services/aiAssistantService');
    const response = await processVoiceQuery(audioBase64, mimeType || 'audio/m4a');
    res.json({ success: true, data: response });
  } catch (e) { next(e); }
};
