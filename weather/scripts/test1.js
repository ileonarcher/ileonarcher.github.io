const selectors = {
  root: "body",
  currentTemp: "[js-data-current-temp]",
  conditionsText: "[js-data-conditions-text]",
  currentDate: "[js-data-current-date]",
  currentWind: "[js-data-current-wind]",
  currentHumidity: "[js-data-current-humidity]",
  currentPressure: "[js-data-current-pressure]",
  weatherImage: "[js-data-weather-image]",
  forecastSlider: ".forecast-slider",
  loadingIndicator: "[js-data-loading]",
  errorContainer: "[js-data-error]"
};

// DOM Elements
const elements = {
  root: document.querySelector(selectors.root),
  currentTemp: document.querySelector(selectors.currentTemp),
  conditionsText: document.querySelector(selectors.conditionsText),
  currentDate: document.querySelector(selectors.currentDate),
  currentWind: document.querySelector(selectors.currentWind),
  currentHumidity: document.querySelector(selectors.currentHumidity),
  currentPressure: document.querySelector(selectors.currentPressure),
  weatherImage: document.querySelector(selectors.weatherImage),
  forecastSlider: document.querySelector(selectors.forecastSlider),
  loadingIndicator: document.querySelector(selectors.loadingIndicator),
  errorContainer: document.querySelector(selectors.errorContainer)
};

// Weather icon mapping
const weatherImageMatch = {
  "01d": "images/WeatherIcons/WeatherIcon-02.png",  // clear sky (day)
  "01n": "images/WeatherIcons/WeatherIcon-03.png",  // clear sky (night)
  "02d": "images/WeatherIcons/WeatherIcon-10.png",  // few clouds (day)
  "02n": "images/WeatherIcons/WeatherIcon-11.png",  // few clouds (night)
  "03d": "images/WeatherIcons/WeatherIcon-01.png",  // scattered clouds
  "03n": "images/WeatherIcons/WeatherIcon-01.png",
  "04d": "images/WeatherIcons/WeatherIcon-01.png",  // broken clouds
  "04n": "images/WeatherIcons/WeatherIcon-01.png",
  "09d": "images/WeatherIcons/WeatherIcon-05.png",  // shower rain
  "09n": "images/WeatherIcons/WeatherIcon-05.png",
  "10d": "images/WeatherIcons/WeatherIcon-05.png",  // rain (day)
  "10n": "images/WeatherIcons/WeatherIcon-05.png",  // rain (night)
  "11d": "images/WeatherIcons/WeatherIcon-06.png",  // thunderstorm
  "11n": "images/WeatherIcons/WeatherIcon-06.png",
  "13d": "images/WeatherIcons/WeatherIcon-07.png",  // snow
  "13n": "images/WeatherIcons/WeatherIcon-07.png",
  "50d": "images/WeatherIcons/WeatherIcon-04.png",  // mist
  "50n": "images/WeatherIcons/WeatherIcon-04.png"
};

// Date formatting
const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatCurrentDate() {
  const now = new Date();
  return `${weekDays[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
}

// Update DOM with weather data
function updateWeatherUI(data) {
  elements.currentTemp.textContent = Math.round(data.main.temp);
  elements.conditionsText.textContent = data.weather[0].main;
  elements.currentWind.textContent = Math.round(data.wind.speed);
  elements.currentHumidity.textContent = Math.round(data.main.humidity);
  elements.currentPressure.textContent = Math.round(data.main.pressure * 0.75006375541921);
  elements.weatherImage.src = weatherImageMatch[data.weather[0].icon] || weatherImageMatch["01d"];
  elements.currentDate.textContent = formatCurrentDate();
}

// Create forecast slider items
function createForecastItems(forecastData) {
  elements.forecastSlider.innerHTML = ''; // Clear existing items
  
  forecastData.forEach((item, index) => {
    const forecastItem = document.createElement('div');
    forecastItem.className = `forecast-slider__item ${index === 0 ? 'forecast-slider__item-selected' : ''}`;
    
    forecastItem.innerHTML = `
      <img class="forecast-slider__item-img" alt="${item.weather[0].description}" 
           src="${weatherImageMatch[item.weather[0].icon] || weatherImageMatch['01d']}" width="40">
      <div class="forecast-slider__item-info-wrapper">
        <p class="forecast-slider__item-temperature">${Math.round(item.main.temp)}°</p>
        <p class="forecast-slider__item-time">${new Date(item.dt * 1000).getHours()}:00</p>
      </div>
    `;
    
    elements.forecastSlider.appendChild(forecastItem);
  });
}

// Show loading state
function showLoading() {
  if (elements.loadingIndicator) {
    elements.loadingIndicator.style.display = 'block';
  }
}

// Hide loading state
function hideLoading() {
  if (elements.loadingIndicator) {
    elements.loadingIndicator.style.display = 'none';
  }
}

// Show error message
function showError(message) {
  if (elements.errorContainer) {
    elements.errorContainer.textContent = message;
    elements.errorContainer.style.display = 'block';
  }
}

// Hide error message
function hideError() {
  if (elements.errorContainer) {
    elements.errorContainer.style.display = 'none';
  }
}

// Fetch weather data
async function fetchWeatherData(lat, lon) {
  const appId = "a3e7bdc246b811691b06aab13ccb0dbb";
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appId}&units=metric&cnt=5`;
  
  try {
    showLoading();
    hideError();
    
    // Fetch both current weather and forecast in parallel
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);
    
    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();
    
    updateWeatherUI(currentData);
    createForecastItems(forecastData.list.slice(0, 7)); // Show next 4 hours
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    showError('Unable to load weather data. Please try again later.');
  } finally {
    hideLoading();
  }
}

// Geolocation success handler
function handleGeolocationSuccess(position) {
  const { latitude, longitude } = position.coords;
  fetchWeatherData(latitude, longitude);
}

// Geolocation error handler
function handleGeolocationError(error) {
  console.warn(`Geolocation error (${error.code}): ${error.message}`);
  showError('Unable to get your location. Using default location.');
  
  // Fallback to a default location (e.g., London)
  fetchWeatherData(51.5074, -0.1278);
}

// Initialize the app
function initWeatherApp() {
  // Set initial date
  elements.currentDate.textContent = formatCurrentDate();
  
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser. Using default location.');
    fetchWeatherData(51.5074, -0.1278); // Fallback to London
    return;
  }
  
  // Request geolocation
  navigator.geolocation.getCurrentPosition(
    handleGeolocationSuccess,
    handleGeolocationError,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initWeatherApp);