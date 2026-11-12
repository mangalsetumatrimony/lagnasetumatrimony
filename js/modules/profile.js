/* ============================================================ MEMBER PROFILE & ACTIONS ============================================================ */
/* ============================================================ STEP 3: SUBMIT PROFILE & GENDER PAYWALL ============================================================ */
async function submitProfileCompletion() {
    const cityInput = document.getElementById('regCity');
    const talukaInput = document.getElementById('regTaluka');
    const districtInput = document.getElementById('regDistrict');
    const addressInput = document.getElementById('regAddress');

    const city = cityInput ? cityInput.value.trim() : '';
    const taluka = talukaInput ? talukaInput.value.trim() : '';
    const district = districtInput ? districtInput.value.trim() : '';
    const address = addressInput ? addressInput.value.trim() : '';

    if (!city) {
        highlightFieldError(cityInput, 'Please enter your City / Village');
        return;
    }
    if (!district) {
        highlightFieldError(districtInput, 'Please enter your District');
        return;
    }
    if (!address) {
        highlightFieldError(addressInput, 'Please enter your Full Address');
        return;
    }

    state.regData.city = city;
    state.regData.taluka = taluka;
    state.regData.district = district;
    state.regData.address = address;
    state.profileComplete = true;

    // Accurately determine gender (Girl vs Boy) before creating profile
    const userGender = state.regData.gender || state.currentUser?.gender;
    if (!userGender || (userGender !== 'Boy' && userGender !== 'Girl')) {
        showToast('Gender is mandatory. Please select Boy or Girl.');
        go('scr-reg2');
        const grid = document.getElementById('genderCardGrid');
        const err = document.getElementById('genderErrorMsg');
        if (err) err.style.display = 'block';
        if (grid) {
            grid.style.outline = '2px solid var(--error)';
            grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    const isGirl = userGender === 'Girl';

    // Synchronize ID and Email across users and profiles tables
    // Synchronize ID and Email across users and profiles tables (Guaranteed 64-bit BIGINT numeric ID)
    let cleanProfileId = null;
    const rawId = (state.currentUser && state.currentUser.id) ? state.currentUser.id : (state.regData.userId || Date.now());
    if (typeof rawId === 'number' && Number.isFinite(rawId) && rawId > 0) {
        cleanProfileId = Math.floor(rawId);
    } else if (typeof rawId === 'string' && rawId.trim()) {
        const digits = rawId.replace(/\D/g, '');
        if (digits.length > 0) {
            cleanProfileId = parseInt(digits.slice(-15), 10);
        }
    }
    if (!cleanProfileId || isNaN(cleanProfileId)) {
        cleanProfileId = Date.now();
    }
    const userEmail = (state.currentUser && state.currentUser.email) ? state.currentUser.email : (state.regData.email || '');

    // Unregister this user from any stale purge caches and mark as freshly registered
    if (typeof unregisterPurgedUserId === 'function') {
        unregisterPurgedUserId(userEmail, cleanProfileId, rawId);
    }
    try {
        sessionStorage.removeItem('LS_PURGED_USER_CACHE');
        sessionStorage.setItem('mangalSetu_just_registered', 'true');
    } catch (_) {}

    // Photos list
    const photosList = (Array.isArray(state.regData.photos) && state.regData.photos.filter(Boolean).length > 0)
        ? state.regData.photos.filter(Boolean)
        : (state.regData.photo ? [state.regData.photo] : (state.currentUser?.photos || (state.currentUser?.img ? [state.currentUser.img] : [])));
    const mainImg = photosList[0] || (isGirl ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop');

    // Create newly registered profile in PROFILES with complete field set
    const newProfile = {
        id: cleanProfileId,
        user_id: String(rawId || cleanProfileId),
        gender: isGirl ? 'girls' : 'boys',
        name: state.regData.name || state.currentUser?.name || '',
        age: parseInt(state.regData.age) || parseInt(state.currentUser?.age) || 24,
        dob: state.regData.dob || state.currentUser?.dob || '',
        height: state.regData.height ? (String(state.regData.height).includes('cm') ? state.regData.height : `${state.regData.height} cm`) : (state.currentUser?.height || "5'6\""),
        weight: state.regData.weight ? (String(state.regData.weight).includes('kg') ? state.regData.weight : `${state.regData.weight} kg`) : (state.currentUser?.weight || '60 kg'),
        education: state.regData.education || state.currentUser?.education || 'Graduate',
        occ: state.regData.occupation || state.currentUser?.occupation || state.currentUser?.occ || 'Professional',
        occupation: state.regData.occupation || state.currentUser?.occupation || state.currentUser?.occ || 'Professional',
        income: state.regData.income || state.currentUser?.income || '₹40K – ₹75K',
        marital: state.regData.marital || state.currentUser?.marital || 'Unmarried',
        physical: state.regData.physical || state.currentUser?.physical || 'Normal',
        community: state.regData.caste || state.currentUser?.caste || '',
        hobbies: (Array.isArray(state.regData.hobbies) && state.regData.hobbies.length > 0) ? state.regData.hobbies : (state.currentUser?.hobbies || []),
        profileCreatedBy: state.regData.profileCreatedBy || state.currentUser?.profileCreatedBy || 'Self',
        created_by: state.regData.profileCreatedBy || state.currentUser?.profileCreatedBy || 'Self',
        father: state.regData.fatherName || state.currentUser?.father || '',
        father_name: state.regData.fatherName || state.currentUser?.father || '',
        fatherOcc: state.regData.fatherOcc || state.currentUser?.fatherOcc || '',
        father_occ: state.regData.fatherOcc || state.currentUser?.fatherOcc || '',
        fatherMobile: state.regData.fatherMobile || state.currentUser?.fatherMobile || '',
        father_mobile: state.regData.fatherMobile || state.currentUser?.fatherMobile || '',
        fatherWhatsapp: state.regData.fatherWhatsapp !== false,
        ownMobile: state.regData.ownMobile || state.currentUser?.mobile || '',
        own_mobile: state.regData.ownMobile || state.currentUser?.mobile || '',
        mother: state.regData.motherName || state.currentUser?.mother || '',
        mother_name: state.regData.motherName || state.currentUser?.mother || '',
        motherOcc: state.regData.motherOcc || state.currentUser?.motherOcc || '',
        mother_occ: state.regData.motherOcc || state.currentUser?.motherOcc || '',
        sister: state.regData.sister || state.currentUser?.sister || 'None',
        brother: state.regData.brother || state.currentUser?.brother || 'None',
        city: state.regData.city || state.currentUser?.city || '',
        village: state.regData.city || state.currentUser?.village || state.currentUser?.city || '',
        taluka: state.regData.taluka || state.currentUser?.taluka || state.regData.city || '',
        district: state.regData.district || state.currentUser?.district || '',
        address: state.regData.address || state.currentUser?.address || '',
        fullAddress: state.regData.address || state.currentUser?.fullAddress || state.currentUser?.address || '',
        full_address: state.regData.address || state.currentUser?.full_address || state.currentUser?.address || '',
        img: mainImg,
        photos: photosList.length > 0 ? photosList : [mainImg]
    };

    // All completed profiles are instantly active, approved and published live
    newProfile.accountStatus = 'active';
    newProfile.verifyStatus = 'approved';
    newProfile.paymentStatus = isGirl ? 'free' : 'unpaid';
    newProfile.visible = true;
    newProfile.registered = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    newProfile.agreedTerms = true;
    newProfile.agreedTermsAt = (state.currentUser && state.currentUser.agreedTermsAt) || new Date().toISOString();
    newProfile.email = userEmail ? userEmail.toLowerCase().trim() : ((state.regData.name || 'member').toLowerCase().replace(/\s+/g, '.') + '@gmail.com');
    newProfile.mobile = state.regData.ownMobile || state.regData.fatherMobile || '';

    // Persist newly registered member profile to Supabase PostgreSQL synchronously
    if (typeof supabaseUpsertProfile === 'function') {
        try {
            const upRes = await supabaseUpsertProfile(newProfile);
            if (upRes && upRes.id) {
                newProfile.id = upRes.id;
            }
            console.info('[Supabase] Profile registration synced live:', upRes);
            if (typeof supabaseBroadcastProfileUpsert === 'function') {
                supabaseBroadcastProfileUpsert(newProfile);
            }
        } catch (err) {
            console.warn('[Supabase] Profile registration sync notice:', err);
        }
    }

    // Keep PROFILES strictly updated
    window.PROFILES = window.PROFILES || [];
    const existPIdx = window.PROFILES.findIndex(p => p && (
        (newProfile.id && p.id == newProfile.id) ||
        (newProfile.email && p.email && p.email.toLowerCase().trim() === newProfile.email.toLowerCase().trim())
    ));
    if (existPIdx !== -1) {
        window.PROFILES[existPIdx] = { ...window.PROFILES[existPIdx], ...newProfile };
    } else {
        window.PROFILES.unshift(newProfile);
    }
    saveCommunityProfiles();

    // Sync current active user session with all 25+ fields
    state.currentUser = state.currentUser || {};
    state.currentUser.id = newProfile.id;
    state.currentUser.userId = String(newProfile.id);
    state.currentUser.profileId = newProfile.id;
    state.currentUser.profileComplete = true;
    state.currentUser.accountStatus = newProfile.accountStatus;
    state.currentUser.verifyStatus = newProfile.verifyStatus;
    state.currentUser.visible = newProfile.visible;
    state.currentUser.email = newProfile.email;
    state.currentUser.name = newProfile.name;
    state.currentUser.gender = isGirl ? 'Girl' : 'Boy';
    state.currentUser.caste = newProfile.community;
    state.currentUser.community = newProfile.community;
    state.currentUser.dob = newProfile.dob;
    state.currentUser.age = newProfile.age;
    state.currentUser.height = newProfile.height;
    state.currentUser.weight = newProfile.weight;
    state.currentUser.education = newProfile.education;
    state.currentUser.occupation = newProfile.occ;
    state.currentUser.occ = newProfile.occ;
    state.currentUser.income = newProfile.income;
    state.currentUser.marital = newProfile.marital;
    state.currentUser.physical = newProfile.physical;
    state.currentUser.hobbies = newProfile.hobbies;
    state.currentUser.father = newProfile.father;
    state.currentUser.fatherName = newProfile.father;
    state.currentUser.fatherOcc = newProfile.fatherOcc;
    state.currentUser.fatherMobile = newProfile.fatherMobile;
    state.currentUser.fatherWhatsapp = newProfile.fatherWhatsapp;
    state.currentUser.mother = newProfile.mother;
    state.currentUser.motherName = newProfile.mother;
    state.currentUser.motherOcc = newProfile.motherOcc;
    state.currentUser.sister = newProfile.sister;
    state.currentUser.brother = newProfile.brother;
    state.currentUser.city = newProfile.city;
    state.currentUser.village = newProfile.village;
    state.currentUser.taluka = newProfile.taluka;
    state.currentUser.district = newProfile.district;
    state.currentUser.address = newProfile.address;
    state.currentUser.fullAddress = newProfile.fullAddress;
    state.currentUser.full_address = newProfile.full_address;
    state.currentUser.mobile = newProfile.ownMobile || newProfile.mobile;
    state.currentUser.ownMobile = newProfile.ownMobile || newProfile.mobile;
    state.currentUser.img = newProfile.img;
    state.currentUser.photo = newProfile.img;
    state.currentUser.photos = newProfile.photos;
    state.currentUser.avatar_url = newProfile.img;
    state.currentUser.paymentStatus = isGirl ? 'Free' : (state.currentUser.paymentStatus || 'Unpaid');
    state.membershipPaid = isGirl || (state.currentUser.paymentStatus === 'Active' || state.currentUser.paymentStatus === 'paid');
    state.profileComplete = true;
    state.filters.caste = 'All'; // Default view shows all communities

    // Anti-Tamper: Seal cryptographic gender & payment signature immediately
    if (typeof computeSecureToken === 'function') {
        state.currentUser.genderToken = computeSecureToken('gender', state.currentUser.id, state.currentUser.email, state.currentUser.gender);
        if (state.currentUser.paymentStatus === 'Active' && state.currentUser.planExpiry) {
            state.currentUser.paymentToken = computeSecureToken('payment', state.currentUser.id, state.currentUser.email, state.currentUser.planExpiry);
        }
    }

    // Update users table in Supabase so profile_complete = true is recorded live
    if (typeof supabaseUpsertUser === 'function') {
        try {
            await supabaseUpsertUser({
                id: String(newProfile.id),
                email: newProfile.email,
                name: newProfile.name,
                gender: isGirl ? 'Girl' : 'Boy',
                caste: newProfile.community,
                mobile: newProfile.mobile,
                profileComplete: true,
                status: 'Active',
                paymentStatus: isGirl ? 'Free' : (state.currentUser.paymentStatus || 'Unpaid')
            });
        } catch (err) {
            console.warn('[Supabase] User profile completion sync notice:', err);
        }
    }

    // Persist completed profile status and all fields to stored accounts
    try {
        if (typeof getStoredAccounts === 'function' && typeof saveStoredAccounts === 'function') {
            const accounts = getStoredAccounts();
            const normEmail = (newProfile.email || state.currentUser?.email || state.regData?.email || '').toLowerCase().trim();
            const uIdx = accounts.findIndex(u => (normEmail && u.email && u.email.toLowerCase().trim() === normEmail) || (state.currentUser?.id && u.id === state.currentUser.id));
            if (uIdx !== -1) {
                accounts[uIdx].name = newProfile.name;
                accounts[uIdx].gender = isGirl ? 'Girl' : 'Boy';
                accounts[uIdx].caste = newProfile.community;
                accounts[uIdx].community = newProfile.community;
                accounts[uIdx].dob = newProfile.dob;
                accounts[uIdx].age = newProfile.age;
                accounts[uIdx].height = newProfile.height;
                accounts[uIdx].weight = newProfile.weight;
                accounts[uIdx].education = newProfile.education;
                accounts[uIdx].occupation = newProfile.occ;
                accounts[uIdx].occ = newProfile.occ;
                accounts[uIdx].income = newProfile.income;
                accounts[uIdx].marital = newProfile.marital;
                accounts[uIdx].physical = newProfile.physical;
                accounts[uIdx].hobbies = newProfile.hobbies;
                accounts[uIdx].father = newProfile.father;
                accounts[uIdx].fatherName = newProfile.father;
                accounts[uIdx].fatherOcc = newProfile.fatherOcc;
                accounts[uIdx].fatherMobile = newProfile.fatherMobile;
                accounts[uIdx].mother = newProfile.mother;
                accounts[uIdx].motherName = newProfile.mother;
                accounts[uIdx].motherOcc = newProfile.motherOcc;
                accounts[uIdx].sister = newProfile.sister;
                accounts[uIdx].brother = newProfile.brother;
                accounts[uIdx].mobile = newProfile.ownMobile || newProfile.mobile;
                accounts[uIdx].ownMobile = newProfile.ownMobile || newProfile.mobile;
                accounts[uIdx].city = newProfile.city;
                accounts[uIdx].village = newProfile.village;
                accounts[uIdx].taluka = newProfile.taluka;
                accounts[uIdx].district = newProfile.district;
                accounts[uIdx].address = newProfile.address;
                accounts[uIdx].fullAddress = newProfile.fullAddress;
                accounts[uIdx].img = newProfile.img;
                accounts[uIdx].photo = newProfile.img;
                accounts[uIdx].photos = newProfile.photos;
                accounts[uIdx].profileId = newProfile.id;
                accounts[uIdx].profileComplete = true;
                accounts[uIdx].genderToken = state.currentUser.genderToken;
                if (state.currentUser.paymentToken) accounts[uIdx].paymentToken = state.currentUser.paymentToken;
                if (isGirl) accounts[uIdx].paymentStatus = 'Free';
                saveStoredAccounts(accounts);
            }
        }
    } catch(e) {
        console.error('Failed to sync profileComplete to accounts store:', e);
    }

    saveCommunityProfiles();
    try {
        localStorage.setItem('mangalSetu_profileComplete', 'true');
        localStorage.setItem('mangalSetu_membershipPaid', JSON.stringify(isGirl));
        localStorage.setItem('mangalSetu_activeScreen', isGirl ? 'scr-home' : 'scr-membership');
        sessionStorage.setItem('mangalSetu_profileComplete', 'true');
        sessionStorage.setItem('mangalSetu_just_registered', 'true');
    } catch (_) {}
    if (typeof clearRegDraft === 'function') {
        clearRegDraft(newProfile.email);
    }
    saveSessionState();
    renderFilterCasteOptions();
    updateHeaderUserDisplay();

    if (isGirl) {
        state.history = ['scr-home'];
        renderHome();
        openModal('modalGirlComplete');
    } else {
        // Boy can explore Home in teaser preview, show welcome modal with option to activate pass or browse
        state.history = ['scr-home'];
        localStorage.setItem('mangalSetu_activeScreen', 'scr-home');
        renderHome();
        openModal('modalBoyComplete');
    }
}

var selectedUpiApp = 'Google Pay';
window.RAZORPAY_KEY_ID = window.RAZORPAY_KEY_ID || 'rzp_test_Tw25YYQHJqbeOA';

function selectUpiApp(appName, el) {
    selectedUpiApp = appName;
    window.selectedUpiApp = appName;
    document.querySelectorAll('.upi-option').forEach(opt => {
        opt.style.borderColor = 'var(--border)';
        opt.style.background = '#fff';
        const ic = opt.querySelector('.upi-check');
        if (ic) {
            ic.className = 'fa-regular fa-circle upi-check';
            ic.style.color = 'var(--text-faint)';
        }
    });
    if (el) {
        el.style.borderColor = 'var(--primary)';
        el.style.background = 'var(--primary-light)';
        const ic = el.querySelector('.upi-check');
        if (ic) {
            ic.className = 'fa-solid fa-circle-check upi-check';
            ic.style.color = 'var(--primary)';
        }
    }
}
window.selectUpiApp = selectUpiApp;

function copyUpiId() {
    const upi = '9726362863@ybl';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(upi).then(() => {
            if (typeof showToast === 'function') showToast('✅ UPI ID Copied: ' + upi);
        }).catch(() => {
            prompt('Copy UPI ID:', upi);
        });
    } else {
        prompt('Copy UPI ID:', upi);
    }
}
window.copyUpiId = copyUpiId;

function payViaUpiApp() {
    const upiUrl = 'upi://pay?pa=9726362863@ybl&pn=MangalSetu%20Matrimony&am=199&cu=INR';
    const isMobile = (typeof navigator !== 'undefined') && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
    if (isMobile) {
        window.location.href = upiUrl;
    } else {
        copyUpiId();
        if (typeof showToast === 'function') {
            showToast('📱 Scan QR from your mobile UPI app, or UPI ID copied!');
        }
    }
}
window.payViaUpiApp = payViaUpiApp;

async function downloadUpiQr() {
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=upi%3A%2F%2Fpay%3Fpa%3D9726362863%40ybl%26pn%3DMangalSetu%2520Matrimony%26am%3D199%26cu%3DINR';
    try {
        if (typeof showToast === 'function') showToast('⏳ Downloading QR code image...');
        const resp = await fetch(qrUrl);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'MangalSetu-UPI-QR-199.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        if (typeof showToast === 'function') {
            showToast('✅ QR Code downloaded! Open PhonePe/GPay scanner & scan from Gallery.');
        }
    } catch (_) {
        window.open(qrUrl, '_blank');
    }
}
window.downloadUpiQr = downloadUpiQr;

function sendPaymentScreenshotWhatsApp() {
    const u = (typeof state !== 'undefined' && state.currentUser) || {};
    const name = u.name || (state.regData && state.regData.name) || 'Member';
    const mobile = u.ownMobile || u.mobile || u.own_mobile || (state.regData && (state.regData.ownMobile || state.regData.mobile)) || '—';
    const email = u.email || (state.regData && state.regData.email) || '—';
    const userId = u.id || (state.regData && state.regData.id) || '—';
    const msg = `નમસ્તે મંગલસેતુ એડમિન, મેં ₹૧૯૯ પાસ માટે UPI પેમેન્ટ કર્યું છે.\n\nમારી વિગત:\n• નામ: ${name}\n• આઈડી: ${userId}\n• મોબાઇલ: ${mobile}\n• ઇમેઇલ: ${email}\n\nકૃપા કરીને આ સ્ક્રીનશોટ ચકાસીને મારો ૩૦ દિવસનો પાસ એપ્રુવ કરો.`;
    const url = `https://wa.me/919726362863?text=${encodeURIComponent(msg)}`;

    // If user is currently unpaid / expired, mark status as pending_approval
    if (state.currentUser && state.currentUser.paymentStatus !== 'Active' && state.currentUser.paymentStatus !== 'paid') {
        state.currentUser.paymentStatus = 'pending_approval';
        state.currentUser.payment_status = 'pending_approval';
        if (typeof saveSessionState === 'function') saveSessionState();
        if (typeof updateMembershipScreen === 'function') updateMembershipScreen();
        if (typeof updateHomeStats === 'function') updateHomeStats();
        if (typeof supabaseUpdateProfile === 'function' && state.currentUser.id) {
            supabaseUpdateProfile(state.currentUser.id, { payment_status: 'pending_approval' }).catch(() => {});
        }
    }

    window.open(url, '_blank');
}
window.sendPaymentScreenshotWhatsApp = sendPaymentScreenshotWhatsApp;

async function checkAndUpdatePaymentStatus() {
    if (!state.currentUser) return;
    if (typeof showToast === 'function') showToast('⏳ Checking status with server...');
    const userId = state.currentUser.id;
    const userEmail = (state.currentUser.email || '').toLowerCase().trim();

    let found = null;
    if (Array.isArray(window.PROFILES)) {
        found = window.PROFILES.find(p => p && ((p.id && String(p.id) === String(userId)) || (p.email && p.email.toLowerCase() === userEmail)));
    }

    if (typeof supabaseFetchUserById === 'function' && userId) {
        try {
            const dbProf = await supabaseFetchUserById(userId);
            if (dbProf) found = dbProf;
        } catch (_) {}
    }

    if (found && (found.paymentStatus === 'Active' || found.payment_status === 'paid' || found.paymentStatus === 'paid')) {
        state.currentUser.paymentStatus = 'Active';
        state.currentUser.payment_status = 'paid';
        if (found.planExpiry || found.plan_expiry) {
            state.currentUser.planExpiry = found.planExpiry || found.plan_expiry;
        }
        if (typeof computeSecureToken === 'function') {
            state.currentUser.paymentToken = computeSecureToken('payment', state.currentUser.id, state.currentUser.email, state.currentUser.planExpiry);
        }
        if (typeof saveSessionState === 'function') saveSessionState();
        if (typeof updateMembershipScreen === 'function') updateMembershipScreen();
        if (typeof updateHomeStats === 'function') updateHomeStats();
        if (typeof showToast === 'function') showToast('🎉 અભિનંદન! તમારો ₹૧૯૯ પાસ એપ્રુવ થઈ ગયો છે!');
    } else {
        if (typeof showToast === 'function') showToast('⏳ પેમેન્ટ હજુ ચકાસણી હેઠળ છે. એડમિન ટીમ ટૂંક સમયમાં એપ્રુવ કરશે.');
    }
}
window.checkAndUpdatePaymentStatus = checkAndUpdatePaymentStatus;

function openPaymentModal(reason = 'general') {
    closeModal('modalBoyComplete');
    closeModal('modalMembership');
    closeModal('modalCompleteProfile');

    const sub = document.getElementById('paywallModalSubtitle');
    const u = (typeof state !== 'undefined' && state.currentUser) || {};
    const passStatus = (typeof checkBoyPassStatus === 'function') ? checkBoyPassStatus(u) : { active: false };
    const isExpired = passStatus.reason === 'expired' || u.paymentStatus === 'Expired';

    if (sub) {
        if (isExpired || reason === 'renew') {
            sub.textContent = 'તમારો ૩૦ દિવસનો પાસ પૂર્ણ થઈ ગયો છે. આગળ ચેટિંગ, ઇન્ટરેસ્ટ અને વિગતો જોવા માટે ₹૧૯૯ પાસ રીન્યૂ કરો.';
        } else if (reason === 'accept') {
            sub.textContent = 'દીકરીની રિક્વેસ્ટ સ્વીકારવા અને સુરક્ષિત વાતચીત શરૂ કરવા માટે ₹૧૯૯ પાસ જરૂરી છે.';
        } else if (reason === 'decline') {
            sub.textContent = 'રિક્વેસ્ટ મેનેજ કરવા અને પ્રોફાઇલ્સ સાથે કનેક્ટ થવા માટે ₹૧૯૯ પાસ જરૂરી છે.';
        } else if (reason === 'contact') {
            sub.textContent = 'દીકરી કે પરિવારનો સંપર્ક અને વિગતો જોવા માટે ₹૧૯૯ પાસ જરૂરી છે (Contact & Chat unlock upon active pass).';
        } else if (reason === 'chat') {
            sub.textContent = 'દીકરીઓ સાથે સુરક્ષિત ચેટ કરવા માટે ₹૧૯૯ પાસ જરૂરી છે (Chat unlocks upon active pass).';
        } else if (reason === 'interest') {
            sub.textContent = 'દીકરીઓને ઇન્ટરેસ્ટ રિક્વેસ્ટ મોકલવા માટે ₹૧૯૯ પાસ જરૂરી છે (રોજના ૩ ઇન્ટરેસ્ટ).';
        } else {
            sub.textContent = 'સુરક્ષિત અને વેરિફાઇડ સંબંધો શોધવા માટે ૩૦ દિવસનો એક્સેસ પાસ';
        }
    }
    if (typeof openModal === 'function') {
        openModal('modalPaywall');
    }
}
window.openPaymentModal = openPaymentModal;

function openPaymentCheckout(reason = 'general') {
    openPaymentModal(reason);
}
window.openPaymentCheckout = openPaymentCheckout;
window.openRazorpayCheckout = openPaymentCheckout;

function processSuccessfulPayment(txnId, upiMethod) {
    if (typeof state === 'undefined') return;

    if (!state.currentUser) {
        try {
            const pendingRaw = localStorage.getItem('mangalSetu_pendingPaymentUser');
            if (pendingRaw) {
                const pending = JSON.parse(pendingRaw);
                if (typeof getStoredAccounts === 'function') {
                    const accs = getStoredAccounts();
                    const matched = accs.find(a => (pending.email && a.email && a.email.toLowerCase() === pending.email.toLowerCase()) || (pending.userId && a.id == pending.userId));
                    if (matched) state.currentUser = Object.assign({}, matched);
                }
            }
        } catch (_) {}
    }
    if (!state.currentUser && state.regData) {
        state.currentUser = Object.assign({}, state.regData);
    }
    if (!state.currentUser) return;

    // 1. Auto-heal currentUser from window.PROFILES or state.regData FIRST before sealing security tokens
    if (typeof PROFILES !== 'undefined' && Array.isArray(PROFILES)) {
        const uEmail = (state.currentUser.email || '').trim().toLowerCase();
        const curId = state.currentUser.id || state.currentUser.profileId;
        const myProf = PROFILES.find(p => p && ((uEmail && p.email && p.email.trim().toLowerCase() === uEmail) || (curId && (p.id == curId || p.userId == curId))));
        if (myProf) {
            myProf.paymentStatus = 'paid';
            if (!state.currentUser.name || state.currentUser.name === 'Member') state.currentUser.name = myProf.name;
            if (!state.currentUser.gender) state.currentUser.gender = (myProf.gender === 'girls' || myProf.gender === 'Girl') ? 'Girl' : 'Boy';
            if (!state.currentUser.caste) state.currentUser.caste = myProf.community || myProf.caste;
            if (!state.currentUser.city) state.currentUser.city = myProf.city || myProf.village || '';
            if (!state.currentUser.district) state.currentUser.district = myProf.district || '';
            if (!state.currentUser.profileId) state.currentUser.profileId = myProf.id;
        }
    }

    if (typeof state.regData !== 'undefined' && state.regData && state.regData.name) {
        if (!state.currentUser.name || state.currentUser.name === 'Member') state.currentUser.name = state.regData.name;
        if (!state.currentUser.gender) state.currentUser.gender = state.regData.gender || 'Boy';
        if (!state.currentUser.caste) state.currentUser.caste = state.regData.caste || '';
        if (!state.currentUser.city) state.currentUser.city = state.regData.city || '';
        if (!state.currentUser.district) state.currentUser.district = state.regData.district || '';
    }

    // 2. Set plan dates & active state
    state.currentUser.paymentStatus = 'Active';
    state.membershipPaid = true;
    state.profileComplete = true;
    state.currentUser.profileComplete = true;
    if (!state.currentUser.gender) state.currentUser.gender = 'Boy';

    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + 30);
    state.currentUser.planStart = today.toISOString().split('T')[0];
    state.currentUser.planExpiry = expiry.toISOString().split('T')[0];

    // 3. Cryptographic anti-tamper signature generation
    if (typeof computeSecureToken === 'function') {
        state.currentUser.paymentToken = computeSecureToken('payment', state.currentUser.id, state.currentUser.email, state.currentUser.planExpiry);
        state.currentUser.genderToken = computeSecureToken('gender', state.currentUser.id, state.currentUser.email, state.currentUser.gender);
    }
    state.currentUser.lastTxnId = txnId;

    // Sync with PROFILES in memory
    if (typeof PROFILES !== 'undefined' && Array.isArray(PROFILES)) {
        const uEmail = (state.currentUser.email || '').trim().toLowerCase();
        const curId = state.currentUser.id || state.currentUser.profileId;
        const myProf = PROFILES.find(p => p && ((uEmail && p.email && p.email.trim().toLowerCase() === uEmail) || (curId && (p.id == curId || p.userId == curId))));
        if (myProf) {
            myProf.paymentStatus = 'paid';
            myProf.planStart = state.currentUser.planStart;
            myProf.planExpiry = state.currentUser.planExpiry;
            myProf.accountStatus = 'active';
            myProf.visible = true;
            if (typeof saveCommunityProfiles === 'function') saveCommunityProfiles();
        }
    }

    // 4. Persist to stored accounts in localStorage
    if (typeof getStoredAccounts === 'function' && typeof saveStoredAccounts === 'function') {
        try {
            const accounts = getStoredAccounts();
            const normEmail = (state.currentUser.email || '').toLowerCase().trim();
            const idx = accounts.findIndex(u => (normEmail && u.email && u.email.toLowerCase().trim() === normEmail) || (state.currentUser.id && u.id == state.currentUser.id));
            if (idx !== -1) {
                accounts[idx].paymentStatus = 'Active';
                accounts[idx].planStart = state.currentUser.planStart;
                accounts[idx].planExpiry = state.currentUser.planExpiry;
                accounts[idx].paymentToken = state.currentUser.paymentToken;
                accounts[idx].genderToken = state.currentUser.genderToken;
                accounts[idx].profileComplete = true;
                if (state.currentUser.name && state.currentUser.name !== 'Member') accounts[idx].name = state.currentUser.name;
                if (state.currentUser.gender) accounts[idx].gender = state.currentUser.gender;
                if (state.currentUser.caste) accounts[idx].caste = state.currentUser.caste;
                saveStoredAccounts(accounts);
            }
        } catch (_) {}
    }

    try {
        localStorage.setItem('mangalSetu_membershipPaid', 'true');
        localStorage.setItem('mangalSetu_profileComplete', 'true');
        sessionStorage.setItem('mangalSetu_membershipPaid', 'true');
        sessionStorage.setItem('mangalSetu_profileComplete', 'true');
    } catch (_) {}

    if (typeof saveSessionState === 'function') saveSessionState();

    // 1. Record in LS_ADMIN_PAYMENTS for admin sync (100% UPI via Razorpay)
    try {
        const newTxn = {
            id: txnId || ('RZP_UPI_' + Math.floor(10000 + Math.random() * 90000)),
            userId: state.currentUser.id,
            profileId: state.currentUser.profileId,
            userEmail: state.currentUser.email,
            userName: state.currentUser.name || 'Registered Member',
            plan: 'Boys 30 Days Pass (₹199)',
            amount: 199,
            planStart: state.currentUser.planStart,
            planExpiry: state.currentUser.planExpiry,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            method: upiMethod || ('UPI (' + (selectedUpiApp || 'UPI') + ')'),
            status: 'success'
        };

        // Record payment in Supabase PostgreSQL live
        if (typeof supabaseRecordPayment === 'function') {
            supabaseRecordPayment({
                id: newTxn.id,
                userId: state.currentUser.id,
                profileId: state.currentUser.profileId,
                userName: state.currentUser.name,
                userEmail: state.currentUser.email,
                email: state.currentUser.email,
                planStart: state.currentUser.planStart,
                planExpiry: state.currentUser.planExpiry,
                method: newTxn.method,
                amount: 199
            }).catch(err => console.warn('[Supabase] Payment record notice:', err));
        }

        // Sync active payment status to Supabase public.users & public.profiles
        if (typeof supabaseUpsertUser === 'function') {
            supabaseUpsertUser({
                id: String(state.currentUser.id),
                email: state.currentUser.email,
                name: state.currentUser.name,
                gender: state.currentUser.gender || 'Boy',
                caste: state.currentUser.caste,
                paymentStatus: 'Active',
                planStart: state.currentUser.planStart,
                planExpiry: state.currentUser.planExpiry,
                profileComplete: true
            }).catch(err => console.warn('[Supabase] Payment user status sync note:', err));
        }

        if (typeof supabaseUpsertProfile === 'function') {
            const curProfiles = (Array.isArray(window.PROFILES) ? window.PROFILES : (typeof PROFILES !== 'undefined' && Array.isArray(PROFILES) ? PROFILES : []));
            const myExistingProf = curProfiles.find(p => p && (p.id == state.currentUser.id || (p.email && p.email.toLowerCase() === (state.currentUser.email || '').toLowerCase())));
            const fullProfilePayload = {
                ...(myExistingProf || {}),
                id: state.currentUser.id,
                user_id: String(state.currentUser.id),
                email: state.currentUser.email,
                name: state.currentUser.name || (myExistingProf && myExistingProf.name) || '',
                gender: state.currentUser.gender || (myExistingProf && myExistingProf.gender) || 'boys',
                community: state.currentUser.caste || (myExistingProf && myExistingProf.community) || '',
                mobile: state.currentUser.mobile || (myExistingProf && myExistingProf.mobile) || '',
                img: state.currentUser.img || state.currentUser.photo || (myExistingProf && (myExistingProf.img || myExistingProf.photo)) || '',
                paymentStatus: 'paid',
                payment_status: 'paid',
                planStart: state.currentUser.planStart,
                plan_start: state.currentUser.planStart,
                planExpiry: state.currentUser.planExpiry,
                plan_expiry: state.currentUser.planExpiry,
                accountStatus: 'active',
                account_status: 'active',
                verifyStatus: 'approved',
                verify_status: 'approved',
                visible: true
            };
            if (myExistingProf) {
                myExistingProf.paymentStatus = 'paid';
                myExistingProf.planStart = state.currentUser.planStart;
                myExistingProf.planExpiry = state.currentUser.planExpiry;
                myExistingProf.accountStatus = 'active';
                myExistingProf.visible = true;
            }
            if (typeof saveCommunityProfiles === 'function') saveCommunityProfiles();
            if (typeof updateHomeStats === 'function') updateHomeStats();

            supabaseUpsertProfile(fullProfilePayload).then(() => {
                if (typeof triggerSilentProfilesSync === 'function') triggerSilentProfilesSync(0);
                if (typeof supabaseBroadcastProfileUpsert === 'function') supabaseBroadcastProfileUpsert(fullProfilePayload);
            }).catch(err => console.warn('[Supabase] Payment profile status sync note:', err));
            if (typeof supabaseBroadcastProfileUpsert === 'function') {
                supabaseBroadcastProfileUpsert(fullProfilePayload);
            }
        }
    } catch (e) {
        console.error('Payment sync error:', e);
    }

    // Close any blocking completion or paywall dialogs
    if (typeof closeModal === 'function') {
        closeModal('modalPaywall');
        closeModal('modalBoyComplete');
        closeModal('modalCompleteProfile');
        closeModal('modalRazorpayCheckout');
    }

    if (typeof updateMembershipScreen === 'function') updateMembershipScreen();
    openModal('modalPaySuccess');
    showToast('₹199 Paid Successfully via UPI! Account Activated 🎉');
}

