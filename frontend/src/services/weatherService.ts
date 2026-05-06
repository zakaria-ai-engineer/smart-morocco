import axios from "axios";

export interface WeatherData {
  city: string;
  temp: number | null;
  description: string;
  icon: string | null;
}

const WEATHER_CACHE: Record<string, WeatherData> = {};

let envValidated = false;

export function validateWeatherEnv(): boolean {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    console.error("⚠️ Weather API key missing in .env");
    return false;
  }
  if (!envValidated && import.meta.env.DEV) {

    envValidated = true;
  }
  return true;
}

export async function testWeatherAPI(): Promise<void> {
  if (!validateWeatherEnv()) return;
  try {
    const data = await getWeatherByCity("Casablanca");
    if (!data) {
      console.error("Weather Test Failed: No data returned.");
    }
  } catch (error) {
    console.error("Weather Test Failed:", error);
  }
}

export async function getWeatherByCity(cityName: string): Promise<WeatherData | null> {
  if (!cityName) return null;

  const normalizedCity = cityName.toLowerCase().trim();
  if (WEATHER_CACHE[normalizedCity]) {
    return WEATHER_CACHE[normalizedCity];
  }

  if (!validateWeatherEnv()) {
    return null;
  }
  
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        q: `${cityName},MA`,
        appid: apiKey,
        units: "metric",
      },
    });

    const data = response.data;
    const weatherData: WeatherData = {
      city: data.name || cityName,
      temp: data.main?.temp ?? null,
      description: data.weather?.[0]?.description ?? "No data",
      icon: data.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png` : null,
    };

    WEATHER_CACHE[normalizedCity] = weatherData;
    return weatherData;
  } catch (error) {
    console.error(`Failed to fetch weather for ${cityName}:`, error);
    return null;
  }
}
