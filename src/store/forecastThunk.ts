import { createAsyncThunk } from '@reduxjs/toolkit';
import ky from 'ky';

import { CityGeolocation } from '../types/CityGeolocation';
import { ForecastData } from '../types/ForecastData';

// Типизируем thunk
export const fetchForecast = createAsyncThunk<
    ForecastData,
    CityGeolocation
>(
    'forecast/fetchforecast',
    async ({ lat, lon }: CityGeolocation) => {
        const forecastURL = `${import.meta.env.VITE_BASE_URL
            }data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_API_KEY
            }&units=metric`;

        // Errors propagate: createAsyncThunk rejects the action with the serialized error,
        // so the caller's .unwrap().catch() sees the real HTTP status instead of a stub.
        const res = await ky.get<ForecastData>(forecastURL);

        return res.json();
    }
);
