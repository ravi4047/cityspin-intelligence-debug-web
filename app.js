// ─── Stats ───────────────────────────────────────────────────────────────────

let totalRequests = 0;
let successCount = 0;
let errorCount = 0;

function updateStats() {
    document.getElementById('totalRequests').textContent = totalRequests;
    document.getElementById('successCount').textContent = successCount;
    document.getElementById('errorCount').textContent = errorCount;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getApiUrl() {
    return document.getElementById('apiUrl').value.replace(/\/$/, '');
}

function getTimingClass(duration) {
    if (duration > 10000) return 'very-slow';
    if (duration > 3000) return 'slow';
    return '';
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = '<div class="loading"></div> Loading...';
    element.className = 'response-area';
}

function showResponse(elementId, data, isError = false, duration = null) {
    const element = document.getElementById(elementId);

    let content = `<pre>${JSON.stringify(data, null, 2)}</pre>`;

    if (duration !== null) {
        const timingClass = getTimingClass(duration);
        content += `
            <div class="response-header" style="margin-top:10px;padding-top:8px;border-top:1px solid #e0e0e0;">
                <span>Response Time:</span>
                <span class="timing-badge ${timingClass}">⏱️ ${Math.round(duration)}ms</span>
            </div>`;
        console.log(`⏱️ ${Math.round(duration)}ms`);
    }

    element.innerHTML = content;
    element.className = isError ? 'response-area response-error' : 'response-area response-success';
}

// ─── Quick-fill helpers ───────────────────────────────────────────────────────

const LOCATIONS = {
    eiffelTower: { lat: '48.858093', lon: '2.294694' },
    paris:       { lat: '48.864716', lon: '2.349014' },
    prague:      { lat: '50.073658', lon: '14.418540' },
    brussels:    { lat: '50.847767', lon: '4.349394' },
};

const PREPARE_POI_IDS = {
    eiffelTower: '16',
    paris: '17',
    prague: '18',
    brussels: '19',
};

function setCoords(prefix, loc) {
    document.getElementById(`${prefix}_lat`).value = loc.lat;
    document.getElementById(`${prefix}_lon`).value = loc.lon;
}

// POI Chat
function fillPOIEiffelTower() { setCoords('poi_chat', LOCATIONS.eiffelTower); }
function fillPOIParis()        { setCoords('poi_chat', LOCATIONS.paris); }
function fillPOIPrague()       { setCoords('poi_chat', LOCATIONS.prague); }
function fillPOIBrussels()     { setCoords('poi_chat', LOCATIONS.brussels); }

// POI Chat Open
function fillPOIOpenEiffelTower() { setCoords('poi_open', LOCATIONS.eiffelTower); }
function fillPOIOpenParis()       { setCoords('poi_open', LOCATIONS.paris); }
function fillPOIOpenPrague()      { setCoords('poi_open', LOCATIONS.prague); }
function fillPOIOpenBrussels()    { setCoords('poi_open', LOCATIONS.brussels); }

// Prepare Open
function fillPrepareOpenEiffelTower() {
    setCoords('prepare_open', LOCATIONS.eiffelTower);
    document.getElementById('prepare_open_poi_id').value = PREPARE_POI_IDS.eiffelTower;
}
function fillPrepareOpenParis() {
    setCoords('prepare_open', LOCATIONS.paris);
    document.getElementById('prepare_open_poi_id').value = PREPARE_POI_IDS.paris;
}
function fillPrepareOpenPrague() {
    setCoords('prepare_open', LOCATIONS.prague);
    document.getElementById('prepare_open_poi_id').value = PREPARE_POI_IDS.prague;
}
function fillPrepareOpenBrussels() {
    setCoords('prepare_open', LOCATIONS.brussels);
    document.getElementById('prepare_open_poi_id').value = PREPARE_POI_IDS.brussels;
}

// POI Multipart
function fillPOIMultiEiffelTower() { setCoords('poi_multi', LOCATIONS.eiffelTower); }
function fillPOIMultiParis()       { setCoords('poi_multi', LOCATIONS.paris); }
function fillPOIMultiPrague()      { setCoords('poi_multi', LOCATIONS.prague); }
function fillPOIMultiBrussels()    { setCoords('poi_multi', LOCATIONS.brussels); }

// Google POI Chat Open
function fillGooglePOIEiffelTower() { setCoords('google_poi', LOCATIONS.eiffelTower); }
function fillGooglePOIParis()       { setCoords('google_poi', LOCATIONS.paris); }
function fillGooglePOIPrague()      { setCoords('google_poi', LOCATIONS.prague); }
function fillGooglePOIBrussels()    { setCoords('google_poi', LOCATIONS.brussels); }

// ─── API: POI Chat ────────────────────────────────────────────────────────────

async function chatPOI() {
    showLoading('poi_chat_response');
    totalRequests++;
    updateStats();

    const startTime = performance.now();

    try {
        const response = await fetch(`${getApiUrl()}/api/v1/chat/poi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': document.getElementById('poi_chat_userId').value,
                'X-User-Email': document.getElementById('poi_chat_email').value,
                'X-User-Email-Verified': 'true'
            },
            body: JSON.stringify({
                event: 'POI_EVENT',
                latitude: parseFloat(document.getElementById('poi_chat_lat').value),
                longitude: parseFloat(document.getElementById('poi_chat_lon').value),
                speed_mps: parseFloat(document.getElementById('poi_chat_speed').value),
                heading_deg: parseFloat(document.getElementById('poi_chat_heading').value)
            })
        });

        const data = await response.json();
        const duration = performance.now() - startTime;

        if (response.ok) {
            successCount++;
            showResponse('poi_chat_response', data, false, duration);
            document.getElementById('poi_chat_audio_section').style.display = 'block';
            document.getElementById('poi_chat_script').textContent = data.content.script;

            const audioPlayer = document.getElementById('poi_chat_audio_player');
            audioPlayer.src = data.content.audio_url;
            audioPlayer.play().catch(err => console.log('Auto-play failed:', err));
        } else {
            errorCount++;
            showResponse('poi_chat_response', data, true, duration);
        }
    } catch (error) {
        const duration = performance.now() - startTime;
        errorCount++;
        showResponse('poi_chat_response', { error: error.message }, true, duration);
    }
    updateStats();
}

// ─── API: POI Chat Open ───────────────────────────────────────────────────────

async function chatPOIOpen() {
    const userText = document.getElementById('poi_open_text').value.trim();
    if (!userText) {
        showResponse('poi_open_response', { error: 'User text is required.' }, true);
        return;
    }

    showLoading('poi_open_response');
    totalRequests++;
    updateStats();

    const startTime = performance.now();

    try {
        const response = await fetch(`${getApiUrl()}/api/v1/chat/poi/open`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': document.getElementById('poi_open_userId').value,
                'X-User-Email': document.getElementById('poi_open_email').value,
                'X-User-Email-Verified': 'true'
            },
            body: JSON.stringify({
                event: 'POI_EVENT',
                latitude: parseFloat(document.getElementById('poi_open_lat').value),
                longitude: parseFloat(document.getElementById('poi_open_lon').value),
                speed_mps: parseFloat(document.getElementById('poi_open_speed').value),
                heading_deg: parseFloat(document.getElementById('poi_open_heading').value),
                user_text: userText
            })
        });

        const data = await response.json();
        const duration = performance.now() - startTime;

        if (response.ok) {
            successCount++;
            showResponse('poi_open_response', data, false, duration);
            document.getElementById('poi_open_audio_section').style.display = 'block';
            document.getElementById('poi_open_script').textContent = data.content.script;

            const audioPlayer = document.getElementById('poi_open_audio_player');
            audioPlayer.src = data.content.audio_url;
            audioPlayer.play().catch(err => console.log('Auto-play failed:', err));
        } else {
            errorCount++;
            showResponse('poi_open_response', data, true, duration);
        }
    } catch (error) {
        const duration = performance.now() - startTime;
        errorCount++;
        showResponse('poi_open_response', { error: error.message }, true, duration);
    }
    updateStats();
}

// ─── API: Prepare Open ───────────────────────────────────────────────────────

async function prepareOpenOnly() {
    const openText = document.getElementById('prepare_open_text').value.trim();
    const poiId   = document.getElementById('prepare_open_poi_id').value.trim();

    if (!openText) { showResponse('prepare_open_response', { error: 'Open text is required.' }, true); return; }
    if (!poiId)    { showResponse('prepare_open_response', { error: 'POI ID is required.' }, true); return; }

    showLoading('prepare_open_response');
    totalRequests++;
    updateStats();

    const startTime = performance.now();

    try {
        const response = await fetch(`${getApiUrl()}/api/v1/test/poi/prepare/open`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': document.getElementById('prepare_open_userId').value,
                'X-User-Email': document.getElementById('prepare_open_email').value,
                'X-User-Email-Verified': 'false'
            },
            body: JSON.stringify({
                latitude: parseFloat(document.getElementById('prepare_open_lat').value),
                longitude: parseFloat(document.getElementById('prepare_open_lon').value),
                speed_mps: parseFloat(document.getElementById('prepare_open_speed').value),
                heading_deg: parseFloat(document.getElementById('prepare_open_heading').value),
                poi_id: poiId,
                open_text: openText
            })
        });

        const data = await response.json();
        const duration = performance.now() - startTime;

        if (!response.ok) {
            errorCount++;
            showResponse('prepare_open_response', data, true, duration);
            updateStats();
            return;
        }

        if (!data.script_id) throw new Error('prepare/open did not return script_id');

        successCount++;
        showResponse('prepare_open_response', data, false, duration);
        document.getElementById('prepare_audio_script_id').value = data.script_id;
    } catch (error) {
        const duration = performance.now() - startTime;
        errorCount++;
        showResponse('prepare_open_response', { error: error.message }, true, duration);
    }
    updateStats();
}

// ─── API: Fetch POI Audio ─────────────────────────────────────────────────────

async function fetchPoiAudioOnly() {
    const scriptId = document.getElementById('prepare_audio_script_id').value.trim();
    if (!scriptId) {
        showResponse('prepare_audio_response', { error: 'Script ID is required.' }, true);
        return;
    }

    showLoading('prepare_audio_response');
    totalRequests++;
    updateStats();

    const startTime = performance.now();

    try {
        const response = await fetch(`${getApiUrl()}/api/v1/audio/test/poi/${encodeURIComponent(scriptId)}`, {
            method: 'GET',
            headers: {
                'X-User-Id': document.getElementById('prepare_audio_userId').value,
                'X-User-Email': document.getElementById('prepare_audio_email').value,
                'X-User-Email-Verified': 'false'
            }
        });

        const duration = performance.now() - startTime;
        const contentType = response.headers.get('Content-Type') || '';

        if (!response.ok) {
            errorCount++;
            showResponse('prepare_audio_response', { error: await response.text() }, true, duration);
            updateStats();
            return;
        }

        if (contentType.includes('audio/')) {
            const audioBlob = await response.blob();
            const audioPlayer = document.getElementById('prepare_audio_player');

            if (audioPlayer.dataset.objectUrl) {
                URL.revokeObjectURL(audioPlayer.dataset.objectUrl);
                delete audioPlayer.dataset.objectUrl;
            }

            const objectUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = objectUrl;
            audioPlayer.dataset.objectUrl = objectUrl;
            document.getElementById('prepare_audio_section').style.display = 'block';

            successCount++;
            showResponse('prepare_audio_response', { script_id: scriptId, status: 'audio_stream_ready' }, false, duration);
            audioPlayer.play().catch(err => console.log('Auto-play failed:', err));
        } else {
            const payload = await response.json();
            const status = (payload.status || '').toLowerCase();

            if (status === 'failed') {
                errorCount++;
                showResponse('prepare_audio_response', { ...payload, error: payload.message || 'Audio generation failed.' }, true, duration);
                updateStats();
                return;
            }

            if (status === 'completed') {
                if (!payload.audio_url) {
                    errorCount++;
                    showResponse('prepare_audio_response', { ...payload, error: 'Completed status returned without audio_url.' }, true, duration);
                    updateStats();
                    return;
                }

                const audioPlayer = document.getElementById('prepare_audio_player');
                if (audioPlayer.dataset.objectUrl) {
                    URL.revokeObjectURL(audioPlayer.dataset.objectUrl);
                    delete audioPlayer.dataset.objectUrl;
                }

                audioPlayer.src = payload.audio_url;
                document.getElementById('prepare_audio_section').style.display = 'block';
                audioPlayer.play().catch(err => console.log('Auto-play failed:', err));
            }

            successCount++;
            showResponse('prepare_audio_response', payload, false, duration);
        }
    } catch (error) {
        const duration = performance.now() - startTime;
        errorCount++;
        showResponse('prepare_audio_response', { error: error.message }, true, duration);
    }
    updateStats();
}

// ─── Multipart parser ─────────────────────────────────────────────────────────

function parseMultipartResponse(arrayBuffer, boundary) {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(arrayBuffer);

    // Extract JSON part
    let jsonData = null;
    const jsonMatch = text.match(/Content-Type: application\/json[\r\n]+[\r\n]+([\s\S]+?)(?=\r\n--)/);
    if (jsonMatch) {
        try { jsonData = JSON.parse(jsonMatch[1].trim()); } catch (e) { console.error('JSON parse failed:', e); }
    }

    // Extract audio bytes from the raw buffer
    const uint8Array = new Uint8Array(arrayBuffer);
    const audioMarker = new TextEncoder().encode('Content-Type: audio/mpeg');
    let audioStartIdx = -1;

    for (let i = 0; i < uint8Array.length - audioMarker.length; i++) {
        if (uint8Array.slice(i, i + audioMarker.length).every((b, j) => b === audioMarker[j])) {
            for (let k = i; k < uint8Array.length - 4; k++) {
                if (uint8Array[k] === 13 && uint8Array[k+1] === 10 && uint8Array[k+2] === 13 && uint8Array[k+3] === 10) {
                    audioStartIdx = k + 4;
                    break;
                }
            }
            break;
        }
    }

    let audioBlob = null;
    if (audioStartIdx > -1) {
        const endBoundary = new TextEncoder().encode(`\r\n--${boundary}`);
        let audioEndIdx = uint8Array.length;

        for (let i = audioStartIdx; i < uint8Array.length - endBoundary.length; i++) {
            if (uint8Array.slice(i, i + endBoundary.length).every((b, j) => b === endBoundary[j])) {
                audioEndIdx = i;
                break;
            }
        }

        audioBlob = new Blob([uint8Array.slice(audioStartIdx, audioEndIdx)], { type: 'audio/mpeg' });
    }

    return { jsonData, audioBlob };
}

// ─── API: POI Chat Open Multipart ─────────────────────────────────────────────

async function chatPOIMultipart() {
    const userText = document.getElementById('poi_multi_text').value.trim();
    if (!userText) {
        showResponse('poi_multi_response', { error: 'User text is required.' }, true);
        return;
    }

    showLoading('poi_multi_response');
    totalRequests++;
    updateStats();

    const startTime = performance.now();

    try {
        const response = await fetch(`${getApiUrl()}/api/v1/chat/poi/open-new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': document.getElementById('poi_multi_userId').value,
                'X-User-Email': document.getElementById('poi_multi_email').value,
                'X-User-Email-Verified': 'true'
            },
            body: JSON.stringify({
                event: 'POI_EVENT',
                latitude: parseFloat(document.getElementById('poi_multi_lat').value),
                longitude: parseFloat(document.getElementById('poi_multi_lon').value),
                speed_mps: parseFloat(document.getElementById('poi_multi_speed').value),
                heading_deg: parseFloat(document.getElementById('poi_multi_heading').value),
                user_text: userText
            })
        });

        const duration = performance.now() - startTime;

        if (response.ok) {
            const contentType = response.headers.get('Content-Type');
            const boundaryMatch = contentType.match(/boundary=([^;]+)/);
            if (!boundaryMatch) throw new Error('No boundary found in multipart response');

            const { jsonData, audioBlob } = parseMultipartResponse(await response.arrayBuffer(), boundaryMatch[1]);
            if (!jsonData || !audioBlob) throw new Error('Failed to parse multipart response');

            successCount++;
            showResponse('poi_multi_response', { status: 'success', message: 'Multipart response parsed successfully', metadata: jsonData }, false, duration);

            document.getElementById('poi_multi_audio_section').style.display = 'block';
            document.getElementById('poi_multi_metadata').textContent = JSON.stringify(jsonData, null, 2);

            const audioPlayer = document.getElementById('poi_multi_audio_player');
            audioPlayer.src = URL.createObjectURL(audioBlob);
            audioPlayer.play().catch(err => console.log('Auto-play failed:', err));
        } else {
            errorCount++;
            showResponse('poi_multi_response', { error: await response.text() }, true, duration);
        }
    } catch (error) {
        const duration = performance.now() - startTime;
        errorCount++;
        showResponse('poi_multi_response', { error: error.message }, true, duration);
    }
    updateStats();
}

