# City Spin Intelligence Service Debug Webpage

🎯 Features:
1. All API Endpoints Covered

✅ Location Update - Test POI triggering with real-time location
✅ Get Nearby POIs - Fetch and view Mapbox POIs
✅ Fetch News - Test Grok news generation
✅ Check Profile - Test profile completeness logic
✅ Health Check - Verify backend is running
✅ Debug Stats - See cache sizes and system stats

2. Smart Features

🌍 Quick Fill Buttons - One-click to test Prague, New York, Tokyo
📊 Live Stats - Track total requests, success/error counts
🎨 Color-coded Responses - Green for success, red for errors
🔑 API Key Support - Optional authentication
📱 Responsive Design - Works on desktop and mobile

3. Pre-filled Test Data

User profile with worldview, interests, vibe
Realistic GPS coordinates
Walking speed simulation
All fields ready to go!

📝 Usage Examples:
Test Location Updates:

Click "Prague" quick-fill button
Adjust speed/heading if needed
Click "Update Location"
See response: IDLE, PREFETCH, or PLAY

Test POI Fetching:

Enter coordinates (Prague pre-filled)
Set radius (200m default)
Toggle "Enrich with Wikipedia" for richer descriptions
Click "Fetch POIs"

Test News Generation:

Enter city/country
Select worldview (see how AI frames news differently!)
Click "Fetch News"
See AI-generated news in user's political lens

🎨 Color Coding:

🟢 Green Response = Success (200 OK)
🔴 Red Response = Error (4xx/5xx)
🔵 Blue Badges = GET request
🟣 Purple Badges = POST request

💡 Pro Tips:

Test Worldview Bias:

Fetch same news with "progressive" vs "conservative"
See how AI frames it differently!


Test Stationary Detection:

Set speed to 0.3 m/s
Should trigger news instead of POIs


Test Profile Nudges:

Leave name/age empty in Profile Check
See which fields system wants to collect


Monitor Stats:

Watch cache sizes grow in Debug Stats
Verify POI cache is working


async function updateLocation() {
            const lat = parseFloat(document.getElementById('lat').value);
            const lon = parseFloat(document.getElementById('lon').value);
            const apiUrl = document.getElementById('apiUrl').value.replace(/\/$/, '');

            document.getElementById('loadingOverlay').classList.add('show');
            requestCount++;
            document.getElementById('requestCount').textContent = requestCount;

            try {
                const response = await fetch(`${apiUrl}/api/v1/location/update?fetch_pois=true`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: 'debug_user',
                        profile: {
                            user_id: 'debug_user',
                            name: document.getElementById('userName').value,
                            age: 28,
                            language: document.getElementById('language').value,
                            vibe: document.getElementById('vibe').value,
                            worldview: 'moderate',
                            interests: ['history', 'architecture']
                        },
                        location: {
                            lat: lat,
                            lon: lon,
                            speed: parseFloat(document.getElementById('speed').value),
                            heading: parseFloat(document.getElementById('heading').value),
                            accuracy: 10.0
                        }
                    })
                });

                const data = await response.json();
                
                // Update response display
                const responseEl = document.getElementById('response');
                responseEl.textContent = JSON.stringify(data, null, 2);
                responseEl.className = response.ok ? 'response-area response-success' : 'response-area response-error';

                // Fetch POIs to display on map
                const poisResponse = await fetch(
                    `${apiUrl}/api/v1/pois/nearby?lat=${lat}&lon=${lon}&radius=${document.getElementById('radius').value}&limit=20`
                );
                const pois = await poisResponse.json();

                // Update map
                updateMapLocation(lat, lon);
                addPOIMarkers(pois);

                // Update POI list
                document.getElementById('poiCount').textContent = pois.length;
                const poiListEl = document.getElementById('poiList');
                poiListEl.innerHTML = pois.map(poi => `
                    <div class="poi-item" onclick="map.flyTo({center: [${poi.lon}, ${poi.lat}], zoom: 18})">
                        <strong>${poi.name}</strong><br>
                        <small>${poi.category} · ${calculateDistance(lat, lon, poi.lat, poi.lon).toFixed(0)}m away</small>
                    </div>
                `).join('');

            } catch (error) {
                const responseEl = document.getElementById('response');
                responseEl.textContent = JSON.stringify({ error: error.message }, null, 2);
                responseEl.className = 'response-area response-error';
            } finally {
                document.getElementById('loadingOverlay').classList.remove('show');
            }
        }