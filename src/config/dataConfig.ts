import { useState, useEffect } from 'react';

/**
 * Data Configuration Module
 * 
 * Provides a seamless, clean toggle between:
 * 1. Mock Data: Uses local datasets in src/data/mockData.ts (ideal for testing, offline demos, and rapid UI development)
 * 2. Real Cloud Data: Connects directly to Google Cloud Firestore database (ai-studio-remixremixunicam-5ec5f1d3-ba00-4d7a-890a-65c5007066bb)
 *
 * Config precedence:
 * 1. Runtime override via localStorage ('edux_use_mock_data') if manually set
 * 2. Environment variable import.meta.env.VITE_USE_MOCK_DATA ('true' / 'false')
 * 3. Default fallback: true (safe demo mode)
 */

export const DATA_MODE_STORAGE_KEY = 'edux_use_mock_data_v2';
export const DATA_MODE_EVENT = 'edux-data-mode-change';

/**
 * Reads the default configuration from the environment variable
 * Defaults to FALSE (Live Cloud Firestore) so all devices immediately sync to cloud!
 */
export function getEnvMockDataDefault(): boolean {
  const envVal = import.meta.env.VITE_USE_MOCK_DATA;
  if (envVal === 'false' || (envVal as unknown) === false) {
    return false;
  }
  return false; // Default: Live Cloud Data by default!
}

/**
 * Returns whether mock data is currently active
 */
export function isMockDataEnabled(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(DATA_MODE_STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    }
  } catch (err) {
    console.warn('Unable to read data mode from localStorage:', err);
  }
  return getEnvMockDataDefault();
}

/**
 * Explicitly sets the data handling mode (Mock vs Live Cloud)
 */
export function setMockDataMode(useMock: boolean): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(DATA_MODE_STORAGE_KEY, String(useMock));
      window.dispatchEvent(
        new CustomEvent(DATA_MODE_EVENT, {
          detail: { isMock: useMock, mode: useMock ? 'mock' : 'firebase' }
        })
      );
    }
  } catch (err) {
    console.warn('Unable to persist data mode to localStorage:', err);
  }
}

/**
 * Toggles between mock data and real cloud Firestore database
 */
export function toggleMockDataMode(): boolean {
  const current = isMockDataEnabled();
  const next = !current;
  setMockDataMode(next);
  return next;
}

/**
 * Resets the override to match the environment variable VITE_USE_MOCK_DATA
 */
export function resetMockDataModeToDefault(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(DATA_MODE_STORAGE_KEY);
      const isMock = getEnvMockDataDefault();
      window.dispatchEvent(
        new CustomEvent(DATA_MODE_EVENT, {
          detail: { isMock, mode: isMock ? 'mock' : 'firebase' }
        })
      );
    }
  } catch (err) {
    console.warn('Unable to reset data mode:', err);
  }
}

/**
 * Returns current mode string
 */
export function getDataMode(): 'mock' | 'firebase' {
  return isMockDataEnabled() ? 'mock' : 'firebase';
}

/**
 * React Hook for subscribing to data mode changes reactively in UI components
 */
export function useDataMode() {
  const [isMock, setIsMock] = useState<boolean>(() => isMockDataEnabled());

  useEffect(() => {
    const handleModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ isMock: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isMock === 'boolean') {
        setIsMock(customEvent.detail.isMock);
      } else {
        setIsMock(isMockDataEnabled());
      }
    };

    window.addEventListener(DATA_MODE_EVENT, handleModeChange);
    return () => {
      window.removeEventListener(DATA_MODE_EVENT, handleModeChange);
    };
  }, []);

  return {
    isMock,
    mode: isMock ? ('mock' as const) : ('firebase' as const),
    toggleMode: () => {
      const next = !isMock;
      setMockDataMode(next);
      setIsMock(next);
    },
    setMode: (val: boolean) => {
      setMockDataMode(val);
      setIsMock(val);
    },
    resetToDefault: () => {
      resetMockDataModeToDefault();
      setIsMock(getEnvMockDataDefault());
    }
  };
}