// ─── Voice Picker ─────────────────────────────────────────────────────────────

const VP_TYPE_META = {
    'Chirp3-HD': { label: 'Chirp3-HD', desc: 'Conversational HD' },
    'Chirp-HD':  { label: 'Chirp-HD',  desc: 'Conversational HD' },
    'Studio':    { label: 'Studio',    desc: 'Narration' },
    'Neural2':   { label: 'Neural2',   desc: 'General purpose' },
    'Wavenet':   { label: 'Wavenet',   desc: 'General purpose' },
    'Standard':  { label: 'Standard',  desc: 'Cost efficient' },
};

// Preferred order for display
const VP_TYPE_ORDER = ['Chirp3-HD', 'Chirp-HD', 'Studio', 'Neural2', 'Wavenet', 'Standard'];

let vpState = { lang: null, accent: null, type: null, gender: null, voice: null };

function vpInit() {
    const sel = document.getElementById('vp_language');
    Object.keys(VOICE_DATA).sort().forEach(lang => {
        const opt = document.createElement('option');
        opt.value = lang;
        opt.textContent = lang;
        sel.appendChild(opt);
    });
    // Default to English (US) → Chirp3-HD → FEMALE → first voice
    sel.value = 'English';
    vpOnLanguage(/* defaultAccent */ 'English (US)', /* defaultType */ 'Chirp3-HD', /* defaultGender */ 'FEMALE');
}

