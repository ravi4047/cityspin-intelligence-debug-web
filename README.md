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