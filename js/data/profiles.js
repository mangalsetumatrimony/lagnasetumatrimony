/* ============================================================ COMMUNITY PROFILES DATA ============================================================ */
// Production Mode: Empty default profiles. Real profiles load live from Supabase & Cloudinary CDN.
const DEFAULT_PROFILES = [];

const LS_PROFILES_KEY = 'LS_COMMUNITY_PROFILES';

function loadCommunityProfiles() {
    try {
        const cached = localStorage.getItem(LS_PROFILES_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter(p => p && (typeof isUserPurged !== 'function' || !isUserPurged(p)));
            }
        }
        const sessionCached = sessionStorage.getItem('mangalSetu_profiles');
        if (sessionCached) {
            const parsed = JSON.parse(sessionCached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter(p => p && (typeof isUserPurged !== 'function' || !isUserPurged(p)));
            }
        }
    } catch(e) {}
    return [];
}

let PROFILES = loadCommunityProfiles();

function saveCommunityProfiles() {
    try {
        if (Array.isArray(PROFILES) && PROFILES.length > 0) {
            localStorage.setItem(LS_PROFILES_KEY, JSON.stringify(PROFILES));
            sessionStorage.setItem('mangalSetu_profiles', JSON.stringify(PROFILES));
        }
    } catch(e) {}
}

/**
 * Asynchronously sync profiles from Supabase PostgreSQL on startup or in background
 * @param {boolean} force - Force sync
 * @param {boolean} silent - Silent sync without showing any global spinner
 */
