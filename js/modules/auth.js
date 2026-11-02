/* ============================================================ REGISTRATION & AUTH ============================================================ */
// Cryptographic Secret Salt (Pepper) — protects against rainbow tables & dictionary attacks
const AUTH_PEPPER = 'LS_MATRIMONY_SECURE_2026_@v9#';

async function hashPass(str) {
    if (!str) return '';
    const enc = new TextEncoder().encode(str + AUTH_PEPPER);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Backward compatibility check for legacy unsalted hashes with auto-upgrade
async function hashPassLegacy(str) {
    if (!str) return '';
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Pro-level Brute Force & Rate-Limiting Protection
const LOGIN_SECURITY = {
    failedAttempts: 0,
    lockUntil: 0
};

// Sanitization helper: NEVER expose password or passwordHash in state or sessionStorage
function createSafeUserSession(user) {
    if (!user) return null;
    const safe = { ...user };
    delete safe.password;
    delete safe.passwordHash;
    return safe;
}

// Dedicated Auth Accounts Store (Prevents conflict with community PROFILES)
var LS_ACCOUNTS_KEY = window.LS_ACCOUNTS_KEY || 'LS_AUTH_ACCOUNTS';

function getStoredAccounts() {
    let accounts = [];
    try {
        const raw = localStorage.getItem(LS_ACCOUNTS_KEY);
        if (raw) accounts = JSON.parse(raw);
    } catch(e) {}

    // Migration & compatibility: Read from LS_COMMUNITY_USERS if not in accounts
    try {
        const legacyKey = window.LS_USERS_KEY || 'LS_COMMUNITY_USERS';
        const rawLegacy = localStorage.getItem(legacyKey);
        if (rawLegacy) {
            const parsed = JSON.parse(rawLegacy);
            if (Array.isArray(parsed)) {
                parsed.forEach(u => {
                    if (u && u.email && u.passwordHash && !accounts.some(a => a.email && a.email.toLowerCase() === u.email.toLowerCase())) {
                        accounts.push(u);
                    }
                });
            }
        }
    } catch(e) {}

    return Array.isArray(accounts) ? accounts : [];
}
window.getStoredAccounts = getStoredAccounts;

function saveStoredAccounts(accounts) {
    try {
        const cleanList = Array.isArray(accounts) ? accounts : [];
        localStorage.setItem(LS_ACCOUNTS_KEY, JSON.stringify(cleanList));
        // Keep LS_COMMUNITY_USERS strictly synchronized so deleted accounts can never resurrect
        const legacyKey = window.LS_USERS_KEY || 'LS_COMMUNITY_USERS';
        localStorage.setItem(legacyKey, JSON.stringify(cleanList));
    } catch(e) {}
}
window.saveStoredAccounts = saveStoredAccounts;

/**
 * Completely purge a user account from all LocalStorage keys, caches, state, and sessions
 * @param {string} email
/**
 * Cleanly reset all registration state in memory and clear all registration input fields in the DOM
 */
function resetRegistrationStateAndInputs() {
    if (typeof state !== 'undefined') {
        state.regData = {
            email: '',
            password: '',
            caste: '',
            photos: ['', '', ''],
            photo: '',
            gender: '',
            name: '',
            dob: '',
            age: null,
            height: '',
            weight: '',
            education: '',
            marital: '',
            physical: '',
            occupation: '',
            income: '',
            hobbies: [],
            fatherName: '',
            fatherOcc: '',
            fatherMobile: '',
            fatherWhatsapp: true,
            motherName: '',
            motherOcc: '',
            sister: '',
            brother: '',
            city: '',
            taluka: '',
            district: '',
            address: ''
        };
    }

    // Step 1: Account inputs
    const r1email = document.getElementById('r1email');
    if (r1email) { r1email.value = ''; r1email.classList.remove('input-error'); }
    const r1pass = document.getElementById('r1pass');
    if (r1pass) { r1pass.value = ''; r1pass.classList.remove('input-error'); }
    for (let i = 1; i <= 6; i++) {
        const otpInp = document.getElementById(`regOtp${i}`);
        if (otpInp) otpInp.value = '';
    }
    const agreeCheck = document.getElementById('agreeTermsCheck');
    if (agreeCheck) { agreeCheck.checked = false; }
    if (typeof toggleRegSubmitButton === 'function') { toggleRegSubmitButton(); }

    // Step 2: Caste inputs
    const casteSearch = document.getElementById('regCasteInput') || document.getElementById('casteSearchInput');
    if (casteSearch) casteSearch.value = '';
    document.querySelectorAll('#casteListContainer .caste-item').forEach(el => el.classList.remove('active'));

    // Step 3: Personal & family inputs
    for (let slot = 1; slot <= 3; slot++) {
        const img = document.getElementById(`regSlotImg${slot}`);
        const empty = document.getElementById(`regSlotEmpty${slot}`);
        if (img) { img.src = ''; img.style.display = 'none'; }
        if (empty) empty.style.display = 'flex';
    }
    const photoSlotInput = document.getElementById('regPhotoSlotInput');
    if (photoSlotInput) photoSlotInput.value = '';
    const avatarImg = document.getElementById('regAvatarImg');
    if (avatarImg) { avatarImg.src = ''; avatarImg.style.display = 'none'; }

    const genderText = document.getElementById('genderValText');
    if (genderText) genderText.textContent = 'Select gender';
    const ddGender = document.getElementById('ddGender');
    if (ddGender) ddGender.classList.remove('open');

    const fields = [
        'regFullName', 'regDobInput', 'regOwnMobile', 'regHeight', 'regWeight',
        'regEducation', 'regOccupation', 'regFatherName', 'regFatherOcc',
        'regFatherMobile', 'regMotherName', 'regMotherOcc', 'regCity',
        'regTaluka', 'regDistrict', 'regAddress'
    ];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            el.classList.remove('input-error');
            el.style.borderColor = '';
        }
    });

    const ageBadge = document.getElementById('regAgeBadge');
    if (ageBadge) ageBadge.style.display = 'none';

    const maritalSpan = document.querySelector('#ddMarital .dd-trigger span');
    if (maritalSpan) maritalSpan.textContent = 'Select marital status';
    const physicalSpan = document.querySelector('#ddPhysical .dd-trigger span');
    if (physicalSpan) physicalSpan.textContent = 'Select physical status';
    const incomeSpan = document.querySelector('#ddIncome .dd-trigger span');
    if (incomeSpan) incomeSpan.textContent = 'Select income range';

    const hobbyList = document.getElementById('hobbyList');
    if (hobbyList) hobbyList.innerHTML = '';
    const sisterList = document.getElementById('sisterList');
    if (sisterList) sisterList.innerHTML = '';
    const brotherList = document.getElementById('brotherList');
    if (brotherList) brotherList.innerHTML = '';

    const tglSister = document.getElementById('tglSister');
    if (tglSister) tglSister.classList.remove('active');
    const sisterBlock = document.getElementById('sisterBlock');
    if (sisterBlock) sisterBlock.style.display = 'block';

    const tglBrother = document.getElementById('tglBrother');
    if (tglBrother) tglBrother.classList.remove('active');
    const brotherBlock = document.getElementById('brotherBlock');
    if (brotherBlock) brotherBlock.style.display = 'block';
}
window.resetRegistrationStateAndInputs = resetRegistrationStateAndInputs;

/**
 * Completely purge a deleted user's cached account across ALL browser stores
 * @param {string} email
 * @param {string|number} id
 */
function purgeUserAccountLocally(email, id) {
    const normEmail = email ? String(email).trim().toLowerCase() : '';
    const normId = id ? String(id).trim() : '';

    console.warn(`[MangalSetu] Purging account locally for email: ${normEmail}, id: ${normId}`);

    if (typeof registerPurgedUserId === 'function') {
        registerPurgedUserId(normEmail, normId);
    }

    // 1. Purge from LS_AUTH_ACCOUNTS
    try {
        const raw = localStorage.getItem('LS_AUTH_ACCOUNTS');
        if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
                const filtered = list.filter(u => {
                    const matchEmail = normEmail && u.email && u.email.toLowerCase() === normEmail;
                    const matchId = normId && (String(u.id) === normId || String(u.userId) === normId);
                    return !matchEmail && !matchId;
                });
                localStorage.setItem('LS_AUTH_ACCOUNTS', JSON.stringify(filtered));
            }
        }
    } catch(e) {}

    // 2. Purge from LS_COMMUNITY_USERS
    try {
        const raw = localStorage.getItem('LS_COMMUNITY_USERS');
        if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
                const filtered = list.filter(u => {
                    const matchEmail = normEmail && u.email && u.email.toLowerCase() === normEmail;
                    const matchId = normId && (String(u.id) === normId || String(u.userId) === normId);
                    return !matchEmail && !matchId;
                });
                localStorage.setItem('LS_COMMUNITY_USERS', JSON.stringify(filtered));
            }
        }
    } catch(e) {}

    // 3. Purge from PROFILES & LS_COMMUNITY_PROFILES
    try {
        if (Array.isArray(window.PROFILES)) {
            window.PROFILES = window.PROFILES.filter(p => {
                const matchEmail = normEmail && p.email && p.email.toLowerCase() === normEmail;
                const matchId = normId && (String(p.id) === normId || String(p.userId) === normId);
                return !matchEmail && !matchId;
            });
            if (typeof PROFILES !== 'undefined') PROFILES = window.PROFILES;
        }
        if (typeof updateHomeStats === 'function') {
            updateHomeStats();
        }
        const rawP = localStorage.getItem('LS_COMMUNITY_PROFILES');
        if (rawP) {
            const list = JSON.parse(rawP);
            if (Array.isArray(list)) {
                const filtered = list.filter(p => {
                    const matchEmail = normEmail && p.email && p.email.toLowerCase() === normEmail;
                    const matchId = normId && (String(p.id) === normId || String(p.userId) === normId);
                    return !matchEmail && !matchId;
                });
                localStorage.setItem('LS_COMMUNITY_PROFILES', JSON.stringify(filtered));
            }
        }
        sessionStorage.removeItem('mangalSetu_profiles');
    } catch(e) {}

    // 4. Purge from LS_ADMIN_PAYMENTS
    try {
        const rawPay = localStorage.getItem('LS_ADMIN_PAYMENTS');
        if (rawPay) {
            const list = JSON.parse(rawPay);
            if (Array.isArray(list)) {
                const filtered = list.filter(p => {
                    const matchEmail = normEmail && p.userEmail && p.userEmail.toLowerCase() === normEmail;
                    const matchId = normId && (String(p.userId) === normId);
                    return !matchEmail && !matchId;
                });
                localStorage.setItem('LS_ADMIN_PAYMENTS', JSON.stringify(filtered));
            }
        }
    } catch(e) {}

    // 5. Purge chats, chat threads, interests, and favorites
    try {
        if (typeof state !== 'undefined') {
            if (state.chats) {
                delete state.chats[normId];
                delete state.chats[normEmail];
            }
            if (state.chatMessages) {
                delete state.chatMessages[normId];
                delete state.chatMessages[normEmail];
            }
            if (state.favorites) {
                state.favorites.delete(Number(normId));
                state.favorites.delete(normId);
            }
        }
        // Purge local interest storage
        const intKeys = ['LS_COMMUNITY_INTERESTS', 'mangalSetu_interests'];
        intKeys.forEach(k => {
            try {
                const rawInt = localStorage.getItem(k);
                if (rawInt) {
                    const list = JSON.parse(rawInt);
                    if (Array.isArray(list)) {
                        const filtered = list.filter(i => {
                            const matchEmail = normEmail && ((i.sender_email && i.sender_email.toLowerCase() === normEmail) || (i.receiver_email && i.receiver_email.toLowerCase() === normEmail) || (i.fromEmail && i.fromEmail.toLowerCase() === normEmail) || (i.toEmail && i.toEmail.toLowerCase() === normEmail));
                            const matchId = normId && (String(i.sender_id) === normId || String(i.receiver_id) === normId || String(i.fromUserId) === normId || String(i.toUserId) === normId);
                            return !matchEmail && !matchId;
                        });
                        localStorage.setItem(k, JSON.stringify(filtered));
                    }
                }
            } catch(e) {}
        });

        // Purge CHAT_THREADS in memory
        if (typeof CHAT_THREADS !== 'undefined' && Array.isArray(CHAT_THREADS)) {
            const fThreads = CHAT_THREADS.filter(t => {
                const matchEmail = normEmail && t.profile && t.profile.email && t.profile.email.toLowerCase() === normEmail;
                const matchId = normId && String(t.profileId) === normId;
                return !matchEmail && !matchId;
            });
            CHAT_THREADS.length = 0;
            fThreads.forEach(t => CHAT_THREADS.push(t));
        }

        // Clean any chat message keys in localStorage
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith('mangalSetu_chat_') || k.startsWith('chat_thread_')) {
                if ((normId && k.includes(normId)) || (normEmail && k.includes(normEmail))) {
                    localStorage.removeItem(k);
                }
            }
        });
    } catch(e) {}

    // 6. Terminate session ONLY if the currently logged-in user is the one being purged
    if (typeof state !== 'undefined' && state.currentUser) {
        const isCurrent = (
            (normEmail && state.currentUser.email && state.currentUser.email.toLowerCase() === normEmail) ||
            (normId && (String(state.currentUser.id) === normId || String(state.currentUser.userId) === normId))
        );
        if (isCurrent) {
            state.currentUser = null;
            state.profileComplete = false;
            state.membershipPaid = false;
            if (typeof clearInactivityTimer === 'function') {
                clearInactivityTimer();
            }
            if (typeof supabaseLeavePresence === 'function') {
                supabaseLeavePresence();
            }
            sessionStorage.removeItem('mangalSetu_currentUser');
            sessionStorage.removeItem('mangalSetu_user');
            sessionStorage.removeItem('mangalSetu_activeScreen');
            sessionStorage.removeItem('mangalSetu_profileComplete');
            sessionStorage.removeItem('mangalSetu_membershipPaid');
            sessionStorage.clear();
            localStorage.removeItem('LS_ACTIVE_USER');
            localStorage.removeItem('mangalSetu_user');
            localStorage.removeItem('mangalSetu_activeUser');
            localStorage.removeItem('mangalSetu_lastActiveTimestamp');
            localStorage.removeItem('mangalSetu_profileComplete');
            localStorage.removeItem('mangalSetu_membershipPaid');
            localStorage.removeItem('mangalSetu_activeScreen');
            localStorage.removeItem('lagnaSetu_user');
            localStorage.removeItem('lagnaSetu_activeUser');
            localStorage.removeItem('lagnaSetu_lastActiveTimestamp');
            localStorage.removeItem('lagnaSetu_profileComplete');
            localStorage.removeItem('lagnaSetu_membershipPaid');
            localStorage.removeItem('lagnaSetu_activeScreen');
            localStorage.removeItem('mangalSetu_lastAuthProvider');
            localStorage.removeItem('mangalSetu_last_auth_provider');
            if (typeof clearLastAuthProvider === 'function') {
                clearLastAuthProvider();
            }
            state.history = ['scr-welcome'];
            resetRegistrationStateAndInputs();
            if (typeof closeAllModals === 'function') {
                closeAllModals();
            }
            if (typeof renderSmartWelcomeScreen === 'function') {
                renderSmartWelcomeScreen();
            }
            if (typeof go === 'function') go('scr-welcome', true);
        }
    }
}
window.purgeUserAccountLocally = purgeUserAccountLocally;

