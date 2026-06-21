const fs = require('fs');
const path = 'src/features/ar/AROverlay.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldFn = `export function AROverlay({ locations, onPress }: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {locations.map(loc => (
        <ARLocationPin
          key={loc.building.id}
          location={loc}
          onPress={onPress}
        />
      ))}
    </View>
  );
}`;

const newFn = `export function AROverlay({ locations, onPress }: Props) {
  const FOV = 80;
  const MIN_GAP_DEG = 12;

  const visible = locations
    .filter(l => l.isDestination || Math.abs(l.relativeBearing) < 55)
    .sort((a, b) => {
      if (a.isDestination) return -1;
      if (b.isDestination) return 1;
      return a.distance - b.distance;
    })
    .slice(0, 6);

  const placedBearings = [];
  const spaced = visible.map(loc => {
    let b = loc.relativeBearing;
    for (const placed of placedBearings) {
      if (Math.abs(b - placed) < MIN_GAP_DEG) {
        b = b >= placed ? placed + MIN_GAP_DEG : placed - MIN_GAP_DEG;
      }
    }
    placedBearings.push(b);
    return { ...loc, relativeBearing: b };
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      {spaced.map(loc => (
        <ARLocationPin
          key={loc.building.id}
          location={loc}
          onPress={onPress}
        />
      ))}
    </View>
  );
}`;

if (content.includes(oldFn)) {
  content = content.replace(oldFn, newFn);
  console.log('OVERLAP_FIX_APPLIED');
} else {
  console.log('OVERLAP_FIX_NOT_FOUND');
}

fs.writeFileSync(path, content);