async function syncProfilesFromSupabase(force = false, silent = false) {
    if (typeof supabaseFetchProfiles !== 'function') return;
    const shouldShowLoader = !silent && (!PROFILES || PROFILES.length === 0);
    try {
        if (shouldShowLoader && typeof showGlobalLoader === 'function') {
            showGlobalLoader('Loading verified profiles from Supabase...', 800);
        }
        const remoteProfiles = await supabaseFetchProfiles();
        if (Array.isArray(remoteProfiles)) {
            PROFILES = remoteProfiles.filter(p => p && (typeof isUserPurged !== 'function' || !isUserPurged(p)));
            window.PROFILES = PROFILES;
            saveCommunityProfiles();

            // Reconcile current user's details live as soon as Supabase profiles arrive
            if (typeof state !== 'undefined' && state.currentUser && state.currentUser.email) {
                const myEmail = state.currentUser.email.trim().toLowerCase();
                const curId = state.currentUser.id || state.currentUser.profileId;
                const myProf = PROFILES.find(p => p && ((p.email && p.email.trim().toLowerCase() === myEmail) || (curId && (p.id == curId || p.userId == curId || p.user_id == curId))));
                if (myProf) {
                    if (myProf.name) state.currentUser.name = myProf.name;
                    if (myProf.gender) state.currentUser.gender = (myProf.gender === 'girls' || myProf.gender === 'Girl') ? 'Girl' : 'Boy';
                    if (myProf.community) {
                        state.currentUser.caste = myProf.community;
                        state.currentUser.community = myProf.community;
                    }
                    if (myProf.img) {
                        state.currentUser.img = myProf.img;
                        state.currentUser.photo = myProf.img;
                    }
                    state.currentUser.profileId = myProf.id;
                    if (myProf.dob !== undefined) state.currentUser.dob = myProf.dob || '';
                    if (myProf.age !== undefined && myProf.age !== null) state.currentUser.age = myProf.age;
                    if (myProf.height !== undefined) state.currentUser.height = myProf.height || '';
                    if (myProf.weight !== undefined) state.currentUser.weight = myProf.weight || '';
                    if (myProf.education !== undefined) state.currentUser.education = myProf.education || '';
                    if (myProf.occ !== undefined || myProf.occupation !== undefined) {
                        state.currentUser.occupation = myProf.occ || myProf.occupation || '';
                        state.currentUser.occ = myProf.occ || myProf.occupation || '';
                    }
                    if (myProf.income !== undefined) state.currentUser.income = myProf.income || '';
                    if (myProf.marital !== undefined) state.currentUser.marital = myProf.marital || 'Unmarried';
                    if (myProf.physical !== undefined) state.currentUser.physical = myProf.physical || 'Normal';
                    if (Array.isArray(myProf.hobbies)) state.currentUser.hobbies = myProf.hobbies;

                    const isFamDisabled = (
                        myProf.familyDetailsEnabled === false ||
                        myProf.raw_data?.familyDetailsEnabled === false ||
                        myProf.raw_data?.family_details_enabled === false
                    );
                    state.currentUser.familyDetailsEnabled = !isFamDisabled;

                    if (myProf.profileCreatedBy !== undefined || myProf.created_by !== undefined) {
                        state.currentUser.profileCreatedBy = myProf.profileCreatedBy || myProf.created_by || 'Self';
                        state.currentUser.created_by = myProf.profileCreatedBy || myProf.created_by || 'Self';
                    }

                    if (isFamDisabled) {
                        state.currentUser.father = '';
                        state.currentUser.fatherName = '';
                        state.currentUser.fatherOcc = '';
                        state.currentUser.fatherMobile = '';
                        state.currentUser.rawFatherMobile = '';
                        state.currentUser.father_mobile = '';
                        state.currentUser.mother = '';
                        state.currentUser.motherName = '';
                        state.currentUser.motherOcc = '';
                        state.currentUser.sister = '—';
                        state.currentUser.brother = '—';
                    } else {
                        if (myProf.father !== undefined || myProf.fatherName !== undefined) {
                            state.currentUser.father = myProf.father || myProf.fatherName || '';
                            state.currentUser.fatherName = myProf.father || myProf.fatherName || '';
                        }
                        if (myProf.fatherOcc !== undefined) state.currentUser.fatherOcc = myProf.fatherOcc || '';
                        const cleanIncomingFM = (!String(myProf.rawFatherMobile || '').includes('•') && myProf.rawFatherMobile) ||
                                                (!String(myProf.father_mobile || '').includes('•') && myProf.father_mobile) ||
                                                (!String(myProf.fatherMobile || '').includes('•') && myProf.fatherMobile) ||
                                                (!String(myProf.raw_data?.rawFatherMobile || '').includes('•') && myProf.raw_data?.rawFatherMobile) ||
                                                (!String(myProf.raw_data?.father_mobile || '').includes('•') && myProf.raw_data?.father_mobile) ||
                                                (!String(myProf.raw_data?.fatherMobile || '').includes('•') && myProf.raw_data?.fatherMobile);
                        if (cleanIncomingFM) {
                            state.currentUser.fatherMobile = cleanIncomingFM;
                            state.currentUser.rawFatherMobile = cleanIncomingFM;
                            state.currentUser.father_mobile = cleanIncomingFM;
                        }
                        if (myProf.mother !== undefined || myProf.motherName !== undefined) {
                            state.currentUser.mother = myProf.mother || myProf.motherName || '';
                            state.currentUser.motherName = myProf.mother || myProf.motherName || '';
                        }
                        if (myProf.motherOcc !== undefined) state.currentUser.motherOcc = myProf.motherOcc || '';
                        if (myProf.sister !== undefined) state.currentUser.sister = myProf.sister || 'None';
                        if (myProf.brother !== undefined) state.currentUser.brother = myProf.brother || 'None';
                    }
                    if (myProf.village !== undefined || myProf.city !== undefined) {
                        state.currentUser.village = myProf.village || myProf.city || '';
                        state.currentUser.city = myProf.village || myProf.city || '';
                    }
                    if (myProf.taluka !== undefined) state.currentUser.taluka = myProf.taluka || '';
                    if (myProf.district !== undefined) state.currentUser.district = myProf.district || '';
                    if (myProf.fullAddress !== undefined || myProf.address !== undefined) {
                        state.currentUser.address = myProf.fullAddress || myProf.address || '';
                        state.currentUser.fullAddress = myProf.fullAddress || myProf.address || '';
                    }
                    const cleanIncomingOM = (!String(myProf.rawOwnMobile || '').includes('•') && myProf.rawOwnMobile) ||
                                            (!String(myProf.own_mobile || '').includes('•') && myProf.own_mobile) ||
                                            (!String(myProf.ownMobile || '').includes('•') && myProf.ownMobile) ||
                                            (!String(myProf.mobile || '').includes('•') && myProf.mobile) ||
                                            (!String(myProf.raw_data?.rawOwnMobile || '').includes('•') && myProf.raw_data?.rawOwnMobile) ||
                                            (!String(myProf.raw_data?.own_mobile || '').includes('•') && myProf.raw_data?.own_mobile) ||
                                            (!String(myProf.raw_data?.ownMobile || '').includes('•') && myProf.raw_data?.ownMobile) ||
                                            (!String(myProf.raw_data?.mobile || '').includes('•') && myProf.raw_data?.mobile);
                    if (cleanIncomingOM) {
                        state.currentUser.ownMobile = cleanIncomingOM;
                        state.currentUser.rawOwnMobile = cleanIncomingOM;
                        state.currentUser.own_mobile = cleanIncomingOM;
                        state.currentUser.mobile = cleanIncomingOM;
                    }
                    if (Array.isArray(myProf.photos) && myProf.photos.length > 0) {
                        state.currentUser.photos = myProf.photos;
                    }

                    // Also sync account status if suspended/active
                    if (myProf.account_status === 'suspended' || myProf.accountStatus === 'suspended') {
                        state.currentUser.status = 'Suspended';
                        state.currentUser.accountStatus = 'suspended';
                        state.currentUser.suspensionReason = myProf.suspension_reason || myProf.suspensionReason || 'Account suspended by administrator.';
                        if (typeof enforceUserSuspendedModal === 'function') {
                            enforceUserSuspendedModal(state.currentUser.suspensionReason);
                        }
                    } else if (myProf.account_status === 'active' || myProf.accountStatus === 'active') {
                        state.currentUser.status = 'Active';
                        state.currentUser.accountStatus = 'active';
                        state.currentUser.suspensionReason = null;
                        if (typeof dismissUserSuspendedModal === 'function') {
                            dismissUserSuspendedModal();
                        }
                    }

                    const isDone = typeof isProfileFullyComplete === 'function' ? isProfileFullyComplete(state.currentUser) : true;
                    state.currentUser.profileComplete = isDone;
                    state.profileComplete = isDone;
                    if (typeof saveSessionState === 'function') saveSessionState();

                    // Keep stored accounts in localStorage updated as well
                    if (typeof getStoredAccounts === 'function' && typeof saveStoredAccounts === 'function') {
                        try {
                            const accounts = getStoredAccounts();
                            const accIdx = accounts.findIndex(a => a && ((a.email && a.email.toLowerCase() === myEmail) || (curId && String(a.id) === String(curId))));
                            if (accIdx !== -1) {
                                accounts[accIdx] = { ...accounts[accIdx], ...state.currentUser };
                                saveStoredAccounts(accounts);
                            }
                        } catch (_) {}
                    }
                }
            }

            if (typeof updateHeaderUserDisplay === 'function') {
                updateHeaderUserDisplay();
            }
            if (typeof updateHomeStats === 'function') {
                updateHomeStats();
            }
            if (typeof renderHome === 'function' && document.getElementById('homeGirlsList')) {
                renderHome();
            }
            if (typeof renderBrowse === 'function' && document.getElementById('browseList')) {
                renderBrowse();
            }
            if (typeof checkCurrentUserStatus === 'function') {
                checkCurrentUserStatus();
            }
        }
    } catch (err) {
        console.warn('[Profiles] Supabase sync note:', err);
    } finally {
        if (shouldShowLoader && typeof hideGlobalLoader === 'function') {
            hideGlobalLoader();
        }
    }
}

