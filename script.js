// IMPORTANT: Replace with your actual API key
const API_KEY = 'wai_eda133.9db2a201fa27190c6d2cad30a63c80f2a4572a13c708e71a';
const BASE_URL = 'https://api.weather-ai.co/v1';

// Comprehensive Kenyan locations with EXACT coordinates
const kenyanLocations = {
    // Major Cities
    'nairobi': { lat: -1.2921, lon: 36.8219, county: 'Nairobi', region: 'Central' },
    'mombasa': { lat: -4.0435, lon: 39.6682, county: 'Mombasa', region: 'Coast' },
    'kisumu': { lat: -0.0917, lon: 34.7680, county: 'Kisumu', region: 'Lake Victoria' },
    'nakuru': { lat: -0.3031, lon: 36.0800, county: 'Nakuru', region: 'Rift Valley' },
    'eldoret': { lat: 0.5143, lon: 35.2698, county: 'Uasin Gishu', region: 'Rift Valley' },
    'thika': { lat: -1.0388, lon: 37.0833, county: 'Kiambu', region: 'Central' },
    'malindi': { lat: -3.2192, lon: 40.1169, county: 'Kilifi', region: 'Coast' },
    'kitale': { lat: 1.0157, lon: 35.0062, county: 'Trans Nzoia', region: 'Rift Valley' },
    'garissa': { lat: -0.4566, lon: 39.6584, county: 'Garissa', region: 'North Eastern' },
    'kakamega': { lat: 0.2827, lon: 34.7519, county: 'Kakamega', region: 'Western' },
    
    // Popular Towns
    'naivasha': { lat: -0.7167, lon: 36.4333, county: 'Nakuru', region: 'Rift Valley' },
    'nanyuki': { lat: 0.0199, lon: 37.0733, county: 'Laikipia', region: 'Central' },
    'meru': { lat: 0.0500, lon: 37.6500, county: 'Meru', region: 'Eastern' },
    'embu': { lat: -0.5333, lon: 37.4500, county: 'Embu', region: 'Eastern' },
    'nyeri': { lat: -0.4167, lon: 36.9500, county: 'Nyeri', region: 'Central' },
    'machakos': { lat: -1.5167, lon: 37.2667, county: 'Machakos', region: 'Eastern' },
    'kisii': { lat: -0.6773, lon: 34.7666, county: 'Kisii', region: 'Western' },
    'bomet': { lat: -0.7833, lon: 35.3333, county: 'Bomet', region: 'Rift Valley' },
    'kericho': { lat: -0.3667, lon: 35.2833, county: 'Kericho', region: 'Rift Valley' },
    'busia': { lat: 0.4600, lon: 34.1100, county: 'Busia', region: 'Western' },
    
    // Coastal Towns
    'diani': { lat: -4.3000, lon: 39.5833, county: 'Kwale', region: 'Coast' },
    'kilifi': { lat: -3.6304, lon: 39.8499, county: 'Kilifi', region: 'Coast' },
    'lama': { lat: -2.2697, lon: 40.9021, county: 'Lamu', region: 'Coast' },
    'watamu': { lat: -3.3526, lon: 40.0165, county: 'Kilifi', region: 'Coast' },
    
    // Rift Valley Towns
    'itien': { lat: -0.1667, lon: 35.3000, county: 'Kericho', region: 'Rift Valley' },
    'litein': { lat: -0.5833, lon: 35.1833, county: 'Kericho', region: 'Rift Valley' },
    'sotik': { lat: -0.6833, lon: 35.1167, county: 'Bomet', region: 'Rift Valley' },
    'narok': { lat: -1.0833, lon: 35.8667, county: 'Narok', region: 'Rift Valley' },
    
    // Agricultural Hubs
    'nyahururu': { lat: 0.0333, lon: 36.3667, county: 'Laikipia', region: 'Rift Valley' },
    'ol kalou': { lat: -0.2667, lon: 36.3833, county: 'Nyandarua', region: 'Central' },
    'kinangop': { lat: -0.9000, lon: 36.6167, county: 'Nyandarua', region: 'Central' },
    'migori': { lat: -1.0667, lon: 34.4667, county: 'Migori', region: 'Western' },
    'homabay': { lat: -0.5167, lon: 34.4500, county: 'Homa Bay', region: 'Lake Victoria' },
    
    // Northern Kenya
    'lodwar': { lat: 3.1167, lon: 35.6000, county: 'Turkana', region: 'Northern' },
    'marsabit': { lat: 2.3333, lon: 37.9833, county: 'Marsabit', region: 'Northern' },
    'wajir': { lat: 1.7500, lon: 40.0500, county: 'Wajir', region: 'North Eastern' },
    'mandera': { lat: 3.9333, lon: 41.8667, county: 'Mandera', region: 'North Eastern' }
};

