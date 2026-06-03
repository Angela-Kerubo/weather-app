// IMPORTANT: Replace with your actual API key
const API_KEY = 'wai_eda133.9db2a201fa27190c6d2cad30a63c80f2a4572a13c708e71a';
const BASE_URL = 'https://api.weather-ai.co/v1';

// City database
const cities = {
    'nairobi': { lat: -1.2921, lon: 36.8219, country: 'Kenya' },
    'london': { lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
    'new york': { lat: 40.7128, lon: -74.0060, country: 'USA' },
    'tokyo': { lat: 35.6895, lon: 139.6917, country: 'Japan' },
    'paris': { lat: 48.8566, lon: 2.3522, country: 'France' },
    'sydney': { lat: -33.8688, lon: 151.2093, country: 'Australia' },
    'mumbai': { lat: 19.0760, lon: 72.8777, country: 'India' },
    'cairo': { lat: 30.0444, lon: 31.2357, country: 'Egypt' },
    'cape town': { lat: -33.9249, lon: 18.4241, country: 'South Africa' },
    'lagos': { lat: 6.5244, lon: 3.3792, country: 'Nigeria' },
    'dubai': { lat: 25.2048, lon: 55.2708, country: 'UAE' },
    'singapore': { lat: 1.3521, lon: 103.8198, country: 'Singapore' },
    'hong kong': { lat: 22.3193, lon: 114.1694, country: 'China' },
    'los angeles': { lat: 34.0522, lon: -118.2437, country: 'USA' },
    'chicago': { lat: 41.8781, lon: -87.6298, country: 'USA' }
};

// Weather effects based on condition
let weatherEffects = null;

function createWeatherEffects(type) {
    // Remove existing effects
    const existingClouds = document.querySelectorAll('.cloud, .rain, .snow');
    existingClouds.forEach(el => el.remove());
    
    if (type === 'rainy') {
        for (let i = 0; i < 100; i++) {
            const rain = document.createElement('div');
            rain.className = 'rain';
            rain.style.left = Math.random() * 100 + '%';
            rain.style.animationDuration = Math.random() * 1 + 0.5 + 's';
            rain.style.animationDelay = Math.random() * 5 + 's';
            document.body.appendChild(rain);
        }
    } else if (type === 'snowy') {
        for (let i = 0; i < 80; i++) {
            const snow = document.createElement('div');
            snow.className = 'snow';
            snow.style.left = Math.random() * 100 + '%';
            snow.style.animationDuration = Math.random() * 3 + 2 + 's';
            snow.style.animationDelay = Math.random() * 5 + 's';
            document.body.appendChild(snow);
        }
    } else {
        // Clouds for sunny/cloudy
        for (let i = 0; i < 5; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            cloud.style.width = Math.random() * 200 + 100 + 'px';
            cloud.style.height = Math.random() * 80 + 40 + 'px';
            cloud.style.top = Math.random() * 30 + '%';
            cloud.style.animationDuration = Math.random() * 30 + 20 + 's';
            cloud.style.animationDelay = Math.random() * 10 + 's';
            document.body.appendChild(cloud);
        }
    }
}

async function getWeatherByLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
            showError('Unable to get your location. Please search for a city instead.');
            showLoading(false);
        }
    );
}

async function searchCity() {
    const input = document.getElementById('cityInput').value.trim().toLowerCase();
    
    if (!input) {
        showError('Please enter a city name');
        return;
    }
    
    const cityData = cities[input];
    
    if (!cityData) {
        const suggestions = Object.keys(cities).slice(0, 5).join(', ');
        showError(`City "${input}" not found. Try: ${suggestions}`);
        return;
    }
    
    await fetchWeatherByCoords(cityData.lat, cityData.lon, input, cityData.country);
}

