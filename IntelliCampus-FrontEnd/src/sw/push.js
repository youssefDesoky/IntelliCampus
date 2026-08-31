self.addEventListener('push', function (event) {
    let data = {};
    try {
        data = event.data.json();
    } catch {
        data = { title: 'IntelliCampus', body: event.data ? event.data.text() : '' };
    }

    const title = data.title || 'IntelliCampus';
    const options = {
        body: data.body || '',
        icon: '/static/images/IntelliCampusLogo.png',
        badge: '/IntelliCampus_Trans.ico',
        image: data.imageUrl || undefined,
        data: {
            clickUrl: data.clickUrl || '/',
            notificationId: data.notificationId || '',
        },
        tag: data.notificationId || undefined,
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.clickUrl) || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (wins) {
            const hit = wins.find(function (w) { return w.url.includes(self.origin); });
            if (hit) return hit.focus().then(function (c) { return c.navigate(url); });
            return clients.openWindow(url);
        })
    );
});
