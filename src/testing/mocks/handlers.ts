import { http, HttpResponse } from "msw";

import { makeForecast } from "@/testing/fixtures/forecast";

const OPEN_WEATHER = "https://api.openweathermap.org";

export const BAKU = { lat: 40.37, lon: 49.89 };

export const forecastHandler = http.get(`${OPEN_WEATHER}/data/2.5/forecast`, () =>
    HttpResponse.json({
        city: { name: "Baku", country: "AZ", coord: BAKU },
        cnt: 40,
        cod: "200",
        list: makeForecast(),
    })
);

export const reverseGeocodeHandler = http.get(`${OPEN_WEATHER}/geo/1.0/reverse`, () =>
    HttpResponse.json([{ name: "Baku", country: "AZ", lat: BAKU.lat, lon: BAKU.lon, local_names: {} }])
);

export const searchCitiesHandler = http.get(`${OPEN_WEATHER}/geo/1.0/direct`, ({ request }) => {
    const query = new URL(request.url).searchParams.get("q") ?? "";

    return HttpResponse.json([
        { name: query, country: "AZ", lat: BAKU.lat, lon: BAKU.lon, local_names: {} },
    ]);
});

export const ipGeolocationHandler = http.get("https://ipapi.co/json/", () =>
    HttpResponse.json({ latitude: BAKU.lat, longitude: BAKU.lon, city: "Baku" })
);

export const handlers = [
    forecastHandler,
    reverseGeocodeHandler,
    searchCitiesHandler,
    ipGeolocationHandler,
];
