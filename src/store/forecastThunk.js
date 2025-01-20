import { createAsyncThunk } from '@reduxjs/toolkit';
import ky from 'ky';


export const fetchForecast = createAsyncThunk('forecast/fetchforecast', async ({ lat, lon }) => {
    const forecastURL = `${import.meta.env.VITE_BASE_URL
        }data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_API_KEY
        }&units=metric`;

    const forecastData = ky.get(forecastURL).json()

    return forecastData
});