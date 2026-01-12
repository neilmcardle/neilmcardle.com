'use client';

import { useEffect, useState } from 'react';

interface UseServiceWorkerReturn {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  updateServiceWorker: () => void;
}

export function useServiceWorker(): UseServiceWorkerReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw-makeebook.js', {
        scope: '/make-ebook',
      });

      setIsRegistered(true);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              setIsUpdateAvailable(true);
              setWaitingWorker(newWorker);
            }
          });
        }
      });

      // Check if there's already a waiting worker
      if (registration.waiting) {
        setIsUpdateAvailable(true);
        setWaitingWorker(registration.waiting);
      }

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_READY') {
          // Trigger sync in the app
          window.dispatchEvent(new CustomEvent('sw-sync-ready'));
        }
      });

      // Listen for controller change (new SW took over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload to get fresh content
        window.location.reload();
      });

    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  };

  const updateServiceWorker = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return {
    isSupported,
    isRegistered,
    isUpdateAvailable,
    updateServiceWorker,
  };
}

export default useServiceWorker;