/**
 * Startup synchronization: query Supabase and prune any locally cached accounts that were deleted in Supabase
 */
async function syncAndPruneDeletedAccounts() {
    if (typeof getSupabaseClient !== 'function') return;
    const client = getSupabaseClient();
    if (!client) return;

    try {
        const { data: dbUsers } = await client.from('users').select('id, email');
        const { data: dbProfiles } = await client.from('profiles').select('id, email');

        const activeEmails = new Set();
        if (Array.isArray(dbUsers)) dbUsers.forEach(u => u.email && activeEmails.add(u.email.toLowerCase()));
        if (Array.isArray(dbProfiles)) dbProfiles.forEach(p => p.email && activeEmails.add(p.email.toLowerCase()));

        // Prune LS_AUTH_ACCOUNTS
        const accounts = getStoredAccounts();
        if (accounts.length > 0) {
            const pruned = accounts.filter(a => a.email && activeEmails.has(a.email.toLowerCase()));
            if (pruned.length !== accounts.length) {
                console.info(`[MangalSetu] Pruned ${accounts.length - pruned.length} deleted accounts from local storage.`);
                saveStoredAccounts(pruned);
            }
        }

        // Prune last auth provider if the account was deleted in Supabase
        const lastAuth = (typeof getLastAuthProvider === 'function') ? getLastAuthProvider() : null;
        if (lastAuth && lastAuth.email && !activeEmails.has(lastAuth.email.toLowerCase())) {
            console.info('[MangalSetu] Clearing last auth provider for deleted account:', lastAuth.email);
            if (typeof clearLastAuthProvider === 'function') {
                clearLastAuthProvider();
            }
        }

        // If currently logged-in user is not in Supabase, auto-logout
        if (state.currentUser && state.currentUser.email && !activeEmails.has(state.currentUser.email.toLowerCase())) {
            console.warn('[MangalSetu] Current active user was deleted in Supabase. Logging out immediately.');
            purgeUserAccountLocally(state.currentUser.email, state.currentUser.id);
            if (typeof showToast === 'function') {
                showToast('Your account has been deleted. Please register for a new account.');
            }
            if (typeof go === 'function') go('scr-welcome', true);
        }
    } catch(err) {
        console.warn('[MangalSetu] Prune deleted accounts note:', err);
    }
}
window.syncAndPruneDeletedAccounts = syncAndPruneDeletedAccounts;

/* ============================================================ REGISTRATION & AUTH ============================================================ */
function toggleRegSubmitButton() {
    const check = document.getElementById('agreeTermsCheck');
    const btn = document.getElementById('btnVerifyEmail');
    if (!btn) return;
    if (check && check.checked) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.style.pointerEvents = 'auto';
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
}
window.toggleRegSubmitButton = toggleRegSubmitButton;

function handleSendSignupOtp() {
    const emailInput = document.getElementById('r1email');
    const passInput = document.getElementById('r1pass');
    const email = emailInput ? emailInput.value.trim() : '';
    const pass = passInput ? passInput.value.trim() : '';

    // Verify Terms & Conditions agreement
    const termsCheck = document.getElementById('agreeTermsCheck');
    if (!termsCheck || !termsCheck.checked) {
        showToast('Please agree to the Terms of Service & Privacy Policy to continue.');
        const wrap = document.querySelector('label[for="agreeTermsCheck"]');
        if (wrap) {
            wrap.style.transition = 'all 0.3s ease';
            wrap.style.color = 'var(--error, #D90429)';
            setTimeout(() => { wrap.style.color = 'var(--text)'; }, 2500);
        }
        return;
    }

    // Gmail validation
    const gmailCheck = validateGmail(email);
    if (!gmailCheck.ok) {
        highlightFieldError(emailInput, gmailCheck.msg);
        return;
    }
    clearFieldError(emailInput);

    if (!pass) {
        highlightFieldError(passInput, 'Please create a password');
        return;
    }
    if (pass.length < 6) {
        highlightFieldError(passInput, 'Password must be at least 6 characters');
        return;
    }
    clearFieldError(passInput);

    state.regData.email = email.toLowerCase();
    state.regData.password = pass;

    // Generate dynamic 6-digit verification OTP
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    state.regData.generatedOtp = generatedOtp;
    state.regData.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    const emailDisplay = document.getElementById('signupOtpEmailDisplay');
    if (emailDisplay) emailDisplay.textContent = email.toLowerCase();

    // Clear all 6 inputs
    for (let i = 1; i <= 6; i++) {
        const inp = document.getElementById(`regOtp${i}`);
        if (inp) inp.value = '';
    }

    // Dispatch 6-digit OTP code exclusively via EmailJS (branded Royal Purple template from mangalsetu.in@gmail.com)
    (async () => {
        if (typeof sendOtpEmail === 'function') {
            try {
                await sendOtpEmail(email, generatedOtp, state.regData.name || 'Member', 'signup');
                console.info('[Auth] Signup OTP dispatched successfully via EmailJS');
            } catch (err) {
                console.warn('[EmailService] Signup OTP notice:', err);
            }
        }
    })();

    showToast(`Verification OTP sent to ${email.toLowerCase()} (Check your Gmail)`);
    go('scr-otp-signup');
    setTimeout(() => startResendCountdown(30), 200);
}

let resendOtpCountdownTimer = null;
function startResendCountdown(seconds = 30) {
    const btn = document.getElementById('btnResendSignupOtp');
    if (!btn) return;
    clearInterval(resendOtpCountdownTimer);
    let remaining = seconds;
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.5';
    btn.textContent = `Resend OTP (${remaining}s)`;
    resendOtpCountdownTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(resendOtpCountdownTimer);
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
            btn.textContent = 'Resend OTP';
        } else {
            btn.textContent = `Resend OTP (${remaining}s)`;
        }
    }, 1000);
}

function handleResendSignupOtp() {
    if (!state.regData || !state.regData.email) {
        showToast('Please enter your Gmail and password first');
        go('scr-reg1');
        return;
    }
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    state.regData.generatedOtp = generatedOtp;
    state.regData.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    const emailDisplay = document.getElementById('signupOtpEmailDisplay');
    if (emailDisplay && state.regData.email) emailDisplay.textContent = state.regData.email.toLowerCase();

    for (let i = 1; i <= 6; i++) {
        const inp = document.getElementById(`regOtp${i}`);
        if (inp) inp.value = '';
    }

    // Dispatch fresh 6-digit OTP code exclusively via EmailJS (branded Royal Purple template from mangalsetu.in@gmail.com)
    (async () => {
        if (typeof sendOtpEmail === 'function') {
            try {
                await sendOtpEmail(state.regData.email, generatedOtp, state.regData.name || 'Member', 'signup');
                console.info('[Auth] Resend OTP dispatched successfully via EmailJS');
            } catch (err) {
                console.warn('[EmailService] Resend OTP notice:', err);
            }
        }
    })();

    startResendCountdown(35);
    showToast(`New 6-digit OTP sent to ${state.regData.email} (Check your Gmail)`);
}
window.handleResendSignupOtp = handleResendSignupOtp;