function vpOnLanguage(defaultAccent, defaultType, defaultGender) {
    const lang = document.getElementById('vp_language').value;
    vpState = { lang, accent: null, type: null, gender: null, voice: null };

    if (!lang) {
        hide('vp_accent_row'); hide('vp_type_gender_row'); hide('vp_voice_row'); hide('vp_selected');
        return;
    }

    const accents = Object.keys(VOICE_DATA[lang]);

    if (accents.length === 1) {
        hide('vp_accent_row');
        vpState.accent = accents[0];
    } else {
        const sel = document.getElementById('vp_accent');
        sel.innerHTML = '';
        accents.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a; opt.textContent = a;
            sel.appendChild(opt);
        });
        if (defaultAccent && accents.includes(defaultAccent)) sel.value = defaultAccent;
        show('vp_accent_row');
        vpState.accent = sel.value;
    }

    vpRenderTypePills(defaultType, defaultGender);
}

function vpOnAccent() {
    vpState.accent = document.getElementById('vp_accent').value;
    vpState.type = null; vpState.gender = null; vpState.voice = null;
    vpRenderTypePills();
}

function vpRenderTypePills(defaultType, defaultGender) {
    const models = VOICE_DATA[vpState.lang]?.[vpState.accent] || {};
    const container = document.getElementById('vp_type_pills');
    container.innerHTML = '';

    const available = VP_TYPE_ORDER.filter(t => models[t]);

    available.forEach(type => {
        const meta = VP_TYPE_META[type] || { label: type, desc: '' };
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'vp-pill';
        pill.innerHTML = `${meta.label}<span class="vp-pill-desc">${meta.desc}</span>`;
        pill.dataset.value = type;
        pill.onclick = () => vpSelectType(type);
        container.appendChild(pill);
    });

    show('vp_type_gender_row');

    const firstType = (defaultType && available.includes(defaultType)) ? defaultType : available[0];
    if (firstType) vpSelectType(firstType, defaultGender);
}

