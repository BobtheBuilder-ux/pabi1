import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PURGE,
  PERSIST,
  REGISTER,
  REHYDRATE,
  persistStore,
  PersistConfig,
  persistReducer,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import preferencesReducer, { PreferencesState } from './slices/preferencesSlice';
import searchReducer from './slices/searchSlice';
import { baseApi } from '../api/baseApi';

const preferencesPersistConfig: PersistConfig<PreferencesState> = {
  key: 'preferences',
  storage,
  whitelist: ['preferences', 'hasCompletedOnboarding'],
};

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    preferences: persistReducer(preferencesPersistConfig, preferencesReducer) as any,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