function processMockPayment() {
    closeModal('modalRazorpayCheckout');

    // Route to official Razorpay if a real merchant key is configured (Test or Live)
    if (window.RAZORPAY_KEY_ID && !window.RAZORPAY_KEY_ID.includes('demo') && (window.RAZORPAY_KEY_ID.startsWith('rzp_live_') || window.RAZORPAY_KEY_ID.startsWith('rzp_test_'))) {
        showToast('Connecting to Razorpay gateway...');
        if (typeof openRazorpayCheckout === 'function') {
            openRazorpayCheckout();
        }
        return;
    }

    const upiInput = document.getElementById('upiCustomVpaInput');
    const customVpa = upiInput ? upiInput.value.trim() : '';
    const methodStr = customVpa ? `UPI (${customVpa})` : `UPI (${selectedUpiApp || 'Google Pay'})`;

    showToast('Processing test payment via ' + methodStr + '...');
    setTimeout(() => {
        const txnId = 'DEMO_UPI_' + Math.floor(10000 + Math.random() * 90000);
        processSuccessfulPayment(txnId, methodStr);
    }, 600);
}

function activateDemoTestPass() {
    console.warn('[Production Guard] Demo pass activation is permanently disabled for production.');
    if (typeof showToast === 'function') {
        showToast('ડેમો પાસ બંધ છે. ₹199 પેમેન્ટ એડમિન વેરિફિકેશન પછી જ પાસ એક્ટિવ થશે.');
    }
}
window.activateDemoTestPass = activateDemoTestPass;

