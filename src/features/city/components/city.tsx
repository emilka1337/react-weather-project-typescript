import React, { Suspense, useEffect } from "react";

import { getCityNameByCoords } from "@/features/city/api/reverse-geocode";
import EditCityToggler from "@/features/city/components/edit-city-toggler";
import { useSelectedCityStore } from "@/features/city/stores/selected-city-store";
import { loadLastCityName, saveLastCityName } from "@/features/city/utils/last-city-storage";
import { useGeolocationStore } from "@/stores/geolocation-store";
import { useUiStore } from "@/stores/ui-store";
import { CityGeolocation } from "@/types/geolocation";

const CitySearch = React.lazy(() => import("@/features/city/components/city-search"));

function City() {
    const geolocation: CityGeolocation = useGeolocationStore((state) => state.geolocation);
    const togglePanel = useUiStore((state) => state.togglePanel);
    const cityName: string = useSelectedCityStore((state) => state.selectedCity);
    const setSelectedCity = useSelectedCityStore((state) => state.setSelectedCity);

    const focusOnCitySearch = (): void => {
        togglePanel("city-search");
    };

    useEffect(() => {
        const { lat, lon } = geolocation;

        if (!lat || !lon) return;

        let cancelled = false;

        getCityNameByCoords({ lat, lon })
            .then((name) => {
                if (cancelled) return;

                saveLastCityName(name);
                setSelectedCity(name);
            })
            .catch((error: unknown) => {
                if (cancelled) return;

                console.error("Failed to resolve city name by coordinates: ", error);
                setSelectedCity(loadLastCityName() ?? "Sorry, something went wrong :(");
            });

        return () => {
            cancelled = true;
        };
    }, [geolocation, setSelectedCity]);

    return (
        <div className="city">
            <h3 className="city-name">{cityName}</h3>
            <EditCityToggler onClick={focusOnCitySearch} />
            {/* Without a boundary here the lazy chunk suspends the WHOLE tree, so the app rendered
                nothing at all until city-search.js had loaded. */}
            <Suspense fallback={null}>
                <CitySearch />
            </Suspense>
        </div>
    );
}

export default React.memo(City);
