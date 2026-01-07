import { WeatherInput } from "./types";


export async function getLiveWeatherByLocation(city: string, country: string): Promise<WeatherInput> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
        throw new Error("Missing OPENWEATHER_API_KEY environment variable");
    }

    const q = encodeURIComponent(`${city},${country}`);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${apiKey}&units=metric`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Weather API error: ${res.status} ${text}`);
    }
    const data = await res.json();
    const temperature = Number(data?.main?.temp ?? 0);
    const humidity = Number(data?.main?.humidity ?? 0);
    const windMs = Number(data?.wind?.speed ?? 0); 
    const wind_speed = Math.round(windMs * 3.6 * 10) / 10; 
    const condition = String(data?.weather?.[0]?.main ?? "");

    return { temperature, humidity, wind_speed, condition };
}

export default getLiveWeatherByLocation;