function resetDemoTestPass() {
    if (typeof state === 'undefined' || !state.currentUser) return;
    const u = state.currentUser;
    u.paymentStatus = 'Unpaid';
    u.payment_status = 'unpaid';
    u.planStart = null;
    u.planExpiry = null;
    state.membershipPaid = false;
    delete u.paymentToken;

    // Purge demo payments from LS_ADMIN_PAYMENTS
    try {
        const adminPayments = JSON.parse(localStorage.getItem('LS_ADMIN_PAYMENTS') || '[]');
        const filtered = adminPayments.filter(p => !(
            (String(p.userId) === String(u.id) || (p.userEmail && p.userEmail.toLowerCase() === (u.email || '').toLowerCase())) &&
            (String(p.id).startsWith('DEMO_') || String(p.plan).includes('Demo') || String(p.method).includes('Testing') || String(p.method).includes('Demo'))
        ));
        localStorage.setItem('LS_ADMIN_PAYMENTS', JSON.stringify(filtered));
        localStorage.setItem('mangalSetu_membershipPaid', 'false');
    } catch (_) {}

    // Update in window.PROFILES
    if (typeof window !== 'undefined' && Array.isArray(window.PROFILES)) {
        const pIdx = window.PROFILES.findIndex(p => p && (String(p.id) === String(u.id) || (p.email && u.email && p.email.toLowerCase() === u.email.toLowerCase())));
        if (pIdx !== -1) {
            window.PROFILES[pIdx].paymentStatus = 'unpaid';
            window.PROFILES[pIdx].payment_status = 'unpaid';
            window.PROFILES[pIdx].planExpiry = null;
            window.PROFILES[pIdx].planStart = null;
        }
    }

    if (typeof saveSessionState === 'function') saveSessionState();
    if (typeof updateMembershipScreen === 'function') updateMembershipScreen();
    showToast('પાસ રીસેટ થઈ ગયો છે (Unpaid). હવે એડમિન મંજૂરી આપશે ત્યારે જ એક્ટિવ થશે.');
    if (typeof go === 'function') go('scr-membership');
}
window.resetDemoTestPass = resetDemoTestPass;

