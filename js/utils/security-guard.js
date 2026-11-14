/* ============================================================
   MANGAL SETU MATRIMONY — CLIENT SECURITY GUARD & ANTI-ZOOM
   PRODUCTION MODE: Right-click & DevTools are DISABLED for real users.
   MOBILE APP MODE: Pinch-to-zoom, double-tap zoom & keyboard zoom disabled across all devices.
   ============================================================ */

(function () {
    'use strict';

    // ============================================================
    // 1. UNIVERSAL ANTI-ZOOM PROTECTION (Android, iOS Safari, Chrome, Edge)
    // ============================================================

    // A. Prevent Multi-Touch Pinch Zoom (2 or more fingers)
    document.addEventListener('touchstart', function (e) {
        if (e.touches && e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchmove', function (e) {
        if (e.touches && e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // B. Prevent iOS Safari WebKit Gesture Zoom
    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
    });
    document.addEventListener('gesturechange', function (e) {
        e.preventDefault();
    });
    document.addEventListener('gestureend', function (e) {
        e.preventDefault();
    });

    // C. Prevent Double-Tap Zoom (while preserving normal taps on interactive elements)
    var lastTouchEndTime = 0;
    document.addEventListener('touchend', function (e) {
        var now = Date.now();
        if (now - lastTouchEndTime <= 300) {
            var tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
            if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT' && tag !== 'BUTTON') {
                e.preventDefault();
            }
        }
        lastTouchEndTime = now;
    }, { passive: false });

    // D. Prevent Mousewheel / Trackpad Pinch Zoom (Ctrl + Wheel)
    window.addEventListener('wheel', function (e) {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });

    // ============================================================
    // 2. PRODUCTION DEVTOOLS & INSPECT LOCKDOWN
    // ============================================================

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
    // 1. Block Right-Click (except inside input/textarea for copy-paste)
    document.addEventListener('contextmenu', function (e) {
        var tag = e.target ? e.target.tagName : '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
            e.preventDefault();
            return false;
        }
    }, true);

    // 2. Block DevTools Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S, Ctrl+Plus/Minus Zoom)
    window.addEventListener('keydown', function (e) {
        var keyCode = e.keyCode || e.which;
        var key = (e.key || '').toLowerCase();

        // F12 key
        if (key === 'f12' || keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl + Shift + I / J / C (or Cmd + Option + I / J / C on Mac)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            if (key === 'i' || key === 'j' || key === 'c' || keyCode === 73 || keyCode === 74 || keyCode === 67) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }

        // Ctrl + U (View Source)
        if ((e.ctrlKey || e.metaKey) && (key === 'u' || keyCode === 85)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl + S (Save Page)
        if ((e.ctrlKey || e.metaKey) && (key === 's' || keyCode === 83)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl / Cmd + '+' / '-' / '0' (Browser Zoom via keyboard)
        if (e.ctrlKey || e.metaKey) {
            if (key === '+' || key === '-' || key === '=' || key === '_' || key === '0' ||
                keyCode === 187 || keyCode === 189 || keyCode === 107 || keyCode === 109 || keyCode === 48 || keyCode === 96) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    }, true);
})();
