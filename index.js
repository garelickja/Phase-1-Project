document.addEventListener('DOMContentLoaded', function () {
  const latitudeInput = document.getElementById('latitude-input')
  const longitudeInput = document.getElementById('longitude-input')
  const searchButton = document.getElementById('search-button')
  const modeToggle = document.getElementById('mode-toggle')
  const weatherContainer = document.getElementById('weather-container')
  const weatherForecastLabel = document.getElementById('weather-forecast-label')
  const currentWeatherCard = document.getElementById('current-weather-card')
  const hourlyWeatherCard = document.getElementById('hourly-weather-card')
  const dailyWeatherCard = document.getElementById('daily-weather-card')

  modeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode')
    })

  function addEnterEventListener(inputElement) {
    inputElement.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        searchButton.click()
      }
    })
  }
  addEnterEventListener(latitudeInput)
  addEnterEventListener(longitudeInput)
  

  searchButton.addEventListener('click', async () => {
    const latitude = latitudeInput.value
    const longitude = longitudeInput.value
    if (!latitude || !longitude) {
      alert('Please enter both latitude and longitude')
      return
    }
    const url = 'https://api.open-meteo.com/v1/forecast'
    const params = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      current: [
        'temperature_2m',
        'apparent_temperature',
        'precipitation',
        'wind_speed_10m',
      ],
      hourly: [
        'temperature_2m',
        'apparent_temperature',
        'precipitation',
        'wind_speed_10m',
      ],
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'sunrise',
        'sunset',
        'precipitation_sum',
        'wind_speed_10m_max',
      ],
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
      precipitation_unit: 'inch',
      timeformat: 'unixtime',
      timezone: 'auto',
    }

    try {
      const weatherData = await fetchWeatherApi(url, params)
      displayWeather(weatherData)
      weatherContainer.style.display = 'block'
      weatherForecastLabel.style.display = 'block'
      document.title = ''
    } catch (error) {
      console.error('Failed to fetch weather data:', error)
      alert('Failed to fetch weather data. Please check console for details.')
    }
  })

  async function fetchWeatherApi(url, params) {
    const search = new URLSearchParams(params).toString()
    const response = await fetch(`${url}?${search}`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  }

  function addBackgroundColorListener(card) {
    card.addEventListener('mouseover', () => {
      card.style.backgroundColor = '#00308F'
    })
    card.addEventListener('mouseout', () => {
      card.style.backgroundColor = ''
    })
  }

  addBackgroundColorListener(currentWeatherCard)
  addBackgroundColorListener(hourlyWeatherCard)
  addBackgroundColorListener(dailyWeatherCard)

  document.getElementById('left-scroll-btn').addEventListener('click', () => {
    hourlyWeatherCard.scrollBy({ left: -200, behavior: 'smooth' })
  })

  document.getElementById('right-scroll-btn').addEventListener('click', () => {
    hourlyWeatherCard.scrollBy({ left: 200, behavior: 'smooth' })
  })

  function transformHourlyData(data) {
    return data.time.map((time, index) => ({
      time: time,
      temperature2m: data.temperature_2m[index] || 'N/A',
      apparentTemperature: data.apparent_temperature[index] || 'N/A',
      precipitation:
        data.precipitation[index] === undefined
          ? 'N/A'
          : data.precipitation[index],
      windSpeed10m: data.wind_speed_10m[index] || 'N/A',
    }))
  }

  function transformDailyData(dataArray) {
    return dataArray.time.map((_, index) => ({
      time: dataArray.time[index],
      temperature2mMax: dataArray.temperature_2m_max?.[index],
      temperature2mMin: dataArray.temperature_2m_min?.[index],
      apparentTemperatureMax: dataArray.apparent_temperature_max?.[index],
      apparentTemperatureMin: dataArray.apparent_temperature_min?.[index],
      sunrise: dataArray.sunrise?.[index],
      sunset: dataArray.sunset?.[index],
      precipitationSum: dataArray.precipitation_sum?.[index],
      windSpeed10mMax: dataArray.wind_speed_10m_max?.[index],
    }))
  }

  function displayWeather(data) {
    currentWeatherCard.innerHTML = ''
    hourlyWeatherCard.innerHTML = ''
    dailyWeatherCard.innerHTML = ''

    if (data.current) {
      currentWeatherCard.innerHTML = `
      <h2>Current Weather</h2>
        <div class="weather-entry">Time: ${new Date(data.current.time * 1000).toLocaleString()}
        <br>Temperature: ${data.current.temperature_2m}°F
        <br>Feels Like: ${data.current.apparent_temperature}°F
        <br>Precipitation: ${data.current.precipitation} inches
        <br>Wind Speed: ${data.current.wind_speed_10m} mph
        </div>`
    }

    if (data.hourly && data.hourly.time) {
      const hourlyData = transformHourlyData(data.hourly)
      hourlyWeatherCard.style.display = 'block'
      hourlyWeatherCard.innerHTML ='<h2>Hourly Weather Forecast</h2>' + hourlyData.map(hour => `
        <div class="weather-entry">Time: ${new Date(hour.time * 1000).toLocaleString()}
        <br>Temperature: ${hour.temperature2m}°F
        <br>Feels Like: ${hour.apparentTemperature}°F
        <br>Precipitation: ${hour.precipitation}${typeof hour.precipitation === 'number' ? ' inches' : ''}
        <br>Wind Speed: ${hour.windSpeed10m} mph
        </div>`).join('')
    }

    if (data.daily && data.daily.time) {
      const dailyData = transformDailyData(data.daily)
      dailyWeatherCard.innerHTML ='<h2>Daily Weather Forecast</h2>' + dailyData.map(day => `
        <div class="weather-entry">Date: ${new Date(day.time * 1000).toLocaleDateString()}
        <br>Max Temperature: ${day.temperature2mMax}°F
        <br>Min Temperature: ${day.temperature2mMin}°F
        <br>Max Feels Like: ${day.apparentTemperatureMax}°F
        <br>Min Feels Like: ${day.apparentTemperatureMin}°F
        <br>Sunrise: ${new Date(day.sunrise * 1000).toLocaleTimeString()}
        <br>Sunset: ${new Date(day.sunset * 1000).toLocaleTimeString()}
        <br>Precipitation Sum: ${day.precipitationSum} inches
        <br>Max Wind Speed: ${day.windSpeed10mMax} mph
        </div>`).join('')
    }
  }
})
