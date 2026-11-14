/* ============================================================ HELP & FAQS CONTENT ============================================================ */
const DEFAULT_HOW_IT_WORKS = [
    { title: '1-Click Google Sign In', desc: 'Fast, secure & 100% password-free login with your official Google account.' },
    { title: 'Select community', desc: 'Choose your specific caste & community from 250+ verified Hindu Gujarati Samaj.' },
    { title: 'Personal & family biodata', desc: 'Add education, occupation, income, hobbies, and respectful family background.' },
    { title: 'Upload verified photos', desc: 'Upload up to 3 high-resolution photos (1 main verified photo + 2 gallery slots).' },
    { title: 'Native location & address', desc: 'Specify your native village, taluka, and district for localized matchmaking.' },
    { title: 'Membership & Instant UPI Pass', desc: 'Community girls: 100% Lifetime Free · Boys: ₹199 for 30 Days Pass via Instant UPI QR Scan / UPI Apps (GPay, PhonePe, Paytm).' },
    { title: 'Explore verified profiles', desc: 'Browse genuine eligible brides and grooms from your community.' },
    { title: 'Send interest (3 daily limit)', desc: 'Send up to 3 interest requests per day to maintain genuine, spam-free connections.' },
    { title: 'Direct family connect', desc: 'Once interest is accepted, unlock direct Father\'s Phone Call, WhatsApp, and in-app chat.' }
];

const DEFAULT_FAQS = [
    ['Is Mangal Setu a government-registered enterprise?', 'Yes. Mangal Setu Matrimony is an officially verified Micro Enterprise registered with the Ministry of Micro, Small and Medium Enterprises (MSME), Government of India (Udyam Registration No: UDYAM-GJ-20-0323404, Rajkot, Gujarat).'],
    ['How do I register?', 'Sign in with Google in 1 click (no passwords or manual registration forms required), select your community, complete your family details, and upload your photos. Your account is active immediately!'],
    ['Is membership free for girls?', 'Yes! 100% Lifetime Free access is guaranteed for all community girls.'],
    ['How much is the membership pass for boys?', 'Boys get 30 Days Full Access for just ₹199, payable instantly via UPI QR Code Scanner or direct UPI Apps (Google Pay, PhonePe, Paytm, BHIM) to official UPI ID: 9726362863@ybl. Community girls enjoy 100% Lifetime Free access.'],
    ['How many interest requests can I send per day?', 'To maintain privacy, prevent mass spamming, and ensure serious matrimonial connections, every member (both girls and boys) can send a maximum of 3 interest requests in a 24-hour period.'],
    ['What happens after 30 days of membership?', 'After 30 days, your account remains active, but browsing candidate profiles is locked until you renew the ₹199 pass.'],
    ['How do members contact each other?', 'A member can send an in-app interest request. Once the candidate accepts, direct Phone Call and WhatsApp buttons for the girl\'s father are unlocked automatically, along with text chat.'],
    ['Is a member\'s phone number public?', 'No. A member\'s own personal mobile number is kept strictly private for Admin verification only. Only the father\'s verified contact number unlocks for accepted interest connections.'],
    ['How do multi-photo profiles work?', 'Members can upload up to 3 high-resolution photos. Verified members can view all photos in the photo gallery carousel.'],
    ['How can I contact official Admin support?', 'You can reach our Jasdan administrative cell via WhatsApp or Phone at +91 97263 62863 or email mangalsetu.in@gmail.com.'],
    ['Can I disconnect or end a match if I don\'t wish to proceed?', 'Yes, absolutely. Either member can tap "Disconnect Match" at any time. This instantly locks contact details back to private (••••••) and permanently deletes all chat messages between the two members from database servers for complete privacy.'],
    ['Can I send an interest again after disconnecting?', 'Yes. If families reconsider in the future, you can send an interest request again using the "Re-connect" button. It adheres to the 3 daily requests limit and requires fresh acceptance from the other party.'],
    ['What happens when I delete my account?', 'Under our DPDP-compliant zero-trace policy, deleting your account permanently wipes your login credentials, profile, photos, chat history, and interests from our servers with 100% zero residual data left behind.']
];