/**
 * Live handle new profile insertion or update in real-time
 * Triggered by Supabase Realtime Broadcast, Postgres changes, or DB sync
 * Immediately updates memory, storage, and re-renders home & browse cards without F5 / reload
 * @param {object} incoming - Raw or mapped profile payload
 */
function handleRemoteProfileUpsert(incoming) {
    if (!incoming) return;

    const isActiveProfile = (incoming.account_status === 'active' || incoming.accountStatus === 'active');
    if (isActiveProfile) {
        if (typeof unregisterPurgedUserId === 'function') {
            unregisterPurgedUserId(incoming.id, incoming.email, incoming.user_id);
        }
    } else {
        if (typeof isUserPurged === 'function' && isUserPurged(incoming)) {
            handleRemoteAccountPurge(incoming.id, incoming.email, incoming);
            return;
        }
    }

    const prof = typeof mapProfileFromSupabase === 'function' ? mapProfileFromSupabase(incoming) : incoming;
    if (!prof || !prof.id) return;

    if (prof.accountStatus === 'deleted' || prof.account_status === 'deleted' || prof.name === '[Deleted Account]') {
        handleRemoteAccountPurge(prof.id, prof.email, prof);
        return;
    }

    // For suspended profiles: remove from public browse feed
    if (prof.accountStatus === 'suspended' || prof.account_status === 'suspended') {
        PROFILES = (window.PROFILES || PROFILES || []).filter(p => p && String(p.id) !== String(prof.id));
        window.PROFILES = PROFILES;
        saveCommunityProfiles();
        if (typeof updateHomeStats === 'function') updateHomeStats();
        if (typeof renderHome === 'function' && document.getElementById('homeGirlsList')) renderHome();
        if (typeof renderBrowse === 'function' && document.getElementById('browseList')) renderBrowse();
        return;
    }

    // Upsert into PROFILES and window.PROFILES
    PROFILES = Array.isArray(window.PROFILES) ? window.PROFILES : (Array.isArray(PROFILES) ? PROFILES : []);
    const profIdStr = String(prof.id);
    const profEmail = (prof.email || '').trim().toLowerCase();

    const idx = PROFILES.findIndex(p => p && (
        String(p.id) === profIdStr ||
        (profEmail && p.email && p.email.trim().toLowerCase() === profEmail)
    ));

    if (idx !== -1) {
        PROFILES[idx] = { ...PROFILES[idx], ...prof };
    } else {
        // Prepend new profile at the top so it is immediately visible
        PROFILES.unshift(prof);
    }
    window.PROFILES = PROFILES;
    saveCommunityProfiles();

    // Live update currentUser model if own profile was updated remotely
    if (typeof state !== 'undefined' && state.currentUser && prof) {
        const myId = String(state.currentUser.id || state.currentUser.profileId || '');
        const myEmail = (state.currentUser.email || '').trim().toLowerCase();
        if ((profIdStr && profIdStr === myId) || (profEmail && profEmail === myEmail)) {
            if (prof.name) state.currentUser.name = prof.name;
            if (prof.gender) state.currentUser.gender = (prof.gender === 'girls' || prof.gender === 'Girl') ? 'Girl' : 'Boy';
            if (prof.community) { state.currentUser.caste = prof.community; state.currentUser.community = prof.community; }
            if (prof.img) { state.currentUser.img = prof.img; state.currentUser.photo = prof.img; }
            if (prof.paymentStatus) state.currentUser.paymentStatus = prof.paymentStatus;
            if (typeof saveSessionState === 'function') saveSessionState();
            if (typeof updateHeaderUserDisplay === 'function') updateHeaderUserDisplay();
        }
    }

    console.info('[Realtime] Live profile update applied:', prof.id, prof.name, prof.gender);
    if (typeof updateHomeStats === 'function') updateHomeStats();
    if (typeof updateHeaderUserDisplay === 'function') updateHeaderUserDisplay();
    if (typeof renderHome === 'function' && document.getElementById('homeGirlsList')) renderHome();
    if (typeof renderBrowse === 'function' && document.getElementById('browseList')) renderBrowse();
    if (typeof checkCurrentUserStatus === 'function') checkCurrentUserStatus();
}
window.handleRemoteProfileUpsert = handleRemoteProfileUpsert;

