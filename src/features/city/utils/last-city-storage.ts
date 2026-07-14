import { readJson, writeJson } from "@/utils/storage";

const STORAGE_KEY = "last-saved-city-name";

export const saveLastCityName = (cityName: string): void => writeJson(STORAGE_KEY, cityName);

export const loadLastCityName = (): string | null => readJson<string>(STORAGE_KEY);