let REMOTE_GUIDE_STEPS = null;
let REMOTE_FAQS = null;
let REMOTE_CONTACT = null;

function getHowItWorksSteps() {
    if (Array.isArray(REMOTE_GUIDE_STEPS) && REMOTE_GUIDE_STEPS.length > 0) {
        return REMOTE_GUIDE_STEPS;
    }
    if (Array.isArray(window.REMOTE_GUIDE_STEPS) && window.REMOTE_GUIDE_STEPS.length > 0) {
        return window.REMOTE_GUIDE_STEPS;
    }
    return DEFAULT_HOW_IT_WORKS;
}

function getFaqs() {
    if (Array.isArray(REMOTE_FAQS) && REMOTE_FAQS.length > 0) {
        return REMOTE_FAQS;
    }
    if (Array.isArray(window.REMOTE_FAQS) && window.REMOTE_FAQS.length > 0) {
        return window.REMOTE_FAQS;
    }
    return DEFAULT_FAQS;
}

/**
 * Fetch FAQs, Guide Steps and Contact Details directly from Supabase app_settings table
 */
async function syncHelpContentFromSupabase() {
    if (typeof supabaseGetAppSetting !== 'function') return;
    try {
        const [faqs, guide, contact] = await Promise.all([
            supabaseGetAppSetting('faqs'),
            supabaseGetAppSetting('guide_steps'),
            supabaseGetAppSetting('contact_details')
        ]);
        if (Array.isArray(faqs) && faqs.length > 0) {
            REMOTE_FAQS = faqs.map(([q, a]) => {
                let cleanA = a || '';
                if (cleanA.includes('Razorpay')) {
                    cleanA = cleanA.replace(/Razorpay UPI \(Google Pay, PhonePe, Paytm\), Debit\/Credit Cards, or Net Banking/gi, 'UPI QR Scan or UPI Apps (Google Pay, PhonePe, Paytm, BHIM) to official UPI ID: 9726362863@ybl');
                    cleanA = cleanA.replace(/Razorpay/gi, 'Instant UPI');
                }
                return [q, cleanA];
            });
            window.REMOTE_FAQS = REMOTE_FAQS;
            if (typeof renderFaqs === 'function' && document.getElementById('faqList')) {
                renderFaqs();
            }
        }
        if (Array.isArray(guide) && guide.length > 0) {
            REMOTE_GUIDE_STEPS = guide.map(s => {
                const step = typeof s === 'string' ? { title: s, desc: '' } : { ...s };
                if (step.desc && (step.desc.includes('Razorpay') || step.title.includes('Government Verified'))) {
                    step.title = 'Membership & Instant UPI Pass';
                    step.desc = 'Community girls: 100% Lifetime Free · Boys: ₹199 for 30 Days Pass via Instant UPI QR Scan / UPI Apps (GPay, PhonePe, Paytm).';
                }
                return step;
            });
            window.REMOTE_GUIDE_STEPS = REMOTE_GUIDE_STEPS;
            if (typeof renderHowItWorks === 'function') {
                renderHowItWorks();
            }
        }
        if (contact && typeof contact === 'object') {
            REMOTE_CONTACT = contact;
            window.REMOTE_CONTACT = contact;
            try {
                localStorage.setItem(LS_CONTACT_KEY, JSON.stringify(contact));
            } catch(e) {}
        }
    } catch(e) {
        console.warn('[Help] syncHelpContentFromSupabase notice:', e);
    }
}


