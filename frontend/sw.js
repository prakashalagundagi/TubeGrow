// TubeGrow Service Worker - Scalable PWA Implementation
const CACHE_NAME = 'tubegrow-v1';
const STATIC_CACHE = 'tubegrow-static-v1';
const DYNAMIC_CACHE = 'tubegrow-dynamic-v1';

// Files to cache for offline functionality
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/tools.html',
    '/analytics.html',
    '/login.html',
    '/register.html',
    '/styles-optimized.css',
    '/script-optimized.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different request types
    if (url.origin === location.origin) {
        // Same origin - use network first strategy
        event.respondWith(networkFirstStrategy(request));
    } else {
        // Cross origin - use cache first strategy
        event.respondWith(cacheFirstStrategy(request));
    }
});

// Network first strategy for dynamic content
async function networkFirstStrategy(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        // Return error for other requests
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Cache first strategy for static assets
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        return new Response('Network error', {
            status: 500,
            statusText: 'Network Error'
        });
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Sync offline actions when back online
    try {
        const offlineActions = await getOfflineActions();
        
        for (const action of offlineActions) {
            try {
                await fetch(action.url, action.options);
                await removeOfflineAction(action.id);
            } catch (error) {
                console.error('Failed to sync action:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New notification from TubeGrow',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('TubeGrow', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('https://127.0.0.1:8000/dashboard.html')
        );
    }
});

// Cache management utilities
async function getOfflineActions() {
    // Get offline actions from IndexedDB
    return [];
}

async function removeOfflineAction(id) {
    // Remove offline action from IndexedDB
    return Promise.resolve();
}

// Performance monitoring
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
        // Handle performance metrics from main app
        console.log('Performance metrics received:', event.data.metrics);
    }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
    self.registration.periodicSync.register({
        tag: 'sync-data',
        minPeriod: 24 * 60 * 60 * 1000 // 24 hours
    }).then(() => {
        console.log('Periodic sync registered');
    }).catch((error) => {
        console.log('Periodic sync registration failed:', error);
    });
}

console.log('🚀 TubeGrow Service Worker loaded');