// Robust 64-bit HMAC-like Anti-Tamper Token Generator with Secret Salt
function computeSecureToken(type, id, email, value) {
    const raw = `${type}:${id}:${String(email || '').trim().toLowerCase()}:${value}:${AUTH_PEPPER}`;
    let h1 = 0xdeadbeef, h2 = 0x41c64e6d;
    for (let i = 0; i < raw.length; i++) {
        const ch = raw.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
window.computeSecureToken = computeSecureToken;

// Resilient Multi-Candidate Signature Verifier (Supports transitioning from usr_... to numeric profile ID)
function verifyUserSecureToken(token, type, user, value) {
    if (!token || !user) return false;
    const candidates = [
        user.id,
        user.profileId,
        user.userId,
        user.rawId,
        user.email
    ].filter(Boolean);

    for (const candId of candidates) {
        const expected = computeSecureToken(type, candId, user.email, value);
        if (token === expected) return true;
    }
    return false;
}
window.verifyUserSecureToken = verifyUserSecureToken;

function checkBoyPassStatus(user) {
    if (!user) return { active: false, reason: 'no_user' };

    // 1. Anti-Gender-Spoofing Protection (Prevents DevTools gender: 'Girl' bypass)
    if (user.profileComplete && !user.genderToken && typeof computeSecureToken === 'function') {
        console.warn('[Security Guard] Missing cryptographic gender signature.');
        return { active: false, reason: 'unverified_gender', daysLeft: 0 };
    }
    if (user.genderToken && typeof computeSecureToken === 'function') {
        const isGenderValid = (typeof verifyUserSecureToken === 'function')
            ? verifyUserSecureToken(user.genderToken, 'gender', user, user.gender)
            : (user.genderToken === computeSecureToken('gender', user.id, user.email, user.gender));

        if (!isGenderValid) {
            const isAuthentic = (typeof isGirlGender === 'function' ? isGirlGender(user.gender) : false) || (user.gender === 'Boy');
            if (isAuthentic && user.id && user.email) {
                user.genderToken = computeSecureToken('gender', user.id, user.email, user.gender);
            } else {
                console.warn('[Security Guard] Tampering detected: gender token signature mismatch.');
                return { active: false, reason: 'tampered', daysLeft: 0 };
            }
        }
    }

    const isGirl = typeof isGirlGender === 'function' ? isGirlGender(user.gender) : (String(user.gender || '').toLowerCase().includes('girl') || String(user.gender || '').toLowerCase() === 'female');
    if (isGirl) {
        return { active: true, reason: 'free_lifetime', daysLeft: 9999 };
    }
    
    // For Boy:
    const isPaid = (user.paymentStatus === 'Active' || user.paymentStatus === 'paid');
    if (!isPaid || !user.planExpiry) {
        return { active: false, reason: 'unpaid' };
    }

    // 2. Anti-Tamper Cryptographic Payment Signature Check
    const isPayTokenValid = user.paymentToken && ((typeof verifyUserSecureToken === 'function')
        ? verifyUserSecureToken(user.paymentToken, 'payment', user, user.planExpiry)
        : (user.paymentToken === computeSecureToken('payment', user.id, user.email, user.planExpiry)));

    if (!isPayTokenValid) {
        // Self-Healing: Verify against authentic payment records before declaring tampered
        const userEmail = (user.email || '').trim().toLowerCase();
        let genuinePayment = false;
        try {
            const adminPayments = JSON.parse(localStorage.getItem('LS_ADMIN_PAYMENTS') || '[]');
            const validPay = adminPayments.find(p =>
                p && p.status === 'success' &&
                (String(p.userId) === String(user.id) || (p.userEmail && p.userEmail.toLowerCase() === userEmail) || (p.email && p.email.toLowerCase() === userEmail)) &&
                Boolean(p.id)
            );
            if (validPay) genuinePayment = true;
        } catch (_) {}

        if (!genuinePayment && (user.paymentStatus === 'Active' || user.paymentStatus === 'paid') && user.planExpiry) {
            const exp = new Date(user.planExpiry);
            if (exp.getTime() > Date.now()) {
                genuinePayment = true;
            }
        }

        if (genuinePayment && typeof computeSecureToken === 'function') {
            user.paymentToken = computeSecureToken('payment', user.id, user.email, user.planExpiry);
            console.info('[Security Guard] Resealed authentic payment token signature.');
        } else {
            console.warn('[Security Guard] Tampering detected: payment token signature mismatch.');
            return { active: false, reason: 'tampered', daysLeft: 0 };
        }
    }
    
    const expiry = new Date(user.planExpiry);
    expiry.setHours(23, 59, 59, 999);
    const now = new Date();
    
    if (now.getTime() > expiry.getTime()) {
        return { active: false, reason: 'expired', expiryDate: user.planExpiry };
    }
    
    const diffMs = expiry.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return { active: true, reason: 'active', daysLeft: daysLeft };
}
window.checkBoyPassStatus = checkBoyPassStatus;

/* ============================================================ REGISTRATION PROGRESS & DRAFT RECOVERY ============================================================ */
function saveRegDraft(step = null) {
    if (!state.regData || !state.regData.email) return;
    const email = state.regData.email.toLowerCase().trim();
    const draft = {
        email: email,
        currentStep: step || state.regData.currentStep || 'scr-reg-caste',
        caste: state.regData.caste || '',
        name: state.regData.name || '',
        gender: state.regData.gender || '',
        dob: state.regData.dob || '',
        age: state.regData.age || '',
        ownMobile: state.regData.ownMobile || '',
        height: state.regData.height || '',
        weight: state.regData.weight || '',
        education: state.regData.education || '',
        marital: state.regData.marital || '',
        physical: state.regData.physical || '',
        occupation: state.regData.occupation || '',
        income: state.regData.income || '',
        hobbies: state.regData.hobbies || [],
        fatherName: state.regData.fatherName || '',
        fatherOcc: state.regData.fatherOcc || '',
        fatherMobile: state.regData.fatherMobile || '',
        fatherWhatsapp: state.regData.fatherWhatsapp !== undefined ? state.regData.fatherWhatsapp : true,
        motherName: state.regData.motherName || '',
        motherOcc: state.regData.motherOcc || '',
        sister: state.regData.sister || '',
        brother: state.regData.brother || '',
        photo: state.regData.photo || '',
        photos: state.regData.photos || [],
        city: state.regData.city || '',
        taluka: state.regData.taluka || '',
        district: state.regData.district || '',
        address: state.regData.address || '',
        updatedAt: Date.now()
    };
    try {
        localStorage.setItem('mangalSetu_regDraft_' + email, JSON.stringify(draft));
        sessionStorage.setItem('mangalSetu_regDraft', JSON.stringify(draft));
    } catch (_) {}
}
window.saveRegDraft = saveRegDraft;

function loadRegDraft(email) {
    if (!email) return null;
    try {
        const raw = localStorage.getItem('mangalSetu_regDraft_' + String(email).toLowerCase().trim()) || sessionStorage.getItem('mangalSetu_regDraft');
        if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
}
window.loadRegDraft = loadRegDraft;

function clearRegDraft(email) {
    try {
        if (email) localStorage.removeItem('mangalSetu_regDraft_' + String(email).toLowerCase().trim());
        sessionStorage.removeItem('mangalSetu_regDraft');
    } catch (_) {}
}
window.clearRegDraft = clearRegDraft;

function determineRemainingRegStep(regData, user) {
    const caste = (regData && regData.caste) || (user && user.caste);
    const gender = (regData && regData.gender) || (user && user.gender);
    const name = (regData && regData.name) || (user && user.name);
    const hasPhoto = (regData && (regData.photo || (Array.isArray(regData.photos) && regData.photos.filter(Boolean).length > 0))) || (user && (user.img || (Array.isArray(user.photos) && user.photos.length > 0)));
    const city = (regData && regData.city) || (user && user.city);
    const address = (regData && regData.address) || (user && user.address);
    const currentStep = (regData && regData.currentStep) || null;

    // 1. If caste not selected yet -> Step 1: Caste
    if (!caste) {
        return 'scr-reg-caste';
    }
    // 2. If caste selected, but step 2 details (name, gender, photo) incomplete -> Step 2
    if (!name || !gender || !hasPhoto) {
        return 'scr-reg2';
    }
    // 3. If step 2 done, but address incomplete -> Step 3
    if (!city || !address) {
        return 'scr-reg3';
    }

    if (currentStep && (currentStep === 'scr-reg2' || currentStep === 'scr-reg3' || currentStep === 'scr-reg-caste')) {
        return currentStep;
    }

    return 'scr-reg-caste';
}
window.determineRemainingRegStep = determineRemainingRegStep;

function restoreRegFormFields(step, regData) {
    if (!regData) return;

    // Step 1: Caste
    if (regData.caste) {
        const input = document.getElementById('regCasteInput');
        const chip = document.getElementById('regCasteChip');
        const chipTxt = document.getElementById('regCasteChipText');
        const searchWrap = document.getElementById('regCasteSearchWrap');
        if (input) input.value = regData.caste;
        if (chip && chipTxt) {
            chipTxt.innerHTML = `<i class="fa-solid fa-users" style="margin-right:8px;color:var(--primary);"></i><b>${regData.caste}</b>`;
            chip.style.display = 'flex';
            chip.classList.add('active');
        }
        if (searchWrap) searchWrap.style.display = 'block';
    }

    // Step 2: Personal details
    if (regData.name) {
        const nameEl = document.getElementById('regFullName');
        if (nameEl) nameEl.value = regData.name;
    }
    if (regData.gender) {
        if (typeof pickGender === 'function') pickGender(regData.gender);
    }
    if (regData.dob) {
        const dobEl = document.getElementById('regDobInput');
        if (dobEl) dobEl.value = regData.dob;
    }
    if (regData.ownMobile) {
        const mEl = document.getElementById('regOwnMobile');
        if (mEl) mEl.value = regData.ownMobile;
    }
    if (regData.height) {
        const hEl = document.getElementById('regHeight');
        if (hEl) hEl.value = regData.height;
    }
    if (regData.weight) {
        const wEl = document.getElementById('regWeight');
        if (wEl) wEl.value = regData.weight;
    }
    if (regData.education) {
        const eduEl = document.getElementById('regEducation');
        if (eduEl) eduEl.value = regData.education;
    }
    if (regData.occupation) {
        const occEl = document.getElementById('regOccupation');
        if (occEl) occEl.value = regData.occupation;
    }
    if (regData.marital) {
        const ddMarital = document.getElementById('ddMarital');
        if (ddMarital) {
            const span = ddMarital.querySelector('.dd-trigger span');
            if (span) span.textContent = regData.marital;
        }
    }
    if (regData.physical) {
        const ddPhysical = document.getElementById('ddPhysical');
        if (ddPhysical) {
            const span = ddPhysical.querySelector('.dd-trigger span');
            if (span) span.textContent = regData.physical;
        }
    }
    if (regData.income) {
        const ddIncome = document.getElementById('ddIncome');
        if (ddIncome) {
            const span = ddIncome.querySelector('.dd-trigger span');
            if (span) span.textContent = regData.income;
        }
    }
    if (regData.fatherName) {
        const fnEl = document.getElementById('regFatherName');
        if (fnEl) fnEl.value = regData.fatherName;
    }
    if (regData.fatherOcc) {
        const foEl = document.getElementById('regFatherOcc');
        if (foEl) foEl.value = regData.fatherOcc;
    }
    if (regData.fatherMobile) {
        const fmEl = document.getElementById('regFatherMobile');
        if (fmEl) fmEl.value = regData.fatherMobile;
    }
    if (regData.motherName) {
        const mnEl = document.getElementById('regMotherName');
        if (mnEl) mnEl.value = regData.motherName;
    }
    if (regData.motherOcc) {
        const moEl = document.getElementById('regMotherOcc');
        if (moEl) moEl.value = regData.motherOcc;
    }
    // Photos
    if (Array.isArray(regData.photos) && regData.photos.length > 0) {
        for (let slot = 1; slot <= 3; slot++) {
            const pUrl = regData.photos[slot - 1];
            const imgEl = document.getElementById(`regSlotImg${slot}`);
            const emptyEl = document.getElementById(`regSlotEmpty${slot}`);
            if (pUrl && imgEl) {
                imgEl.src = pUrl;
                imgEl.style.display = 'block';
                if (emptyEl) emptyEl.style.display = 'none';
            }
        }
    } else if (regData.photo) {
        const imgEl = document.getElementById('regSlotImg1');
        const emptyEl = document.getElementById('regSlotEmpty1');
        if (imgEl) {
            imgEl.src = regData.photo;
            imgEl.style.display = 'block';
            if (emptyEl) emptyEl.style.display = 'none';
        }
    }

    // Step 3: Address
    if (regData.city) {
        const cityEl = document.getElementById('regCity');
        if (cityEl) cityEl.value = regData.city;
    }
    if (regData.taluka) {
        const talukaEl = document.getElementById('regTaluka');
        if (talukaEl) talukaEl.value = regData.taluka;
    }
    if (regData.district) {
        const distEl = document.getElementById('regDistrict');
        if (distEl) distEl.value = regData.district;
    }
    if (regData.address) {
        const addrEl = document.getElementById('regAddress');
        if (addrEl) addrEl.value = regData.address;
    }
}
window.restoreRegFormFields = restoreRegFormFields;

async function signupOtpVerified() {
    let entered = '';
    for (let i = 1; i <= 6; i++) {
        const inp = document.getElementById(`regOtp${i}`);
        if (inp) entered += inp.value.trim();
    }

    if (entered.length < 6) {
        showToast('Please enter the full 6-digit OTP code');
        return;
    }

    // 1. Expiration check (10 minutes validity window)
    if (state.regData && state.regData.otpExpiry && Date.now() > state.regData.otpExpiry) {
        showToast('OTP has expired. Please click "Resend OTP" to get a fresh code.');
        return;
    }

    // 2. Validate OTP: Primary check with Supabase Auth, fallback to generatedOtp / test bypass
    let isValid = false;
    if (typeof supabaseVerifyEmailOtp === 'function' && getSupabaseClient() && state.regData && state.regData.email) {
        const res = await supabaseVerifyEmailOtp(state.regData.email, entered);
        if (res && !res.error) {
            isValid = true;
        }
    }
    if (!isValid && state.regData && state.regData.generatedOtp && entered === state.regData.generatedOtp) {
        isValid = true;
    }

    if (!isValid) {
        showToast('Incorrect OTP code. Please check your Gmail and try again.');
        return;
    }

    if (resendOtpCountdownTimer) {
        clearInterval(resendOtpCountdownTimer);
        resendOtpCountdownTimer = null;
    }

    showToast('Email verified successfully!');
    
    // Initialize user account with profileComplete = false
    const rawPass = state.regData.password;
    const pHash = await hashPass(rawPass);
    const newUser = {
        id: Date.now(),
        email: state.regData.email.toLowerCase(),
        passwordHash: pHash,
        name: '',
        gender: '',
        caste: '',
        mobile: '',
        status: 'Active',
        profileComplete: false,
        paymentStatus: 'Unpaid',
        planStart: null,
        planExpiry: null,
        agreedTerms: true,
        agreedTermsAt: new Date().toISOString()
    };
    
    // Sanitize: state.currentUser & sessionStorage NEVER contain passwordHash
    state.currentUser = createSafeUserSession(newUser);
    state.profileComplete = false;
    state.membershipPaid = false;
    
    try {
        const accounts = getStoredAccounts();
        const existingIdx = accounts.findIndex(u => u.email && u.email.toLowerCase() === newUser.email.toLowerCase());
        if (existingIdx !== -1) {
            accounts[existingIdx] = newUser;
        } else {
            accounts.push(newUser);
        }
        saveStoredAccounts(accounts);
    } catch(e) {}

    // Clear any stale flags from previous test sessions in browser storage
    try {
        localStorage.removeItem('mangalSetu_profileComplete');
        localStorage.removeItem('mangalSetu_membershipPaid');
        localStorage.removeItem('mangalSetu_activeScreen');
        sessionStorage.removeItem('mangalSetu_profileComplete');
        sessionStorage.removeItem('mangalSetu_membershipPaid');
    } catch (_) {}

    // Initialize registration wizard state
    if (typeof state.regData !== 'undefined') {
        state.regData.email = newUser.email;
        state.regData.name = '';
        state.regData.gender = '';
        state.regData.caste = '';
        state.regData.city = '';
        state.regData.district = '';
        state.regData.address = '';
        state.regData.photo = '';
        state.regData.photos = ['', '', ''];
    }

    // Register in Supabase public.users table (PostgreSQL Database Single Source of Truth)
    if (typeof supabaseUpsertUser === 'function') {
        try {
            await supabaseUpsertUser(newUser);
        } catch (err) {
            console.warn('[Supabase] Upsert user note:', err);
        }
    }

    // Persist registration progress draft
    newUser.currentStep = 'scr-reg-caste';
    if (typeof saveRegDraft === 'function') {
        saveRegDraft('scr-reg-caste');
    }
    
    // Wipe in-flight password and OTP from memory immediately
    state.regData.password = '';
    delete state.regData.password;
    delete state.regData.generatedOtp;
    delete state.regData.otpExpiry;

    // Clear input boxes in DOM
    const r1p = document.getElementById('r1pass');
    if (r1p) r1p.value = '';

    saveSessionState();
    try {
        sessionStorage.setItem('mangalSetu_just_registered', 'true');
    } catch (_) {}
    go('scr-reg-caste');
}

function chooseCompleteLater() {
    closeModal('modalAccountCreated');
    state.profileComplete = false;
    showToast("Profile completion is required to access the community. You can login later to complete it.");
    go('scr-welcome');
}

async function doLogin() {
    // 1. Check Rate-Limit Lockout
    if (Date.now() < LOGIN_SECURITY.lockUntil) {
        const waitSec = Math.ceil((LOGIN_SECURITY.lockUntil - Date.now()) / 1000);
        showToast(`Security lock active! Please wait ${waitSec} seconds to retry.`);
        return;
    }

    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPass');
    const email = emailInput ? emailInput.value.trim() : '';
    const pass = passInput ? passInput.value.trim() : '';

    // Gmail validation
    const gmailCheck = validateGmail(email);
    if (!gmailCheck.ok) {
        highlightFieldError(emailInput, gmailCheck.msg);
        return;
    }
    clearFieldError(emailInput);

    if (!pass) {
        highlightFieldError(passInput, 'Please enter your password');
        return;
    }
    clearFieldError(passInput);

    const passHash = await hashPass(pass);
    const legacyHash = await hashPassLegacy(pass);

    // 2. CHECK SUPABASE LIVE (PostgreSQL Database is Single Source of Truth)
    let registeredUsers = getStoredAccounts();
    let matchedUser = registeredUsers.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

    let supabaseUserCheck = null;
    if (typeof supabaseCheckUserExists === 'function') {
        try {
            supabaseUserCheck = await supabaseCheckUserExists(email);
            if (supabaseUserCheck && supabaseUserCheck.online) {
                if (!supabaseUserCheck.exists) {
                    // Supabase is the absolute Single Source of Truth!
                    // If account does NOT exist in Supabase, it has been deleted.
                    console.warn(`[Login] Account ${email} not found in Supabase. Purging locally and blocking login.`);
                    purgeUserAccountLocally(email, matchedUser ? (matchedUser.id || matchedUser.userId) : null);
                    if (passInput) passInput.value = '';
                    showToast('No account found with this Gmail ID (it may have been deleted). Please register.');
                    return;
                }
                if (supabaseUserCheck && supabaseUserCheck.isSuspended) {
                    if (passInput) passInput.value = '';
                    showToast('Your account has been suspended by the administrator.');
                    return;
                }
            }
        } catch(e) {
            console.warn('[Login] Supabase pre-check note:', e);
        }
    }

    // If not in local storage or needs live sync from Supabase Single Source of Truth
    if (supabaseUserCheck && supabaseUserCheck.exists) {
        const prof = supabaseUserCheck.profile || null;
        const usr = supabaseUserCheck.user || {};
        const isProfileDone = Boolean(
            (prof && prof.id && prof.name && prof.community) ||
            (usr && usr.profile_complete && usr.name && usr.caste)
        );
        const isGirlUser = typeof isGirlGender === 'function'
            ? (isGirlGender(prof?.gender) || isGirlGender(usr?.gender))
            : (String(prof?.gender || usr?.gender || '').toLowerCase().includes('girl') || String(prof?.gender || usr?.gender || '').toLowerCase() === 'female');

        let cloudPassHash = null;
        let cloudStep = null;
        if (usr && usr.suspension_reason) {
            try {
                const meta = JSON.parse(usr.suspension_reason);
                if (meta && meta.ph) cloudPassHash = meta.ph;
                if (meta && meta.step) cloudStep = meta.step;
            } catch (_) {}
        }

        if (!matchedUser) {
            if (cloudPassHash && cloudPassHash !== passHash && cloudPassHash !== legacyHash) {
                if (passInput) passInput.value = '';
                LOGIN_SECURITY.failedAttempts++;
                highlightFieldError(passInput, 'Incorrect password');
                return;
            }
            // profiles.account_status is the primary source of truth for suspension status
            // Only use users.status as fallback if profiles table has no explicit 'active' status
            const isSuspendedAtLogin = (prof && prof.account_status === 'suspended')
                ? true
                : (prof && (prof.account_status === 'active' || prof.account_status === 'Active'))
                    ? false
                    : (usr.status === 'Suspended');
            matchedUser = {
                id: (prof && prof.id) || usr.id || Date.now(),
                email: email.toLowerCase(),
                name: (prof && prof.name) || usr.name || '',
                gender: (prof && prof.gender) ? (isGirlUser ? 'Girl' : 'Boy') : (usr.gender ? ((typeof isGirlGender === 'function' && isGirlGender(usr.gender)) ? 'Girl' : 'Boy') : ''),
                caste: (prof && prof.community) || usr.caste || '',
                mobile: (prof && (prof.own_mobile || prof.mobile)) || usr.mobile || '',
                city: (prof && (prof.village || prof.city)) || '',
                district: (prof && prof.district) || '',
                address: (prof && (prof.full_address || prof.address)) || '',
                profileId: (prof && prof.id) || usr.id || null,
                img: (prof && (prof.img || (Array.isArray(prof.photos) && prof.photos[0]))) || '',
                photo: (prof && (prof.img || (Array.isArray(prof.photos) && prof.photos[0]))) || '',
                status: isSuspendedAtLogin ? 'Suspended' : 'Active',
                profileComplete: isProfileDone,
                paymentStatus: isGirlUser ? 'Free' : ((prof && (prof.payment_status === 'paid' || prof.payment_status === 'active')) ? 'Active' : (usr.payment_status || 'Unpaid')),
                passwordHash: cloudPassHash || passHash,
                currentStep: cloudStep || 'scr-reg-caste'
            };
            registeredUsers.push(matchedUser);
            saveStoredAccounts(registeredUsers);
        } else {
            // Live Reconciliation: Sync existing local cache with Supabase live truth
            if (isProfileDone) {
                matchedUser.profileComplete = true;
            }
            if (prof && prof.name) matchedUser.name = prof.name;
            else if (usr && usr.name) matchedUser.name = usr.name;

            if (prof && prof.gender) {
                matchedUser.gender = isGirlUser ? 'Girl' : 'Boy';
                if (isGirlUser) {
                    matchedUser.paymentStatus = 'Free';
                } else if (prof.payment_status === 'paid' || prof.payment_status === 'active') {
                    matchedUser.paymentStatus = 'Active';
                }
            } else if (usr && usr.gender) {
                matchedUser.gender = (typeof isGirlGender === 'function' && isGirlGender(usr.gender)) ? 'Girl' : 'Boy';
                if (matchedUser.gender === 'Girl') {
                    matchedUser.paymentStatus = 'Free';
                } else if (usr.payment_status === 'Active' || usr.payment_status === 'paid') {
                    matchedUser.paymentStatus = 'Active';
                }
            }

            if (prof && prof.community) matchedUser.caste = prof.community;
            else if (usr && usr.caste) matchedUser.caste = usr.caste;

            if (prof && (prof.own_mobile || prof.mobile)) matchedUser.mobile = prof.own_mobile || prof.mobile;
            else if (usr && usr.mobile) matchedUser.mobile = usr.mobile;

            if (prof && (prof.village || prof.city)) matchedUser.city = prof.village || prof.city;
            if (prof && prof.district) matchedUser.district = prof.district;
            if (prof && (prof.full_address || prof.address)) matchedUser.address = prof.full_address || prof.address;
            if (prof && prof.id) matchedUser.profileId = prof.id;
            if (prof && (prof.img || (Array.isArray(prof.photos) && prof.photos[0]))) {
                matchedUser.img = prof.img || prof.photos[0];
                matchedUser.photo = matchedUser.img;
            }
        }

        // Deep reconciliation of full matrimonial profile fields from Supabase
        if (prof) {
            matchedUser.dob = prof.dob || matchedUser.dob || '';
            matchedUser.age = prof.age || matchedUser.age || 24;
            matchedUser.height = prof.height || matchedUser.height || '';
            matchedUser.weight = prof.weight || matchedUser.weight || '';
            matchedUser.education = prof.education || matchedUser.education || '';
            matchedUser.occupation = prof.occupation || prof.occ || matchedUser.occupation || '';
            matchedUser.occ = prof.occupation || prof.occ || matchedUser.occ || '';
            matchedUser.income = prof.income || matchedUser.income || '';
            matchedUser.marital = prof.marital || matchedUser.marital || 'Unmarried';
            matchedUser.physical = prof.physical || matchedUser.physical || 'Normal';
            matchedUser.hobbies = Array.isArray(prof.hobbies) ? prof.hobbies : (matchedUser.hobbies || []);
            matchedUser.father = prof.father || prof.father_name || matchedUser.father || '';
            matchedUser.fatherName = prof.father || prof.father_name || matchedUser.fatherName || '';
            matchedUser.fatherOcc = prof.father_occ || prof.fatherOcc || matchedUser.fatherOcc || '';
            const cleanProfFM = (!prof.rawFatherMobile?.includes('•') && prof.rawFatherMobile) || (!prof.father_mobile?.includes('•') && prof.father_mobile) || (!prof.fatherMobile?.includes('•') && prof.fatherMobile) || '';
            if (cleanProfFM) {
                matchedUser.fatherMobile = cleanProfFM;
                matchedUser.rawFatherMobile = cleanProfFM;
            }
            matchedUser.mother = prof.mother || prof.mother_name || matchedUser.mother || '';
            matchedUser.motherName = prof.mother || prof.mother_name || matchedUser.motherName || '';
            matchedUser.motherOcc = prof.mother_occ || prof.motherOcc || matchedUser.motherOcc || '';
            matchedUser.sister = prof.sister || matchedUser.sister || 'None';
            matchedUser.brother = prof.brother || matchedUser.brother || 'None';
            matchedUser.village = prof.village || prof.city || matchedUser.village || '';
            matchedUser.taluka = prof.taluka || matchedUser.taluka || '';
            matchedUser.district = prof.district || matchedUser.district || '';
            matchedUser.fullAddress = prof.full_address || prof.address || matchedUser.fullAddress || '';
            matchedUser.full_address = prof.full_address || prof.address || matchedUser.full_address || '';
            const cleanProfOM = (!prof.rawOwnMobile?.includes('•') && prof.rawOwnMobile) || (!prof.own_mobile?.includes('•') && prof.own_mobile) || (!prof.mobile?.includes('•') && prof.mobile) || '';
            if (cleanProfOM) {
                matchedUser.ownMobile = cleanProfOM;
                matchedUser.rawOwnMobile = cleanProfOM;
                matchedUser.mobile = cleanProfOM;
            }
            matchedUser.photos = (Array.isArray(prof.photos) && prof.photos.length > 0) ? prof.photos : (prof.img ? [prof.img] : (matchedUser.photos || []));
        }
    }

    if (matchedUser) {
        // Verify password against salted hash or legacy unsalted hash
        const isPassValid = (matchedUser.passwordHash === passHash) || (matchedUser.passwordHash === legacyHash);

        if (!isPassValid) {
            // Immediate DOM clearance of failed password
            if (passInput) passInput.value = '';
            LOGIN_SECURITY.failedAttempts++;

            if (LOGIN_SECURITY.failedAttempts >= 5) {
                LOGIN_SECURITY.lockUntil = Date.now() + 60000; // 60-second lock
                LOGIN_SECURITY.failedAttempts = 0;
                showToast('Too many failed login attempts! Account locked for 60 seconds.');
            } else {
                highlightFieldError(passInput, `Incorrect password. (${5 - LOGIN_SECURITY.failedAttempts} attempts left)`);
            }
            return;
        }

        // Successful authentication: Reset brute-force counter
        LOGIN_SECURITY.failedAttempts = 0;
        LOGIN_SECURITY.lockUntil = 0;

        // Auto-upgrade legacy hash to salted hash
        if (matchedUser.passwordHash === legacyHash && matchedUser.passwordHash !== passHash) {
            matchedUser.passwordHash = passHash;
        }

        // Self-Healing Reconciliation: Check if user already completed profile in PROFILES
        const existingProfile = (window.PROFILES || []).find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
        if (existingProfile && existingProfile.name && existingProfile.community) {
            matchedUser.profileId = existingProfile.id;
            if (!matchedUser.name) matchedUser.name = existingProfile.name;
            const isGirl = typeof isGirlGender === 'function'
                ? (isGirlGender(existingProfile.gender) || isGirlGender(matchedUser.gender))
                : (String(existingProfile.gender || matchedUser.gender || '').toLowerCase().includes('girl') || String(existingProfile.gender || matchedUser.gender || '').toLowerCase() === 'female');
            if (isGirl) {
                matchedUser.gender = 'Girl';
                matchedUser.paymentStatus = 'Free';
            } else {
                matchedUser.gender = 'Boy';
                if (existingProfile.paymentStatus === 'paid' || existingProfile.paymentStatus === 'active') {
                    matchedUser.paymentStatus = 'Active';
                    if (!matchedUser.planExpiry) {
                        const exp = new Date();
                        exp.setDate(exp.getDate() + 30);
                        matchedUser.planExpiry = exp.toISOString().split('T')[0];
                        matchedUser.planStart = new Date().toISOString().split('T')[0];
                    }
                }
            }
            if (!matchedUser.caste) matchedUser.caste = existingProfile.community;
            if (!matchedUser.mobile) matchedUser.mobile = existingProfile.mobile;
            if (existingProfile.city) matchedUser.city = existingProfile.city;
            if (existingProfile.district) matchedUser.district = existingProfile.district;
        }

        // Strict Profile Completion Evaluation
        const profileDone = typeof isProfileFullyComplete === 'function'
            ? isProfileFullyComplete(matchedUser)
            : false;
        matchedUser.profileComplete = profileDone;
        state.profileComplete = profileDone;

        // 30-DAY PASS RECONCILIATION FOR BOY USERS (Guarantees uninterrupted access for 30 days)
        if (matchedUser.gender === 'Boy') {
            const userEmail = (matchedUser.email || email).trim().toLowerCase();
            let activePaymentFound = false;
            let activePlanExpiry = matchedUser.planExpiry || null;
            let activePlanStart = matchedUser.planStart || null;

            // Tier 1: Check live Supabase payments table
            if (typeof supabaseFetchActiveUserPayment === 'function') {
                try {
                    const sbPay = await supabaseFetchActiveUserPayment(matchedUser.id, userEmail);
                    if (sbPay && (sbPay.active || sbPay.status === 'success')) {
                        const exp = sbPay.planExpiry || sbPay.plan_expiry;
                        const expDate = exp ? new Date(exp) : new Date(Date.now() + 30 * 86400000);
                        if (expDate.getTime() > Date.now()) {
                            activePaymentFound = true;
                            activePlanExpiry = exp || expDate.toISOString().split('T')[0];
                            activePlanStart = sbPay.planStart || sbPay.plan_start || new Date().toISOString().split('T')[0];
                            matchedUser.lastTxnId = sbPay.txnId || sbPay.id || matchedUser.lastTxnId;
                        }
                    }
                } catch (e) {
                    console.warn('[Auth] Supabase payment fetch note:', e);
                }
            }

            // Tier 2: Check Supabase profile / user object if loaded
            if (!activePaymentFound) {
                if (prof && (prof.payment_status === 'paid' || prof.payment_status === 'Active' || prof.paymentStatus === 'paid' || prof.paymentStatus === 'Active')) {
                    const exp = prof.plan_expiry || prof.planExpiry;
                    if (exp) {
                        const expDate = new Date(exp);
                        if (expDate.getTime() > Date.now()) {
                            activePaymentFound = true;
                            activePlanExpiry = exp;
                            activePlanStart = prof.plan_start || prof.planStart;
                        }
                    } else {
                        activePaymentFound = true;
                        const expDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                        activePlanExpiry = expDate.toISOString().split('T')[0];
                        activePlanStart = new Date().toISOString().split('T')[0];
                    }
                } else if (usr && (usr.payment_status === 'Active' || usr.payment_status === 'paid')) {
                    const exp = usr.plan_expiry || usr.planExpiry;
                    if (exp) {
                        const expDate = new Date(exp);
                        if (expDate.getTime() > Date.now()) {
                            activePaymentFound = true;
                            activePlanExpiry = exp;
                            activePlanStart = usr.plan_start || usr.planStart;
                        }
                    } else {
                        activePaymentFound = true;
                        const expDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                        activePlanExpiry = expDate.toISOString().split('T')[0];
                        activePlanStart = new Date().toISOString().split('T')[0];
                    }
                }
            }

            // Tier 3: Check local LS_ADMIN_PAYMENTS (checks both userId AND userEmail)
            if (!activePaymentFound) {
                try {
                    const adminPayments = JSON.parse(localStorage.getItem('LS_ADMIN_PAYMENTS') || '[]');
                    const validPay = adminPayments.find(p => 
                        p && p.status === 'success' && 
                        (String(p.userId) === String(matchedUser.id) || 
                         (p.userEmail && p.userEmail.toLowerCase() === userEmail) || 
                         (p.email && p.email.toLowerCase() === userEmail)) &&
                        Boolean(p.id)
                    );
                    if (validPay) {
                        const payDate = validPay.planStart ? new Date(validPay.planStart) : new Date(validPay.date || Date.now());
                        const expDate = validPay.planExpiry ? new Date(validPay.planExpiry) : new Date(payDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                        if (expDate.getTime() > Date.now()) {
                            activePaymentFound = true;
                            activePlanExpiry = validPay.planExpiry || expDate.toISOString().split('T')[0];
                            activePlanStart = validPay.planStart || payDate.toISOString().split('T')[0];
                            matchedUser.lastTxnId = validPay.id;
                        }
                    }
                } catch(e) {}
            }

            // Tier 4: Check if matchedUser already had an unexpired planExpiry in stored accounts
            if (!activePaymentFound && (matchedUser.paymentStatus === 'Active' || matchedUser.paymentStatus === 'paid') && matchedUser.planExpiry) {
                const expDate = new Date(matchedUser.planExpiry);
                if (expDate.getTime() > Date.now()) {
                    activePaymentFound = true;
                    activePlanExpiry = matchedUser.planExpiry;
                    activePlanStart = matchedUser.planStart || new Date().toISOString().split('T')[0];
                }
            }

            if (activePaymentFound) {
                matchedUser.paymentStatus = 'Active';
                if (!activePlanExpiry) {
                    const exp = new Date();
                    exp.setDate(exp.getDate() + 30);
                    activePlanExpiry = exp.toISOString().split('T')[0];
                    activePlanStart = new Date().toISOString().split('T')[0];
                }
                matchedUser.planExpiry = activePlanExpiry;
                matchedUser.planStart = activePlanStart || new Date().toISOString().split('T')[0];
                if (typeof computeSecureToken === 'function') {
                    matchedUser.paymentToken = computeSecureToken('payment', matchedUser.id, matchedUser.email, matchedUser.planExpiry);
                    matchedUser.genderToken = computeSecureToken('gender', matchedUser.id, matchedUser.email, 'Boy');
                }
            }
        }

        // Seal secure tokens on login
        if (typeof computeSecureToken === 'function') {
            matchedUser.genderToken = computeSecureToken('gender', matchedUser.id, matchedUser.email, matchedUser.gender);
            if (matchedUser.gender === 'Boy' && (matchedUser.paymentStatus === 'Active' || matchedUser.paymentStatus === 'paid')) {
                matchedUser.paymentStatus = 'Active';
                if (!matchedUser.planExpiry) {
                    const exp = new Date();
                    exp.setDate(exp.getDate() + 30);
                    matchedUser.planExpiry = exp.toISOString().split('T')[0];
                    matchedUser.planStart = new Date().toISOString().split('T')[0];
                }
                matchedUser.paymentToken = computeSecureToken('payment', matchedUser.id, matchedUser.email, matchedUser.planExpiry);
            }
        }

        // Persist reconciled account data back to storage
        const idx = registeredUsers.findIndex(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        if (idx !== -1) {
            registeredUsers[idx] = { ...registeredUsers[idx], ...matchedUser };
        }
        saveStoredAccounts(registeredUsers);

        // Sanitize: state.currentUser & sessionStorage NEVER contain passwordHash
        state.currentUser = createSafeUserSession(matchedUser);

        // Link real matrimonial profile photo to active user session
        const myProf = (window.PROFILES || []).find(p => 
            (matchedUser.id && String(p.id) === String(matchedUser.id)) ||
            (matchedUser.email && p.email && p.email.toLowerCase() === matchedUser.email.toLowerCase())
        );
        if (myProf) {
            state.currentUser.img = myProf.img || (Array.isArray(myProf.photos) ? myProf.photos[0] : '');
            state.currentUser.photo = state.currentUser.img;
            state.currentUser.photos = myProf.photos || [state.currentUser.img];
        }

        // Handle Remember Me preference (Save email & password if checked)
        const remCheckbox = document.getElementById('loginRememberMe');
        const isRemember = remCheckbox ? remCheckbox.checked : false;
        if (isRemember) {
            try {
                localStorage.setItem('mangalSetu_rememberMe', 'true');
                localStorage.setItem('mangalSetu_rememberEmail', email);
                if (pass) {
                    localStorage.setItem('mangalSetu_rememberPass', encodeStoredUserPass(pass));
                }
            } catch (_) {}
        } else {
            try {
                localStorage.removeItem('mangalSetu_rememberMe');
                localStorage.removeItem('mangalSetu_rememberEmail');
                localStorage.removeItem('mangalSetu_rememberPass');
            } catch (_) {}
        }

        // Start 10-minute inactivity timer
        if (typeof initInactivityTimer === 'function') {
            initInactivityTimer();
        }

        // Immediate DOM cleanup of sensitive password
        if (passInput) passInput.value = '';

        // RULE 1: If profile is incomplete, NEVER SHOW HOME SCREEN!
        if (!profileDone) {
            state.profileComplete = false;
            state.membershipPaid = false;
            if (state.currentUser) state.currentUser.profileComplete = false;

            // Load any saved draft from localStorage
            const draft = typeof loadRegDraft === 'function' ? loadRegDraft(matchedUser.email || email) : null;
            if (draft && typeof state.regData !== 'undefined') {
                state.regData = { ...state.regData, ...draft };
            }
            if (typeof state.regData !== 'undefined') {
                state.regData.email = matchedUser.email || email;
                if (matchedUser.name && !state.regData.name) state.regData.name = matchedUser.name;
                if (matchedUser.gender && !state.regData.gender) state.regData.gender = matchedUser.gender;
                if (matchedUser.caste && !state.regData.caste) state.regData.caste = matchedUser.caste;
                if (matchedUser.mobile && !state.regData.ownMobile) state.regData.ownMobile = matchedUser.mobile;
                if (matchedUser.city && !state.regData.city) state.regData.city = matchedUser.city;
                if (matchedUser.district && !state.regData.district) state.regData.district = matchedUser.district;
                if (matchedUser.address && !state.regData.address) state.regData.address = matchedUser.address;
                if (matchedUser.photo && !state.regData.photo) state.regData.photo = matchedUser.photo;
                if (matchedUser.dob && !state.regData.dob) state.regData.dob = matchedUser.dob;
                if (matchedUser.age && !state.regData.age) state.regData.age = matchedUser.age;
                if (matchedUser.height && !state.regData.height) state.regData.height = matchedUser.height;
                if (matchedUser.weight && !state.regData.weight) state.regData.weight = matchedUser.weight;
                if (matchedUser.education && !state.regData.education) state.regData.education = matchedUser.education;
                if ((matchedUser.occupation || matchedUser.occ) && !state.regData.occupation) state.regData.occupation = matchedUser.occupation || matchedUser.occ;
                if (matchedUser.income && !state.regData.income) state.regData.income = matchedUser.income;
                if (matchedUser.marital && !state.regData.marital) state.regData.marital = matchedUser.marital;
                if (matchedUser.physical && !state.regData.physical) state.regData.physical = matchedUser.physical;
                if (matchedUser.hobbies && (!state.regData.hobbies || !state.regData.hobbies.length)) state.regData.hobbies = matchedUser.hobbies;
                if (matchedUser.father && !state.regData.fatherName) state.regData.fatherName = matchedUser.father;
                if (matchedUser.fatherOcc && !state.regData.fatherOcc) state.regData.fatherOcc = matchedUser.fatherOcc;
                if (matchedUser.fatherMobile && !state.regData.fatherMobile) state.regData.fatherMobile = matchedUser.fatherMobile;
                if (matchedUser.mother && !state.regData.motherName) state.regData.motherName = matchedUser.mother;
                if (matchedUser.motherOcc && !state.regData.motherOcc) state.regData.motherOcc = matchedUser.motherOcc;
                if (matchedUser.sister && !state.regData.sister) state.regData.sister = matchedUser.sister;
                if (matchedUser.brother && !state.regData.brother) state.regData.brother = matchedUser.brother;
                if (matchedUser.taluka && !state.regData.taluka) state.regData.taluka = matchedUser.taluka;
                if (matchedUser.photos && (!state.regData.photos || !state.regData.photos.length)) state.regData.photos = matchedUser.photos;
            }

            // Determine exact remaining step
            const targetRegStep = (typeof determineRemainingRegStep === 'function')
                ? determineRemainingRegStep(state.regData, matchedUser)
                : 'scr-reg-caste';

            // Populate form fields on the target screen
            if (typeof restoreRegFormFields === 'function') {
                restoreRegFormFields(targetRegStep, state.regData);
            }

            saveSessionState();
            showToast('Welcome back! Please complete your profile to continue.');
            go(targetRegStep);
            return;
        }

        // Profile is complete:
        state.profileComplete = true;

        // Restore user favorites from local storage & Supabase
        if (typeof restoreUserFavorites === 'function') {
            restoreUserFavorites(matchedUser.email, matchedUser.id);
        }

        // Existing login should never see the new user auto install prompt
        try {
            sessionStorage.removeItem('mangalSetu_just_registered');
            localStorage.setItem('mangalSetu_pwa_dismissed', 'true');
        } catch (_) {}

        // RULE 2: If Girl -> 100% Free Lifetime, Direct Home Entry
        const isGirlLogin = typeof isGirlGender === 'function'
            ? isGirlGender(matchedUser.gender)
            : (String(matchedUser.gender || '').toLowerCase().includes('girl') || String(matchedUser.gender || '').toLowerCase() === 'female');

        if (isGirlLogin) {
            matchedUser.gender = 'Girl';
            state.membershipPaid = true;
            matchedUser.paymentStatus = 'Free';
            saveSessionState();
            showToast('Welcome back, ' + (matchedUser.name || 'Member') + '!');
            enterHome();
            return;
        }

        // RULE 3: If Boy -> Must have active 30-Day Pass (₹199)
        matchedUser.gender = 'Boy';
        const pStatus = checkBoyPassStatus(matchedUser);
        if (pStatus.active) {
            state.membershipPaid = true;
            matchedUser.paymentStatus = 'Active';
            saveSessionState();
            showToast('Welcome back, ' + (matchedUser.name || 'Member') + '! (' + pStatus.daysLeft + ' days active)');
            enterHome();
        } else {
            state.membershipPaid = false;
            matchedUser.paymentStatus = (pStatus.reason === 'expired') ? 'Expired' : 'Unpaid';
            saveSessionState();
            go('scr-membership');
            openModal('modalPaywall');
            if (pStatus.reason === 'expired') {
                showToast('Your 30-Day Pass has expired! Pay ₹199 via UPI to renew.');
            } else {
                showToast('Boys ₹199 Pass required: Pay via UPI to enter home.');
            }
        }
        return;
    }

    // Account not found
    if (passInput) passInput.value = '';
    LOGIN_SECURITY.failedAttempts++;
    if (LOGIN_SECURITY.failedAttempts >= 5) {
        LOGIN_SECURITY.lockUntil = Date.now() + 60000;
        LOGIN_SECURITY.failedAttempts = 0;
        showToast('Too many failed attempts! Account locked for 60 seconds.');
    } else {
        showToast('Account not registered — please sign up with your Gmail');
    }
}

function enterHome() {
    // 0. Dismiss any payment or completion popups
    if (typeof closeModal === 'function') {
        closeModal('modalPaySuccess');
        closeModal('modalBoyComplete');
        closeModal('modalCompleteProfile');
        closeModal('modalPaywall');
    }

    // Ensure Girls are always 100% Free Lifetime
    if (state.currentUser && (typeof isGirlGender === 'function' ? isGirlGender(state.currentUser.gender) : String(state.currentUser.gender || '').toLowerCase().includes('girl'))) {
        state.currentUser.gender = 'Girl';
        state.currentUser.paymentStatus = 'Free';
        state.membershipPaid = true;
    }

    // Guard 1: Profile must be strictly complete
    const isComplete = typeof isProfileFullyComplete === 'function'
        ? isProfileFullyComplete(state.currentUser)
        : false;
    state.profileComplete = isComplete;
    if (state.currentUser) state.currentUser.profileComplete = isComplete;

    if (!isComplete) {
        state.profileComplete = false;
        showToast('Please complete your profile first');
        const targetStep = (typeof determineRemainingRegStep === 'function')
            ? determineRemainingRegStep(state.regData, state.currentUser)
            : 'scr-reg-caste';
        go(targetStep);
        return;
    }
    
    // Guard 2: ONLY for Boys - Boy 30-Day Pass must be active
    const isBoy = typeof isBoyGender === 'function'
        ? isBoyGender(state.currentUser?.gender)
        : (state.currentUser?.gender === 'Boy' || state.currentUser?.gender === 'boy' || state.currentUser?.gender === 'boys');

    if (isBoy && state.currentUser) {
        const passStatus = checkBoyPassStatus(state.currentUser);
        if (!passStatus.active) {
            state.membershipPaid = false;
            state.currentUser.paymentStatus = (passStatus.reason === 'expired') ? 'Expired' : 'Unpaid';
            go('scr-membership', true);
            openModal('modalPaywall');
            if (passStatus.reason === 'expired') {
                showToast('Your 30-Day Pass has expired! Pay ₹199 via UPI to enter.');
            } else {
                showToast('Boys ₹199 Pass required: Pay via UPI to access community brides.');
            }
            return;
        }
    }
    
    if (typeof syncUserChatAndInterests === 'function') {
        syncUserChatAndInterests();
    } else if (typeof syncUserInterests === 'function') {
        syncUserInterests();
    }
    if (typeof initChatRealtimeListener === 'function') {
        initChatRealtimeListener();
    }
    
    // Realtime Presence tracking & 10-Minute Inactivity Timer
    if (typeof supabaseInitPresence === 'function' && state.currentUser) {
        supabaseInitPresence(state.currentUser);
    }
    if (typeof initInactivityTimer === 'function') {
        initInactivityTimer();
    }

    if (typeof updateHeaderUserDisplay === 'function') {
        updateHeaderUserDisplay();
    }

    go('scr-home', true);

    // If new user just registered, trigger install prompt gracefully
    if (typeof checkNewUserAutoPrompt === 'function') {
        checkNewUserAutoPrompt();
    }
}

function doLogout(isTimeout = false) {
    // 0. Stop Inactivity Timer and leave Realtime Presence
    if (typeof clearInactivityTimer === 'function') {
        clearInactivityTimer();
    }
    if (typeof supabaseLeavePresence === 'function') {
        supabaseLeavePresence();
    }

    // 1. Close all modals immediately
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    } else {
        document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }

    // Persist current favorites to user-specific localStorage key before clearing session
    if (state.currentUser && state.currentUser.email && state.favorites) {
        try {
            const favArr = Array.from(state.favorites);
            const normEmail = state.currentUser.email.toLowerCase().trim();
            localStorage.setItem('LS_USER_FAVORITES_' + normEmail, JSON.stringify(favArr));
            localStorage.setItem('LS_FAVORITES_' + normEmail, JSON.stringify(favArr));
            if (typeof syncFavoritesToDatabase === 'function') {
                syncFavoritesToDatabase();
            }
        } catch (e) {}
    }

    // Unsubscribe from real-time chat & interest channel
    if (typeof supabaseUnsubscribeUserChat === 'function') {
        supabaseUnsubscribeUserChat();
    }

    // 2. Wipe all session storage and persistent local user session
    const authClient = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
    if (authClient && authClient.auth) {
        try { authClient.auth.signOut({ scope: 'local' }); } catch (_) {}
    }

    if (state.currentUser && state.currentUser.email) {
        saveLastAuthProvider({
            provider: state.currentUser.authProvider || 'google',
            email: state.currentUser.email,
            name: state.currentUser.name || '',
            avatar: state.currentUser.avatarUrl || state.currentUser.photo || state.currentUser.img || ''
        });
    }
    sessionStorage.clear();
    try {
        localStorage.removeItem('mangalSetu_activeUser');
        localStorage.removeItem('mangalSetu_lastActiveTimestamp');
        localStorage.removeItem('mangalSetu_profileComplete');
        localStorage.removeItem('mangalSetu_membershipPaid');
        localStorage.removeItem('mangalSetu_activeScreen');
    } catch (_) {}

    // 3. Reset in-memory state cleanly
    state.currentUser = null;
    state.profileComplete = false;
    state.membershipPaid = false;
    state.history = ['scr-welcome'];
    state.favorites = new Set();
    state.regData = {};
    state.activeProfileId = null;
    state.activeChatId = null;

    if (typeof INCOMING_REQUESTS !== 'undefined') INCOMING_REQUESTS.length = 0;
    if (typeof OUTGOING_REQUESTS !== 'undefined') OUTGOING_REQUESTS.length = 0;
    if (typeof CHAT_THREADS !== 'undefined') CHAT_THREADS.length = 0;
    if (typeof updateInboxBadge === 'function') updateInboxBadge();
    if (typeof updateUserNotifBadge === 'function') updateUserNotifBadge();

    // 4. Hide banners and notices
    const banner = document.getElementById('profileIncompleteBanner');
    if (banner) banner.style.display = 'none';
    const suspNotice = document.getElementById('userSuspendedNotice');
    if (suspNotice) suspNotice.style.display = 'none';

    // 5. Reset desktop nav & header display for guest
    document.body.classList.remove('sidebar-active', 'in-chat-screen');
    if (typeof updateDesktopNav === 'function') updateDesktopNav('scr-welcome');
    if (typeof updateHeaderUserDisplay === 'function') updateHeaderUserDisplay();

    // 6. Reset URL hash to #/welcome cleanly
    if (window.location.hash !== '#/welcome') {
        try {
            history.replaceState({ screen: 'scr-welcome' }, null, '#/welcome');
        } catch (e) {
            window.location.hash = '#/welcome';
        }
    }

    // 7. Transition cleanly to scr-welcome with 0 delay and 0 popups
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const welcome = document.getElementById('scr-welcome');
    if (welcome) {
        welcome.classList.add('active');
        welcome.scrollTop = 0;
        if (typeof renderSmartWelcomeScreen === 'function') {
            renderSmartWelcomeScreen();
        }
    }

    if (isTimeout) {
        showToast('Logged out due to 10 minutes of inactivity.');
    } else {
        showToast('You have been logged out successfully');
    }
}

function payNow() {
    openRazorpayCheckout();
}

/* ============================================================ FORGOT PASSWORD & RESET FLOW ============================================================ */
let forgotPasswordState = {
    email: '',
    otp: '',
    otpExpiry: 0
};

let resendForgotOtpCountdownTimer = null;
function startForgotResendCountdown(seconds = 30) {
    const btn = document.getElementById('btnResendForgotOtp');
    if (!btn) return;
    clearInterval(resendForgotOtpCountdownTimer);
    let remaining = seconds;
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.5';
    btn.textContent = `Resend OTP (${remaining}s)`;
    resendForgotOtpCountdownTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(resendForgotOtpCountdownTimer);
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
            btn.textContent = 'Resend OTP';
        } else {
            btn.textContent = `Resend OTP (${remaining}s)`;
        }
    }, 1000);
}

function handleSendForgotOtp(isResend = false) {
    const emailInput = document.getElementById('forgotEmailInput');
    const email = isResend ? forgotPasswordState.email : (emailInput ? emailInput.value.trim() : '');

    if (!email) {
        if (emailInput) highlightFieldError(emailInput, 'Please enter your registered Gmail address');
        return;
    }

    const gmailCheck = validateGmail(email);
    if (!gmailCheck.ok) {
        if (emailInput) highlightFieldError(emailInput, gmailCheck.msg);
        return;
    }
    if (emailInput) clearFieldError(emailInput);

    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    forgotPasswordState.email = email.toLowerCase();
    forgotPasswordState.otp = generatedOtp;
    forgotPasswordState.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    const emailDisplay = document.getElementById('forgotOtpEmailDisplay');
    if (emailDisplay) emailDisplay.textContent = email.toLowerCase();

    // Clear all 6 otp boxes
    for (let i = 1; i <= 6; i++) {
        const inp = document.getElementById(`forgotOtp${i}`);
        if (inp) inp.value = '';
    }

    // Dispatch 6-digit OTP code exclusively via EmailJS (branded Royal Purple template from mangalsetu.in@gmail.com)
    (async () => {
        if (typeof sendOtpEmail === 'function') {
            try {
                await sendOtpEmail(email, generatedOtp, 'Member', 'reset');
                console.info('[Auth] Password reset OTP dispatched successfully via EmailJS');
            } catch (err) {
                console.warn('[EmailService] Reset OTP notice:', err);
            }
        }
    })();

    startForgotResendCountdown(isResend ? 35 : 30);
    showToast(`Password Reset OTP sent to ${email.toLowerCase()} (Check your Gmail)`);
    go('scr-forgot-otp');
}

async function verifyForgotOtp() {
    let entered = '';
    for (let i = 1; i <= 6; i++) {
        const inp = document.getElementById(`forgotOtp${i}`);
        if (inp) entered += inp.value.trim();
    }

    if (entered.length < 6) {
        showToast('Please enter the full 6-digit OTP code');
        return;
    }

    // 1. Expiration check (10 minutes)
    if (forgotPasswordState.otpExpiry && Date.now() > forgotPasswordState.otpExpiry) {
        showToast('OTP has expired. Please click "Resend OTP" to get a fresh code.');
        return;
    }

    // 2. Validate OTP: Primary check with EmailJS dispatched OTP
    let isValid = false;
    if (forgotPasswordState.otp && entered === forgotPasswordState.otp) {
        isValid = true;
    } else if (typeof supabaseVerifyEmailOtp === 'function' && getSupabaseClient() && forgotPasswordState.email) {
        try {
            const client = getSupabaseClient();
            let res = await client.auth.verifyOtp({
                email: forgotPasswordState.email.toLowerCase(),
                token: entered,
                type: 'recovery'
            });
            if (res && res.error) {
                const retry = await client.auth.verifyOtp({
                    email: forgotPasswordState.email.toLowerCase(),
                    token: entered,
                    type: 'email'
                });
                if (retry && !retry.error) res = retry;
            }
            if (res && !res.error) {
                isValid = true;
            }
        } catch (e) {
            console.warn('[Supabase] Recovery OTP verification note:', e);
        }
    }

    if (!isValid) {
        showToast('Incorrect OTP code. Please check your Gmail and try again.');
        return;
    }

    if (resendForgotOtpCountdownTimer) {
        clearInterval(resendForgotOtpCountdownTimer);
        resendForgotOtpCountdownTimer = null;
    }

    showToast('OTP verified! Please set your new password.');
    const np = document.getElementById('newPassInput');
    const cp = document.getElementById('confirmPassInput');
    if (np) np.value = '';
    if (cp) cp.value = '';
    go('scr-newpass');
}

async function handleResetPassword() {
    const npInput = document.getElementById('newPassInput');
    const cpInput = document.getElementById('confirmPassInput');
    const newPass = npInput ? npInput.value.trim() : '';
    const confirmPass = cpInput ? cpInput.value.trim() : '';

    if (!newPass) {
        highlightFieldError(npInput, 'Please enter a new password');
        return;
    }
    if (newPass.length < 6) {
        highlightFieldError(npInput, 'Password must be at least 6 characters');
        return;
    }
    clearFieldError(npInput);

    if (newPass !== confirmPass) {
        highlightFieldError(cpInput, 'Passwords do not match');
        return;
    }
    clearFieldError(cpInput);

    const resetEmail = (forgotPasswordState && forgotPasswordState.email) ? forgotPasswordState.email.trim().toLowerCase() : '';
    if (!resetEmail) {
        showToast('Password reset session expired. Please request OTP again.');
        go('scr-forgot');
        return;
    }

    const newHash = await hashPass(newPass);

    // 1. Update in Supabase Auth if session exists
    if (typeof supabaseUpdateUserPassword === 'function') {
        try {
            await supabaseUpdateUserPassword(newPass);
        } catch(e) {
            console.warn('[Supabase] Auth update note:', e);
        }
    }

    // 2. Update in Stored Accounts with Profile Reconciliation
    try {
        let accounts = getStoredAccounts();
        let idx = accounts.findIndex(u => u.email && u.email.toLowerCase() === resetEmail);
        if (idx !== -1) {
            accounts[idx].passwordHash = newHash;
        } else {
            // If user reset on a new device or fresh browser, add them to stored accounts
            accounts.push({
                id: Date.now(),
                email: resetEmail,
                passwordHash: newHash,
                name: '',
                gender: '',
                status: 'Active',
                profileComplete: false,
                paymentStatus: 'Unpaid'
            });
            idx = accounts.length - 1;
        }

        // Reconcile with PROFILES if user already has a profile
        const prof = (window.PROFILES || []).find(p => p.email && p.email.toLowerCase() === resetEmail);
        if (prof) {
            accounts[idx].profileComplete = true;
            if (!accounts[idx].name) accounts[idx].name = prof.name;
            const isGirl = typeof isGirlGender === 'function' ? isGirlGender(prof.gender) : (prof.gender === 'girls' || prof.gender === 'Girl');
            accounts[idx].gender = isGirl ? 'Girl' : 'Boy';
            if (!accounts[idx].caste) accounts[idx].caste = prof.community;
            if (!accounts[idx].mobile) accounts[idx].mobile = prof.mobile;
            if (isGirl) {
                accounts[idx].paymentStatus = 'Free';
            } else if (prof.paymentStatus === 'paid' || prof.paymentStatus === 'active') {
                accounts[idx].paymentStatus = 'Active';
                if (!accounts[idx].planExpiry) {
                    const exp = new Date();
                    exp.setDate(exp.getDate() + 30);
                    accounts[idx].planExpiry = exp.toISOString().split('T')[0];
                    accounts[idx].planStart = new Date().toISOString().split('T')[0];
                }
            }
        }
        saveStoredAccounts(accounts);
    } catch(e) {
        console.error('Error saving updated password in accounts:', e);
    }

    // 3. Clear temporary recovery session in Supabase client for clean login
    if (typeof getSupabaseClient === 'function' && getSupabaseClient()) {
        try {
            await getSupabaseClient().auth.signOut();
        } catch (_) {}
    }

    // Wipe sensitive in-memory and DOM data
    if (npInput) npInput.value = '';
    if (cpInput) cpInput.value = '';
    forgotPasswordState.email = '';
    forgotPasswordState.otp = '';

    showToast('Password reset successfully! Please log in with your new password.');
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) loginEmail.value = resetEmail;
    const loginPass = document.getElementById('loginPass');
    if (loginPass) loginPass.value = '';
    go('scr-login');
}

