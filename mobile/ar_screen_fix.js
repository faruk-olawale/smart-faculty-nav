const fs = require('fs');
const path = 'src/screens/ARScreen.tsx';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import React, { useState, useEffect, useRef, useCallback } from 'react';",
  "import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';"
);

const oldLoc = `  // Demo location if GPS not available
  const effectiveLocation = userLocation ?? {
    lat: FACULTY_ICT.latitude,
    lng: FACULTY_ICT.longitude,
  };`;

const newLoc = `  // Demo location if GPS not available — memoized so it's not a new
  // object reference on every render (this was causing the infinite loop)
  const effLat = userLocation?.lat ?? FACULTY_ICT.latitude;
  const effLng = userLocation?.lng ?? FACULTY_ICT.longitude;
  const effectiveLocation = useMemo(
    () => ({ lat: effLat, lng: effLng }),
    [effLat, effLng]
  );`;

if (content.includes(oldLoc)) {
  content = content.replace(oldLoc, newLoc);
  console.log('EFFECTIVE_LOCATION_FIXED');
} else {
  console.log('EFFECTIVE_LOCATION_NOT_FOUND');
}

const oldDep = '  }, [effectiveLocation, heading, buildings, destination]);';
const newDep = '  }, [effLat, effLng, heading, buildings, destination?.id]);';

if (content.includes(oldDep)) {
  content = content.replace(oldDep, newDep);
  console.log('DEPENDENCY_ARRAY_FIXED');
} else {
  console.log('DEPENDENCY_ARRAY_NOT_FOUND');
}

fs.writeFileSync(path, content);
