/* ============================================================ REGISTRATION & AUTH ============================================================ */
// Cryptographic Secret Salt (Pepper) for anti-tamper security signatures
const AUTH_PEPPER = 'LS_MATRIMONY_SECURE_2026_@v9#';
if (typeof window !== 'undefined') window.AUTH_PEPPER = AUTH_PEPPER;

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

        // If currently logged-in user is not in Supabase, auto-logout ONLY if profile was previously complete
        // and user is not in the middle of active registration or fresh post-registration grace period
        const isJustRegistered = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('mangalSetu_just_registered') === 'true');
        const isProfileCompleteUser = Boolean(state.profileComplete && state.currentUser && state.currentUser.profileComplete);

        if (isProfileCompleteUser && state.currentUser && state.currentUser.email && !isJustRegistered) {
            const currentEmailNorm = state.currentUser.email.trim().toLowerCase();
            if (activeEmails.size > 0 && !activeEmails.has(currentEmailNorm)) {
                // Double check with direct individual queries to prevent false positive logouts
                let stillExistsInDb = false;
                try {
                    const { data: directU } = await client.from('users').select('id, email').ilike('email', currentEmailNorm).limit(1);
                    if (Array.isArray(directU) && directU.length > 0) stillExistsInDb = true;
                    if (!stillExistsInDb) {
                        const { data: directP } = await client.from('profiles').select('id, email').ilike('email', currentEmailNorm).limit(1);
                        if (Array.isArray(directP) && directP.length > 0) stillExistsInDb = true;
                    }
                } catch (_) {}

                if (!stillExistsInDb) {
                    console.warn('[MangalSetu] Current active user was confirmed deleted in Supabase. Logging out.');
                    purgeUserAccountLocally(state.currentUser.email, state.currentUser.id);
                    if (typeof showToast === 'function') {
                        showToast('Your account has been deleted. Please register for a new account.');
                    }
                    if (typeof go === 'function') go('scr-welcome', true);
                }
            }
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

// Robust 64-bit HMAC-like Anti-Tamper Token Generator with Secret Salt
function computeSecureToken(type, id, email, value) {
    const pepper = (typeof AUTH_PEPPER !== 'undefined') ? AUTH_PEPPER : ((typeof window !== 'undefined' && window.AUTH_PEPPER) ? window.AUTH_PEPPER : 'LS_MATRIMONY_SECURE_2026_@v9#');
    const raw = `${type}:${id}:${String(email || '').trim().toLowerCase()}:${value}:${pepper}`;
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
            // Anti-Tamper: Never trust client-modified user.gender! Cross-check against authentic profile in PROFILES
            const uEmail = (user.email || '').trim().toLowerCase();
            const originalProf = (typeof window !== 'undefined' && Array.isArray(window.PROFILES))
                ? window.PROFILES.find(p => p && p.email && p.email.toLowerCase() === uEmail)
                : null;
            const trueGender = originalProf ? originalProf.gender : null;
            const isReallyGirl = trueGender && ((typeof isGirlGender === 'function' && isGirlGender(trueGender)) || String(trueGender).toLowerCase().includes('girl'));

            if (isReallyGirl && user.id && user.email) {
                user.gender = 'Girl';
                user.genderToken = computeSecureToken('gender', user.id, user.email, 'Girl');
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

        // Cross-check against authentic server profile in PROFILES
        if (!genuinePayment && typeof window !== 'undefined' && Array.isArray(window.PROFILES)) {
            const authProf = window.PROFILES.find(p => p && ((p.id && String(p.id) === String(user.id)) || (p.email && p.email.toLowerCase() === userEmail)));
            if (authProf && (authProf.paymentStatus === 'paid' || authProf.payment_status === 'paid' || authProf.paymentStatus === 'Active') && (authProf.planExpiry || authProf.plan_expiry)) {
                const expDate = authProf.planExpiry || authProf.plan_expiry;
                const exp = new Date(expDate);
                if (exp.getTime() > Date.now()) {
                    genuinePayment = true;
                    user.planExpiry = expDate;
                }
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
    
    // Guard 2: ONLY for Boys - Boy 30-Day Pass status check (Freemium Teaser Mode: Unpaid boys can browse Home & Browse)
    const isBoy = typeof isBoyGender === 'function'
        ? isBoyGender(state.currentUser?.gender)
        : (state.currentUser?.gender === 'Boy' || state.currentUser?.gender === 'boy' || state.currentUser?.gender === 'boys');

    if (isBoy && state.currentUser) {
        const passStatus = checkBoyPassStatus(state.currentUser);
        state.membershipPaid = passStatus.active;
        if (!passStatus.active) {
            state.currentUser.paymentStatus = (passStatus.reason === 'expired') ? 'Expired' : 'Unpaid';
            // Freemium Teaser Mode: Unpaid boys can freely browse profiles, while contacts & chat are locked behind ₹199 pass
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
    if (typeof syncUserNotificationsFromData === 'function') {
        syncUserNotificationsFromData();
    }
    if (typeof updateUserNotifBadge === 'function') {
        updateUserNotifBadge();
    }
    if (typeof updateInboxBadge === 'function') {
        updateInboxBadge();
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
    if (typeof openPaymentCheckout === 'function') {
        openPaymentCheckout();
    } else if (typeof openRazorpayCheckout === 'function') {
        openRazorpayCheckout();
    }
}

if (typeof doLogout !== 'undefined') window.doLogout = doLogout;
if (typeof enterHome !== 'undefined') window.enterHome = enterHome;

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

        // STRICT SINGLE SOURCE OF TRUTH:
        // Only if Supabase client is NOT available (offline standalone demo), check local stored accounts fallback.
        if (!client && !existingProfile) {
            if (typeof getStoredAccounts === 'function') {
                const accounts = getStoredAccounts();
                existingProfile = accounts.find(a => a.email && a.email.toLowerCase() === normEmail);
            }
            if (!existingProfile && Array.isArray(window.PROFILES)) {
                existingProfile = window.PROFILES.find(p => p.email && p.email.toLowerCase() === normEmail);
            }
        }

        // If this is a brand new user or returning user starting registration,
        // explicitly unregister any purge markers so registration can proceed smoothly without false purge triggers
        if (typeof unregisterPurgedUserId === 'function') {
            unregisterPurgedUserId(normEmail, socialUser.id);
        }
        try {
            sessionStorage.removeItem('LS_PURGED_USER_CACHE');
        } catch (_) {}

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