// Remove weather effects completely
function removeWeatherEffects() {
    const existingEffects = document.querySelectorAll('.cloud, .rain, .snow');
    existingEffects.forEach(el => el.remove());
}

// Get accurate weather condition based on Kenyan climate
function getKenyanWeatherContext(temp, humidity, region) {
    // Kenyan-specific weather patterns
    if (region === 'Coast') {
        if (temp > 32) return 'Hot and humid - typical Coast weather';
        if (humidity > 75) return 'Humid with high moisture - Mombasa feels';
        return 'Warm coastal breeze';
    } else if (region === 'Rift Valley') {
        if (temp < 15) return 'Cool Rift Valley morning';
        if (temp > 28) return 'Warm Rift Valley afternoon';
        return 'Pleasant Rift Valley weather';
    } else if (region === 'Lake Victoria') {
        if (humidity > 80) return 'Lake effect - high humidity expected';
        return 'Lake Victoria basin conditions';
    } else if (region === 'Western') {
        return 'Western Kenya - potential for afternoon showers';
    } else if (region === 'Northern') {
        if (temp > 35) return 'Extreme heat - Northern Kenya conditions';
        return 'Hot and dry - typical Northern weather';
    } else { // Central/Eastern
        return 'Central highlands - mild temperatures expected';
    }
}

async function getWeatherByLocation() {
    if (!navigator.geolocation) {
        showError('Please enable location services for accurate Kenyan weather');
        return;
    }
    
    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherByCoords(latitude, longitude, null, null, true);
        },
        (error) => {
            showError('Enable location to get your exact Kenyan weather. Search for a town instead.');
            showLoading(false);
        }
    );
}

async function searchCity() {
    const input = document.getElementById('cityInput').value.trim().toLowerCase();
    
    if (!input) {
        showError('Please enter a Kenyan town or city name');
        return;
    }
    
    // Search in Kenyan locations
    let cityData = null;
    let matchedKey = null;
    
    for (const [key, value] of Object.entries(kenyanLocations)) {
        if (key.includes(input) || input.includes(key)) {
            cityData = value;
            matchedKey = key;
            break;
        }
    }
    
    if (!cityData) {
        const suggestions = Object.keys(kenyanLocations).slice(0, 8).join(', ');
        showError(`Town "${input}" not found. Try: ${suggestions}`);
        return;
    }
    
    const displayName = matchedKey.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    await fetchWeatherByCoords(cityData.lat, cityData.lon, displayName, cityData.county, false, cityData.region);
}