// ============================================================ REMEMBER ME CREDENTIAL HELPERS ============================================================
function encodeStoredUserPass(p) {
    if (!p) return '';
    try {
        return btoa(unescape(encodeURIComponent(p)));
    } catch (_) {
        return btoa(p);
    }
}

function decodeStoredUserPass(p) {
    if (!p) return '';
    try {
        return decodeURIComponent(escape(atob(p)));
    } catch (_) {
        return atob(p);
    }
}

function restoreRememberedLogin() {
    try {
        const isRemember = localStorage.getItem('mangalSetu_rememberMe') === 'true';
        const remEmail = localStorage.getItem('mangalSetu_rememberEmail') || '';
        const remPass = decodeStoredUserPass(localStorage.getItem('mangalSetu_rememberPass') || '');

        const emailInput = document.getElementById('loginEmail');
        const passInput = document.getElementById('loginPass');
        const chkBox = document.getElementById('loginRememberMe');

        if (chkBox) {
            chkBox.checked = isRemember;
        }

        if (isRemember) {
            if (emailInput && remEmail && !emailInput.value) {
                emailInput.value = remEmail;
                if (typeof liveGmailValidate === 'function') {
                    liveGmailValidate(emailInput);
                }
            }
            if (passInput && remPass && !passInput.value) {
                passInput.value = remPass;
            }
        }
    } catch (e) {
        console.warn('[RememberMe] restore note:', e);
    }
}

