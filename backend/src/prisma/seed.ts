import { PrismaClient, BuildingType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding KWASU ICT Faculty...\n');

  await prisma.qRLocation.deleteMany();
  await prisma.department.deleteMany();
  await prisma.building.deleteMany();
  await prisma.faculty.deleteMany();

  const faculty = await prisma.faculty.create({
    data: {
      name: 'Faculty of Information & Communication Technology',
      code: 'ICT',
      description: 'Faculty of ICT at Kwara State University, Malete.',
      color: '#00E5C0',
      dean: 'Prof. Abdulrasaq Mustapha',
      email: 'ict@kwasu.edu.ng',
      phone: '+234-031-555-0200',
      latitude: 8.723479,
      longitude: 4.482587,
    },
  });

  const entrance = await prisma.building.create({
    data: {
      name: 'ICT Faculty Entrance',
      shortName: 'ICT-GATE',
      type: BuildingType.FACULTY,
      description: 'Main entrance of the Faculty of ICT, KWASU Malete.',
      latitude: 8.723479,
      longitude: 4.482587,
      address: 'Faculty of ICT, KWASU, Malete',
      openingHours: 'Mon–Fri: 7:00 AM – 9:00 PM',
      phone: '+234-031-555-0200',
      email: 'ict@kwasu.edu.ng',
      floor: 1,
      isEmergency: false,
      isAccessible: true,
      facultyId: faculty.id,
    },
  });

  const auditorium = await prisma.building.create({
    data: {
      name: 'ICT Auditorium',
      shortName: 'AUDITORIUM',
      type: BuildingType.LECTURE_HALL,
      description: 'Main ICT Auditorium. Ground floor.',
      latitude: 8.723685,
      longitude: 4.482222,
      openingHours: 'Mon–Sat: 7:00 AM – 9:00 PM',
      floor: 1,
      isEmergency: false,
      isAccessible: true,
      facultyId: faculty.id,
    },
  });

  const lre = await prisma.building.create({
    data: {
      name: 'Lecture Room E',
      shortName: 'LR-E',
      type: BuildingType.LECTURE_HALL,
      description: 'Lecture Room E. Ground floor.',
      latitude: 8.723633,
      longitude: 4.482161,
      openingHours: 'Mon–Sat: 7:00 AM – 9:00 PM',
      floor: 1,
      isEmergency: false,
      isAccessible: true,
      facultyId: faculty.id,
    },
  });

  const lrf = await prisma.building.create({
    data: {
      name: 'Lecture Room F',
      shortName: 'LR-F',
      type: BuildingType.LECTURE_HALL,
      description: 'Lecture Room F. Ground floor.',
      latitude: 8.723537,
      longitude: 4.482112,
      openingHours: 'Mon–Sat: 7:00 AM – 9:00 PM',
      floor: 1,
      isEmergency: false,
      isAccessible: true,
      facultyId: faculty.id,
    },
  });

  const lrg = await prisma.building.create({
    data: {
      name: 'Lecture Room G',
      shortName: 'LR-G',
      type: BuildingType.LECTURE_HALL,
      description: 'Lecture Room G. Ground floor.',
      latitude: 8.723598,
      longitude: 4.482223,
      openingHours: 'Mon–Sat: 7:00 AM – 9:00 PM',
      floor: 1,
      isEmergency: false,
      isAccessible: true,
      facultyId: faculty.id,
    },
  });

  const lrh = await prisma.building.create({
    data: {
      name: 'Lecture Room H',
      shortName: 'LR-H',
      type: BuildingType.LECTURE_HALL,
      description: 'Lecture Room H. Ground floor.',
      latitude: 8.723470,
      longitude: 4.482379,
      openingHours: 'Mon–Sat: 7:00 AM – 9:00 PM',
      floor: 1,
      isEmergency: false,
      isAccessible: true,
      facultyId: faculty.id,
    },
  });

  const printingLab = await prisma.building.create({
    data: {
      name: 'Printing Laboratory',
      shortName: 'PRINT-LAB',
      type: BuildingType.LAB,
      description: 'Printing Laboratory. Ground floor.',
      latitude: 8.723640,
      longitude: 4.482428,
      openingHours: 'Mon–Fri: 8:00 AM – 5:00 PM',
      phone: '+234-031-555-0225',
      floor: 1,
      isEmergency: false,
      isAccessible: true,
      facultyId: faculty.id,
    },
  });

  const nlpLab = await prisma.building.create({
    data: {
      name: 'NLP Laboratory',
      shortName: 'NLP-LAB',
      type: BuildingType.LAB,
      description: '⬆️ UPSTAIRS — Natural Language Processing Lab. First floor.',
      latitude: 8.723642,
      longitude: 4.482151,
      openingHours: 'Mon–Fri: 8:00 AM – 6:00 PM',
      phone: '+234-031-555-0220',
      floor: 2,
      isEmergency: false,
      isAccessible: false,
      facultyId: faculty.id,
    },
  });

  // ─── QR Locations for ALL buildings ─────────────────────────
  await prisma.qRLocation.createMany({
    data: [
      {
        buildingId: entrance.id,
        label: 'ICT Faculty Main Entrance',
        qrCode: `KWASU_QR:${entrance.id}:entrance`,
        latitude: 8.723479,
        longitude: 4.482587,
        description: 'Scan at ICT entrance for faculty map.',
        isActive: true,
      },
      {
        buildingId: auditorium.id,
        label: 'ICT Auditorium Entrance',
        qrCode: `KWASU_QR:${auditorium.id}:entrance`,
        latitude: 8.723685,
        longitude: 4.482222,
        description: 'Scan for auditorium info and navigation.',
        isActive: true,
      },
      {
        buildingId: lre.id,
        label: 'Lecture Room E — Entrance',
        qrCode: `KWASU_QR:${lre.id}:entrance`,
        latitude: 8.723633,
        longitude: 4.482161,
        description: 'Scan at Lecture Room E entrance.',
        isActive: true,
      },
      {
        buildingId: lrf.id,
        label: 'Lecture Room F — Entrance',
        qrCode: `KWASU_QR:${lrf.id}:entrance`,
        latitude: 8.723537,
        longitude: 4.482112,
        description: 'Scan at Lecture Room F entrance.',
        isActive: true,
      },
      {
        buildingId: lrg.id,
        label: 'Lecture Room G — Entrance',
        qrCode: `KWASU_QR:${lrg.id}:entrance`,
        latitude: 8.723598,
        longitude: 4.482223,
        description: 'Scan at Lecture Room G entrance.',
        isActive: true,
      },
      {
        buildingId: lrh.id,
        label: 'Lecture Room H — Entrance',
        qrCode: `KWASU_QR:${lrh.id}:entrance`,
        latitude: 8.723470,
        longitude: 4.482379,
        description: 'Scan at Lecture Room H entrance.',
        isActive: true,
      },
      {
        buildingId: printingLab.id,
        label: 'Printing Lab — Entrance',
        qrCode: `KWASU_QR:${printingLab.id}:entrance`,
        latitude: 8.723640,
        longitude: 4.482428,
        description: 'Scan for printing services.',
        isActive: true,
      },
      {
        buildingId: nlpLab.id,
        label: 'NLP Lab — Upstairs',
        qrCode: `KWASU_QR:${nlpLab.id}:entrance`,
        latitude: 8.723642,
        longitude: 4.482151,
        description: 'NLP Lab is upstairs. Take staircase.',
        isActive: true,
      },
    ],
  });

  const counts = await Promise.all([
    prisma.faculty.count(),
    prisma.building.count(),
    prisma.qRLocation.count(),
  ]);

  console.log('\n📊 ICT Faculty Summary:');
  console.log(`   Faculty:      ${counts[0]}`);
  console.log(`   Buildings:    ${counts[1]}`);
  console.log(`   QR Locations: ${counts[2]}`);
  console.log('\n✅ All buildings now have QR codes!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