/**
 * Realtime subscription: Listen for profile insertions, updates, and deletions
 * Subscribes to BOTH Realtime Broadcast (sub-100ms) and Postgres Changes
 */
function setupProfilesRealtime() {
    if (window._profilesRealtimeActive) return;
    const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
    if (!client) return;

    window._profilesRealtimeActive = true;
    console.info('[Profiles] Initializing Realtime listeners (Broadcast + Postgres Changes)...');

    try {
        // 1. Subscribe to Realtime broadcast channel (instant cross-device synchronization)
        if (typeof client.channel === 'function') {
            const bcChannel = client.channel('realtime:presence:community');
            bcChannel
                .on('broadcast', { event: 'profile_upserted' }, ({ payload }) => {
                    if (payload) {
                        console.info('[Realtime Broadcast] Received profile_upserted:', payload.id, payload.name);
                        handleRemoteProfileUpsert(payload);
                    }
                })
                .on('broadcast', { event: 'user_account_deleted' }, ({ payload }) => {
                    if (payload) {
                        console.info('[Realtime Broadcast] Received user_account_deleted:', payload.id, payload.email);
                        handleRemoteAccountPurge(payload.id, payload.email, payload);
                    }
                })
                .subscribe((status) => {
                    console.info('[Realtime Broadcast] Community channel status:', status);
                });
        }

        // 2. Subscribe to profiles table via Postgres changes
        if (typeof supabaseSubscribeToTable === 'function') {
            supabaseSubscribeToTable('profiles', 
                (newRow) => {
                    if (!newRow) return;
                    handleRemoteProfileUpsert(newRow);
                },
                (updatedRow) => {
                    if (!updatedRow) return;
                    // Live check if current user was suspended or reactivated
                    if (typeof state !== 'undefined' && state.currentUser) {
                        const myId = String(state.currentUser.id || state.currentUser.profileId || state.currentUser.userId || '');
                        const myUserId = String(state.currentUser.userId || state.currentUser.user_id || '');
                        const myEmail = (state.currentUser.email || '').trim().toLowerCase();
                        const rowId = String(updatedRow.id || '');
                        const rowUserId = String(updatedRow.user_id || '');
                        const rowEmail = (updatedRow.email || '').trim().toLowerCase();
                        const isMatch = (rowId && (rowId === myId || rowId === myUserId)) ||
                                        (rowUserId && (rowUserId === myId || rowUserId === myUserId)) ||
                                        (rowEmail && myEmail && rowEmail === myEmail);
                        if (isMatch) {
                            const rowStatus = String(updatedRow.account_status || (updatedRow.raw_data && updatedRow.raw_data.accountStatus) || '').toLowerCase();
                            if (rowStatus === 'suspended') {
                                state.currentUser.status = 'Suspended';
                                state.currentUser.accountStatus = 'suspended';
                                state.currentUser.account_status = 'suspended';
                                state.currentUser.suspensionReason = updatedRow.suspension_reason || (updatedRow.raw_data && updatedRow.raw_data.suspensionReason) || 'Account suspended by administrator.';
                                if (typeof saveSessionState === 'function') saveSessionState();
                                if (typeof enforceUserSuspendedModal === 'function') enforceUserSuspendedModal(state.currentUser.suspensionReason);
                                return;
                            } else if (rowStatus === 'active') {
                                state.currentUser.status = 'Active';
                                state.currentUser.accountStatus = 'active';
                                state.currentUser.account_status = 'active';
                                state.currentUser.suspensionReason = null;
                                if (typeof saveSessionState === 'function') saveSessionState();
                                if (typeof dismissUserSuspendedModal === 'function') dismissUserSuspendedModal();
                            }
                        }
                    }

                    handleRemoteProfileUpsert(updatedRow);
                },
                (deletedRow) => {
                    if (!deletedRow) return;
                    handleRemoteAccountPurge(deletedRow.id, deletedRow.email, deletedRow);
                }
            );

            // Also subscribe to users table for live user moderation / deletion events
            supabaseSubscribeToTable(
                'users',
                () => {},
                (updatedUser) => {
                    if (!updatedUser) return;
                    if (state.currentUser && (String(state.currentUser.id) === String(updatedUser.id) || (updatedUser.email && state.currentUser.email && state.currentUser.email.toLowerCase() === updatedUser.email.toLowerCase()))) {
                        if (updatedUser.status === 'Suspended') {
                            if (typeof supabaseCheckUserSuspended === 'function') {
                                supabaseCheckUserSuspended(state.currentUser.id || state.currentUser.profileId, state.currentUser.email).then(res => {
                                    if (res && res.suspended) {
                                        state.currentUser.status = 'Suspended';
                                        state.currentUser.suspensionReason = res.reason || updatedUser.suspension_reason || 'Account suspended by administrator.';
                                        if (typeof saveSessionState === 'function') saveSessionState();
                                        if (typeof enforceUserSuspendedModal === 'function') enforceUserSuspendedModal(state.currentUser.suspensionReason);
                                    }
                                }).catch(() => {});
                            }
                        } else if (updatedUser.status === 'Active') {
                            state.currentUser.status = 'Active';
                            if (typeof saveSessionState === 'function') saveSessionState();
                            if (typeof dismissUserSuspendedModal === 'function') dismissUserSuspendedModal();
                        }
                    }
                },
                (deletedUser) => {
                    if (!deletedUser) return;
                    handleRemoteAccountPurge(deletedUser.id, deletedUser.email, deletedUser);
                }
            );
        }
    } catch (e) {
        console.warn('[Profiles] Realtime setup note:', e);
    }
}