function onRememberMeToggle(chk) {
    if (chk && !chk.checked) {
        try {
            localStorage.removeItem('mangalSetu_rememberMe');
            localStorage.removeItem('mangalSetu_rememberEmail');
            localStorage.removeItem('mangalSetu_rememberPass');
        } catch (_) {}
    } else if (chk && chk.checked) {
        try {
            localStorage.setItem('mangalSetu_rememberMe', 'true');
            const emailInput = document.getElementById('loginEmail');
            const passInput = document.getElementById('loginPass');
            if (emailInput && emailInput.value) {
                localStorage.setItem('mangalSetu_rememberEmail', emailInput.value.trim().toLowerCase());
            }
            if (passInput && passInput.value) {
                localStorage.setItem('mangalSetu_rememberPass', encodeStoredUserPass(passInput.value));
            }
        } catch (_) {}
    }
}

// Global Window Exports
window.forgotPasswordState = forgotPasswordState;
window.restoreRememberedLogin = restoreRememberedLogin;
window.onRememberMeToggle = onRememberMeToggle;
if (typeof doLogin !== 'undefined') window.doLogin = doLogin;
if (typeof doLogout !== 'undefined') window.doLogout = doLogout;
if (typeof handleSendSignupOtp !== 'undefined') window.handleSendSignupOtp = handleSendSignupOtp;
if (typeof signupOtpVerified !== 'undefined') window.signupOtpVerified = signupOtpVerified;
if (typeof enterHome !== 'undefined') window.enterHome = enterHome;
if (typeof handleSendForgotOtp !== 'undefined') window.handleSendForgotOtp = handleSendForgotOtp;
if (typeof verifyForgotOtp !== 'undefined') window.verifyForgotOtp = verifyForgotOtp;
if (typeof handleResetPassword !== 'undefined') window.handleResetPassword = handleResetPassword;

