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

        // Ky автоматически типизирует возвращаемое значение
        const forecastData = await ky.get(forecastURL).json<ForecastData>();

        return forecastData;
    }
);