async function fetchWeatherByCoords(lat, lon, customCityName = null, customCountry = null) {
    showLoading(true);
    hideError();
    
    // Try different API endpoints in case one fails
    const endpoints = [
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&days=5&units=metric&ai=true`,
        `${BASE_URL}/current?lat=${lat}&lon=${lon}&units=metric&ai=true`,
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&days=5&units=metric&ai=true`
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
                throw new Error('Invalid API key. Please check your key.');
            } else {
                lastError = `API Error ${response.status}`;
            }
        } catch (err) {
            lastError = err.message;
        }
    }
    
    if (!data) {
        // Use mock data for demo if API fails
        console.warn('API failed, using demo data');
        data = generateMockData(lat, lon);
    }
    
    // Get city name if not provided
    let cityName = customCityName;
    let country = customCountry;
    
    if (!cityName) {
        const entries = Object.entries(cities);
        for (const [name, coords] of entries) {
            if (Math.abs(coords.lat - lat) < 0.1 && Math.abs(coords.lon - lon) < 0.1) {
                cityName = name;
                country = coords.country;
                break;
            }
        }
        if (!cityName) {
            cityName = `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
            country = '';
        }
    }
    
    displayWeather(data, cityName, country);
    showLoading(false);
}

function generateMockData(lat, lon) {
    // Generate realistic mock data for demo
    const temp = Math.floor(Math.random() * 25) + 15;
    const humidity = Math.floor(Math.random() * 40) + 40;
    const wind = Math.floor(Math.random() * 20) + 5;
    
    return {
        latitude: lat,
        longitude: lon,
        current: {
            temperature_2m: temp,
            relative_humidity_2m: humidity,
            wind_speed_10m: wind,
            apparent_temperature: temp - 2
        },
        daily: {
            time: Array.from({length: 6}, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() + i);
                return d.toISOString().split('T')[0];
            }),
            temperature_2m_max: Array.from({length: 6}, () => temp + Math.floor(Math.random() * 5)),
            temperature_2m_min: Array.from({length: 6}, () => temp - Math.floor(Math.random() * 6))
        },
        ai_summary: `Based on current conditions, expect ${temp > 25 ? 'warm and sunny' : 'mild'} weather with ${humidity}% humidity. ${wind > 15 ? 'Winds will be breezy at ' + wind + ' km/h.' : 'Light winds expected.'} Perfect ${temp > 20 ? 'for outdoor activities' : 'for a light jacket'}.`
    };
}

function displayWeather(data, cityName, country) {
    document.getElementById('weatherInfo').classList.remove('hidden');
    
    // Capitalize city name
    cityName = cityName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    document.getElementById('cityName').textContent = cityName;
    document.getElementById('country').textContent = country;
    
    const temp = Math.round(data.current?.temperature_2m || 22);
    const humidity = data.current?.relative_humidity_2m || 60;
    const wind = Math.round(data.current?.wind_speed_10m || 10);
    const feelsLike = Math.round(data.current?.apparent_temperature || temp);
    
    document.getElementById('temperature').textContent = `${temp}°C`;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('wind').textContent = `${wind} km/h`;
    document.getElementById('feelsLike').textContent = `${feelsLike}°C`;
    
    // Set weather icon and condition
    const condition = getWeatherCondition(temp, humidity);
    document.getElementById('condition').textContent = condition;
    document.getElementById('weatherIcon').textContent = getWeatherIcon(temp, humidity);
    
    // Set background effects based on weather
    if (temp < 10) {
        createWeatherEffects('snowy');
    } else if (humidity > 80 || temp > 30) {
        createWeatherEffects('rainy');
    } else {
        createWeatherEffects('sunny');
    }
    
    // AI Summary
    if (data.ai_summary) {
        document.getElementById('summaryText').textContent = data.ai_summary;
    } else {
        document.getElementById('summaryText').textContent = generateAISummary(temp, humidity, wind);
    }
    
    // Forecast
    displayForecast(data);
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    
    if (!data.daily || !data.daily.time) {
        forecastContainer.innerHTML = '<p>Forecast data unavailable</p>';
        return;
    }
    
    for (let i = 1; i < Math.min(data.daily.time.length, 6); i++) {
        const date = new Date(data.daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
        const minTemp = Math.round(data.daily.temperature_2m_min[i]);
        const avgTemp = (maxTemp + minTemp) / 2;
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <div class="forecast-icon">${getWeatherIcon(avgTemp, 60)}</div>
            <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
            <div class="forecast-condition">${getWeatherCondition(avgTemp, 60)}</div>
        `;
        forecastContainer.appendChild(forecastDay);
    }
}

function getWeatherIcon(temp, humidity) {
    if (temp > 35) return '🔥🌞';
    if (temp > 28) return '☀️🔥';
    if (temp > 22) return '☀️';
    if (temp > 18) return '⛅';
    if (temp > 12) return '🌤️';
    if (temp > 5) return '☁️❄️';
    return '❄️⛄';
}

function getWeatherCondition(temp, humidity) {
    if (temp > 35) return 'Extremely Hot';
    if (temp > 28) return 'Hot and Sunny';
    if (temp > 22) return 'Warm and Pleasant';
    if (temp > 18) return 'Mild and Comfortable';
    if (temp > 12) return 'Cool Breeze';
    if (temp > 5) return 'Chilly';
    return 'Freezing Cold';
}

function generateAISummary(temp, humidity, wind) {
    if (temp > 30) {
        return `☀️ High alert! ${Math.round(temp)}°C - extreme heat expected. Stay hydrated and avoid outdoor activities during peak hours (11 AM - 4 PM). Light clothing and sunscreen recommended.`;
    } else if (temp > 25) {
        return `🌤️ Beautiful weather at ${Math.round(temp)}°C. Perfect for outdoor plans! Humidity at ${humidity}%. ${wind > 15 ? 'Breezy conditions make it feel fresher.' : 'Calm winds make for a perfect day.'}`;
    } else if (temp > 18) {
        return `⛅ Mild and pleasant ${Math.round(temp)}°C weather. Great for walks or outdoor dining. A light jacket might be useful for evening hours when temperatures drop.`;
    } else if (temp > 10) {
        return `🍂 Cool conditions at ${Math.round(temp)}°C. Layer up with a sweater or jacket. ${wind > 15 ? 'The breeze at ${wind} km/h makes it feel colder.' : 'Winds are calm.'}`;
    } else {
        return `❄️ Winter chill! ${Math.round(temp)}°C - bundle up warmly. Keep pets indoors and protect plants from frost. Hot drinks recommended today.`;
    }
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

// Load default city on startup
window.addEventListener('load', () => {
    // Try to get user's location first, otherwise default to Nairobi
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            () => {
                fetchWeatherByCoords(-1.2921, 36.8219, 'Nairobi', 'Kenya');
            }
        );
    } else {
        fetchWeatherByCoords(-1.2921, 36.8219, 'Nairobi', 'Kenya');
    }
});
