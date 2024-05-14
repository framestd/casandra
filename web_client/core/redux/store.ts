import { configureStore, Selector } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { configReducer } from "./features";

export const store = configureStore({
  reducer: {
    config: configReducer,
  },
});

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type AppDispatch = typeof store.dispatch;
export type AppSelector<Result = unknown> = Selector<RootState, Result>;
export type RootState = ReturnType<typeof store.getState>;