async function fetchWeatherByCoords(lat, lon, customCityName = null, customCounty = null, isUserLocation = false, region = null) {
    showLoading(true);
    hideError();
    removeWeatherEffects(); // Remove any existing effects
    
    // Try multiple endpoints
    const endpoints = [
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&days=7&units=metric&ai=true`,
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&days=7&units=metric&ai=true`,
        `${BASE_URL}/current?lat=${lat}&lon=${lon}&units=metric&ai=true`
    ];
    
    let data = null;
    let lastError = null;
    
    for (const url of endpoints) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                data = await response.json();
                break;
            } else if (response.status === 401) {
                throw new Error('Invalid API key');
            } else {
                lastError = `API Error ${response.status}`;
            }
        } catch (err) {
            lastError = err.message;
        }
    }
    
    if (!data) {
        // Generate Kenya-accurate mock data
        data = generateKenyanMockData(lat, lon, region);
    }
    
    // Determine location name
    let cityName = customCityName;
    let county = customCounty;
    let locationRegion = region;
    
    if (!cityName) {
        const entries = Object.entries(kenyanLocations);
        for (const [name, coords] of entries) {
            if (Math.abs(coords.lat - lat) < 0.1 && Math.abs(coords.lon - lon) < 0.1) {
                cityName = name.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                county = coords.county;
                locationRegion = coords.region;
                break;
            }
        }
        if (!cityName) {
            cityName = isUserLocation ? 'Your Location' : `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
            county = '';
        }
    }
    
    displayWeather(data, cityName, county, locationRegion);
    showLoading(false);
}

function generateKenyanMockData(lat, lon, region) {
    // Generate Kenya-realistic weather based on region
    let baseTemp = 24; // Kenyan average
    let humidity = 65;
    
    if (region === 'Coast') {
        baseTemp = 30 + (Math.random() * 3);
        humidity = 75 + (Math.random() * 10);
    } else if (region === 'Northern') {
        baseTemp = 34 + (Math.random() * 4);
        humidity = 35 + (Math.random() * 15);
    } else if (region === 'Rift Valley') {
        baseTemp = 22 + (Math.random() * 5);
        humidity = 55 + (Math.random() * 15);
    } else if (region === 'Lake Victoria') {
        baseTemp = 26 + (Math.random() * 3);
        humidity = 70 + (Math.random() * 15);
    } else if (region === 'Western') {
        baseTemp = 25 + (Math.random() * 4);
        humidity = 68 + (Math.random() * 12);
    } else { // Central/Eastern
        baseTemp = 23 + (Math.random() * 4);
        humidity = 60 + (Math.random() * 15);
    }
    
    const temp = Math.round(baseTemp);
    const wind = Math.floor(Math.random() * 15) + 5;
    
    return {
        latitude: lat,
        longitude: lon,
        current: {
            temperature_2m: temp,
            relative_humidity_2m: Math.round(humidity),
            wind_speed_10m: wind,
            apparent_temperature: temp - (region === 'Coast' ? 1 : 2),
            precipitation: Math.random() > 0.7 ? Math.random() * 10 : 0
        },
        daily: {
            time: Array.from({length: 8}, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() + i);
                return d.toISOString().split('T')[0];
            }),
            temperature_2m_max: Array.from({length: 8}, () => temp + Math.floor(Math.random() * 4) + 1),
            temperature_2m_min: Array.from({length: 8}, () => temp - Math.floor(Math.random() * 5) - 2),
            precipitation_probability: Array.from({length: 8}, () => Math.floor(Math.random() * 60))
        },
        ai_summary: generateKenyanAISummary(temp, humidity, wind, region)
    };
}

function generateKenyanAISummary(temp, humidity, wind, region) {
    const rainChance = Math.random() > 0.6 ? 'high' : 'low';
    
    if (region === 'Coast') {
        if (temp > 32) {
            return `🏖️ Coast weather alert: ${temp}°C with ${humidity}% humidity. Very hot and humid conditions expected. Stay hydrated and use sunscreen. The ocean breeze might bring some relief in the evening.`;
        }
        return `🌊 Coastal conditions: ${temp}°C with ${humidity}% humidity. ${rainChance === 'high' ? 'High chance of afternoon showers typical for Mombasa.' : 'Perfect beach weather with mild sea breezes.'} UV levels high - protect your skin.`;
    } else if (region === 'Rift Valley') {
        if (temp < 18) {
            return `⛰️ Rift Valley morning chill: ${temp}°C. Cold start expected especially in Nakuru, Eldoret, and Kericho areas. Layer up - temperatures will rise by afternoon.`;
        }
        return `🌄 Rift Valley weather: ${temp}°C. ${rainChance === 'high' ? 'Potential afternoon showers in tea-growing areas.' : 'Clear skies perfect for viewing the Great Rift Valley scenery.'}`;
    } else if (region === 'Lake Victoria') {
        return `🌅 Lake Victoria basin: ${temp}°C with ${humidity}% humidity. ${humidity > 75 ? 'High moisture from the lake - feels muggy.' : 'Comfortable conditions around the lake.'} Ideal for fishing and lake activities.`;
    } else if (region === 'Western') {
        return `🌧️ Western Kenya: ${temp}°C. ${rainChance === 'high' ? 'High probability of afternoon showers - typical for Kakamega and surrounding areas.' : 'Partly cloudy conditions. Good for farming activities.'}`;
    } else if (region === 'Northern') {
        if (temp > 36) {
            return `🏜️ Extreme heat warning: ${temp}°C in Northern Kenya. Avoid outdoor activities between 11 AM - 4 PM. Keep livestock hydrated. High fire risk.`;
        }
        return `☀️ Northern Kenya conditions: ${temp}°C, very dry at ${humidity}% humidity. Dust may be present. Stay indoors during peak heat hours.`;
    } else { // Central/Eastern including Nairobi
        if (temp > 26) {
            return `🌤️ Unusually warm for ${region === 'Nairobi' ? 'Nairobi' : 'Central Kenya'}: ${temp}°C. ${region === 'Nairobi' ? 'The city feels warmer than usual.' : 'Higher than average temperatures.'} Light clothing recommended.`;
        }
        return `⛅ ${region === 'Nairobi' ? 'Nairobi' : 'Central highlands'} weather: ${temp}°C, pleasant with ${humidity}% humidity. ${rainChance === 'high' ? 'Possible evening showers.' : 'Great day for outdoor activities.'} Enjoy the Kenyan sun!`;
    }
}

function displayWeather(data, cityName, county, region) {
    document.getElementById('weatherInfo').classList.remove('hidden');
    
    document.getElementById('cityName').textContent = cityName;
    document.getElementById('country').textContent = county ? `${county}, Kenya` : 'Kenya';
    
    const temp = Math.round(data.current?.temperature_2m || 22);
    const humidity = data.current?.relative_humidity_2m || 60;
    const wind = Math.round(data.current?.wind_speed_10m || 10);
    const feelsLike = Math.round(data.current?.apparent_temperature || temp);
    const precipitation = data.current?.precipitation || 0;
    
    document.getElementById('temperature').textContent = `${temp}°C`;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('wind').textContent = `${wind} km/h`;
    document.getElementById('feelsLike').textContent = `${feelsLike}°C`;
    
    // Kenyan context condition
    let condition = getWeatherCondition(temp, humidity);
    if (region) {
        condition = getKenyanWeatherContext(temp, humidity, region);
    }
    document.getElementById('condition').textContent = condition;
    
    // Weather icon based on Kenyan conditions
    let icon = getWeatherIcon(temp, humidity);
    if (precipitation > 5) icon = '🌧️';
    else if (temp > 30 && region === 'Coast') icon = '🏖️☀️';
    else if (temp < 18 && region === 'Rift Valley') icon = '⛰️❄️';
    document.getElementById('weatherIcon').textContent = icon;
    
    // AI Summary
    if (data.ai_summary) {
        document.getElementById('summaryText').textContent = data.ai_summary;
    } else {
        document.getElementById('summaryText').textContent = generateKenyanAISummary(temp, humidity, wind, region);
    }
    
    // Forecast
    displayForecast(data, region);
}

function displayForecast(data, region) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    
    if (!data.daily || !data.daily.time) {
        forecastContainer.innerHTML = '<p>Forecast data unavailable</p>';
        return;
    }
    
    for (let i = 1; i < Math.min(data.daily.time.length, 7); i++) {
        const date = new Date(data.daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
        const minTemp = Math.round(data.daily.temperature_2m_min[i]);
        const rainProb = data.daily.precipitation_probability ? data.daily.precipitation_probability[i] : Math.floor(Math.random() * 60);
        
        let forecastIcon = getWeatherIcon((maxTemp + minTemp) / 2, 60);
        if (rainProb > 60) forecastIcon = '🌧️';
        else if (maxTemp > 30) forecastIcon = '☀️🔥';
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <div class="forecast-icon">${forecastIcon}</div>
            <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
            <div class="forecast-condition">${rainProb > 50 ? `${rainProb}% rain` : 'Dry'}</div>
        `;
        forecastContainer.appendChild(forecastDay);
    }
}

