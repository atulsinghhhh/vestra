import { WeatherCategory, WeatherInput } from "./types";


export function classifyWeatherCategories(weather: WeatherInput): WeatherCategory[] {
    const categories: WeatherCategory[] = [];

    const t = weather.temperature;
    if (t >= 32) categories.push("hot");
    else if (t >= 25) categories.push("warm");
    else if (t >= 18) categories.push("mild");
    else if (t >= 10) categories.push("cool");
    else categories.push("cold");


    if (weather.humidity >= 70) categories.push("humid");
    if (weather.wind_speed >= 25) categories.push("windy");

    const cond = weather.condition?.toLowerCase() || "";
    if (/(rain|drizzle|thunderstorm)/.test(cond)) {
        categories.push("rainy");
    }

    return categories;
}

export default classifyWeatherCategories;