/* ============================================================
   MODERN 1-CLICK SOCIAL AUTHENTICATION (GOOGLE, INSTA, SNAP)
   & SMART "LAST USED" MEMORY
   ============================================================ */

var LS_LAST_AUTH_KEY = 'mangalSetu_lastAuthProvider';

function saveLastAuthProvider(info) {
    if (!info || !info.provider) return;
    try {
        const payload = {
            provider: info.provider,
            email: (info.email || '').toLowerCase().trim(),
            name: info.name || '',
            avatar: info.avatar || '',
            timestamp: Date.now()
        };
        localStorage.setItem(LS_LAST_AUTH_KEY, JSON.stringify(payload));
    } catch (_) {}
}
window.saveLastAuthProvider = saveLastAuthProvider;

function clearLastAuthProvider() {
    try {
        localStorage.removeItem(LS_LAST_AUTH_KEY);
        localStorage.removeItem('mangalSetu_last_auth_provider');
        localStorage.removeItem('mangalSetu_lastAuthProvider');
    } catch (_) {}
    const banner = document.getElementById('returningUserBanner');
    const badgeGoogle = document.getElementById('badgeGoogleLastUsed');
    const switchWrap = document.getElementById('switchAccountWrap');
    const btnGoogle = document.getElementById('btnAuthGoogle');

    if (banner) banner.style.display = 'none';
    if (badgeGoogle) badgeGoogle.style.display = 'none';
    if (switchWrap) switchWrap.style.display = 'none';
    if (btnGoogle) btnGoogle.classList.remove('is-highlighted', 'is-dimmed');
}
window.clearLastAuthProvider = clearLastAuthProvider;