/**
 * Handle remote account deletion broadcast or DB change in realtime
 * Instantly wipes user from memory, UI, and favorites across all tabs & devices
 */
function handleRemoteAccountPurge(delId, delEmail, rawPayload = {}) {
    const normEmail = delEmail ? String(delEmail).trim().toLowerCase() : '';
    const normId = delId ? String(delId).trim() : '';
    const ids = Array.isArray(rawPayload.ids) ? rawPayload.ids.map(String) : (normId ? [normId] : []);
    const emails = Array.isArray(rawPayload.emails) ? rawPayload.emails.map(e => String(e).trim().toLowerCase()) : (normEmail ? [normEmail] : []);

    if (typeof registerPurgedUserId === 'function') {
        registerPurgedUserId(...ids, ...emails);
    }

    console.info(`[Realtime Purge] Processing account deletion for IDs: [${ids.join(', ')}], Emails: [${emails.join(', ')}]`);

    // 1. Remove from in-memory PROFILES and localStorage
    PROFILES = PROFILES.filter(p => {
        if (!p) return false;
        const pId = String(p.id || '');
        const pUid = String(p.user_id || p.userId || '');
        const pEml = (p.email || '').trim().toLowerCase();
        if (ids.some(id => id && (id === pId || id === pUid))) return false;
        if (emails.some(eml => eml && eml === pEml)) return false;
        return true;
    });
    window.PROFILES = PROFILES;
    saveCommunityProfiles();

    // 2. Remove from favorites
    if (typeof state !== 'undefined' && state.favorites) {
        ids.forEach(id => {
            if (typeof state.favorites.delete === 'function') {
                state.favorites.delete(Number(id));
                state.favorites.delete(id);
            } else if (Array.isArray(state.favorites)) {
                state.favorites = state.favorites.filter(f => Number(f) !== Number(id) && String(f) !== String(id));
            }
        });
        saveSessionState();
    }

    // 3. If currently viewing this deleted profile modal/screen, close it immediately!
    const profileScreen = document.getElementById('scr-profile');
    if (profileScreen && profileScreen.classList.contains('active')) {
        const viewingId = String(window.currentViewingProfileId || '');
        if (ids.some(id => id && id === viewingId)) {
            if (typeof goBack === 'function') goBack();
            else if (typeof go === 'function') go('scr-home');
            if (typeof showToast === 'function') showToast('This profile is no longer available.');
        }
    }

    // 3b. If currently chatting with this deleted user, close chat screen immediately!
    const chatScreen = document.getElementById('scr-chat');
    if (chatScreen && chatScreen.classList.contains('active')) {
        const viewingChatId = String(state.activeChatId || '');
        if (ids.some(id => id && id === viewingChatId) || (emails.length > 0 && emails.includes((state.activeChatEmail || '').toLowerCase()))) {
            if (typeof goBack === 'function') goBack();
            else if (typeof go === 'function') go('scr-inbox');
            if (typeof showToast === 'function') showToast('This user account is no longer active.');
        }
    }

    // 3c. Completely purge deleted user from all chats, threads, and interests
    if (typeof purgeDeletedUserFromAllChatsAndInterests === 'function') {
        purgeDeletedUserFromAllChatsAndInterests(normId, normEmail, ids);
    }

    // 4. Check if currently logged-in user is the one deleted
    if (typeof state !== 'undefined' && state.currentUser) {
        const myId = String(state.currentUser.id || state.currentUser.userId || '');
        const myProfId = String(state.currentUser.profileId || '');
        const myEmail = (state.currentUser.email || '').trim().toLowerCase();

        const isMe = (ids.some(id => id && (id === myId || id === myProfId))) ||
                     (emails.some(eml => eml && eml === myEmail));

        // CRITICAL GUARD: Never auto-logout if the incoming payload is an active profile
        // or if the user has just registered in this session!
        const isPayloadActive = rawPayload && (rawPayload.account_status === 'active' || rawPayload.accountStatus === 'active');
        const isJustRegistered = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('mangalSetu_just_registered') === 'true');

        if (isMe && !isPayloadActive && !isJustRegistered) {
            console.warn('[Realtime] Current user account was deleted remotely. Auto-logging out.');
            if (typeof purgeUserAccountLocally === 'function') {
                purgeUserAccountLocally(state.currentUser.email, state.currentUser.id);
            } else {
                state.currentUser = null;
                state.profileComplete = false;
                sessionStorage.clear();
                if (typeof go === 'function') go('scr-welcome', true);
            }
            if (typeof showToast === 'function') showToast('Your account has been permanently deleted.');
            return;
        }
    }

    // 5. Live update UI across the app
    if (typeof updateHomeStats === 'function') updateHomeStats();
    if (typeof renderHome === 'function' && document.getElementById('homeGirlsList')) renderHome();
    if (typeof renderBrowse === 'function' && document.getElementById('browseList')) renderBrowse();
    if (typeof renderFavorites === 'function' && document.getElementById('favContent')) renderFavorites();
    if (typeof syncUserChatAndInterests === 'function' && typeof state !== 'undefined' && state.currentUser) syncUserChatAndInterests();
}
window.handleRemoteAccountPurge = handleRemoteAccountPurge;

