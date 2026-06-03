// IMPORTANT: Replace this with your actual API key
const API_KEY = 'wai_eda133.9db2a201fa27190c6d2cad30a63c80f2a4572a13c708e71a';
const BASE_URL = 'https://api.weather-ai.co/v1';

let currentWeatherData = null;
let currentUnits = 'metric';

async function getWeatherByLocation() {
    const input = document.getElementById('cityInput').value.trim();
    
    if (!input) {
        showError('Please enter a city or coordinates');
        return;
    }
    
    // Check if input is coordinates (lat,lon format)
    if (input.includes(',')) {
        const [lat, lon] = input.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lon)) {
            await fetchWeather(lat, lon);
            return;
        }
    }
    
    // Otherwise, it's a city name - use geocoding (simple mapping for demo)
    // In a real app, you'd use a geocoding service. For now, use Nairobi as default
    showError('For coordinates, use format: -1.2921,36.8219\nTry: "40.7128,-74.0060" for NYC');
}

async function getMyLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            await fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            showError('Unable to get your location. Please enter coordinates manually.');
            showLoading(false);
        }
    );
}

async function fetchWeather(lat, lon) {
    showLoading(true);
    hideError();
    
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&days=7&units=${currentUnits}&ai=true`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        currentWeatherData = data;
        displayWeather(data);
    } catch (error) {
        console.error('Fetch error:', error);
        showError(`Failed to fetch weather: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function displayWeather(data) {
    const weatherDiv = document.getElementById('weatherContent');
    
    const tempUnit = currentUnits === 'metric' ? '°C' : '°F';
    const windUnit = currentUnits === 'metric' ? 'km/h' : 'mph';
    
    // Get current temperature (using daily or current data)
    const currentTemp = data.current?.temperature_2m || data.daily?.temperature_2m_max?.[0] || 'N/A';
    
    const html = `
        <div class="current-weather">
            <h2>📍 ${data.latitude.toFixed(2)}°, ${data.longitude.toFixed(2)}°</h2>
            <div class="temperature">${currentTemp}${tempUnit}</div>
            <div class="condition">
                Humidity: ${data.current?.relative_humidity_2m || 'N/A'}% | 
                Wind: ${data.current?.wind_speed_10m || 'N/A'} ${windUnit}
            </div>
            
            ${data.ai_summary ? `
                <div class="ai-summary">
                    <h3>🤖 Gemini AI Weather Summary</h3>
                    <p>${data.ai_summary}</p>
                </div>
            ` : ''}
        </div>
        
        <h3>📅 7-Day Forecast</h3>
        <div class="forecast">
            ${generateForecastHTML(data, tempUnit)}
        </div>
    `;
    
    weatherDiv.innerHTML = html;
    weatherDiv.classList.remove('hidden');
}

function generateForecastHTML(data, tempUnit) {
    if (!data.daily || !data.daily.time) {
        return '<p>Forecast data not available</p>';
    }
    
    let html = '';
    for (let i = 0; i < data.daily.time.length; i++) {
        const date = new Date(data.daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = data.daily.temperature_2m_max?.[i] || 'N/A';
        const minTemp = data.daily.temperature_2m_min?.[i] || 'N/A';
        
        html += `
            <div class="forecast-card">
                <div class="forecast-day">${dayName}</div>
                <div>${date.getMonth()+1}/${date.getDate()}</div>
                <div class="forecast-temp">↑ ${maxTemp}${tempUnit}</div>
                <div>↓ ${minTemp}${tempUnit}</div>
            </div>
        `;
    }
    
    return html;
}

function showLoading(show) {
    const loadingDiv = document.getElementById('loading');
    if (show) {
        loadingDiv.classList.remove('hidden');
    } else {
        loadingDiv.classList.add('hidden');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    document.getElementById('weatherContent').classList.add('hidden');
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

function hideError() {
    document.getElementById('error').classList.add('hidden');
}

// Unit toggle
document.getElementById('celsiusBtn').addEventListener('click', () => {
    currentUnits = 'metric';
    document.getElementById('celsiusBtn').classList.add('active');
    document.getElementById('fahrenheitBtn').classList.remove('active');
    if (currentWeatherData) {
        fetchWeather(currentWeatherData.latitude, currentWeatherData.longitude);
    }
});

document.getElementById('fahrenheitBtn').addEventListener('click', () => {
    currentUnits = 'imperial';
    document.getElementById('fahrenheitBtn').classList.add('active');
    document.getElementById('celsiusBtn').classList.remove('active');
    if (currentWeatherData) {
        fetchWeather(currentWeatherData.latitude, currentWeatherData.longitude);
    }
});

// Load default weather (Nairobi) on page load
window.addEventListener('load', () => {
    fetchWeather(-1.2921, 36.8219);
});