/* ============================================================ MEMBERSHIP SCREEN UPDATE ============================================================ */
function updateMembershipScreen() {
    const memWrap = document.querySelector('#scr-membership .membership-wrap');
    if (!memWrap) return;
    const u = (typeof state !== 'undefined' && state.currentUser) || {};
    const isGirl = (typeof isGirlGender === 'function')
        ? isGirlGender(u.gender)
        : (u.gender === 'Girl' || u.gender === 'girl' || u.gender === 'girls');

    const passStatus = (typeof checkBoyPassStatus === 'function')
        ? checkBoyPassStatus(u)
        : { active: u.paymentStatus === 'Active' || isGirl, reason: isGirl ? 'free_lifetime' : (u.paymentStatus === 'Active' ? 'active' : 'unpaid'), daysLeft: 30 };

    const isPending = !isGirl && !passStatus.active && (u.paymentStatus === 'pending_approval' || u.payment_status === 'pending_approval');
    const isExpired = !isGirl && passStatus.reason === 'expired';
    const isActive = !isGirl && passStatus.active;

    // Daily interest usage
    const dailyUsage = (typeof getDailyInterestUsage === 'function')
        ? getDailyInterestUsage()
        : { count: 0, remaining: 3, limitReached: false };

    let expiryFormatted = '30 Days from Approval';
    let daysLeftDisplay = Math.min(30, Math.max(0, (typeof passStatus.daysLeft === 'number') ? passStatus.daysLeft : 30));
    let percentLeft = Math.min(100, Math.max(0, Math.round((daysLeftDisplay / 30) * 100)));
    if (u.planExpiry) {
        try {
            const expD = new Date(u.planExpiry);
            expiryFormatted = expD.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (_) {
            expiryFormatted = u.planExpiry;
        }
    }

    // ----------------------------------------------------
    // CASE 1: GIRL - 100% LIFETIME FREE
    // ----------------------------------------------------
    if (isGirl) {
        memWrap.innerHTML = `
            <!-- Header Card -->
            <div class="card" style="background:linear-gradient(135deg, #BE185D, #8B5CF6);box-shadow:0 6px 20px rgba(190,24,93,0.28);color:#fff;border-radius:16px;padding:20px;margin-bottom:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <span style="font-size:11.5px;font-weight:800;background:rgba(255,255,255,0.22);color:#fff;padding:4px 10px;border-radius:20px;display:inline-flex;align-items:center;gap:6px;backdrop-filter:blur(4px);">
                        <i class="fa-solid fa-heart" style="color:#FBCFE8;"></i> 100% LIFETIME FREE • આજીવન મફત
                    </span>
                    <i class="fa-solid fa-person-dress" style="font-size:32px;color:rgba(255,255,255,0.85);"></i>
                </div>
                <div style="font-size:20px;font-weight:800;color:#fff;line-height:1.2;">Girls 100% Free Lifetime Pass</div>
                <div style="font-size:14px;font-weight:700;color:rgba(255,255,255,0.92);margin-top:2px;">(દીકરીઓ માટે ૧૦૦% આજીવન મફત સદસ્યતા)</div>
                <div style="font-size:12.5px;color:#fff;opacity:0.95;margin-top:8px;line-height:1.45;">
                    Mangal Setu is 100% free forever for all daughters of our community. No fees, renewals, or charges ever.
                </div>
                <div style="font-size:12px;color:rgba(255,255,255,0.88);margin-top:4px;line-height:1.4;">
                    સમાજની તમામ દીકરીઓ માટે મંગલ સેતુ હંમેશા ૧૦૦% આજીવન મફત છે. કોઈ પણ પ્રકારની ફી કે ચાર્જ ચૂકવવાનો નથી.
                </div>
                <div style="background:rgba(255,255,255,0.15);padding:10px 14px;border-radius:10px;margin-top:14px;font-size:12px;border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-shield-halved" style="color:#FDE68A;"></i>
                    <span><b>Lifetime Active (આજીવન સક્રિય)</b> • No Expiry Date (કોઈ સમાપ્તિ તારીખ નથી)</span>
                </div>
            </div>

            <!-- Section Label -->
            <div class="section-label" style="display:flex;align-items:center;gap:6px;color:#15803D;font-size:13px;font-weight:800;margin:18px 0 10px;">
                <i class="fa-solid fa-circle-check"></i> Unlocked Benefits / તમારી અનલૉક સુવિધાઓ
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:22px;">
                <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                    <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                        <i class="fa-solid fa-eye" style="color:#16A34A;"></i> Unlimited Profile Views
                    </div>
                    <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                        અમર્યાદિત પ્રોફાઇલ વિઝિટ
                    </div>
                    <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                        Browse every verified groom profile with complete biodata without any limitations.
                    </div>
                    <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                        સમાજના તમામ વેરિફાઇડ યુવકોની પ્રોફાઇલ કોઈ પણ લિમિટ વગર જોઈ શકો છો.
                    </div>
                </div>
                <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                    <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                        <i class="fa-solid fa-comments" style="color:#16A34A;"></i> 100% Free Chatting
                    </div>
                    <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                        મફત ચેટિંગ અને વાતચીત
                    </div>
                    <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                        Accept interest requests and chat safely with verified grooms inside the app.
                    </div>
                    <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                        યુવકો દ્વારા મોકલાયેલ ઇન્ટરેસ્ટ સ્વીકારો અને એપમાં સુરક્ષિત ચેટ કરો.
                    </div>
                </div>
                <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                    <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                        <i class="fa-solid fa-lock" style="color:#16A34A;"></i> Complete Privacy & Protection
                    </div>
                    <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                        સંપૂર્ણ સુરક્ષા અને પ્રાઇવસી
                    </div>
                    <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                        Your photos and contact details are securely protected and visible only to approved matches.
                    </div>
                    <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                        તમારો ફોટો અને સંપર્ક વિગતો ફક્ત મંજૂર થયેલા સભ્યોને જ સુરક્ષિત રીતે દેખાય છે.
                    </div>
                </div>
            </div>

            <button type="button" class="btn btn-primary" onclick="setTab('boys');go('scr-browse')"
                style="width:100%;padding:14px;font-size:15px;font-weight:800;border-radius:12px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:8px;">
                <i class="fa-solid fa-magnifying-glass"></i> Browse Grooms (દીકરાઓની પ્રોફાઇલ્સ જુઓ)
            </button>
        `;
        return;
    }

    // ----------------------------------------------------
    // CASE 2: BOY - ACTIVE 30-DAY PASS (Approved)
    // ----------------------------------------------------
    if (isActive) {
        memWrap.innerHTML = `
            <!-- Active Header Card -->
            <div class="card" style="background:linear-gradient(135deg, #7B2CBF, #9D4EDD);box-shadow:0 6px 20px rgba(123,44,191,0.28);color:#fff;border-radius:16px;padding:20px;margin-bottom:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <span style="font-size:11.5px;font-weight:800;background:rgba(255,255,255,0.22);color:#fff;padding:4px 10px;border-radius:20px;display:inline-flex;align-items:center;gap:6px;backdrop-filter:blur(4px);">
                        <i class="fa-solid fa-crown" style="color:#FCD34D;"></i> ACTIVE PLAN • સક્રિય પ્લાન (₹199)
                    </span>
                    <i class="fa-solid fa-medal" style="font-size:32px;color:#FCD34D;"></i>
                </div>
                <div style="font-size:20px;font-weight:800;color:#fff;line-height:1.2;">Boys 30-Day Premium Pass</div>
                <div style="font-size:14px;font-weight:700;color:rgba(255,255,255,0.92);margin-top:2px;">(યુવકો માટે ૩૦ દિવસનો પ્રીમિયમ પાસ)</div>
                <div style="font-size:12.5px;color:#fff;opacity:0.95;margin-top:8px;line-height:1.45;">
                    Your pass is verified and approved by admin. Full community access is active.
                </div>
                <div style="font-size:12px;color:rgba(255,255,255,0.85);margin-top:3px;line-height:1.4;">
                    તમારો પાસ એડમિન દ્વારા મંજૂર કરાયેલ છે અને સંપૂર્ણ એક્ટિવ છે.
                </div>

                <!-- Total Validity & Days Remaining Grid -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;background:rgba(255,255,255,0.12);padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.18);">
                    <div>
                        <div style="font-size:11px;opacity:0.85;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Total Validity</div>
                        <div style="font-size:10.5px;opacity:0.8;font-weight:600;">(કુલ માન્યતા)</div>
                        <div style="font-size:18px;font-weight:800;margin-top:2px;">30 Days</div>
                        <div style="font-size:11px;opacity:0.85;">(૩૦ દિવસ)</div>
                    </div>
                    <div style="border-left:1px solid rgba(255,255,255,0.2);padding-left:12px;">
                        <div style="font-size:11px;opacity:0.85;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Days Remaining</div>
                        <div style="font-size:10.5px;opacity:0.8;font-weight:600;">(બાકી દિવસો)</div>
                        <div style="font-size:18px;font-weight:800;color:#FCD34D;margin-top:2px;">${daysLeftDisplay} Days</div>
                        <div style="font-size:11px;opacity:0.85;">(${daysLeftDisplay} દિવસ બાકી)</div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div style="margin-top:14px;">
                    <div style="display:flex;justify-content:space-between;font-size:11px;opacity:0.88;margin-bottom:4px;">
                        <span>${daysLeftDisplay} / 30 Days Left (${daysLeftDisplay} દિવસ બાકી)</span>
                        <span>Valid Till: ${expiryFormatted}</span>
                    </div>
                    <div style="width:100%;height:6px;background:rgba(255,255,255,0.25);border-radius:6px;overflow:hidden;">
                        <div style="width:${percentLeft}%;height:100%;background:#FCD34D;border-radius:6px;"></div>
                    </div>
                </div>
            </div>

            <!-- Daily Quota Tracker -->
            <div style="background:#F0FDF4;border:1.2px solid #BBF7D0;border-radius:12px;padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                <div>
                    <div style="font-size:12.5px;font-weight:800;color:#166534;">
                        <i class="fa-solid fa-heart" style="color:#16A34A;margin-right:4px;"></i> Daily Interest Quota / આજનો ઇન્ટરેસ્ટ ક્વોટા
                    </div>
                    <div style="font-size:11.5px;color:#15803D;margin-top:2px;">
                        ${dailyUsage.count}/3 Used (વપરાયેલ) • <b>${dailyUsage.remaining} Left Today (આજે બાકી)</b>
                    </div>
                </div>
                <span style="font-size:11px;font-weight:800;background:#DCFCE7;color:#166534;padding:4px 8px;border-radius:8px;">Resets Every 24h (૨૪ કલાકે રીસેટ)</span>
            </div>

            <!-- Active Benefits Checklist -->
            <div class="section-label" style="display:flex;align-items:center;gap:6px;color:#15803D;font-size:13px;font-weight:800;margin:18px 0 10px;">
                <i class="fa-solid fa-circle-check"></i> Active Benefits / તમારી અનલૉક સુવિધાઓ
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
                <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                    <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                        <i class="fa-solid fa-heart-circle-check" style="color:#16A34A;"></i> 3 Daily Interest Requests
                    </div>
                    <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                        દરરોજ ૩ ઇન્ટરેસ્ટ રિક્વેસ્ટ
                    </div>
                    <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                        Send up to 3 interest requests per day to connect with suitable brides (up to 90 total).
                    </div>
                    <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                        ૩૦ દિવસ સુધી દરરોજ ૩ મનપસંદ પાત્રોને કનેક્ટ થવા માટે રિક્વેસ્ટ મોકલો (કુલ ૯૦ સુધી).
                    </div>
                </div>
                <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                    <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                        <i class="fa-solid fa-comments" style="color:#16A34A;"></i> Direct 1-on-1 Safe Chat
                    </div>
                    <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                        ડાયરેક્ટ ૧-ટુ-૧ સુરક્ષિત ચેટ
                    </div>
                    <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                        Start direct private conversations instantly inside the app once the bride accepts your request.
                    </div>
                    <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                        દીકરી દ્વારા રિક્વેસ્ટ સ્વીકારાય એટલે તરત જ સીધી વાતચીત શરૂ કરો.
                    </div>
                </div>
                <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                    <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                        <i class="fa-solid fa-phone" style="color:#16A34A;"></i> Contact & WhatsApp Access
                    </div>
                    <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                        સંપર્ક અને WhatsApp નંબર અનલોક
                    </div>
                    <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                        View verified mobile and WhatsApp numbers of the girl and parents upon mutual interest acceptance.
                    </div>
                    <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                        બંને પક્ષની પરસ્પર સંમતિથી દીકરી કે વાલીનો સંપર્ક નંબર ઉપલબ્ધ થાય છે.
                    </div>
                </div>
                <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                    <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                        <i class="fa-solid fa-id-card" style="color:#16A34A;"></i> Complete Biodata & Family Details
                    </div>
                    <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                        સંપૂર્ણ બાયોડેટા અને મોસાળ વિગતો
                    </div>
                    <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                        Access full background, maternal (mosal) family details, occupation, and verified address.
                    </div>
                    <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                        મોસાળ, વ્યવસાય, શિક્ષણ અને કૌટુંબિક ચકાસાયેલ માહિતી ખુલ્લી છે.
                    </div>
                </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;">
                <button type="button" class="btn btn-primary" onclick="setTab('girls');go('scr-browse')"
                    style="width:100%;padding:14px;font-size:14.5px;font-weight:800;border-radius:12px;">
                    <i class="fa-solid fa-magnifying-glass"></i> Browse Brides (દીકરીઓની પ્રોફાઇલ્સ જુઓ)
                </button>
                <button type="button" class="btn btn-outline" onclick="openPaymentHistoryModal()"
                    style="border:1.2px solid #E5E7EB;color:#4B5563;font-size:12.5px;padding:10px;border-radius:10px;">
                    <i class="fa-solid fa-receipt"></i> View Payment History (પેમેન્ટ હિસ્ટ્રી જુઓ)
                </button>
            </div>
        `;
        return;
    }

    // ----------------------------------------------------
    // CASE 3: BOY - PENDING APPROVAL
    // ----------------------------------------------------
    if (isPending) {
        memWrap.innerHTML = `
            <!-- Pending Header Card -->
            <div class="card" style="background:#FFFBEB;border:1.5px solid #FCD34D;border-radius:16px;padding:20px;margin-bottom:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <span style="font-size:11.5px;font-weight:800;background:#FEF3C7;color:#B45309;padding:4px 10px;border-radius:20px;display:inline-flex;align-items:center;gap:6px;">
                        <i class="fa-solid fa-clock-rotate-left"></i> PENDING APPROVAL • ચકાસણી ચાલુ છે
                    </span>
                    <i class="fa-solid fa-hourglass-half" style="font-size:28px;color:#D97706;"></i>
                </div>
                <div style="font-size:19px;font-weight:800;color:#92400E;line-height:1.25;">Payment Verification Pending</div>
                <div style="font-size:14px;font-weight:700;color:#B45309;margin-top:2px;">(પેમેન્ટ ચકાસણી હેઠળ છે)</div>
                <div style="font-size:12.5px;color:#78350F;margin-top:8px;line-height:1.45;">
                    We have received your <b>₹199 payment request</b>. Admin team is verifying your payment screenshot on WhatsApp and will activate your 30-day pass shortly.
                </div>
                <div style="font-size:12px;color:#92400E;margin-top:4px;line-height:1.4;">
                    અમને તમારી <b>₹૧૯૯ પેમેન્ટ વિનંતી</b> મળી ગઈ છે. એડમિન ટીમ વોટ્સએપ પર મળેલ સ્ક્રીનશોટ ચકાસીને ટૂંક સમયમાં તમારો ૩૦ દિવસનો પાસ સક્રિય કરશે.
                </div>
                <div style="background:#fff;padding:10px 14px;border-radius:10px;margin-top:14px;font-size:12px;border:1px solid #FDE68A;color:#78350F;display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-clock" style="color:#D97706;"></i>
                    <div>
                        <div><b>Verification Time:</b> Usually approved within 4 to 6 hours.</div>
                        <div style="font-size:11px;color:#92400E;margin-top:2px;">(સામાન્ય રીતે ૪ થી ૬ કલાકમાં પાસ એપ્રુવ થઈ જાય છે.)</div>
                    </div>
                </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:12px;margin-top:20px;">
                <button type="button" class="btn" onclick="sendPaymentScreenshotWhatsApp()"
                    style="background:#25D366;color:#fff;width:100%;padding:13px;font-size:14px;font-weight:800;border:none;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 3px 10px rgba(37,211,102,0.3);">
                    <i class="fa-brands fa-whatsapp" style="font-size:18px;"></i> 📲 Send / Re-send Screenshot on WhatsApp (સ્ક્રીનશોટ મોકલો)
                </button>
                <button type="button" class="btn btn-outline" onclick="checkAndUpdatePaymentStatus()"
                    style="border:1.2px solid #D1D5DB;background:#fff;color:#374151;font-size:13px;font-weight:700;padding:11px;border-radius:10px;cursor:pointer;">
                    <i class="fa-solid fa-arrows-rotate"></i> Check Status (રિફ્રેશ કરો)
                </button>
                <button type="button" class="btn btn-outline" onclick="openPaymentHistoryModal()"
                    style="border:1.2px solid #E5E7EB;color:#4B5563;font-size:12.5px;padding:10px;border-radius:10px;">
                    <i class="fa-solid fa-receipt"></i> View Payment History (પેમેન્ટ હિસ્ટ્રી જુઓ)
                </button>
            </div>
        `;
        return;
    }

    // ----------------------------------------------------
    // CASE 4: BOY - EXPIRED PASS
    // ----------------------------------------------------
    if (isExpired) {
        memWrap.innerHTML = `
            <!-- Expired Header Card -->
            <div class="card" style="background:#FFF1F2;border:1.5px solid #FECDD3;border-radius:16px;padding:18px;margin-bottom:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                    <span style="font-size:11.5px;font-weight:800;background:#FEE2E2;color:#BE123C;padding:4px 10px;border-radius:20px;display:inline-flex;align-items:center;gap:6px;">
                        <i class="fa-solid fa-clock-rotate-left"></i> PASS EXPIRED • પ્લાન પૂર્ણ થઈ ગયો છે
                    </span>
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:24px;color:#F43F5E;"></i>
                </div>
                <div style="font-size:19px;font-weight:800;color:#881337;line-height:1.25;">Your 30-Day Pass Has Expired</div>
                <div style="font-size:14px;font-weight:700;color:#9F1239;margin-top:2px;">(તમારો ૩૦ દિવસનો પાસ પૂર્ણ થયો છે)</div>
                <div style="font-size:12.5px;color:#4C0519;margin-top:8px;line-height:1.45;">
                    Your ₹199 pass expired on <b>${expiryFormatted}</b>. Bride profiles and chat features are locked. Renew your 30-day pass for ₹199 to continue connecting.
                </div>
                <div style="font-size:12px;color:#881337;margin-top:4px;line-height:1.4;">
                    તમારો ₹૧૯૯ પાસ <b>${expiryFormatted}</b> ના રોજ પૂર્ણ થઈ ગયો છે. ફરીથી દીકરીઓ સાથે ચેટ કરવા અને ઇન્ટરેસ્ટ મોકલવા માટે ₹૧૯૯ માં રીન્યૂ કરો.
                </div>
            </div>

            <!-- Renewal Actions -->
            <div style="display:flex;flex-direction:column;gap:12px;margin-top:20px;">
                <button type="button" class="btn" onclick="openPaymentCheckout('renew')"
                    style="background:linear-gradient(135deg,var(--primary),#9D4EDD);color:#fff;width:100%;padding:14px;font-size:15px;font-weight:800;border:none;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 4px 14px rgba(123,44,191,0.28);">
                    <i class="fa-solid fa-bolt" style="color:#FCD34D;"></i> Renew 30-Day Pass (₹૧૯૯ માં રીન્યૂ કરો)
                </button>
                <button type="button" class="btn" onclick="sendPaymentScreenshotWhatsApp()"
                    style="background:#E7F5EC;color:#1D7A44;border:1.5px solid #A3E6B4;width:100%;padding:12px 14px;font-size:13.5px;font-weight:800;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;">
                    <i class="fa-brands fa-whatsapp" style="font-size:18px;color:#1D7A44;"></i> 📲 Send Renewal Screenshot on WhatsApp (રીન્યૂ સ્ક્રીનશોટ મોકલો)
                </button>
                <button type="button" class="btn btn-outline" onclick="openPaymentHistoryModal()"
                    style="margin-top:4px;border:1.2px solid #E5E7EB;color:#4B5563;font-size:12.5px;padding:10px;border-radius:10px;">
                    <i class="fa-solid fa-receipt"></i> View Payment History (પેમેન્ટ હિસ્ટ્રી જુઓ)
                </button>
            </div>
        `;
        return;
    }

    // ----------------------------------------------------
    // CASE 5: BOY - UNPAID / NO ACTIVE PLAN (Default)
    // ----------------------------------------------------
    memWrap.innerHTML = `
        <!-- Header Card: No Active Plan -->
        <div class="card" style="background:#FFF1F2;border:1.5px solid #FECDD3;border-radius:16px;padding:18px;margin-bottom:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <span style="font-size:11.5px;font-weight:800;background:#FEE2E2;color:#BE123C;padding:4px 10px;border-radius:20px;display:inline-flex;align-items:center;gap:6px;">
                    <i class="fa-solid fa-lock"></i> NO ACTIVE PLAN • કોઈ પ્લાન સક્રિય નથી
                </span>
                <i class="fa-solid fa-shield-halved" style="font-size:26px;color:#F43F5E;opacity:0.85;"></i>
            </div>
            <div style="font-size:19px;font-weight:800;color:#881337;line-height:1.25;">No Active Membership Plan</div>
            <div style="font-size:14px;font-weight:700;color:#9F1239;margin-top:2px;">(તમારો કોઈ પ્લાન સક્રિય નથી)</div>
            <div style="font-size:12.5px;color:#4C0519;margin-top:8px;line-height:1.45;">
                Your profile is 100% verified. To connect with brides, send interests, and unlock direct chat, a <b>30-Day Pass (₹199)</b> is required.
            </div>
            <div style="font-size:12px;color:#881337;margin-top:4px;line-height:1.4;">
                તમારી પ્રોફાઇલ ૧૦૦% વેરિફાઇડ છે, પરંતુ દીકરીઓ સાથે જોડાવા અને વાતચીત કરવા માટે <b>₹૧૯૯ નો ૩૦ દિવસનો પાસ</b> જરૂરી છે.
            </div>
        </div>

        <!-- SECTION 1: ❌ CURRENT LIMITATIONS (હાલમાં આ સુવિધાઓ બંધ છે) -->
        <div class="section-label" style="display:flex;align-items:center;gap:6px;color:#B91C1C;font-size:13px;font-weight:800;margin:18px 0 10px;">
            <i class="fa-solid fa-ban"></i> Current Limitations / હાલમાં આ સુવિધાઓ બંધ છે
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px;">
            <div style="background:#fff;border:1.2px solid #FEE2E2;border-left:4px solid #EF4444;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                <div style="font-weight:700;font-size:13.5px;color:#991B1B;display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-circle-xmark" style="color:#EF4444;"></i> Cannot Send Interest Requests
                </div>
                <div style="font-size:12px;font-weight:600;color:#B91C1C;margin-top:1px;padding-left:22px;">
                    ઇન્ટરેસ્ટ મોકલી શકતા નથી
                </div>
                <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                    The "I'm Interested" button on bride profiles is locked. No match requests can be sent without an active pass.
                </div>
                <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                    દીકરીઓની પ્રોફાઇલમાં "I'm Interested" મોકલવાની સુવિધા બંધ છે. પાસ વગર કોઈ રિક્વેસ્ટ જશે નહીં.
                </div>
            </div>

            <div style="background:#fff;border:1.2px solid #FEE2E2;border-left:4px solid #EF4444;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                <div style="font-weight:700;font-size:13.5px;color:#991B1B;display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-circle-xmark" style="color:#EF4444;"></i> Direct 1-on-1 Chat Locked
                </div>
                <div style="font-size:12px;font-weight:600;color:#B91C1C;margin-top:1px;padding-left:22px;">
                    ડાયરેક્ટ ૧-ટુ-૧ ચેટ બંધ છે
                </div>
                <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                    You cannot initiate private chats or exchange messages with brides without pass activation.
                </div>
                <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                    દીકરીઓ સાથે પ્રાઇવેટ મેસેજિંગ કે વાતચીત શરૂ કરી શકાતી નથી.
                </div>
            </div>

            <div style="background:#fff;border:1.2px solid #FEE2E2;border-left:4px solid #EF4444;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                <div style="font-weight:700;font-size:13.5px;color:#991B1B;display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-circle-xmark" style="color:#EF4444;"></i> Contact & WhatsApp Numbers Locked
                </div>
                <div style="font-size:12px;font-weight:600;color:#B91C1C;margin-top:1px;padding-left:22px;">
                    ફોન અને WhatsApp નંબર લૉક
                </div>
                <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                    Direct phone and WhatsApp numbers of the girl and her family remain masked and hidden.
                </div>
                <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                    દીકરી કે તેમના પરિવારનો મોબાઈલ / WhatsApp નંબર જોઈ શકાતો નથી.
                </div>
            </div>

            <div style="background:#fff;border:1.2px solid #FEE2E2;border-left:4px solid #EF4444;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                <div style="font-weight:700;font-size:13.5px;color:#991B1B;display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-circle-xmark" style="color:#EF4444;"></i> Family & Mosal Details Hidden
                </div>
                <div style="font-size:12px;font-weight:600;color:#B91C1C;margin-top:1px;padding-left:22px;">
                    પરિવાર અને મોસાળની વિગતો લૉક
                </div>
                <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                    Complete home address, maternal (mosal) background, and detailed family info remain locked.
                </div>
                <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                    સંપૂર્ણ સરનામું, મોસાળ અને કૌટુંબિક ઊંડાણપૂર્વકની માહિતી બંધ છે.
                </div>
            </div>
        </div>

        <!-- SECTION 2: ✅ WHAT YOU GET WITH ₹199 PASS (₹૧૯૯ પાસ એક્ટિવ કરવાથી શું મળશે?) -->
        <div class="section-label" style="display:flex;align-items:center;gap:6px;color:#15803D;font-size:13px;font-weight:800;margin:18px 0 10px;">
            <i class="fa-solid fa-circle-check"></i> What You Get with ₹199 Pass / ₹૧૯૯ પાસ એક્ટિવ કરવાથી શું મળશે?
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
            <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-heart-circle-check" style="color:#16A34A;"></i> 3 Daily Interest Requests
                </div>
                <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                    દરરોજ ૩ ઇન્ટરેસ્ટ રિક્વેસ્ટ
                </div>
                <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                    Send up to 3 interest requests every 24 hours to connect with suitable brides (up to 90 total).
                </div>
                <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                    ૩૦ દિવસ સુધી દરરોજ ૩ મનપસંદ પાત્રોને કનેક્ટ થવા માટે રિક્વેસ્ટ મોકલો (કુલ ૯૦ સુધી).
                </div>
            </div>

            <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-comments" style="color:#16A34A;"></i> Direct 1-on-1 Safe Chat
                </div>
                <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                    ડાયરેક્ટ ૧-ટુ-૧ સુરક્ષિત ચેટ
                </div>
                <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                    Chat securely in the app as soon as your interest request is accepted by the bride.
                </div>
                <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                    દીકરી દ્વારા રિક્વેસ્ટ સ્વીકારાય એટલે તરત જ સીધી વાતચીત શરૂ કરો.
                </div>
            </div>

            <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-phone" style="color:#16A34A;"></i> Contact & WhatsApp Access
                </div>
                <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                    સંપર્ક અને WhatsApp નંબર અનલોક
                </div>
                <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                    View verified phone and WhatsApp numbers of the bride and her parents upon mutual consent.
                </div>
                <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                    બંને પક્ષની પરસ્પર સંમતિથી દીકરી કે વાલીનો સંપર્ક નંબર ઉપલબ્ધ થાય છે.
                </div>
            </div>

            <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-id-card" style="color:#16A34A;"></i> Complete Biodata & Family Details
                </div>
                <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                    સંપૂર્ણ બાયોડેટા અને મોસાળ વિગતો
                </div>
                <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                    Access complete matrimonial biodata, maternal (mosal) details, occupation, and verified address.
                </div>
                <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                    મોસાળ, વ્યવસાય, શિક્ષણ અને કૌટુંબિક ચકાસાયેલ માહિતી ખુલ્લી છે.
                </div>
            </div>

            <div style="background:#fff;border:1.2px solid #DCFCE7;border-left:4px solid #16A34A;border-radius:10px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                <div style="font-weight:700;font-size:13.5px;color:#14532D;display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-calendar-check" style="color:#16A34A;"></i> Full 30-Day Validity
                </div>
                <div style="font-size:12px;font-weight:600;color:#15803D;margin-top:1px;padding-left:22px;">
                    ૩૦ દિવસની સંપૂર્ણ માન્યતા
                </div>
                <div style="font-size:12px;color:#374151;margin-top:4px;padding-left:22px;line-height:1.4;">
                    Enjoy uninterrupted access for 30 full days with no recurring or hidden fees.
                </div>
                <div style="font-size:11.5px;color:#6B7280;margin-top:3px;padding-left:22px;line-height:1.4;">
                    કોઈ છુપા ચાર્જ વગર સંપૂર્ણ ૩૦ દિવસ સુધી અનલિમિટેડ એક્સેસ મળે છે.
                </div>
            </div>
        </div>

        <!-- SECTION 3: ACTION BUTTONS (બટનો) -->
        <div style="display:flex;flex-direction:column;gap:12px;">
            <!-- 1. Pay ₹199 via UPI Button -->
            <button type="button" class="btn" onclick="openPaymentCheckout('plan_page')"
                style="background:linear-gradient(135deg,var(--primary),#9D4EDD);color:#fff;width:100%;padding:14px;font-size:15px;font-weight:800;border:none;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 4px 14px rgba(123,44,191,0.28);">
                <i class="fa-solid fa-bolt" style="color:#FCD34D;"></i> Pay ₹199 via UPI (પાસ એક્ટિવ કરો)
            </button>

            <!-- 2. Send Payment Screenshot on WhatsApp -->
            <button type="button" class="btn" onclick="sendPaymentScreenshotWhatsApp()"
                style="background:#E7F5EC;color:#1D7A44;border:1.5px solid #A3E6B4;width:100%;padding:12px 14px;font-size:13.5px;font-weight:800;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                <i class="fa-brands fa-whatsapp" style="font-size:18px;color:#1D7A44;"></i> 📲 Send Payment Screenshot on WhatsApp (પેમેન્ટ સ્ક્રીનશોટ મોકલો)
            </button>

            <!-- Helper Note -->
            <div style="background:#F9FAFB;border:1px dashed #D1D5DB;border-radius:10px;padding:10px 14px;font-size:11.5px;color:#4B5563;line-height:1.45;text-align:left;">
                <div>💡 <b>Already Paid?</b> If you made payment via GPay / PhonePe / Paytm and closed the window, click the WhatsApp button above to send your transaction screenshot.</div>
                <div style="color:#6B7280;margin-top:4px;border-top:1px dashed #E5E7EB;padding-top:4px;">
                    💡 <b>પેમેન્ટ કરી દીધું છે?</b> જો તમે પેમેન્ટ કર્યા પછી સ્ક્રીન ભૂલથી બંધ કરી દીધી હોય, તો ઉપરના WhatsApp બટન પર ક્લિક કરીને સીધો સ્ક્રીનશોટ મોકલી આપો.
                </div>
            </div>

            <!-- 3. View Payment History -->
            <button type="button" class="btn btn-outline" onclick="openPaymentHistoryModal()"
                style="margin-top:2px;border:1.2px solid #E5E7EB;color:#4B5563;font-size:12.5px;padding:10px;border-radius:10px;">
                <i class="fa-solid fa-receipt"></i> View Payment History (પેમેન્ટ હિસ્ટ્રી જુઓ)
            </button>
        </div>
    `;
}
window.updateMembershipScreen = updateMembershipScreen;

/* ============================================================ PHOTO CAROUSEL MODAL (2-3 PHOTOS) ============================================================ */
let currentCarouselPhotos = [];
let currentCarouselIdx = 0;

function openPhotoCarousel(profileId, event, initialIdx = 0) {
    if (event) event.stopPropagation();
    const p = (typeof findProfile === 'function') ? findProfile(profileId) : (window.PROFILES || []).find(x => x.id === profileId || String(x.id) === String(profileId));
    if (!p) return;
    const isProfileGirl = typeof isGirlGender === 'function' ? isGirlGender(p.gender) : (p.gender === 'girls' || p.gender === 'Girl');
    const fallbackImg = isProfileGirl ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop';

    // Prioritize actual main image in the profile so the slider opens the EXACT current photo
    let photos = [];
    const isSelf = (typeof isSelfProfile === 'function') ? isSelfProfile(p) : false;
    const sourceObj = (isSelf && state.currentUser) ? state.currentUser : p;

    if (Array.isArray(sourceObj.photos) && sourceObj.photos.length > 0) {
        photos = sourceObj.photos.filter(Boolean);
    }
    const currentHeroImg = sourceObj.img || sourceObj.photo || p.img || p.photo;
    if (currentHeroImg) {
        if (!photos.includes(currentHeroImg)) {
            photos.unshift(currentHeroImg);
        } else {
            const heroIdx = photos.indexOf(currentHeroImg);
            if (heroIdx > 0 && initialIdx === 0) {
                photos.splice(heroIdx, 1);
                photos.unshift(currentHeroImg);
            }
        }
    }
    if (!photos || photos.length === 0) {
        photos = [fallbackImg];
    }

    currentCarouselPhotos = photos;
    currentCarouselIdx = (typeof initialIdx === 'number' && initialIdx >= 0 && initialIdx < photos.length) ? initialIdx : 0;

    const imgEl = document.getElementById('carouselImg') || document.getElementById('photoCarouselImg');
    const countEl = document.getElementById('carouselCounter') || document.getElementById('photoCarouselCount');
    const dotsWrap = document.getElementById('carouselDots') || document.getElementById('photoCarouselDots');

    if (imgEl) {
        const targetPhoto = photos[currentCarouselIdx] || photos[0];
        const optimizedCarouselImg = (typeof getCarouselImageUrl === 'function') ? getCarouselImageUrl(targetPhoto) : targetPhoto;
        imgEl.onerror = null;
        imgEl.src = optimizedCarouselImg;
        imgEl.onerror = function() {
            this.onerror = null;
            this.src = targetPhoto || fallbackImg;
        };
    }
    if (countEl) countEl.textContent = `${currentCarouselIdx + 1} / ${photos.length}`;
    if (dotsWrap) {
        dotsWrap.innerHTML = photos.map((_, i) => `<span class="carousel-dot ${i === currentCarouselIdx ? 'active' : ''}" onclick="selectCarouselPhoto(${i})"></span>`).join('');
    }

    const prevBtn = document.querySelector('.carousel-btn.prev') || document.getElementById('photoCarouselPrev');
    const nextBtn = document.querySelector('.carousel-btn.next') || document.getElementById('photoCarouselNext');
    if (prevBtn) prevBtn.style.display = photos.length > 1 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = photos.length > 1 ? 'flex' : 'none';

    openModal('modalPhotoCarousel');
}

function nextCarouselPhoto(e) {
    if (e) e.stopPropagation();
    if (!currentCarouselPhotos.length) return;
    currentCarouselIdx = (currentCarouselIdx + 1) % currentCarouselPhotos.length;
    updateCarouselView();
}

function prevCarouselPhoto(e) {
    if (e) e.stopPropagation();
    if (!currentCarouselPhotos.length) return;
    currentCarouselIdx = (currentCarouselIdx - 1 + currentCarouselPhotos.length) % currentCarouselPhotos.length;
    updateCarouselView();
}

function updateCarouselView() {
    const imgEl = document.getElementById('carouselImg') || document.getElementById('photoCarouselImg');
    const countEl = document.getElementById('carouselCounter') || document.getElementById('photoCarouselCount');
    const dotsWrap = document.getElementById('carouselDots') || document.getElementById('photoCarouselDots');

    if (imgEl && currentCarouselPhotos[currentCarouselIdx]) {
        const rawPhoto = currentCarouselPhotos[currentCarouselIdx];
        const optimizedCarouselImg = (typeof getCarouselImageUrl === 'function') ? getCarouselImageUrl(rawPhoto) : rawPhoto;
        imgEl.src = optimizedCarouselImg;
    }
    if (countEl) countEl.textContent = `${currentCarouselIdx + 1} / ${currentCarouselPhotos.length}`;
    if (dotsWrap) {
        const dots = dotsWrap.querySelectorAll('.carousel-dot, .pdot');
        dots.forEach((d, i) => d.classList.toggle('active', i === currentCarouselIdx));
    }
}

function selectCarouselPhoto(idx) {
    if (idx >= 0 && idx < currentCarouselPhotos.length) {
        currentCarouselIdx = idx;
        updateCarouselView();
    }
}

function closePhotoCarousel() {
    const el = document.getElementById('modalPhotoCarousel');
    if (el) el.classList.remove('open');
    document.body.style.overflow = '';
}

function closeCarouselOnBackdrop(e) {
    if (e.target.id === 'modalPhotoCarousel') {
        closePhotoCarousel();
    }
}

window.addEventListener('keydown', (e) => {
    const carousel = document.getElementById('modalPhotoCarousel');
    if (carousel && carousel.classList.contains('open')) {
        if (e.key === 'ArrowLeft') prevCarouselPhoto();
        else if (e.key === 'ArrowRight') nextCarouselPhoto();
        else if (e.key === 'Escape') closePhotoCarousel();
    }
});


/* ============================================================ FULL PROFILE ACTIONS ============================================================ */
function setInterestBtnState(btn, pid) {
    if (!btn) return;
    const profileId = Number(pid);
    btn.dataset.pid = profileId;

    const status = (typeof interestStatusFor === 'function') 
        ? interestStatusFor(profileId) 
        : (typeof getEffectiveInterestStatus === 'function' ? getEffectiveInterestStatus(profileId) : null);

    btn.classList.remove('btn-sent', 'btn-accepted');
    btn.removeAttribute('disabled');
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';

    const discWrap = document.getElementById('profileDisconnectActionWrap');
    if (discWrap) {
        discWrap.style.display = (status === 'accepted') ? 'block' : 'none';
    }

    const secTitle = document.getElementById('profileActionsSectionTitle');
    const secDesc = document.getElementById('profileActionsSectionDesc');

    // Unpaid / Expired Boy Teaser Guard: prompt pass modal
    const isViewerBoy = state.currentUser && (typeof isBoyGender === 'function' ? isBoyGender(state.currentUser.gender) : (state.currentUser.gender === 'Boy' || state.currentUser.gender === 'boy'));
    const passStatus = (typeof checkBoyPassStatus === 'function' && state.currentUser) ? checkBoyPassStatus(state.currentUser) : { active: false };
    const isViewerUnpaidBoy = isViewerBoy && (!passStatus.active);
    const isExpired = passStatus.reason === 'expired' || (state.currentUser && state.currentUser.paymentStatus === 'Expired');

    if (isViewerUnpaidBoy) {
        if (status === 'accepted') {
            if (secTitle) secTitle.innerHTML = '<i class="fa-solid fa-lock" style="color:var(--primary);margin-right:6px;"></i> Match Connected (પાસ જરૂરી છે)';
            if (secDesc) secDesc.textContent = isExpired 
                ? 'તમારો ૩૦ દિવસનો પાસ પૂર્ણ થઈ ગયો છે. આગળ ચેટ કરવા અને વિગતો જોવા માટે ₹૧૯૯ પાસ રીન્યૂ કરો.'
                : 'દીકરી સાથે ચેટ કરવા અને વિગતો જોવા માટે ₹૧૯૯ નો પાસ સક્રિય કરો.';
            btn.innerHTML = '<i class="fa-solid fa-lock"></i> Chat / Message (₹૧૯૯ પાસ)';
            btn.className = 'btn btn-gold btn-grow';
            btn.disabled = false;
            btn.onclick = () => {
                if (typeof openPaymentModal === 'function') openPaymentModal('chat');
                else if (typeof openModal === 'function') openModal('modalPaywall');
                if (typeof showToast === 'function') showToast(isExpired ? '🔒 તમારો પાસ પૂર્ણ થઈ ગયો છે. ચેટિંગ કરવા માટે ₹૧૯૯ પાસ રીન્યૂ કરો.' : '🔒 દીકરી સાથે ચેટ કરવા માટે ₹૧૯૯ પાસ જરૂરી છે.');
            };
            return;
        }
        if (secTitle) secTitle.textContent = 'Interested? (ઇન્ટરેસ્ટ મોકલો)';
        if (secDesc) secDesc.textContent = isExpired
            ? 'તમારો ૩૦ દિવસનો પાસ પૂર્ણ થઈ ગયો છે. દીકરીઓને ઇન્ટરેસ્ટ મોકલવા માટે ₹૧૯૯ પાસ રીન્યૂ કરો.'
            : 'Send an interest request — if accepted, chat, family details & location unlock directly.';
        btn.innerHTML = isExpired ? '<i class="fa-solid fa-bolt"></i> Renew Pass (₹૧૯૯ પાસ)' : '<i class="fa-solid fa-lock"></i> I\'m interested (₹૧૯૯ પાસ)';
        btn.className = 'btn btn-gold btn-grow';
        btn.disabled = false;
        btn.onclick = () => {
            if (typeof openPaymentModal === 'function') openPaymentModal('interest');
            else if (typeof openModal === 'function') openModal('modalPaywall');
            if (typeof showToast === 'function') showToast(isExpired ? '🔒 તમારો પાસ પૂર્ણ થઈ ગયો છે. ઇન્ટરેસ્ટ મોકલવા માટે ₹૧૯૯ પાસ રીન્યૂ કરો.' : '🔒 દીકરીઓને ઇન્ટરેસ્ટ મોકલવા માટે ₹૧૯૯ પાસ જરૂરી છે.');
        };
        return;
    }

    if (status === 'accepted') {
        if (secTitle) secTitle.innerHTML = '<i class="fa-solid fa-shield-heart" style="color:var(--primary);margin-right:6px;"></i> Connected Match (જોડાયેલ સંબંધ)';
        if (secDesc) secDesc.textContent = 'Interest accepted! Direct safe text messaging and verified details are unlocked below.';
        btn.classList.add('btn-accepted');
        btn.innerHTML = '<i class="fa-solid fa-comment-dots"></i> Message (Text Only)';
        btn.className = 'btn btn-primary btn-grow';
        btn.onclick = () => openChatFor(profileId);
        return;
    }
    if (status === 'pending') {
        if (secTitle) secTitle.textContent = 'Interested?';
        if (secDesc) secDesc.textContent = 'Send an interest request — if accepted, chat, family details & location unlock directly.';
        btn.classList.add('btn-sent');
        btn.innerHTML = '<i class="fa-solid fa-clock"></i> Request sent';
        btn.className = 'btn btn-outline btn-grow';
        btn.onclick = () => showToast('Interest request already sent. Waiting for acceptance.');
        btn.disabled = true;
        return;
    }
    if (status === 'declined') {
        if (secTitle) secTitle.textContent = 'Interested?';
        if (secDesc) secDesc.textContent = 'Send an interest request — if accepted, chat, family details & location unlock directly.';
        btn.innerHTML = '<i class="fa-solid fa-ban"></i> Request declined';
        btn.className = 'btn btn-outline btn-grow';
        btn.onclick = () => showToast('This request was declined.');
        btn.disabled = true;
        return;
    }
    if (status === 'disconnected') {
        if (discWrap) discWrap.style.display = 'none';
        if (secTitle) secTitle.textContent = 'Interested?';
        if (secDesc) secDesc.textContent = 'Send an interest request — if accepted, chat, family details & location unlock directly.';
        btn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Re-connect (ફરી રિક્વેસ્ટ મોકલો)';
        btn.className = 'btn btn-gold btn-grow';
        btn.disabled = false;
        btn.onclick = () => openInterestModal(profileId);
        return;
    }

    btn.innerHTML = '<i class="fa-solid fa-heart-circle-check"></i> I\'m interested';
    btn.className = 'btn btn-gold btn-grow';
    btn.disabled = false;
    btn.onclick = () => openInterestModal(profileId);
}

function sendInterest(id) {
    if (typeof isSelfProfile === 'function' && isSelfProfile(id)) {
        if (typeof showToast === 'function') showToast('You cannot send interest to your own profile');
        return;
    }
    const isViewerBoy = state.currentUser && (typeof isBoyGender === 'function' ? isBoyGender(state.currentUser.gender) : (state.currentUser.gender === 'Boy' || state.currentUser.gender === 'boy'));
    const isViewerUnpaidBoy = isViewerBoy && (typeof checkBoyPassStatus === 'function' ? !checkBoyPassStatus(state.currentUser).active : (state.currentUser.paymentStatus !== 'Active' && state.currentUser.paymentStatus !== 'paid'));
    if (isViewerUnpaidBoy) {
        if (typeof openPaymentModal === 'function') {
            openPaymentModal('interest');
        } else if (typeof openModal === 'function') {
            openModal('modalPaywall');
        }
        if (typeof showToast === 'function') {
            showToast('🔒 દીકરીઓને ઇન્ટરેસ્ટ મોકલવા માટે ₹૧૯૯ પાસ જરૂરી છે.');
        }
        return;
    }
    if (typeof getDailyInterestUsage === 'function') {
        const usage = getDailyInterestUsage();
        if (usage && usage.isLimitReached) {
            if (typeof showToast === 'function') {
                const msg = (typeof getDailyInterestLimitMessage === 'function')
                    ? getDailyInterestLimitMessage(usage)
                    : `Daily limit reached! Your daily credit of 3 interest requests is finished for today. You can send 3 more interest requests in ${usage.resetTimeText || '24 hours'}.`;
                showToast(msg, 3500);
            }
            return;
        }
    }
    if (typeof openInterestModal === 'function') {
        openInterestModal(id);
    }
}
window.sendInterest = sendInterest;

function isProfileDetailsUnlocked(p) {
    if (!p) return false;
    const isSelf = (typeof isSelfProfile === 'function') ? isSelfProfile(p) : false;
    if (isSelf) return true;

    const isAdmin = (typeof isSessionValidSync === 'function' && isSessionValidSync()) || 
                    (typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.includes('admin'));
    if (isAdmin) return true;

    // Unpaid Boy Guard: can NEVER unlock family details or direct contacts
    const isViewerBoy = state.currentUser && (typeof isBoyGender === 'function' ? isBoyGender(state.currentUser.gender) : (state.currentUser.gender === 'Boy' || state.currentUser.gender === 'boy'));
    const isViewerUnpaidBoy = isViewerBoy && (typeof checkBoyPassStatus === 'function' ? !checkBoyPassStatus(state.currentUser).active : (state.currentUser.paymentStatus !== 'Active' && state.currentUser.paymentStatus !== 'paid'));
    if (isViewerUnpaidBoy) return false;

    const status = (typeof interestStatusFor === 'function')
        ? interestStatusFor(p.id)
        : (typeof getEffectiveInterestStatus === 'function' ? getEffectiveInterestStatus(p.id) : null);

    return status === 'accepted';
}
window.isProfileDetailsUnlocked = isProfileDetailsUnlocked;

function renderFamilyDetailsSection(p) {
    if (!p) return '';
    const isSelf = (typeof isSelfProfile === 'function') ? isSelfProfile(p) : false;
    const unlocked = isProfileDetailsUnlocked(p);
    const status = (typeof interestStatusFor === 'function')
        ? interestStatusFor(p.id)
        : (typeof getEffectiveInterestStatus === 'function' ? getEffectiveInterestStatus(p.id) : null);

    const createdByRaw = String(p.profileCreatedBy || p.created_by || p.raw_data?.profileCreatedBy || p.raw_data?.created_by || '').trim().toLowerCase();
    const isParentCreated = createdByRaw === 'parents' || createdByRaw === 'parent' || createdByRaw.includes('parent') || createdByRaw.includes('વાલી');
    const createdByTag = isParentCreated 
        ? `<span class="profile-creator-tag parents" style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px;background:rgba(16,185,129,0.12);color:#059669;display:inline-flex;align-items:center;gap:4px;"><i class="fa-solid fa-people-roof"></i> Managed by Parents (વાલી દ્વારા)</span>`
        : `<span class="profile-creator-tag self" style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px;background:rgba(123,44,191,0.1);color:var(--primary);display:inline-flex;align-items:center;gap:4px;"><i class="fa-solid fa-user-check"></i> Candidate Self (પોતે)</span>`;

    const isGirl = typeof isGirlGender === 'function' ? isGirlGender(p.gender) : (p.gender === 'girls' || p.gender === 'Girl');
    const personTerm = isGirl ? 'દીકરીને' : 'ઉમેદવારને';
    const personSubject = isGirl ? 'દીકરી' : 'ઉમેદવાર';

    const isFamilyExplicitlyDisabled = (
        p.familyDetailsEnabled === false ||
        p.raw_data?.familyDetailsEnabled === false ||
        p.raw_data?.family_details_enabled === false
    );

    const hasFather = !isFamilyExplicitlyDisabled && Boolean(p.father && p.father !== '—' && p.father !== 'Father' && String(p.father).trim() !== '');
    const hasMother = !isFamilyExplicitlyDisabled && Boolean(p.mother && p.mother !== '—' && p.mother !== 'Mother' && String(p.mother).trim() !== '');
    const hasFamilyDetails = !isFamilyExplicitlyDisabled && (hasFather || hasMother);

    if (unlocked) {
        if (!hasFamilyDetails) {
            // Unlocked, but profile hasn't filled family details yet
            const noticeContent = isParentCreated ? `
                <div style="display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:800;color:#166534;margin-bottom:6px;">
                    <i class="fa-solid fa-people-roof" style="color:#16A34A;"></i>
                    <span>Managed by Parents (વાલી દ્વારા સંચાલિત)</span>
                </div>
                <div style="font-size:12.5px;color:#15803D;line-height:1.55;">
                    <b>વાલી દ્વારા પરિવારની વિગતો પ્રોફાઇલમાં ઉમેરવામાં આવી નથી. ચેટિંગમાં પરસ્પર વાતચીત દ્વારા તમે વાલી/પરિવાર સાથે વિગતો જાણી શકો છો.</b>
                </div>
                <div style="font-size:11.5px;color:#166534;margin-top:4px;line-height:1.45;">
                    Family details were not added in this profile. You can inquire directly in chat after connecting with the family.
                </div>
            ` : `
                <div style="display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:800;color:#166534;margin-bottom:6px;">
                    <i class="fa-solid fa-shield-heart" style="color:#16A34A;"></i>
                    <span>Candidate Self Profile (ઉમેદવાર પોતે બનાવેલ પ્રોફાઇલ)</span>
                </div>
                <div style="font-size:12.5px;color:#15803D;line-height:1.55;">
                    <b>ચેટિંગમાં પરસ્પર અનુકૂળતા લાગ્યા બાદ તમે ${personTerm} પરિવાર વિશે પૂછી શકો છો અથવા ${personSubject} તમને જણાવી શકે છે.</b>
                </div>
                <div style="font-size:11.5px;color:#166534;margin-top:4px;line-height:1.45;">
                    In chat, after mutual comfort, you can ask the candidate about family or candidate can share details with you.
                </div>
            `;

            return `
            <div id="profileFamilyDetailsWrap">
                <div class="section-label" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
                    <span><i class="fa-solid fa-people-roof" style="color:var(--primary);margin-right:6px;"></i> Family details (પરિવાર વિગત)</span>
                    ${createdByTag}
                </div>
                <div style="background:#F0FDF4;border:1.5px solid #86EFAC;border-radius:14px;padding:14px 16px;margin:8px 0 20px 0;">
                    ${noticeContent}
                </div>
            </div>`;
        }

        // Resolve unmasked father mobile if already in cache or memory
        let phone = '';
        if (p.rawFatherMobile && !p.rawFatherMobile.includes('•')) {
            phone = p.rawFatherMobile;
        } else if (p.fatherMobile && !p.fatherMobile.includes('•')) {
            phone = p.fatherMobile;
        } else if (p.father_mobile && !p.father_mobile.includes('•')) {
            phone = p.father_mobile;
        } else if (typeof window !== 'undefined' && window.AUTHORIZED_CONTACT_CACHE && window.AUTHORIZED_CONTACT_CACHE.has(Number(p.id))) {
            const cached = window.AUTHORIZED_CONTACT_CACHE.get(Number(p.id));
            const cPhone = (cached && cached.fatherMobile && !cached.fatherMobile.includes('•')) ? cached.fatherMobile : (cached?.ownMobile && !cached.ownMobile.includes('•') ? cached.ownMobile : '');
            if (cPhone) phone = cPhone;
        }

        const cleanDigits = String(phone || '').replace(/\D/g, '');
        const hasValidPhone = cleanDigits.length >= 10;
        const hasAnyFatherMobile = Boolean((p.fatherMobile && p.fatherMobile.trim()) || (p.father_mobile && p.father_mobile.trim()) || p.rawFatherMobile || hasValidPhone);

        let contactButtonsHtml = '';
        if (!isSelf && (hasValidPhone || hasAnyFatherMobile)) {
            contactButtonsHtml = `
            <div class="contact-btn-row" style="display:flex;gap:10px;margin-top:14px;margin-bottom:18px;padding-top:12px;border-top:1px dashed #E5E7EB;">
                <button class="contact-btn wa" style="flex:1;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:12px;cursor:pointer;" onclick="quickWhatsApp('${escapeHtml(phone)}','${escapeHtml(p.name)}',${p.id})">
                    <i class="fa-brands fa-whatsapp" style="font-size:18px;"></i> <span>WhatsApp Father</span>
                </button>
                <button class="contact-btn call" style="flex:1;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:12px;cursor:pointer;" onclick="quickCall('${escapeHtml(phone)}',${p.id})">
                    <i class="fa-solid fa-phone" style="font-size:16px;"></i> <span>Call Father</span>
                </button>
            </div>`;
        }

        return `
        <div id="profileFamilyDetailsWrap">
            <div class="section-label" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
                <span><i class="fa-solid fa-people-roof" style="color:var(--primary);margin-right:6px;"></i> Family details (પરિવાર વિગત)</span>
                <div style="display:flex;align-items:center;gap:6px;">
                    ${createdByTag}
                    ${isSelf 
                        ? `<span class="privacy-unlocked-badge" style="background:#EEF2FF;color:#4F46E5;border-color:#C7D2FE;"><i class="fa-solid fa-user-check"></i> Your Profile</span>` 
                        : `<span class="privacy-unlocked-badge"><i class="fa-solid fa-circle-check"></i> Unlocked</span>`
                    }
                </div>
            </div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-user-tie"></i> Father (પિતા)</div><div class="dval">${escapeHtml(p.father || p.father_name || '—')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-briefcase"></i> Occupation (વ્યવસાય)</div><div class="dval">${escapeHtml(p.fatherOcc || p.father_occ || '—')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-person-dress"></i> Mother (માતા)</div><div class="dval">${escapeHtml(p.mother || p.mother_name || '—')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-briefcase"></i> Occupation (વ્યવસાય)</div><div class="dval">${escapeHtml(p.motherOcc || p.mother_occ || '—')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-person"></i> Sister (બહેન)</div><div class="dval">${escapeHtml(p.sister || '—')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-person"></i> Brother (ભાઈ)</div><div class="dval">${escapeHtml(p.brother || '—')}</div></div>
            ${contactButtonsHtml}
        </div>`;
    }

    // LOCKED STATE
    let actionBtnHtml = '';
    const isViewerBoy = state.currentUser && (typeof isBoyGender === 'function' ? isBoyGender(state.currentUser.gender) : (state.currentUser.gender === 'Boy' || state.currentUser.gender === 'boy'));
    const passStatus = (typeof checkBoyPassStatus === 'function' && state.currentUser) ? checkBoyPassStatus(state.currentUser) : { active: false };
    const isViewerUnpaidBoy = isViewerBoy && (!passStatus.active);
    const isExpired = passStatus.reason === 'expired' || (state.currentUser && state.currentUser.paymentStatus === 'Expired');

    if (status === 'accepted' && isViewerUnpaidBoy) {
        actionBtnHtml = `<button class="btn btn-gold btn-sm" style="padding:7px 16px;font-size:12px;border-radius:20px;box-shadow:0 3px 10px rgba(245,158,11,0.25);" onclick="openPaymentCheckout('contact')"><i class="fa-solid fa-lock"></i> ${isExpired ? 'Renew Pass to Unlock (₹૧૯૯)' : 'Unlock Details (₹૧૯૯ પાસ)'}</button>`;
    } else if (status === 'pending') {
        actionBtnHtml = `<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#F3F4F6;border:1px solid #D1D5DB;border-radius:20px;font-size:11.5px;font-weight:700;color:#4B5563;"><i class="fa-solid fa-clock" style="color:#D97706;"></i> Request Sent (Waiting for acceptance)</div>`;
    } else if (status === 'declined') {
        actionBtnHtml = `<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#FEF2F2;border:1px solid #FECACA;border-radius:20px;font-size:11.5px;font-weight:700;color:#DC2626;"><i class="fa-solid fa-ban"></i> Request Declined</div>`;
    } else {
        actionBtnHtml = `<button class="btn btn-gold btn-sm" style="padding:7px 16px;font-size:12px;border-radius:20px;box-shadow:0 3px 10px rgba(245,158,11,0.25);" onclick="sendInterest(${p.id})"><i class="fa-solid fa-heart-circle-check"></i> Send Interest to Unlock</button>`;
    }

    return `
    <div id="profileFamilyDetailsWrap">
        <div class="section-label" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
            <div style="display:flex;align-items:center;gap:6px;">
                <i class="fa-solid fa-lock" style="color:var(--accent-deep);font-size:13px;"></i>
                <span>Family details (Protected / ગુપ્ત)</span>
            </div>
            ${createdByTag}
        </div>
        <div class="privacy-protected-card">
            <div class="privacy-blur-content" aria-hidden="true">
                <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-user-tie"></i> Father</div><div class="dval">••••••••••••</div></div>
                <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-briefcase"></i> Occupation</div><div class="dval">••••••••</div></div>
                <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-person-dress"></i> Mother</div><div class="dval">••••••••••••</div></div>
                <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-briefcase"></i> Occupation</div><div class="dval">••••••••</div></div>
                <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-person"></i> Sister</div><div class="dval">••</div></div>
                <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-person"></i> Brother</div><div class="dval">••</div></div>
            </div>
            <div class="privacy-lock-overlay">
                <div class="privacy-lock-icon gold"><i class="fa-solid fa-shield-halved"></i></div>
                <div class="privacy-lock-title">Family Details Protected</div>
                <div style="font-size:12px;font-weight:700;color:#B45309;margin-bottom:4px;line-height:1.4;">
                    સુરક્ષા ખાતર પરિવારની વિગતો ગુપ્ત છે
                </div>
                <div class="privacy-lock-desc" style="line-height:1.45;">
                    રિકવેસ્ટ સ્વીકારાયા બાદ વિગતો અનલોક થશે અને ચેટિંગમાં પરસ્પર અનુકૂળતા લાગ્યા બાદ તમે દીકરીને પરિવાર વિશે પૂછી શકો છો અથવા દીકરી તમને જણાવી શકે છે.<br>
                    <span style="font-size:11px;opacity:0.85;">Details unlock once <b>${escapeHtml(p.name || 'member')}</b> accepts your Interest Request.</span>
                </div>
                ${actionBtnHtml}
            </div>
        </div>
    </div>`;
}
window.renderFamilyDetailsSection = renderFamilyDetailsSection;

function renderLocationSection(p) {
    if (!p) return '';
    const isSelf = (typeof isSelfProfile === 'function') ? isSelfProfile(p) : false;
    const unlocked = isProfileDetailsUnlocked(p);
    const status = (typeof interestStatusFor === 'function')
        ? interestStatusFor(p.id)
        : (typeof getEffectiveInterestStatus === 'function' ? getEffectiveInterestStatus(p.id) : null);

    if (unlocked) {
        return `
        <div id="profileLocationWrap">
            <div class="section-label" style="display:flex;align-items:center;justify-content:space-between;">
                <span><i class="fa-solid fa-map-location-dot" style="color:var(--primary);margin-right:6px;"></i> Location</span>
                ${isSelf ? `<span class="privacy-unlocked-badge" style="background:#EEF2FF;color:#4F46E5;border-color:#C7D2FE;"><i class="fa-solid fa-user-check"></i> Your Profile</span>` : ''}
            </div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-location-dot"></i> Village / City</div><div class="dval">${escapeHtml(p.village || p.city || '—')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-map"></i> Taluka</div><div class="dval">${escapeHtml(p.taluka || '—')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-map-location-dot"></i> District</div><div class="dval">${escapeHtml(p.district || '—')}</div></div>
            <div class="detail-row" style="align-items:flex-start;"><div class="dlabel"><i class="fa-solid fa-house"></i> Full address</div><div class="dval" style="text-align:right;max-width:60%;">${escapeHtml(p.fullAddress || p.address || `${p.village || p.city || ''}, Taluka ${p.taluka || ''}, Dist. ${p.district || ''}`)}</div></div>
        </div>`;
    }

    // LOCKED STATE
    let actionBtnHtml = '';
    const isViewerBoy = state.currentUser && (typeof isBoyGender === 'function' ? isBoyGender(state.currentUser.gender) : (state.currentUser.gender === 'Boy' || state.currentUser.gender === 'boy'));
    const passStatus = (typeof checkBoyPassStatus === 'function' && state.currentUser) ? checkBoyPassStatus(state.currentUser) : { active: false };
    const isViewerUnpaidBoy = isViewerBoy && (!passStatus.active);
    const isExpired = passStatus.reason === 'expired' || (state.currentUser && state.currentUser.paymentStatus === 'Expired');

    if (status === 'accepted' && isViewerUnpaidBoy) {
        actionBtnHtml = `<button class="btn btn-gold btn-sm" style="padding:7px 16px;font-size:12px;border-radius:20px;box-shadow:0 3px 10px rgba(245,158,11,0.25);" onclick="openPaymentCheckout('contact')"><i class="fa-solid fa-lock"></i> ${isExpired ? 'Renew Pass to Unlock (₹૧૯૯)' : 'Unlock Details (₹૧૯૯ પાસ)'}</button>`;
    } else if (status === 'pending') {
        actionBtnHtml = `<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#F3F4F6;border:1px solid #D1D5DB;border-radius:20px;font-size:11.5px;font-weight:700;color:#4B5563;"><i class="fa-solid fa-clock" style="color:#D97706;"></i> Request Sent (Waiting for acceptance)</div>`;
    } else if (status === 'declined') {
        actionBtnHtml = `<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#FEF2F2;border:1px solid #FECACA;border-radius:20px;font-size:11.5px;font-weight:700;color:#DC2626;"><i class="fa-solid fa-ban"></i> Request Declined</div>`;
    } else {
        actionBtnHtml = `<button class="btn btn-gold btn-sm" style="padding:7px 16px;font-size:12px;border-radius:20px;box-shadow:0 3px 10px rgba(245,158,11,0.25);" onclick="sendInterest(${p.id})"><i class="fa-solid fa-heart-circle-check"></i> Send Interest to Unlock</button>`;
    }

    const broadRegion = p.district ? `${escapeHtml(p.district)}, Gujarat` : 'Gujarat';

    return `
    <div id="profileLocationWrap">
        <div class="section-label" style="display:flex;align-items:center;gap:6px;">
            <i class="fa-solid fa-lock" style="color:var(--accent-deep);font-size:13px;"></i>
            <span>Location (Protected)</span>
        </div>
        <div class="privacy-protected-card">
            <div class="privacy-blur-content" aria-hidden="true">
                <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-location-dot"></i> Village / City</div><div class="dval">••••••••</div></div>
                <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-map"></i> Taluka</div><div class="dval">••••••••</div></div>
                <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-map-location-dot"></i> District</div><div class="dval">${broadRegion}</div></div>
                <div class="detail-row" style="align-items:flex-start;"><div class="dlabel"><i class="fa-solid fa-house"></i> Full address</div><div class="dval">••••••••••••••••••••••••</div></div>
            </div>
            <div class="privacy-lock-overlay">
                <div class="privacy-lock-icon indigo"><i class="fa-solid fa-location-crosshairs"></i></div>
                <div class="privacy-lock-title">Exact Location Protected</div>
                <div style="font-size:11.5px;font-weight:700;color:#4F46E5;margin-bottom:3px;">સુરક્ષા ખાતર સરનામું ગુપ્ત રાખેલ છે</div>
                <div class="privacy-lock-desc">Area: <b>${broadRegion}</b>. Exact village, taluka and address unlock automatically upon accepted Interest Request.</div>
                ${actionBtnHtml}
            </div>
        </div>
    </div>`;
}
window.renderLocationSection = renderLocationSection;

function renderFatherContactSection(p) {
    // Action buttons are integrated directly inside Family details (renderFamilyDetailsSection)
    // Hidden container preserved to avoid breaking legacy DOM references
    return `<div id="profileFatherContactWrap" style="display:none;"></div>`;
}
window.renderFatherContactSection = renderFatherContactSection;

function openProfile(id) {
    if (!state.currentUser || !state.currentUser.email) {
        showToast('Please log in or register to view profiles');
        if (typeof go === 'function') go('scr-welcome', true);
        return;
    }
    if (!state.profileComplete) { openModal('modalCompleteProfile'); return; }

    const p = (typeof findProfile === 'function') ? findProfile(id) : (PROFILES || []).find(x => x.id === id || String(x.id) === String(id) || Number(x.id) === Number(id));
    if (!p) {
        showToast('Profile not found');
        return;
    }

    const isSelf = (typeof isSelfProfile === 'function') ? isSelfProfile(p) : false;

    if (!isSelf && (p.visible === false || p.visible === 'false')) {
        showToast('This profile is currently hidden from search.');
        return;
    }

    // Strict Gender Isolation Rule:
    // A boy can NEVER open/view another boy's profile!
    // A girl can NEVER open/view another girl's profile!
    const isProfileGirl = typeof isGirlGender === 'function' ? isGirlGender(p.gender) : (p.gender === 'girls' || p.gender === 'Girl');
    const isProfileBoy = typeof isBoyGender === 'function' ? isBoyGender(p.gender) : (p.gender === 'boys' || p.gender === 'Boy');

    const isUserBoy = state.currentUser && (typeof isBoyGender === 'function' ? isBoyGender(state.currentUser.gender) : (state.currentUser.gender === 'Boy' || state.currentUser.gender === 'boy'));
    const isUserGirl = state.currentUser && (typeof isGirlGender === 'function' ? isGirlGender(state.currentUser.gender) : (state.currentUser.gender === 'Girl' || state.currentUser.gender === 'girl'));

    if (!isSelf) {
        if (isUserBoy && isProfileBoy) {
            showToast('You can only view profiles of eligible brides (girls).');
            if (typeof go === 'function') go('scr-home');
            return;
        }
        if (isUserGirl && isProfileGirl) {
            showToast('You can only view profiles of eligible grooms (boys).');
            if (typeof go === 'function') go('scr-home');
            return;
        }
    }

    state.activeProfileId = p.id;
    window.currentViewingProfileId = p.id;
    saveSessionState();
    const isFav = state.favorites.has(p.id);
    const photos = (p.photos && p.photos.length > 0) ? p.photos.filter(Boolean) : [p.img || p.photo].filter(Boolean);
    const fallbackImg = isProfileGirl ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop';
    const mainImg = photos[0] || p.img || p.photo || fallbackImg;
    const hasMultiple = photos.length > 1;

    const el = document.getElementById('profileContent');
    if (!el) return;

    const unlocked = isProfileDetailsUnlocked(p);
    const heroLocHtml = unlocked
        ? `<i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.village || p.city || '')}${p.district ? ', ' + escapeHtml(p.district) : ''}`
        : `<i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.district ? p.district + ', Gujarat' : 'Gujarat')} <span style="font-size:10.5px;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,0.25);margin-left:4px;letter-spacing:0.02em;"><i class="fa-solid fa-shield-halved"></i> Protected</span>`;

    const heroImg = (typeof getHeroImageUrl === 'function') ? getHeroImageUrl(mainImg) : mainImg;

    el.innerHTML = `
        <div class="full-hero" style="cursor:pointer;" onclick="openPhotoCarousel(${p.id}, event)">
            <img src="${heroImg}" alt="${escapeHtml(p.name || 'Profile')}" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='${fallbackImg}';">
            <div class="grad"></div>
            <div class="fh-top">
                <button class="icon-btn" onclick="event.stopPropagation();goBack()"><i class="fa-solid fa-arrow-left"></i></button>
                <button class="icon-btn" id="fullFavBtn" onclick="event.stopPropagation();toggleFullFav(${p.id})" style="color:${isFav ? '#D64545' : 'var(--primary)'};"><i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>
            </div>
            <div class="fh-bottom">
                <div class="fname">${escapeHtml(p.name || '')}, ${p.age}</div>
                <div class="floc" id="profileHeroLoc">${heroLocHtml}</div>
                <div style="display:flex;gap:8px;align-items:center;margin-top:4px;">
                    <div class="verified-tag"><i class="fa-solid fa-shield-check"></i> Verified profile</div>
                    ${hasMultiple ? `<span class="pcount-chip" style="position:static;cursor:pointer;" onclick="event.stopPropagation();openPhotoCarousel(${p.id}, event)"><i class="fa-solid fa-camera"></i> ${photos.length} Photos</span>` : ''}
                </div>
            </div>
        </div>
        <div class="screen-pad no-tab">
            <div class="section-label" style="margin-top:6px;">Personal details</div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-cake-candles"></i> Age</div><div class="dval">${p.age} Years</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-ruler-vertical"></i> Height</div><div class="dval">${escapeHtml(p.height || '—')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-weight-scale"></i> Weight</div><div class="dval">${escapeHtml(p.weight || '—')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-ring"></i> Marital status</div><div class="dval">${escapeHtml(p.marital || 'Unmarried')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-person"></i> Physical status</div><div class="dval">${escapeHtml(p.physical || 'Normal')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-briefcase"></i> Occupation</div><div class="dval">${escapeHtml(p.occ || p.occupation || 'Professional')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-graduation-cap"></i> Education</div><div class="dval">${escapeHtml(p.education || 'Graduate')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-sack-dollar"></i> Monthly income</div><div class="dval">${escapeHtml(p.income || 'Confidential')}</div></div>
            <div class="detail-row"><div class="dlabel"><i class="fa-solid fa-users"></i> Community</div><div class="dval">${escapeHtml(p.community || p.caste || '')}</div></div>
            ${(function() {
                let list = [];
                if (Array.isArray(p.hobbies)) {
                    list = p.hobbies.map(h => String(h || '').trim()).filter(h => h.length > 0 && h.toLowerCase() !== 'none' && h !== '—');
                } else if (typeof p.hobbies === 'string' && p.hobbies.trim()) {
                    const trimmed = p.hobbies.trim();
                    if (trimmed.toLowerCase() !== 'none' && trimmed !== '—') {
                        list = trimmed.split(',').map(s => s.trim()).filter(Boolean);
                    }
                }
                if (!list || list.length === 0) {
                    return `
                    <div class="detail-row" style="flex-direction:column;align-items:flex-start;gap:6px;padding:10px 0;">
                        <div class="dlabel"><i class="fa-solid fa-icons" style="color:var(--primary);"></i> Hobbies</div>
                        <div style="font-size:13px;color:var(--text-muted);font-style:italic;margin-top:2px;">No hobbies listed</div>
                    </div>`;
                }
                const chipsHtml = typeof renderHobbiesHtml === 'function' ? renderHobbiesHtml(list) : list.map(h => `<span class="chip">${escapeHtml(h)}</span>`).join('');
                if (!chipsHtml) {
                    return `
                    <div class="detail-row" style="flex-direction:column;align-items:flex-start;gap:6px;padding:10px 0;">
                        <div class="dlabel"><i class="fa-solid fa-icons" style="color:var(--primary);"></i> Hobbies</div>
                        <div style="font-size:13px;color:var(--text-muted);font-style:italic;margin-top:2px;">No hobbies listed</div>
                    </div>`;
                }
                return `
                <div class="detail-row" style="flex-direction:column;align-items:flex-start;gap:8px;padding:12px 0;">
                    <div class="dlabel"><i class="fa-solid fa-icons" style="color:var(--primary);"></i> Hobbies</div>
                    <div class="chip-row" style="margin-top:2px;">${chipsHtml}</div>
                </div>`;
            })()}

            ${renderFamilyDetailsSection(p)}

            ${renderLocationSection(p)}

            ${renderFatherContactSection(p)}

            ${isSelf ? `
                <div class="section-label">Your Profile</div>
                <p class="p-muted" style="margin-top:-8px;margin-bottom:12px;">This is how eligible community members see your matrimony profile.</p>
                <button class="btn btn-primary" onclick="go('scr-editprofile')"><i class="fa-solid fa-user-pen"></i> Edit My Profile</button>
            ` : `
                <div class="section-label" id="profileActionsSectionTitle">Interested?</div>
                <p class="p-muted" id="profileActionsSectionDesc" style="margin-top:-8px;margin-bottom:12px;">Send an interest request — if accepted, chat, family details &amp; location unlock directly.</p>
                <button class="btn btn-gold" id="fullInterestBtn" data-pid="${p.id}"><i class="fa-solid fa-heart-circle-check"></i> I'm interested</button>
                <div id="profileDisconnectActionWrap" style="display:${((typeof interestStatusFor === 'function' ? interestStatusFor(p.id) : null) === 'accepted') ? 'block' : 'none'};">
                    <button class="btn btn-outline" type="button" style="width:100%;margin-top:10px;border-color:rgba(239,68,68,0.3);color:var(--error,#ef4444);font-size:13px;font-weight:700;" onclick="promptDisconnectConnection(${p.id})">
                        <i class="fa-solid fa-user-slash"></i> Disconnect Match (સંબંધ સમાપ્ત કરો)
                    </button>
                </div>
            `}

            ${!isSelf ? `<button class="btn btn-ghost" style="margin-top:22px;color:var(--error);" onclick="openQuickReport(${p.id})"><i class="fa-solid fa-flag"></i> Report this profile</button>` : ''}
        </div>`;

    go('scr-profile');
    if (!isSelf) {
        const interestBtn = document.getElementById('fullInterestBtn');
        setInterestBtnState(interestBtn, p.id);
    }

    // Authorized On-Demand Contact Reveal:
    // Only fetch real unmasked contact if Interest is ACCEPTED, or viewer is self/admin!
    if (unlocked && typeof supabaseFetchAuthorizedContact === 'function') {
        supabaseFetchAuthorizedContact(p.id).then(contact => {
            if (contact) {
                if (typeof window !== 'undefined' && window.AUTHORIZED_CONTACT_CACHE) {
                    window.AUTHORIZED_CONTACT_CACHE.set(Number(p.id), contact);
                }
                const realPhone = (contact.fatherMobile && !contact.fatherMobile.includes('•'))
                    ? contact.fatherMobile
                    : (contact.ownMobile && !contact.ownMobile.includes('•') ? contact.ownMobile : '');
                if (realPhone) {
                    p.fatherMobile = realPhone;
                    p.father_mobile = realPhone;
                    p.rawFatherMobile = realPhone;
                }
                if (contact.ownMobile && !contact.ownMobile.includes('•')) p.ownMobile = contact.ownMobile;
                if (contact.email && !contact.email.includes('•')) p.email = contact.email;
                if (contact.fullAddress) {
                    p.fullAddress = contact.fullAddress;
                    const addrEl = document.querySelector('#profileLocationWrap .detail-row [style*="max-width:60%"]');
                    if (addrEl) addrEl.textContent = contact.fullAddress;
                }
                const famWrap = document.getElementById('profileFamilyDetailsWrap');
                if (famWrap && typeof renderFamilyDetailsSection === 'function') {
                    famWrap.outerHTML = renderFamilyDetailsSection(p);
                }
                const wrap = document.getElementById('profileFatherContactWrap');
                if (wrap && typeof renderFatherContactSection === 'function') {
                    wrap.outerHTML = renderFatherContactSection(p);
                }
            }
        }).catch(err => console.warn('[Security Guard] Authorized contact note:', err));
    }
}

function toggleFullFav(id) {
    const btn = document.getElementById('fullFavBtn');
    if (state.favorites.has(id)) {
        state.favorites.delete(id);
        if (btn) {
            btn.style.color = 'var(--primary)';
            const icon = btn.querySelector('i');
            if (icon) icon.className = 'fa-regular fa-heart';
        }
        showToast('Removed from favorites');
    } else {
        state.favorites.add(id);
        if (btn) {
            btn.style.color = '#D64545';
            const icon = btn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-heart';
        }
        showToast('Added to favorites ❤️');
    }
    const favCountHome = document.getElementById('favCountHome');
    if (favCountHome) {
        favCountHome.textContent = state.favorites.size;
    }
    saveSessionState();
    if (typeof syncFavoritesToDatabase === 'function') {
        syncFavoritesToDatabase();
    }
}
function openContact() { openModal('modalContact'); }

/* ============================================================ REPORT ============================================================ */
function pickReport(el) {
    document.querySelectorAll('#reportOpts .report-opt').forEach(r => r.classList.remove('active'));
    el.classList.add('active');
    state.reportPicked = true;
}
async function submitReport() {
    if (!state.reportPicked) { showToast('Please select a reason'); return; }
    const activeOpt = document.querySelector('#reportOpts .report-opt.active span');
    const reason = activeOpt ? activeOpt.textContent.trim() : 'Inappropriate content';
    const detailsEl = document.getElementById('reportScreenDetails');
    const details = detailsEl ? detailsEl.value.trim() : '';

    const targetId = state.activeReportId || state.activeProfileId || 4;
    let targetProfile = null;
    if (typeof findProfile === 'function') {
        targetProfile = findProfile(targetId);
    }
    if (!targetProfile && typeof PROFILES !== 'undefined' && Array.isArray(PROFILES)) {
        targetProfile = PROFILES.find(p => p && (String(p.id) === String(targetId) || String(p.user_id) === String(targetId)));
    }

    const reporter = state.currentUser || state.regData || null;
    const reportData = {
        reporterId: reporter ? (reporter.id || reporter.userId || 1) : 1,
        reporterName: reporter ? (reporter.name || 'Member') : 'Member',
        reporterEmail: reporter ? (reporter.email || '') : '',
        targetUserId: targetId,
        targetUserName: targetProfile ? (targetProfile.name || 'Reported Member') : 'Member',
        targetUserEmail: targetProfile ? (targetProfile.email || '') : '',
        targetUserPhoto: targetProfile ? (targetProfile.img || targetProfile.avatar_url || '') : '',
        reason: reason,
        details: details || 'Submitted via in-app report screen.',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    if (typeof supabaseSubmitReport === 'function') {
        supabaseSubmitReport(reportData).catch(err => console.warn('[Report] Cloud submit note:', err));
    } else {
        try {
            const raw = localStorage.getItem(LS_REPORTS_KEY);
            const rList = raw ? JSON.parse(raw) : [];
            rList.unshift({
                id: Date.now(),
                userId: targetId,
                reporterId: reportData.reporterId,
                reason: reason,
                details: reportData.details,
                date: reportData.date,
                status: 'open'
            });
            localStorage.setItem(LS_REPORTS_KEY, JSON.stringify(rList));
        } catch(e) {}
    }

    if (detailsEl) detailsEl.value = '';
    document.querySelectorAll('#reportOpts .report-opt').forEach(r => r.classList.remove('active'));
    state.reportPicked = false;

    showToast('Report submitted to admin team — thank you');
    setTimeout(() => goBack(), 500);
}


/* ============================================================ DELETE ACCOUNT ============================================================ */
function openDeleteAccountModal() {
    const emailInput = document.getElementById('deleteAccountEmail');
    if (emailInput) {
        const userEmail = (state.currentUser && state.currentUser.email) ||
            (state.regData && state.regData.email) || '';
        emailInput.value = userEmail;
    }
    const confirmInput = document.getElementById('deleteAccountConfirmInput');
    if (confirmInput) {
        confirmInput.value = '';
    }
    const btn = document.getElementById('btnConfirmDeleteAccount');
    if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.45';
        btn.style.cursor = 'not-allowed';
    }
    openModal('modalDeleteAccount');
}
window.openDeleteAccountModal = openDeleteAccountModal;

function handleDeleteAccountInput(el) {
    const btn = document.getElementById('btnConfirmDeleteAccount');
    const val = (el ? el.value : '').trim().toUpperCase();
    if (val === 'DELETE') {
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    } else {
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.45';
            btn.style.cursor = 'not-allowed';
        }
    }
}
window.handleDeleteAccountInput = handleDeleteAccountInput;

