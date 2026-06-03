// IMPORTANT: Replace with your actual API key
const API_KEY = 'wai_eda133.9db2a201fa27190c6d2cad30a63c80f2a4572a13c708e71a';
const BASE_URL = 'https://api.weather-ai.co/v1';

// City coordinates database (common cities)
const cities = {
    'nairobi': { lat: -1.2921, lon: 36.8219, country: 'Kenya' },
    'london': { lat: 51.5074, lon: -0.1278, country: 'UK' },
    'new york': { lat: 40.7128, lon: -74.0060, country: 'USA' },
    'tokyo': { lat: 35.6895, lon: 139.6917, country: 'Japan' },
    'paris': { lat: 48.8566, lon: 2.3522, country: 'France' },
    'sydney': { lat: -33.8688, lon: 151.2093, country: 'Australia' },
    'mumbai': { lat: 19.0760, lon: 72.8777, country: 'India' },
    'cairo': { lat: 30.0444, lon: 31.2357, country: 'Egypt' },
    'cape town': { lat: -33.9249, lon: 18.4241, country: 'South Africa' },
    'lagos': { lat: 6.5244, lon: 3.3792, country: 'Nigeria' }
};

async function searchCity() {
    const input = document.getElementById('cityInput').value.trim().toLowerCase();
    
    if (!input) {
        showError('Please enter a city name');
        return;
    }
    
    const cityData = cities[input];
    
    if (!cityData) {
        showError(`City "${input}" not found. Try: Nairobi, London, Tokyo, Paris, Mumbai, etc.`);
        return;
    }
    
    await fetchWeather(cityData.lat, cityData.lon, input, cityData.country);
}

async function fetchWeather(lat, lon, cityName, country) {
    showLoading(true);
    hideError();
    
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&days=5&units=metric&ai=true`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401) {
            throw new Error('Invalid API key. Please check your key.');
        }
        
        if (response.status === 429) {
            throw new Error('Monthly quota exceeded. Please try again later.');
        }
        
        if (!response.ok) {
            throw new Error(`Weather service error (${response.status})`);
        }
        
        const data = await response.json();
        displayWeather(data, cityName, country);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to load weather. Please check your connection.');
    } finally {
        showLoading(false);
    }
}

function displayWeather(data, cityName, country) {
    // Show weather container
    document.getElementById('weatherInfo').classList.remove('hidden');
    
    // Basic info
    document.getElementById('cityName').textContent = cityName.charAt(0).toUpperCase() + cityName.slice(1);
    document.getElementById('country').textContent = country;
    
    // Current weather
    const temp = Math.round(data.current?.temperature_2m || 22);
    document.getElementById('temperature').textContent = `${temp}°C`;
    document.getElementById('condition').textContent = getWeatherCondition(temp, data.current?.relative_humidity_2m);
    document.getElementById('humidity').textContent = `${data.current?.relative_humidity_2m || 65}%`;
    document.getElementById('wind').textContent = `${Math.round(data.current?.wind_speed_10m || 10)} km/h`;
    
    // Feels like (estimate if not provided)
    const feelsLike = data.current?.apparent_temperature || temp;
    document.getElementById('feelsLike').textContent = `${Math.round(feelsLike)}°C`;
    
    // Weather icon
    document.getElementById('weatherIcon').textContent = getWeatherIcon(temp, data.current?.relative_humidity_2m);
    
    // AI Summary
    if (data.ai_summary) {
        document.getElementById('summaryText').textContent = data.ai_summary;
    } else {
        document.getElementById('summaryText').textContent = generateAISummary(temp, data.current?.relative_humidity_2m, data.current?.wind_speed_10m);
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
    if (temp > 30) return '🔥';
    if (temp > 25) return '☀️';
    if (temp > 20) return '⛅';
    if (temp > 15) return '🌤️';
    if (temp > 10) return '🌥️';
    if (temp > 5) return '☁️';
    return '❄️';
}

function getWeatherCondition(temp, humidity) {
    if (temp > 30) return 'Hot and sunny';
    if (temp > 25) return 'Warm and pleasant';
    if (temp > 20) return 'Mild and comfortable';
    if (temp > 15) return 'Cool breeze';
    if (temp > 10) return 'Chilly';
    if (temp > 5) return 'Cold';
    return 'Freezing';
}

function generateAISummary(temp, humidity, wind) {
    if (temp > 30) {
        return `☀️ High temperatures of ${Math.round(temp)}°C today. Stay hydrated and avoid direct sunlight during peak hours. Light clothing recommended.`;
    } else if (temp > 25) {
        return `🌤️ Pleasant weather with ${Math.round(temp)}°C. Perfect for outdoor activities. Humidity at ${Math.round(humidity || 60)}%.`;
    } else if (temp > 15) {
        return `⛅ Mild conditions with ${Math.round(temp)}°C. A light jacket might be useful for evening hours.`;
    } else {
        return `❄️ Cool weather at ${Math.round(temp)}°C. Bundle up if heading outside. Winds at ${Math.round(wind || 10)} km/h.`;
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
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchCity();
});

// Load default city
window.addEventListener('load', () => {
    // Default to Nairobi
    fetchWeather(-1.2921, 36.8219, 'Nairobi', 'Kenya');
});