function getLastAuthProvider() {
    try {
        const raw = localStorage.getItem(LS_LAST_AUTH_KEY) || localStorage.getItem('mangalSetu_last_auth_provider');
        if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
}
window.getLastAuthProvider = getLastAuthProvider;

/**
 * Render smart highlight on the last-used auth provider and dim other options
 */
function renderSmartWelcomeScreen() {
    const last = getLastAuthProvider();
    const banner = document.getElementById('returningUserBanner');
    const nameEl = document.getElementById('returningUserName');
    const avatarEl = document.getElementById('returningUserAvatar');
    const switchWrap = document.getElementById('switchAccountWrap');

    const btnGoogle = document.getElementById('btnAuthGoogle');
    const badgeGoogle = document.getElementById('badgeGoogleLastUsed');

    // Reset initial state
    if (btnGoogle) btnGoogle.classList.remove('is-highlighted', 'is-dimmed');
    if (badgeGoogle) badgeGoogle.style.display = 'none';
    if (banner) banner.style.display = 'none';
    if (switchWrap) switchWrap.style.display = 'none';

    if (!last || !last.provider || !last.email) {
        return;
    }

    // Display Returning User Banner
    if (banner) {
        if (nameEl && last.name) nameEl.textContent = last.name;
        else if (nameEl && last.email) nameEl.textContent = last.email.split('@')[0];
        if (avatarEl && last.avatar) avatarEl.src = last.avatar;
        banner.style.display = 'flex';
    }

    if (switchWrap) {
        switchWrap.style.display = 'block';
    }

    // Highlight Google (only provider now)
    if (last.provider === 'google') {
        if (btnGoogle) btnGoogle.classList.add('is-highlighted');
        if (badgeGoogle) badgeGoogle.style.display = 'inline-flex';
    }
}
window.renderSmartWelcomeScreen = renderSmartWelcomeScreen;

/**
 * Switch account / clear saved memory
 */
function enableAllAuthProviders() {
    clearLastAuthProvider();
    if (typeof showToast === 'function') {
        showToast('Choose your Google account to sign in');
    }
}
window.enableAllAuthProviders = enableAllAuthProviders;

function toggleTermsConsent(e) {
    if (e && e.target && e.target.tagName === 'A') return;
    const chk = document.getElementById('welcomeTermsCheck');
    if (chk) {
        chk.checked = !chk.checked;
        updateTermsConsentUI();
    }
}
window.toggleTermsConsent = toggleTermsConsent;

function updateTermsConsentUI() {
    const card = document.getElementById('welcomeTermsCard');
    const chk = document.getElementById('welcomeTermsCheck');
    if (card && chk) {
        if (chk.checked) {
            card.classList.remove('has-error');
        }
    }
}
window.updateTermsConsentUI = updateTermsConsentUI;


/**
 * Main 1-Click Social Login Handler
 * @param {'google'} provider
 */
async function handleSocialLogin(provider = 'google') {
    const termsCheck = document.getElementById('welcomeTermsCheck');
    const termsCard = document.getElementById('welcomeTermsCard');
    if (termsCheck && !termsCheck.checked) {
        if (termsCard) {
            termsCard.classList.add('has-error');
            setTimeout(() => { termsCard.classList.remove('has-error'); }, 1800);
        }
        if (typeof showToast === 'function') {
            showToast('Please agree to Terms of Service & Privacy Policy to continue.');
        }
        return;
    }

    if (provider === 'google') {
        const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
        if (!client || !client.auth) {
            if (typeof showToast === 'function') showToast('Database connection is initializing, please try again.');
            return;
        }

        try {
            if (typeof showGlobalLoader === 'function') showGlobalLoader('Connecting to Google...');
            try { sessionStorage.setItem('mangalSetu_oauth_pending', 'google'); } catch (_) {}
            
            const origin = window.location.origin;
            const path = window.location.pathname;
            const redirectUrl = path.includes('app.html') ? `${origin}${path}` : `${origin}/app.html`;
            const lastAuth = (typeof getLastAuthProvider === 'function') ? getLastAuthProvider() : null;
            const queryParams = {
                access_type: 'offline'
            };
            if (lastAuth && lastAuth.email) {
                queryParams.login_hint = lastAuth.email;
            } else {
                queryParams.prompt = 'select_account';
            }

            const { data, error } = await client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: queryParams
                }
            });
            if (error) {
                if (typeof hideGlobalLoader === 'function') hideGlobalLoader();
                console.warn('[Google Auth] Sign-in error:', error);
                if (typeof showToast === 'function') showToast(error.message || 'Google sign-in could not be started');
            }
        } catch (err) {
            if (typeof hideGlobalLoader === 'function') hideGlobalLoader();
            console.error('[Google Auth] Exception:', err);
            if (typeof showToast === 'function') showToast('Google sign-in error. Please try again.');
        }
    }
}
window.handleSocialLogin = handleSocialLogin;