function vpSelectType(type, defaultGender) {
    vpState.type = type; vpState.gender = null; vpState.voice = null;

    // Highlight active pill
    document.querySelectorAll('#vp_type_pills .vp-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.value === type);
    });

    // Render gender pills
    const genders = Object.keys(VOICE_DATA[vpState.lang]?.[vpState.accent]?.[type] || {});
    const container = document.getElementById('vp_gender_pills');
    container.innerHTML = '';

    ['FEMALE', 'MALE'].forEach(g => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'vp-pill' + (genders.includes(g) ? '' : ' disabled');
        pill.innerHTML = g === 'FEMALE' ? '♀ Female' : '♂ Male';
        pill.dataset.value = g;
        if (genders.includes(g)) pill.onclick = () => vpSelectGender(g);
        container.appendChild(pill);
    });

    const firstGender = (defaultGender && genders.includes(defaultGender)) ? defaultGender : genders[0];
    if (firstGender) vpSelectGender(firstGender);
}

function vpSelectGender(gender) {
    vpState.gender = gender;

    document.querySelectorAll('#vp_gender_pills .vp-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.value === gender);
    });

    const voices = VOICE_DATA[vpState.lang]?.[vpState.accent]?.[vpState.type]?.[gender] || [];
    const sel = document.getElementById('vp_voice');
    sel.innerHTML = '';
    voices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v; opt.textContent = v;
        sel.appendChild(opt);
    });

    show('vp_voice_row');
    vpOnVoice();
}