/* ============================================================ HOW IT WORKS & FAQS DYNAMIC RENDER ============================================================ */
function renderHowItWorks() {
    const safeEsc = (s) => (typeof escapeHtml === "function" ? escapeHtml(s) : (typeof window !== "undefined" && window.escapeHtml ? window.escapeHtml(s) : String(s || "")));
    const steps = getHowItWorksSteps();

    // 1. Render inside the Welcome Screen popup modal (#modalGuideSteps)
    const modalWrap = document.getElementById('modalGuideSteps');
    if (modalWrap) {
        modalWrap.innerHTML = steps.map((step, i) => `
            <div class="step-item">
                <div class="snum">${i + 1}</div>
                <div>
                    <div class="stitle">${safeEsc(step.title || '')}</div>
                    <div class="sdesc">${safeEsc(step.desc || '')}</div>
                </div>
            </div>
        `).join('');
    }

    // 2. Render inside the in-app How It Works panel screen (#scrHowItWorksContent)
    const screenWrap = document.getElementById('scrHowItWorksContent');
    if (screenWrap) {
        screenWrap.innerHTML = steps.map((step, i) => `
            <div class="step-item"${i === steps.length - 1 ? ' style="margin-bottom:0;"' : ''}>
                <div class="snum">${i + 1}</div>
                <div>
                    <div class="stitle">${safeEsc(step.title || '')}</div>
                    <div class="sdesc">${safeEsc(step.desc || '')}</div>
                </div>
            </div>
        `).join('');
    }
}

function renderFaqs(filterQuery = '') {
    const wrap = document.getElementById('faqList');
    if (!wrap) return;

    const allFaqs = getFaqs();
    const q = (filterQuery || '').trim().toLowerCase();
    const faqs = q
        ? allFaqs.filter(([quest, ans]) => quest.toLowerCase().includes(q) || ans.toLowerCase().includes(q))
        : allFaqs;

    if (faqs.length === 0) {
        wrap.innerHTML = `
            <div style="padding:24px 12px;text-align:center;color:var(--text-muted);font-size:13px;">
                <i class="fa-solid fa-magnifying-glass" style="font-size:24px;color:var(--text-faint);margin-bottom:8px;display:block;"></i>
                No matching help articles found.
            </div>
        `;
        return;
    }

    wrap.innerHTML = faqs.map(([quest, ans]) => `
        <div class="faq-item" onclick="this.classList.toggle('open')">
            <div class="faq-q">
                <span>${escapeHtml(quest)}</span>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            <div class="faq-a">${escapeHtml(ans)}</div>
        </div>
    `).join('');
}

function filterFaqs(val) {
    renderFaqs(val);
}

function contactSupportAction(type) {
    let contact = { whatsapp: '+91 97263 62863', phone: '+91 97263 62863', email: 'mangalsetu.in@gmail.com' };
    if (REMOTE_CONTACT && typeof REMOTE_CONTACT === 'object') {
        if (REMOTE_CONTACT.whatsapp) contact.whatsapp = REMOTE_CONTACT.whatsapp;
        if (REMOTE_CONTACT.phone) contact.phone = REMOTE_CONTACT.phone;
        if (REMOTE_CONTACT.email) contact.email = REMOTE_CONTACT.email;
    } else {
        try {
            const stored = localStorage.getItem(LS_CONTACT_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.whatsapp && !parsed.whatsapp.includes('98765')) contact.whatsapp = parsed.whatsapp;
                if (parsed.phone && !parsed.phone.includes('4000')) contact.phone = parsed.phone;
                if (parsed.email) contact.email = parsed.email;
            }
        } catch(e) {}
    }

    if (type === 'whatsapp') {
        const cleanNumber = contact.whatsapp.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent('Hello Mangal Setu Support, I need help with my account.')}`, '_blank');
    } else if (type === 'phone') {
        window.location.href = `tel:${contact.phone.replace(/[^0-9+]/g, '')}`;
    } else if (type === 'email') {
        window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent('Support Request — Mangal Setu')}`;
    }
}

// Global Window Exports
if (typeof renderHowItWorks !== 'undefined') window.renderHowItWorks = renderHowItWorks;
if (typeof renderFaqs !== 'undefined') window.renderFaqs = renderFaqs;
if (typeof filterFaqs !== 'undefined') window.filterFaqs = filterFaqs;
if (typeof getFaqs !== 'undefined') window.getFaqs = getFaqs;
if (typeof getHowItWorks !== 'undefined') window.getHowItWorks = getHowItWorks;
if (typeof syncHelpContentFromSupabase !== 'undefined') window.syncHelpContentFromSupabase = syncHelpContentFromSupabase;