async function confirmDeleteAccount() {
    const confirmInput = document.getElementById('deleteAccountConfirmInput');
    const val = confirmInput ? confirmInput.value.trim().toUpperCase() : '';
    if (val !== 'DELETE') {
        showToast('Please type DELETE in capital letters to confirm');
        if (confirmInput) confirmInput.focus();
        return;
    }

    const currentUser = state.currentUser;
    if (!currentUser || !currentUser.email) {
        closeModal('modalDeleteAccount');
        go('scr-welcome', true);
        return;
    }

    closeModal('modalDeleteAccount');
    if (confirmInput) confirmInput.value = '';
    showGlobalLoader('Deleting account permanently from Supabase & Cloudinary...');

    let emailToDelete = currentUser.rawEmail || currentUser.email || state.regData?.email || '';
    if (emailToDelete.includes('•')) {
        if (currentUser.rawEmail && !currentUser.rawEmail.includes('•')) {
            emailToDelete = currentUser.rawEmail;
        } else if (state.regData?.email && !state.regData.email.includes('•')) {
            emailToDelete = state.regData.email;
        }
    }
    const idToDelete = currentUser.id || '';
    const userIdToDelete = currentUser.userId || state.regData?.userId || state.regData?.id || '';

    // 1. Delete permanently from Supabase & Cloudinary CDN
    if (typeof supabaseDeleteUserCompletely === 'function') {
        try {
            await supabaseDeleteUserCompletely(currentUser, emailToDelete, userIdToDelete || idToDelete, { isSelfDelete: true });
        } catch(e) {
            console.warn('[Delete] Supabase delete note:', e);
        }
    }

    // 2. Completely purge all local storage caches, chats, and active state
    if (typeof purgeUserAccountLocally === 'function') {
        purgeUserAccountLocally(emailToDelete, idToDelete || userIdToDelete);
    }
    if (typeof updateHomeStats === 'function') {
        updateHomeStats();
    }
    state.currentUser = null;
    state.profileComplete = false;
    state.membershipPaid = false;
    state.regData = {};
    if (state.favorites) state.favorites.clear();
    sessionStorage.clear();
    localStorage.removeItem('LS_ACTIVE_USER');
    localStorage.removeItem('mangalSetu_last_auth_provider');
    localStorage.removeItem('mangalSetu_lastAuthProvider');
    if (typeof clearLastAuthProvider === 'function') {
        clearLastAuthProvider();
    }

    if (typeof resetRegistrationStateAndInputs === 'function') {
        resetRegistrationStateAndInputs();
    }
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    if (typeof hideGlobalLoader === 'function') hideGlobalLoader();
    showToast('Your account, photos, and messages have been permanently deleted.');
    go('scr-welcome', true);
    if (typeof renderSmartWelcomeScreen === 'function') {
        renderSmartWelcomeScreen();
    }
}
window.confirmDeleteAccount = confirmDeleteAccount;

