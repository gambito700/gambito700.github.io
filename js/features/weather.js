export class WeatherModule {
  static init() {
    const tempEl = document.getElementById('weather-temp')
    const descEl = document.getElementById('weather-desc')
    const humidEl = document.getElementById('weather-humidity')
    const windEl = document.getElementById('weather-wind')
    const errEl = document.getElementById('weather-error')
    if (!tempEl) return

    const lat = -39.2833
    const lon = -72.2333
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&timezone=America%2FSantiago&forecast_days=1'

    fetch(url)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
      .then(data => {
        const cw = data.current_weather
        const desc = WeatherModule._weatherCodeDesc(cw.weathercode, window.currentLang || 'es')
        tempEl.textContent = Math.round(cw.temperature) + 'C'
        descEl.textContent = desc
        descEl.setAttribute('data-es', WeatherModule._weatherCodeDesc(cw.weathercode, 'es'))
        descEl.setAttribute('data-en', WeatherModule._weatherCodeDesc(cw.weathercode, 'en'))
        if (humidEl && data.hourly) {
          const idx = data.hourly.time.findIndex(t => t >= cw.time)
          if (idx >= 0) humidEl.innerHTML = '<i class="fas fa-tint"></i> ' + data.hourly.relative_humidity_2m[idx] + '%'
        }
        if (windEl) windEl.innerHTML = '<i class="fas fa-wind"></i> ' + Math.round(cw.windspeed) + ' km/h'
        if (errEl) errEl.classList.add('d-none')
        window._lastWeatherCode = cw.weathercode
        window._lastIsDay = cw.is_day
        if (typeof cw.is_day !== 'undefined' && typeof window.updateVantaByWeather === 'function') {
          window.updateVantaByWeather(cw.weathercode, cw.is_day)
        }
      })
      .catch(err => {
        if (errEl) { errEl.classList.remove('d-none'); errEl.textContent = (window.currentLang === 'es' ? 'No se pudo cargar el clima' : 'Could not load weather') }
      })
  }

  static _weatherCodeDesc(code, lang) {
    const codes = {
      0: { es: 'Despejado', en: 'Clear sky' },
      1: { es: 'Mayormente despejado', en: 'Mainly clear' },
      2: { es: 'Parcialmente nublado', en: 'Partly cloudy' },
      3: { es: 'Nublado', en: 'Overcast' },
      45: { es: 'Niebla', en: 'Foggy' },
      48: { es: 'Niebla con escarcha', en: 'Depositing rime fog' },
      51: { es: 'Llovizna ligera', en: 'Light drizzle' },
      53: { es: 'Llovizna moderada', en: 'Moderate drizzle' },
      55: { es: 'Llovizna densa', en: 'Dense drizzle' },
      61: { es: 'Lluvia ligera', en: 'Slight rain' },
      63: { es: 'Lluvia moderada', en: 'Moderate rain' },
      65: { es: 'Lluvia intensa', en: 'Heavy rain' },
      71: { es: 'Nevada ligera', en: 'Slight snow' },
      73: { es: 'Nevada moderada', en: 'Moderate snow' },
      75: { es: 'Nevada intensa', en: 'Heavy snow' },
      80: { es: 'Chubascos ligeros', en: 'Slight rain showers' },
      81: { es: 'Chubascos moderados', en: 'Moderate rain showers' },
      82: { es: 'Chubascos violentos', en: 'Violent rain showers' },
      95: { es: 'Tormenta', en: 'Thunderstorm' },
      96: { es: 'Tormenta con granizo ligero', en: 'Thunderstorm with slight hail' },
      99: { es: 'Tormenta con granizo intenso', en: 'Thunderstorm with heavy hail' }
    }
    const entry = codes[code]
    return entry ? entry[lang] : (lang === 'es' ? 'Estado desconocido' : 'Unknown')
  }
}

export default WeatherModule
