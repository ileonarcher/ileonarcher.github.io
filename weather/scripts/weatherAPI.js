class weatherAPI {
  constructor() {
    this.selectors = {
      root: "body",
      currentTemp: "[js-data-current-temp]",
      conditionsText: "[js-data-conditions-text]",
      currentDate: "[js-data-current-date]",
      currentWind: "[js-data-current-wind]",
      currentHumidity: "[js-data-current-humidity]",
      currentPressure: "[js-data-current-pressure]",
      weatherImage: "[js-data-weather-image]",
      forecastSlider: ".forecast-slider",
    };

    this.rootElement = document.querySelector(this.selectors.root);
    this.currentTempElement = this.rootElement.querySelector(
      this.selectors.currentTemp
    );
    this.conditionsTextElement = this.rootElement.querySelector(
      this.selectors.conditionsText
    );
    this.currentDateElement = this.rootElement.querySelector(
      this.selectors.currentDate
    );
    this.currentWindElement = this.rootElement.querySelector(
      this.selectors.currentWind
    );
    this.currentHumidityElement = this.rootElement.querySelector(
      this.selectors.currentHumidity
    );
    this.currentPressureElement = this.rootElement.querySelector(
      this.selectors.currentPressure
    );
    this.weatherImage = this.rootElement.querySelector(
      this.selectors.weatherImage
    );

    this.forecastSliderElement = this.rootElement.querySelector(
      this.selectors.forecastSlider
    );

    this.weatherImageMatch = {
      "01d": "images/WeatherIcons/WeatherIcon-02.png",
      "01n": "images/WeatherIcons/WeatherIcon-03.png",
      "02d": "images/WeatherIcons/WeatherIcon-10.png",
      "02n": "images/WeatherIcons/WeatherIcon-11.png",
      "03n": "images/WeatherIcons/WeatherIcon-01.png",
      "03d": "images/WeatherIcons/WeatherIcon-01.png",
      "04d": "images/WeatherIcons/WeatherIcon-01.png",
      "04n": "images/WeatherIcons/WeatherIcon-01.png",
      "09d": "images/WeatherIcons/WeatherIcon-05.png",
      "09n": "images/WeatherIcons/WeatherIcon-05.png",
      "10d": "images/WeatherIcons/WeatherIcon-05.png",
      "10n": "images/WeatherIcons/WeatherIcon-05.png",
      "11d": "images/WeatherIcons/WeatherIcon-06.png",
      "11n": "images/WeatherIcons/WeatherIcon-06.png",
      "13d": "images/WeatherIcons/WeatherIcon-07.png",
      "13n": "images/WeatherIcons/WeatherIcon-07.png",
      "50d": "images/WeatherIcons/WeatherIcon-04.png",
      "50n": "images/WeatherIcons/WeatherIcon-04.png",
    };

    this.initialWeatherApp();
  }

  initialWeatherApp() {
    this.currentDateElement.textContent = this.formatDate();

    if (!navigator.geolocation) {
      this.showError(
        "Geolocation is not supported by your browser. Using default location."
      );
      this.fetchWeatherData(this.defaultLocation.lat, this.defaultLocation.lon);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      this.success.bind(this),
      this.error.bind(this),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  formatDate() {
    let currentDateRequest = new Date();

    const WeekDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const Months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return `${
      WeekDays[currentDateRequest.getDay() - 1]
    } ,${currentDateRequest.getDate()} ${
      Months[currentDateRequest.getMonth()]
    }`;
  }

  error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    this.fetchData(51.5074, -0.1278);
  }

  success(pos) {
    const { latitude, longitude } = pos.coords;
    this.fetchData(latitude, longitude);
  }

  async fetchData(lat, lon) {
    try {
      let appId = "a3e7bdc246b811691b06aab13ccb0dbb";
      const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appId}&units=metric&cnt=5`;

      const [currentWeather, forecastWeather] = await Promise.all([
        fetch(currentWeatherURL),
        fetch(forecastUrl),
      ]);

      if (!currentWeather.ok || !forecastWeather.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const [currentWeatherData, forecastWeatherData] = await Promise.all([
        currentWeather.json(),
        forecastWeather.json(),
      ]);

      this.updateWeatherData(currentWeatherData);
      this.drawForecast(forecastWeatherData);
    } catch {
      console.error("Fetch error:", err);
    }
  }

  updateWeatherData(json) {
    this.currentTempElement.innerHTML = Math.round(json.main.temp);
    this.conditionsTextElement.innerHTML = json.weather[0].main;
    this.currentWindElement.innerHTML = Math.round(json.wind.speed);
    this.currentHumidityElement.innerHTML = Math.round(json.main.humidity);
    this.currentPressureElement.innerHTML = Math.round(
      json.main.pressure * 0.75006375541921
    );
    this.weatherImage.src = this.weatherImageMatch[json.weather[0].icon];
  }

  drawForecast(json) {
    this.forecastSliderElement.innerHTML = "";
    json.list.slice(0, 4).forEach((item) => {
      let forecastImage = this.weatherImageMatch[item.weather[0].icon];
      let forecastTemp = Math.round(item.main.temp);
      let forecastTime = item.dt_txt.slice(-9, -3);

      let sliderItem = document.createElement("div");
      sliderItem.classList.add("forecast-slider__item");
      sliderItem.innerHTML = `
              <img
                class="forecast-slider__item-img"
                alt=""
                src="${forecastImage}"
                width="40"
              />
              <div class="forecast-slider__item-info-wrapper">
                <p class="forecast-slider__item-temperature">${forecastTemp}°</p>
                <p class="forecast-slider__item-time">${forecastTime}</p>
              </div>
        `;
      this.forecastSliderElement.append(sliderItem);
    });
  }
}

export default weatherAPI;
