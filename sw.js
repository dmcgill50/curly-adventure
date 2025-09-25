// Service Worker for SharedCal PWA
const CACHE_NAME = 'sharedcal-v1.0.0';
const STATIC_CACHE = 'sharedcal-static-v1.0.0';
const DYNAMIC_CACHE = 'sharedcal-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/styles/main.css',
    '/styles/calendar.css',
    '/styles/event-decorations.css',
    '/js/app.js',
    '/js/calendar.js',
    '/js/events.js',
    '/js/storage.js',
    '/js/pwa.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Skip waiting');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Install failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other schemes
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone the response for caching
                        const responseToCache = networkResponse.clone();

                        // Cache dynamic content
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                // Only cache same-origin requests
                                if (event.request.url.startsWith(self.location.origin)) {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // If both cache and network fail, show offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // For other requests, return a generic offline response
                        return new Response('Offline content not available', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Background sync for offline event creation
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'sync-events') {
        event.waitUntil(syncEvents());
    }
});

async function syncEvents() {
    try {
        // This would sync with a backend server
        // For now, just log that sync would happen
        console.log('Service Worker: Syncing events...');
        
        // In a real implementation, this would:
        // 1. Get pending changes from IndexedDB
        // 2. Send them to the server
        // 3. Update local storage with server response
        // 4. Clean up pending changes
        
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Sync failed', error);
        throw error;
    }
}

// Push notifications
self.addEventListener('push', event => {
    console.log('Service Worker: Push received', event);
    
    const options = {
        body: 'You have an upcoming event!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Event',
                icon: '/icons/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Dismiss',
                icon: '/icons/icon-192x192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('SharedCal Reminder', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();

    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
                
            case 'CACHE_URLS':
                event.waitUntil(
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.addAll(event.data.urls))
                );
                break;
                
            case 'CLEAR_CACHE':
                event.waitUntil(
                    caches.keys()
                        .then(cacheNames => {
                            return Promise.all(
                                cacheNames.map(cacheName => caches.delete(cacheName))
                            );
                        })
                );
                break;
                
            default:
                console.log('Service Worker: Unknown message type', event.data.type);
        }
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    console.log('Service Worker: Periodic sync', event.tag);
    
    if (event.tag === 'sync-events') {
        event.waitUntil(syncEvents());
    }
});

// Share target handling (for PWA share target)
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Handle share target
    if (url.pathname === '/share-target' && event.request.method === 'POST') {
        event.respondWith(handleShareTarget(event.request));
    }
});

async function handleShareTarget(request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title') || '';
        const text = formData.get('text') || '';
        const url = formData.get('url') || '';
        
        // Store shared data for the main app to process
        const sharedData = { title, text, url, timestamp: Date.now() };
        
        // In a real implementation, you'd store this in IndexedDB
        // and the main app would read it on next load
        
        // Redirect to main app with shared data as URL params
        const params = new URLSearchParams();
        if (title) params.set('shared_title', title);
        if (text) params.set('shared_text', text);
        if (url) params.set('shared_url', url);
        
        return Response.redirect(`/?${params.toString()}`, 302);
    } catch (error) {
        console.error('Service Worker: Share target error', error);
        return Response.redirect('/', 302);
    }
}

// Handle errors
self.addEventListener('error', event => {
    console.error('Service Worker: Error', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Unhandled rejection', event.reason);
});

// Utility functions
function isStaticAsset(url) {
    return STATIC_FILES.some(file => url.endsWith(file));
}

function shouldCache(request) {
    // Cache same-origin requests
    const url = new URL(request.url);
    return url.origin === self.location.origin;
}

function createOfflineResponse(request) {
    if (request.destination === 'document') {
        return caches.match('/index.html');
    }
    
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}

console.log('Service Worker: Loaded');