// Automatically trigger sync and realtime subscription on load
let _lastSilentProfilesSync = 0;
function triggerSilentProfilesSync(minIntervalMs = 5000) {
    const now = Date.now();
    if (now - _lastSilentProfilesSync < minIntervalMs) return;
    _lastSilentProfilesSync = now;
    if (typeof syncProfilesFromSupabase === 'function') {
        syncProfilesFromSupabase(false, true);
    }
}
window.triggerSilentProfilesSync = triggerSilentProfilesSync;

function bootProfilesInit() {
    if (typeof updateHomeStats === 'function') updateHomeStats();
    const isSilentInitial = Array.isArray(PROFILES) && PROFILES.length > 0;
    if (typeof syncProfilesFromSupabase === 'function') {
        syncProfilesFromSupabase(false, isSilentInitial);
    }
    if (typeof setupProfilesRealtime === 'function') {
        setupProfilesRealtime();
    }
}
window.bootProfilesInit = bootProfilesInit;

if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', bootProfilesInit);
    } else {
        bootProfilesInit();
    }

    // Auto-sync immediately when user returns to tab / unlocks phone
    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) triggerSilentProfilesSync(0);
        });
        window.addEventListener('focus', () => {
            triggerSilentProfilesSync(0);
        });
    }

    // High-frequency failsafe background sync every 6 seconds
    setInterval(() => {
        if (typeof document !== 'undefined' && !document.hidden) {
            triggerSilentProfilesSync(5000);
        }
    }, 6000);
}

