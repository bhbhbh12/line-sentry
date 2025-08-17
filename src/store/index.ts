import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import departmentReducer from './slices/departmentSlice';
import machineReducer from './slices/machineSlice';
import sensorReducer from './slices/sensorSlice';
import moldReducer from './slices/moldSlice';
import userReducer from './slices/userSlice';
import configReducer from './slices/configSlice';
import reportReducer from './slices/reportSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentReducer,
    machines: machineReducer,
    sensors: sensorReducer,
    molds: moldReducer,
    users: userReducer,
    config: configReducer,
    reports: reportReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;