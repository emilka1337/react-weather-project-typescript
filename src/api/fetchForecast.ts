import ky from "ky";

import { CityGeolocation } from "../types/CityGeolocation";
import { ForecastData } from "../types/ForecastData";

// Was a createAsyncThunk. Zustand has no thunk concept and needs none: the request touches
// no store state, so it is a plain async function and the caller awaits it.
export async function fetchForecast({ lat, lon }: CityGeolocation): Promise<ForecastData> {
    const forecastURL = `${import.meta.env.VITE_BASE_URL
        }data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_API_KEY
        }&units=metric`;

    // Errors propagate to the caller's catch with the real HTTP status.
    const res = await ky.get<ForecastData>(forecastURL);

    return res.json();
}