/**
 * Enforce non-dismissible suspended modal for suspended accounts
 */
function enforceUserSuspendedModal(reason) {
    if (typeof state !== 'undefined' && state.currentUser) {
        state.currentUser.status = 'Suspended';
        state.currentUser.accountStatus = 'suspended';
        state.currentUser.suspensionReason = reason || state.currentUser.suspensionReason || 'Violation of community guidelines or pending verification.';
    }
    const modal = document.getElementById('modalSuspended');
    if (modal) {
        modal.classList.add('open');
        modal.style.display = 'flex';
        modal.style.zIndex = '99999';
        const reasonEl = document.getElementById('suspensionReasonText');
        if (reasonEl && reason) {
            reasonEl.textContent = reason;
        }
    }
}

/**
 * Dismiss suspended modal upon admin reactivation
 */
function dismissUserSuspendedModal() {
    if (typeof state !== 'undefined' && state.currentUser) {
        state.currentUser.status = 'Active';
        state.currentUser.accountStatus = 'active';
        state.currentUser.suspensionReason = null;
    }
    const modal = document.getElementById('modalSuspended');
    if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
    }
}
window.enforceUserSuspendedModal = enforceUserSuspendedModal;
window.dismissUserSuspendedModal = dismissUserSuspendedModal;

async function checkCurrentUserStatus() {
    if (!state.currentUser || !state.currentUser.email) {
        dismissUserSuspendedModal();
        return;
    }

    // Direct live query to Supabase PostgreSQL (Single Source of Truth)
    if (typeof supabaseCheckUserSuspended === 'function') {
        try {
            const myId = state.currentUser.id || state.currentUser.profileId;
            const myEmail = state.currentUser.email;
            const res = await supabaseCheckUserSuspended(myId, myEmail);
            if (res && res.suspended) {
                enforceUserSuspendedModal(res.reason);
                return;
            } else {
                state.currentUser.status = 'Active';
                dismissUserSuspendedModal();
            }
        } catch (e) {
            console.warn('[Status] check error:', e);
        }
    }
}

