import { configureStore } from "@reduxjs/toolkit";
import { authSlice, setStoreRef } from "./authSlice";
import fhirAuthReducer from "./fhirAuthSlice";

export const store = configureStore({
  reducer: {
    authentication: authSlice.reducer,
    fhirAuth: fhirAuthReducer,
  },
});

setStoreRef(store);