function vpOnVoice() {
    vpState.voice = document.getElementById('vp_voice').value;
    const badge = document.getElementById('vp_selected');
    const val   = document.getElementById('vp_selected_value');
    if (vpState.voice) {
        val.textContent = vpState.voice;
        show('vp_selected');
    } else {
        hide('vp_selected');
    }
}

function show(id) { document.getElementById(id).style.display = ''; }
function hide(id) { document.getElementById(id).style.display = 'none'; }

// Init picker on page load
window.addEventListener('load', () => {
    vpInit();
    setTimeout(healthCheck, 500);
});

// ─── API: Google POI Chat Open ────────────────────────────────────────────────

async function chatGooglePOIOpen() {
    const userText = document.getElementById('google_poi_text').value.trim();
    if (!userText) {
        showResponse('google_poi_response', { error: 'User text is required.' }, true);
        return;
    }

    const selectedVoice = vpState.voice;
    if (!selectedVoice) {
        showResponse('google_poi_response', { error: 'Please select a voice first.' }, true);
        return;
    }

    showLoading('google_poi_response');
    totalRequests++;
    updateStats();

    const startTime = performance.now();

    try {
        const response = await fetch(`${getApiUrl()}/api/v1/google/poi/open`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': document.getElementById('google_poi_userId').value,
                'X-User-Email': document.getElementById('google_poi_email').value,
                'X-User-Email-Verified': 'true'
            },
            body: JSON.stringify({
                event: 'POI_EVENT',
                latitude:    parseFloat(document.getElementById('google_poi_lat').value),
                longitude:   parseFloat(document.getElementById('google_poi_lon').value),
                speed_mps:   parseFloat(document.getElementById('google_poi_speed').value),
                heading_deg: parseFloat(document.getElementById('google_poi_heading').value),
                user_text:   userText,
                google_tts_voice: selectedVoice,
                google_tts_language: vpState.lang.toLowerCase()
            })
        });

        const data = await response.json();
        const duration = performance.now() - startTime;

        if (response.ok) {
            successCount++;
            showResponse('google_poi_response', data, false, duration);
            document.getElementById('google_poi_audio_section').style.display = 'block';
            document.getElementById('google_poi_script').textContent = data.content.script;

            const audioPlayer = document.getElementById('google_poi_audio_player');
            audioPlayer.src = data.content.audio_url;
            audioPlayer.play().catch(err => console.log('Auto-play failed:', err));
        } else {
            errorCount++;
            showResponse('google_poi_response', data, true, duration);
        }
    } catch (error) {
        const duration = performance.now() - startTime;
        errorCount++;
        showResponse('google_poi_response', { error: error.message }, true, duration);
    }
    updateStats();
}

