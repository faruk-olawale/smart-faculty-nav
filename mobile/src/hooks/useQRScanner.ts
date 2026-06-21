import { useState, useCallback } from 'react';
import { qrApi } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import type { Building } from '../types';

export interface QRScanResult {
  building: Building;
  userPosition: { lat: number; lng: number };
  qrLabel: string;
}

export function useQRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<QRScanResult | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const { buildings, setUserLocation } = useAppStore();

  const processQRCode = useCallback(async (data: string): Promise<QRScanResult | null> => {
    if (isProcessing) return null;

    setIsProcessing(true);
    setError(null);

    try {
      // Try API first
      const res = await qrApi.scan(data);
      if (res.data) {
        const result: QRScanResult = {
          building: res.data.building,
          userPosition: res.data.userPosition,
          qrLabel: res.data.qrLocation?.label || 'Scanned Location',
        };

        // Update user location from QR
        setUserLocation({
          lat: res.data.userPosition.lat,
          lng: res.data.userPosition.lng,
          accuracy: 5,
          timestamp: Date.now(),
        });

        setLastResult(result);
        setHasScanned(true);
        return result;
      }
    } catch {
      // Fallback: parse QR locally
      try {
        const payload = JSON.parse(data);
        if (payload.type === 'kwasu_nav' && payload.buildingId) {
          const building = buildings.find(b => b.id === payload.buildingId);
          if (building) {
            const result: QRScanResult = {
              building,
              userPosition: {
                lat: payload.lat || building.latitude,
                lng: payload.lng || building.longitude,
              },
              qrLabel: payload.label || building.name,
            };
            setUserLocation({
              lat: result.userPosition.lat,
              lng: result.userPosition.lng,
              accuracy: 5,
              timestamp: Date.now(),
            });
            setLastResult(result);
            setHasScanned(true);
            return result;
          }
        }
      } catch {
        // Not a JSON QR — search buildings by name
        const building = buildings.find(b =>
          b.name.toLowerCase().includes(data.toLowerCase()) ||
          b.shortName?.toLowerCase().includes(data.toLowerCase())
        );
        if (building) {
          const result: QRScanResult = {
            building,
            userPosition: {
              lat: building.latitude,
              lng: building.longitude,
            },
            qrLabel: building.name,
          };
          setLastResult(result);
          setHasScanned(true);
          return result;
        }
      }
      setError('QR code not recognised. Try scanning again.');
    } finally {
      setIsProcessing(false);
    }
    return null;
  }, [buildings, isProcessing]);

  const resetScanner = useCallback(() => {
    setHasScanned(false);
    setLastResult(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    isScanning, setIsScanning,
    isProcessing,
    error,
    lastResult,
    hasScanned,
    processQRCode,
    resetScanner,
  };
}
