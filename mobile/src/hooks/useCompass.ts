import { useState, useEffect, useRef } from 'react';
import { Magnetometer } from 'expo-sensors';
import { Platform } from 'react-native';

export function useCompass() {
  const [heading, setHeading] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const subscriptionRef = useRef<any>(null);
  const headingBuffer = useRef<number[]>([]);

  useEffect(() => {
    async function start() {
      try {
        const available = await Magnetometer.isAvailableAsync();
        setIsAvailable(available);

        if (!available) {
          console.log('Magnetometer not available — using GPS heading');
          return;
        }

        Magnetometer.setUpdateInterval(100);

        subscriptionRef.current = Magnetometer.addListener(data => {
          // Calculate heading from magnetometer
          let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
          angle = (angle + 360) % 360;

          // Smooth with rolling average
          headingBuffer.current.push(angle);
          if (headingBuffer.current.length > 5) {
            headingBuffer.current.shift();
          }
          const avg = headingBuffer.current.reduce((a, b) => a + b, 0) /
            headingBuffer.current.length;
          setHeading(avg);
        });
      } catch (e) {
        console.log('Compass error:', e);
        setIsAvailable(false);
      }
    }

    start();

    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  return { heading, isAvailable };
}
