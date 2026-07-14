import { act } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import type * as zustand from "zustand";

// Zustand stores are module singletons, so without this they carry state from one test into the
// next. This is zustand's own test recipe: wrap create(), remember each store's initial state, and
// restore them all after every test.
//
// Caveat: settings-store and starred-cities-store read localStorage at MODULE LOAD, so their
// "initial state" is whatever storage held on first import. Tests that need a specific persisted
// state must still use vi.resetModules() + a dynamic import.
const { create: actualCreate, createStore: actualCreateStore } =
    await vi.importActual<typeof zustand>("zustand");

export const storeResetFns = new Set<() => void>();

const createUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
    const store = actualCreate(stateCreator);
    const initialState = store.getInitialState();

    storeResetFns.add(() => store.setState(initialState, true));

    return store;
};

export const create = (<T>(stateCreator: zustand.StateCreator<T>) =>
    typeof stateCreator === "function"
        ? createUncurried(stateCreator)
        : createUncurried) as typeof zustand.create;

const createStoreUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
    const store = actualCreateStore(stateCreator);
    const initialState = store.getInitialState();

    storeResetFns.add(() => store.setState(initialState, true));

    return store;
};

export const createStore = (<T>(stateCreator: zustand.StateCreator<T>) =>
    typeof stateCreator === "function"
        ? createStoreUncurried(stateCreator)
        : createStoreUncurried) as typeof zustand.createStore;

afterEach(() => {
    act(() => storeResetFns.forEach((resetStore) => resetStore()));
});
