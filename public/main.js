/*if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
        if (registration.waiting) {
            showUpdateNotification();
        }

        registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                        showUpdateNotification();
                    }
                }
            });
        });
    });
}

function showUpdateNotification() {
    if (confirm("Hay una nueva versión disponible. ¿Deseas actualizar?")) {
        window.location.reload();
    }
}
*/