function openPaymentHistoryModal() {
    const listEl = document.getElementById('paymentHistoryList');
    if (!listEl) return;
    listEl.innerHTML = '';

    const isGirl = state.currentUser && (state.currentUser.gender === 'Girl' || state.currentUser.gender === 'girl');

    if (isGirl) {
        listEl.innerHTML = `
            <div style="background:var(--success-bg,#ECFDF5);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:24px;margin-bottom:6px;">🎉</div>
                <div style="font-weight:700;font-size:15px;color:var(--success,#059669);margin-bottom:4px;">100% Lifetime Free Membership</div>
                <p style="font-size:12px;color:var(--text-muted,#666);margin:0;line-height:1.5;">
                    Community brides enjoy lifetime complimentary access to search, browse, and connect. No payment required.
                </p>
            </div>
        `;
    } else {
        const userEmail = state.currentUser?.email?.toLowerCase().trim();
        const userId = state.currentUser?.id;
        let payments = [];
        try {
            const allPayments = JSON.parse(localStorage.getItem('LS_ADMIN_PAYMENTS') || '[]');
            payments = allPayments.filter(p => 
                (userId && p.userId === userId) ||
                (userEmail && p.userEmail && p.userEmail.toLowerCase().trim() === userEmail) ||
                (state.currentUser?.name && p.userName && p.userName.toLowerCase() === state.currentUser.name.toLowerCase())
            );
        } catch(e) {}

        if (payments.length === 0) {
            const passCheck = (typeof checkBoyPassStatus === 'function' && state.currentUser) 
                ? checkBoyPassStatus(state.currentUser) 
                : { active: false };

            listEl.innerHTML = `
                <div style="background:var(--surface-sunken,#f9fafb);border:1px dashed var(--border,#e5e7eb);border-radius:12px;padding:20px 16px;text-align:center;">
                    <i class="fa-solid fa-receipt" style="font-size:28px;color:var(--text-faint,#9ca3af);margin-bottom:8px;"></i>
                    <div style="font-weight:700;font-size:14px;color:var(--text,#333);margin-bottom:4px;">No Transactions Yet</div>
                    <p style="font-size:12px;color:var(--text-muted,#666);margin:0;line-height:1.5;">
                        ${passCheck.active ? 'Your pass is currently active.' : 'Pay ₹199 via UPI to activate your 30-Day Full Access Pass.'}
                    </p>
                </div>
            `;
        } else {
            payments.forEach(p => {
                const item = document.createElement('div');
                item.style.cssText = 'background:var(--surface,#fff);border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:12px 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 3px rgba(0,0,0,0.04);';
                item.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:36px;height:36px;border-radius:10px;background:rgba(16,185,129,0.12);color:var(--success,#059669);display:flex;align-items:center;justify-content:center;font-size:16px;">
                            <i class="fa-solid fa-bolt"></i>
                        </div>
                        <div>
                            <div style="font-weight:700;font-size:13.5px;color:var(--text,#111);">${escapeHtml(p.plan || 'Boys 30 Days Pass')}</div>
                            <div style="font-size:11px;color:var(--text-muted,#777);margin-top:2px;">${escapeHtml(p.date || '')} ${escapeHtml(p.time || '')} · <span style="color:var(--primary);">${escapeHtml(p.method || 'UPI')}</span></div>
                            <div style="font-size:10.5px;color:var(--text-faint,#999);margin-top:1px;">ID: ${escapeHtml(p.id || '')}</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:800;font-size:15px;color:var(--text,#111);">₹${p.amount || 199}</div>
                        <span style="font-size:10.5px;font-weight:700;color:#059669;background:#ECFDF5;padding:2px 7px;border-radius:6px;display:inline-block;margin-top:2px;">PAID</span>
                    </div>
                `;
                listEl.appendChild(item);
            });
        }
    }

    if (typeof openModal === 'function') openModal('modalPaymentHistory');
}

// Global Window Exports
if (typeof openProfile !== 'undefined') window.openProfile = openProfile;
if (typeof populateEditProfile !== 'undefined') window.populateEditProfile = populateEditProfile;
if (typeof updateMembershipScreen !== 'undefined') window.updateMembershipScreen = updateMembershipScreen;
if (typeof submitProfileCompletion !== 'undefined') window.submitProfileCompletion = submitProfileCompletion;
if (typeof openRazorpayCheckout !== 'undefined') window.openRazorpayCheckout = openRazorpayCheckout;
if (typeof openPaymentHistoryModal !== 'undefined') window.openPaymentHistoryModal = openPaymentHistoryModal;
if (typeof openPhotoCarousel !== 'undefined') window.openPhotoCarousel = openPhotoCarousel;
if (typeof closePhotoCarousel !== 'undefined') window.closePhotoCarousel = closePhotoCarousel;
if (typeof nextCarouselPhoto !== 'undefined') window.nextCarouselPhoto = nextCarouselPhoto;
if (typeof prevCarouselPhoto !== 'undefined') window.prevCarouselPhoto = prevCarouselPhoto;
if (typeof selectCarouselPhoto !== 'undefined') window.selectCarouselPhoto = selectCarouselPhoto;
if (typeof setInterestBtnState !== 'undefined') window.setInterestBtnState = setInterestBtnState;
if (typeof sendInterest !== 'undefined') window.sendInterest = sendInterest;

if (typeof isProfileDetailsUnlocked !== 'undefined') window.isProfileDetailsUnlocked = isProfileDetailsUnlocked;
if (typeof renderFamilyDetailsSection !== 'undefined') window.renderFamilyDetailsSection = renderFamilyDetailsSection;
if (typeof renderLocationSection !== 'undefined') window.renderLocationSection = renderLocationSection;

function refreshProfileContactState(profileId) {
    const pid = Number(profileId);
    if (state.activeProfileId && Number(state.activeProfileId) === pid) {
        const p = (typeof findProfile === 'function') ? findProfile(pid) : null;
        if (p) {
            const unlocked = (typeof isProfileDetailsUnlocked === 'function') ? isProfileDetailsUnlocked(p) : false;

            // 1. Refresh Family details
            const famWrap = document.getElementById('profileFamilyDetailsWrap');
            if (famWrap && typeof renderFamilyDetailsSection === 'function') {
                famWrap.outerHTML = renderFamilyDetailsSection(p);
            }
            // 2. Refresh Location
            const locWrap = document.getElementById('profileLocationWrap');
            if (locWrap && typeof renderLocationSection === 'function') {
                locWrap.outerHTML = renderLocationSection(p);
            }
            // 3. Refresh Hero Location text
            const heroLoc = document.getElementById('profileHeroLoc');
            if (heroLoc) {
                if (unlocked) {
                    heroLoc.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.village || p.city || '')}${p.district ? ', ' + escapeHtml(p.district) : ''}`;
                } else {
                    heroLoc.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.district ? p.district + ', Gujarat' : 'Gujarat')} <span style="font-size:10.5px;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,0.25);margin-left:4px;letter-spacing:0.02em;"><i class="fa-solid fa-shield-halved"></i> Protected</span>`;
                }
            }
            // 4. Refresh Father contact
            const wrap = document.getElementById('profileFatherContactWrap');
            if (wrap && typeof renderFatherContactSection === 'function') {
                wrap.outerHTML = renderFatherContactSection(p);
            }
            // 5. Refresh Disconnect button visibility (ONLY visible if mutual connection is currently accepted)
            const isConnAccepted = (typeof interestStatusFor === 'function') ? (interestStatusFor(p.id) === 'accepted') : false;
            const discWrap = document.getElementById('profileDisconnectActionWrap');
            if (discWrap) {
                discWrap.style.display = isConnAccepted ? 'block' : 'none';
            }
            // 6. Refresh Main Full Interest Button
            const fullBtn = document.getElementById('fullInterestBtn');
            if (fullBtn && typeof setInterestBtnState === 'function') {
                setInterestBtnState(fullBtn, p.id);
            }
            if (unlocked && typeof supabaseFetchAuthorizedContact === 'function') {
                supabaseFetchAuthorizedContact(p.id).then(contact => {
                    if (contact) {
                        if (typeof window !== 'undefined' && window.AUTHORIZED_CONTACT_CACHE) {
                            window.AUTHORIZED_CONTACT_CACHE.set(Number(p.id), contact);
                        }
                        const realPhone = (contact.fatherMobile && !contact.fatherMobile.includes('•'))
                            ? contact.fatherMobile
                            : (contact.ownMobile && !contact.ownMobile.includes('•') ? contact.ownMobile : '');
                        if (realPhone) {
                            p.fatherMobile = realPhone;
                            p.father_mobile = realPhone;
                            p.rawFatherMobile = realPhone;
                        }
                        if (contact.fullAddress) {
                            p.fullAddress = contact.fullAddress;
                            const addrEl = document.querySelector('#profileLocationWrap .detail-row [style*="max-width:60%"]');
                            if (addrEl) addrEl.textContent = contact.fullAddress;
                        }
                        const updatedFamWrap = document.getElementById('profileFamilyDetailsWrap');
                        if (updatedFamWrap && typeof renderFamilyDetailsSection === 'function') {
                            updatedFamWrap.outerHTML = renderFamilyDetailsSection(p);
                        }
                        const updatedWrap = document.getElementById('profileFatherContactWrap');
                        if (updatedWrap && typeof renderFatherContactSection === 'function') {
                            updatedWrap.outerHTML = renderFatherContactSection(p);
                        }
                    }
                }).catch(() => {});
            }
        }
    }
}
window.refreshProfileContactState = refreshProfileContactState;