const FAQS = [
    ['How do I register?', 'Tap "Create account" on the welcome screen and complete all 3 steps: community, personal & family details, and address.'],
    ['Is Mangal Setu free for girls?', 'Yes! 100% Lifetime Free access is guaranteed for all community girls.'],
    ['How much is the membership pass for boys?', 'Boys get 30 Days Full Access for just ₹199, giving direct contact to verified community brides\' families.'],
    ['How do I contact a profile?', 'You can direct Call or WhatsApp the girl\'s father using the verified contact buttons, or send an in-app interest request.'],
    ['Is my personal phone number visible to everyone?', 'No. Your personal registration number is kept strictly private for Admin review only. Only your father\'s contact number is shown to verified members.'],
    ['How do multi-photo profiles work?', 'Profiles with 2 or 3 photos display a photo counter badge. Tap on the photo to open the high-resolution photo carousel.'],
    ['How does the DOB age calculator work?', 'Tap on Date of Birth to open the custom scrollable calendar modal. Your exact age in years is calculated and verified automatically.'],
];

window.DEFAULT_PROFILES = DEFAULT_PROFILES;
window.PROFILES = PROFILES;
window.loadCommunityProfiles = loadCommunityProfiles;
window.saveCommunityProfiles = saveCommunityProfiles;
window.syncProfilesFromSupabase = syncProfilesFromSupabase;
window.setupProfilesRealtime = setupProfilesRealtime;
window.checkCurrentUserStatus = checkCurrentUserStatus;
window.FAQS = FAQS;
