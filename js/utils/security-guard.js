/* ============================================================
   MANGAL SETU MATRIMONY — CLIENT SECURITY GUARD
   PRODUCTION MODE: Right-click & DevTools are DISABLED for real users.
   To re-enable for debugging, set IS_DEV_TESTING_MODE = true temporarily.
   ============================================================ */

(function () {
    'use strict';

    // Set to true ONLY during local development/testing. Must be false for live/production.
    var IS_DEV_TESTING_MODE = false;

    if (IS_DEV_TESTING_MODE) {
        // Clean notification in console
        setTimeout(function () {
            try {
                console.info('%c Mangal Setu Matrimony %c Testing Mode Active — Inspect & Console enabled',
                    'color:#fff;background:#e63946;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:bold;',
                    'color:#1e1b4b;background:#e2e8f0;padding:4px 8px;border-radius:0 4px 4px 0;font-weight:600;'
                );
            } catch (_) {}
        }, 800);
        return;
    }

    // --- Production Lockdown (disabled during testing) ---
    document.addEventListener('contextmenu', function (e) {
        var tag = e.target ? e.target.tagName : '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
})();