// ─── Quick-fill: Stream ───────────────────────────────────────────────────────

function fillGoogleStreamEiffelTower() {
    setCoords('stream', LOCATIONS.eiffelTower);
    document.getElementById('stream_poi_id').value = PREPARE_POI_IDS.eiffelTower;
}
function fillGoogleStreamParis() {
    setCoords('stream', LOCATIONS.paris);
    document.getElementById('stream_poi_id').value = PREPARE_POI_IDS.paris;
}
function fillGoogleStreamPrague() {
    setCoords('stream', LOCATIONS.prague);
    document.getElementById('stream_poi_id').value = PREPARE_POI_IDS.prague;
}
function fillGoogleStreamBrussels() {
    setCoords('stream', LOCATIONS.brussels);
    document.getElementById('stream_poi_id').value = PREPARE_POI_IDS.brussels;
}

// ─── API: Google POI Open Stream ──────────────────────────────────────────────

// ─── API: Google POI Open Stream ──────────────────────────────────────────────

async function streamGooglePOI() {
    const openText = document.getElementById('stream_open_text').value.trim();
    const poiId    = document.getElementById('stream_poi_id').value.trim();

    if (!openText) { showResponse('stream_response', { error: 'Open text is required.' }, true); return; }
    if (!poiId)    { showResponse('stream_response', { error: 'POI ID is required.' }, true); return; }

    const btn          = document.getElementById('stream_btn');
    const progressWrap = document.getElementById('stream_progress_wrap');
    const progressFill = document.getElementById('stream_progress_fill');
    const statusText   = document.getElementById('stream_status_text');
    const bytesText    = document.getElementById('stream_bytes_text');
    const audioSection = document.getElementById('stream_audio_section');
    const audioPlayer  = document.getElementById('stream_audio_player');

    // ── Tear down any previous MediaSource session ────────────────────────────
    if (audioPlayer.dataset.objectUrl) {
        URL.revokeObjectURL(audioPlayer.dataset.objectUrl);
        delete audioPlayer.dataset.objectUrl;
    }
    audioPlayer.src = '';
    audioSection.style.display = 'none';

    // Reset progress bar
    progressFill.className = 'stream-progress-fill indeterminate';
    progressFill.style.width = '';
    progressFill.style.background = '';
    statusText.textContent = 'Connecting…';
    bytesText.textContent  = '';
    progressWrap.style.display = 'block';

    btn.disabled = true;
    btn.textContent = '⏳ Streaming…';
    showLoading('stream_response');
    totalRequests++;
    updateStats();

    const startTime = performance.now();

    try {
        const response = await fetch(`${getApiUrl()}/api/v1/test/chat/google/poi/open/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id':    document.getElementById('stream_userId').value,
                'X-User-Email': document.getElementById('stream_email').value,
                'X-User-Email-Verified': 'true',
            },
            body: JSON.stringify({
                latitude:    parseFloat(document.getElementById('stream_lat').value),
                longitude:   parseFloat(document.getElementById('stream_lon').value),
                speed_mps:   parseFloat(document.getElementById('stream_speed').value),
                heading_deg: parseFloat(document.getElementById('stream_heading').value),
                poi_id:      poiId,
                open_text:   openText,
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const contentType = response.headers.get('Content-Type') || '';
        if (!contentType.includes('audio/')) {
            throw new Error(`Unexpected Content-Type: "${contentType}"`);
        }

        // ── Set up MediaSource for true streaming playback ────────────────────
        // MSE lets us push chunks into the audio buffer as they arrive,
        // so the audio starts playing before the full response is received.
        const mime = 'audio/mpeg';
        if (!MediaSource.isTypeSupported(mime)) {
            throw new Error(`MediaSource does not support "${mime}" in this browser. Try Chrome or Edge.`);
        }

        const mediaSource = new MediaSource();
        const objectUrl   = URL.createObjectURL(mediaSource);
        audioPlayer.src   = objectUrl;
        audioPlayer.dataset.objectUrl = objectUrl;
        audioSection.style.display = 'block';

        // Wait for MediaSource to open before we can create a SourceBuffer
        await new Promise((resolve, reject) => {
            mediaSource.addEventListener('sourceopen', resolve, { once: true });
            mediaSource.addEventListener('error',      reject,  { once: true });
        });

        const sourceBuffer = mediaSource.addSourceBuffer(mime);

        // SourceBuffer is synchronous and can only accept one chunk at a time.
        // We queue incoming chunks and drain the queue after each updateend.
        const queue = [];
        let   streamDone = false;
        let   received   = 0;
        const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);

        function drainQueue() {
            if (sourceBuffer.updating || queue.length === 0) return;
            sourceBuffer.appendBuffer(queue.shift());
        }

        sourceBuffer.addEventListener('updateend', () => {
            if (queue.length > 0) {
                drainQueue();
            } else if (streamDone && mediaSource.readyState === 'open') {
                // All chunks have been flushed — signal end of stream
                mediaSource.endOfStream();
                progressFill.style.width  = '100%';
                statusText.textContent    = '✅ Stream complete';
            }
        });

        // ── Read the fetch ReadableStream chunk by chunk ──────────────────────
        progressFill.className = 'stream-progress-fill';   // stop indeterminate pulse
        statusText.textContent = 'Buffering…';

        const reader = response.body.getReader();
        let firstChunk = true;

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                streamDone = true;
                // If the sourceBuffer is idle right now, end the stream immediately
                if (!sourceBuffer.updating && queue.length === 0 && mediaSource.readyState === 'open') {
                    mediaSource.endOfStream();
                    progressFill.style.width = '100%';
                    statusText.textContent   = '✅ Stream complete';
                }
                break;
            }

            received += value.byteLength;
            queue.push(value.buffer);
            drainQueue();  // push to SourceBuffer if it's not busy

            // Autoplay on first chunk so audio starts immediately
            if (firstChunk) {
                firstChunk = false;
                statusText.textContent = '▶ Playing…';
                audioPlayer.play().catch(err => console.log('Auto-play blocked:', err));
            }

            // Update progress bar
            if (contentLength > 0) {
                const pct = Math.min(99, Math.round((received / contentLength) * 100));
                progressFill.style.width = pct + '%';
                statusText.textContent   = `▶ Playing… ${pct}%`;
            } else {
                // No Content-Length (typical for StreamingResponse) — log-scale approximation
                const logPct = Math.min(90, Math.round(Math.log1p(received / 1024) * 12));
                progressFill.style.width = logPct + '%';
            }

            bytesText.textContent = formatBytes(received);
        }

        const duration = performance.now() - startTime;
        successCount++;
        showResponse('stream_response', {
            status:         'streaming',
            note:           'Audio started playing on first chunk — did NOT wait for full download.',
            bytes_received: received,
            content_type:   contentType,
            duration_ms:    Math.round(duration),
        }, false, duration);

    } catch (error) {
        const duration = performance.now() - startTime;
        progressFill.className    = 'stream-progress-fill';
        progressFill.style.width  = '100%';
        progressFill.style.background = '#f44336';
        statusText.textContent    = '❌ Failed';
        bytesText.textContent     = '';
        errorCount++;
        showResponse('stream_response', { error: error.message }, true, duration);
    } finally {
        btn.disabled    = false;
        btn.textContent = '📡 Stream Audio';
        updateStats();
    }
}

function formatBytes(bytes) {
    if (bytes < 1024)        return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ─────────────────────────────────────────────────────────────────────────────

async function healthCheck() {
    showLoading('health_response');
    totalRequests++;
    updateStats();

    const startTime = performance.now();

    try {
        const response = await fetch(`${getApiUrl()}/api/v1/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        const duration = performance.now() - startTime;

        if (response.ok) {
            successCount++;
            showResponse('health_response', data, false, duration);
        } else {
            errorCount++;
            showResponse('health_response', data, true, duration);
        }
    } catch (error) {
        const duration = performance.now() - startTime;
        errorCount++;
        showResponse('health_response', { error: error.message }, true, duration);
    }
    updateStats();
}