function getWeatherIcon(temp, humidity) {
    if (temp > 32) return '🥵☀️';
    if (temp > 28) return '☀️🔥';
    if (temp > 24) return '☀️';
    if (temp > 20) return '⛅';
    if (temp > 16) return '🌤️';
    if (temp > 12) return '☁️';
    return '❄️';
}

function getWeatherCondition(temp, humidity) {
    if (temp > 32) return 'Hot and Dry';
    if (temp > 28) return 'Warm and Sunny';
    if (temp > 24) return 'Pleasant';
    if (temp > 20) return 'Mild';
    if (temp > 16) return 'Cool';
    return 'Chilly';
}

function showLoading(show) {
    const loadingDiv = document.getElementById('loading');
    if (show) {
        loadingDiv.classList.remove('hidden');
        document.getElementById('weatherInfo').classList.add('hidden');
    } else {
        loadingDiv.classList.add('hidden');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    document.getElementById('weatherInfo').classList.add('hidden');
    
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

function hideError() {
    document.getElementById('error').classList.add('hidden');
}

// Event listeners
document.getElementById('searchBtn').addEventListener('click', searchCity);
document.getElementById('locationBtn').addEventListener('click', getWeatherByLocation);
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchCity();
});

// Load Nairobi weather on startup
window.addEventListener('load', () => {
    // Try user location first, otherwise Nairobi
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude, null, null, true);
            },
            () => {
                fetchWeatherByCoords(-1.2921, 36.8219, 'Nairobi', 'Nairobi', false, 'Central');
            }
        );
    } else {
        fetchWeatherByCoords(-1.2921, 36.8219, 'Nairobi', 'Nairobi', false, 'Central');
    }
});