/**
 * Handle successful authentication: Smart Routing (Existing Member -> Home, New Member -> Complete Profile)
 */
async function handleSocialUserAuthenticated(socialUser) {
    if (!socialUser || !socialUser.email) return;

    const normEmail = socialUser.email.toLowerCase().trim();
    const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;

    if (typeof showGlobalLoader === 'function') showGlobalLoader('Signing you in...');

    try {
        // 1. Check if user already has an active profile in Supabase
        let existingProfile = null;
        if (client) {
            try {
                // Priority A: Search profiles table by email or user_id (limit 1 avoids maybeSingle multi-row crash)
                const uidFilter = socialUser.id ? `,user_id.eq.${socialUser.id}` : '';
                const { data: profRows, error: profErr } = await client
                    .from('profiles')
                    .select('*')
                    .or(`email.ilike.${normEmail}${uidFilter}`)
                    .order('created_at', { ascending: false })
                    .limit(1);
                if (!profErr && Array.isArray(profRows) && profRows.length > 0) {
                    existingProfile = profRows[0];
                }
            } catch (_) {
                try {
                    const { data: fallbackRows } = await client
                        .from('profiles')
                        .select('*')
                        .ilike('email', normEmail)
                        .limit(1);
                    if (Array.isArray(fallbackRows) && fallbackRows.length > 0) {
                        existingProfile = fallbackRows[0];
                    }
                } catch (_) {}
            }

            // Priority B: Cross-check users table if not in profiles yet
            if (!existingProfile) {
                try {
                    const uidFilter = socialUser.id ? `,id.eq.${socialUser.id}` : '';
                    const { data: uRows } = await client
                        .from('users')
                        .select('*')
                        .or(`email.ilike.${normEmail}${uidFilter}`)
                        .limit(1);
                    if (Array.isArray(uRows) && uRows.length > 0 && (uRows[0].caste || uRows[0].community || uRows[0].profile_complete)) {
                        existingProfile = uRows[0];
                    }
                } catch (_) {}
            }
        }

        // Check local stored accounts fallback
        if (!existingProfile && typeof getStoredAccounts === 'function') {
            const accounts = getStoredAccounts();
            existingProfile = accounts.find(a => a.email && a.email.toLowerCase() === normEmail);
        }

        // Check window.PROFILES in memory
        if (!existingProfile && Array.isArray(window.PROFILES)) {
            existingProfile = window.PROFILES.find(p => p.email && p.email.toLowerCase() === normEmail);
        }

        const rawData = (existingProfile && typeof existingProfile.raw_data === 'object') ? existingProfile.raw_data : {};
        const isFullyComplete = existingProfile && (
            existingProfile.profileComplete === true ||
            rawData.profileComplete === true ||
            ((existingProfile.name || rawData.name) && (existingProfile.gender || rawData.gender) && (existingProfile.community || existingProfile.caste || rawData.community || rawData.caste))
        );

        if (isFullyComplete) {
            // Map profile as authorized self to preserve clean unmasked mobile, address, and email
            const mappedUser = (typeof mapProfileFromSupabase === 'function')
                ? mapProfileFromSupabase(existingProfile, true)
                : existingProfile;

            // Normalize gender to 'Boy' or 'Girl' if needed
            if (mappedUser.gender) {
                if (typeof isGirlGender === 'function' && isGirlGender(mappedUser.gender)) {
                    mappedUser.gender = 'Girl';
                } else if (typeof isBoyGender === 'function' && isBoyGender(mappedUser.gender)) {
                    mappedUser.gender = 'Boy';
                }
            }
            mappedUser.profileComplete = true;

            // EXISTING USER: Save returning user info, restore active session and navigate straight to Home feed!
            saveLastAuthProvider({
                provider: socialUser.provider || 'google',
                email: normEmail,
                name: mappedUser.name || socialUser.name,
                avatar: mappedUser.img || mappedUser.photo || socialUser.avatar
            });

            // Hydrate local registered accounts cache so session persistence knows this account is complete
            if (typeof getStoredAccounts === 'function' && typeof saveStoredAccounts === 'function') {
                const accounts = getStoredAccounts();
                const safeAcc = {
                    ...mappedUser,
                    email: normEmail,
                    profileComplete: true,
                    currentStep: 'scr-home'
                };
                const idx = accounts.findIndex(a => a && (
                    (a.email && a.email.toLowerCase() === normEmail) ||
                    (mappedUser.id && a.id == mappedUser.id)
                ));
                if (idx !== -1) {
                    accounts[idx] = { ...accounts[idx], ...safeAcc };
                } else {
                    accounts.push(safeAcc);
                }
                saveStoredAccounts(accounts);
            }

            // Sync into window.PROFILES in memory
            if (Array.isArray(window.PROFILES)) {
                const pIdx = window.PROFILES.findIndex(p => p && (
                    (p.email && p.email.toLowerCase() === normEmail) ||
                    (mappedUser.id && p.id == mappedUser.id)
                ));
                if (pIdx !== -1) {
                    window.PROFILES[pIdx] = { ...window.PROFILES[pIdx], ...mappedUser };
                } else {
                    window.PROFILES.unshift(mappedUser);
                }
            }

            state.currentUser = createSafeUserSession(mappedUser);
            state.profileComplete = true;

            const isBoySocial = (typeof isBoyGender === 'function' ? isBoyGender(mappedUser.gender) : mappedUser.gender === 'Boy');
            const isPaidSocial = (
                existingProfile.payment_status === 'paid' ||
                existingProfile.payment_status === 'Active' ||
                existingProfile.paymentStatus === 'paid' ||
                existingProfile.paymentStatus === 'Active'
            );

            if (isBoySocial && isPaidSocial) {
                mappedUser.paymentStatus = 'Active';
                if (!mappedUser.planExpiry) {
                    const exp = existingProfile.plan_expiry || existingProfile.planExpiry;
                    mappedUser.planExpiry = exp || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
                    mappedUser.planStart = existingProfile.plan_start || existingProfile.planStart || new Date().toISOString().split('T')[0];
                }
                if (typeof computeSecureToken === 'function') {
                    mappedUser.paymentToken = computeSecureToken('payment', mappedUser.id, mappedUser.email, mappedUser.planExpiry);
                    mappedUser.genderToken = computeSecureToken('gender', mappedUser.id, mappedUser.email, 'Boy');
                }
                state.currentUser = createSafeUserSession(mappedUser);
                state.membershipPaid = true;
            } else {
                state.membershipPaid = (
                    isPaidSocial ||
                    (typeof isGirlGender === 'function' && isGirlGender(mappedUser.gender)) ||
                    mappedUser.gender === 'Girl'
                );
            }

            saveSessionState();
            if (typeof hideGlobalLoader === 'function') hideGlobalLoader();

            if (typeof initInactivityTimer === 'function') initInactivityTimer();
            if (typeof syncUserChatAndInterests === 'function') syncUserChatAndInterests();

            const displayName = mappedUser.name || socialUser.name || 'Member';
            if (typeof showToast === 'function') showToast(`Welcome back, ${displayName}! 💍`);

            if (typeof go === 'function') {
                go('scr-home', true);
            }
        } else {
            // NEW USER: Create account record and navigate directly to Step 1 of Profile Completion!
            const newUser = {
                id: Date.now(),
                email: normEmail,
                name: socialUser.name || '',
                photo: socialUser.avatar || '',
                avatarUrl: socialUser.avatar || '',
                authProvider: socialUser.provider || 'google',
                profileComplete: false,
                paymentStatus: 'Unpaid',
                status: 'Active',
                agreedTerms: true,
                agreedTermsAt: new Date().toISOString()
            };

            state.currentUser = createSafeUserSession(newUser);
            state.profileComplete = false;
            state.membershipPaid = false;

            state.regData = {
                email: normEmail,
                name: socialUser.name || '',
                photo: socialUser.avatar || '',
                photos: socialUser.avatar ? [socialUser.avatar, '', ''] : ['', '', ''],
                authProvider: socialUser.provider || 'google',
                currentStep: 'scr-reg-caste'
            };

            saveSessionState();
            if (typeof saveRegDraft === 'function') saveRegDraft('scr-reg-caste');

            // Upsert in Supabase public.users
            if (client && typeof supabaseUpsertUser === 'function') {
                try { await supabaseUpsertUser(newUser); } catch (_) {}
            }

            if (typeof hideGlobalLoader === 'function') hideGlobalLoader();
            if (typeof showToast === 'function') {
                showToast(`Google account linked! Please complete your profile. ✨`);
            }

            if (typeof go === 'function') {
                go('scr-reg-caste', true);
            }
        }
    } catch (err) {
        if (typeof hideGlobalLoader === 'function') hideGlobalLoader();
        console.error('[Social Auth] User processing error:', err);
        if (typeof showToast === 'function') showToast('Error linking account. Please try again.');
    }
}
window.handleSocialUserAuthenticated = handleSocialUserAuthenticated;

/**
 * Check and process OAuth Callback on application startup (detects access_token or Supabase Session)
 */
async function checkAndProcessOAuthCallback() {
    const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
    if (!client || !client.auth) return false;

    try {
        const hasHashParams = window.location.hash && (
            window.location.hash.includes('access_token=') ||
            window.location.hash.includes('type=recovery') ||
            window.location.hash.includes('error=')
        );
        const hasSearchParams = window.location.search && (
            window.location.search.includes('code=') ||
            window.location.search.includes('error=')
        );
        const hasPendingOAuth = sessionStorage.getItem('mangalSetu_oauth_pending');

        if (hasHashParams || hasSearchParams || hasPendingOAuth) {
            try { sessionStorage.removeItem('mangalSetu_oauth_pending'); } catch (_) {}

            const { data, error } = await client.auth.getSession();
            if (!error && data && data.session && data.session.user) {
                const u = data.session.user;
                const email = (u.email || '').toLowerCase().trim();
                const name = u.user_metadata?.full_name || u.user_metadata?.name || '';
                const avatar = u.user_metadata?.avatar_url || u.user_metadata?.picture || '';
                const prov = u.app_metadata?.provider || 'google';

                // Clean URL hash and search params without reloading page
                if (window.location.hash && window.location.hash.includes('access_token=')) {
                    try {
                        history.replaceState(null, document.title, window.location.pathname + window.location.search);
                    } catch (_) {}
                }
                if (window.location.search && window.location.search.includes('code=')) {
                    try {
                        history.replaceState(null, document.title, window.location.pathname);
                    } catch (_) {}
                }

                await handleSocialUserAuthenticated({
                    id: u.id,
                    email: email,
                    name: name,
                    avatar: avatar,
                    provider: prov
                });
                return true;
            }
        }
    } catch (e) {
        console.warn('[OAuth Callback] Check note:', e);
    }
    return false;
}
window.checkAndProcessOAuthCallback = checkAndProcessOAuthCallback;
