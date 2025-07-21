import { createSlice } from "@reduxjs/toolkit";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
// import { setItemAsync, deleteItemAsync } from "expo-secure-store";
import { encode as base64encode } from "base-64";
import axios from "axios";

// Initial state for the FHIR authentication slice
const initialState = {
  fhirAccessToken: null,
  fhirIsLoading: false,
  fhirError: null,
  authorizationCode: null,
  fullParams: null,
  servers: {},
};

// Createing FHIR authentication slice
const fhirAuthSlice = createSlice({
  name: "fhirAuth",
  initialState,
  reducers: {
    setFhirAccessToken: (state, action) => {
      state.fhirAccessToken = action.payload;
    },
    setFhirLoading: (state, action) => {
      state.fhirIsLoading = action.payload;
    },
    setFhirError: (state, action) => {
      state.fhirError = action.payload;
    },
    clearFhirAuth: (state) => {
      state.fhirAccessToken = null;
      state.fhirError = null;
    },
    setAuthorizationCode: (state, action) => {
      state.authorizationCode = action.payload;
    },
    setFullParams: (state, action) => {
      state.fullParams = action.payload;
    },
    setServerData: (state, action) => {
      const { serverId, data } = action.payload;
      state.servers[serverId] = { ...state.servers[serverId], ...data };
    },
    clearServerAuth: (state, action) => {
      const { serverId } = action.payload;
      delete state.servers[serverId];
    },
    clearAllServerAuth: (state) => {
      state.servers = {};
    },
  },
});

// Export actions
export const {
  setFhirAccessToken,
  setFhirLoading,
  setFhirError,
  clearFhirAuth,
  setAuthorizationCode,
  setFullParams,
  setServerData,
  clearServerAuth,
  clearAllServerAuth,
} = fhirAuthSlice.actions;

// Export reducer
export default fhirAuthSlice.reducer;

// Thunk for initiating FHIR login
export const initiateLoginFHIR =
  (connectionString, serverId) => async (dispatch) => {
    dispatch(setFhirLoading(true));

    try {
      const {
        client_id: clientId,
        scope,
        clientSecret,
        iss,
      } = connectionString;

      const authRequest = new AuthSession.AuthRequest({
        clientId: clientId,
        scopes: scope.split(" "),
        redirectUri: AuthSession.makeRedirectUri({
          scheme: "com.fiacregiraneza.myapp",
          path: "redirect",
        }),
        extraParams: { iss: iss, aud: iss },
        // state: Crypto.randomUUID(),
        clientSecret: clientSecret,
        // usePKCE: true, // Enable PKCE
      });

      // Get discovery endpoints
      const wellKnownConfig = await fetchWellKnownConfig(iss);
      const { authorization_endpoint: authorizationEndpoint } = wellKnownConfig;

      console.log("Opening browser...");
      const result = await authRequest.promptAsync({
        authorizationEndpoint,
        showInRecents: true,
      });

      if (result.type === "success") {
        console.log("Authentication successful");
        // Pass codeVerifier to token exchange
        return await handleSuccessfulAuth(
          result,
          result.params.state,
          dispatch,
          serverId,
          connectionString,
          authRequest.codeVerifier // Pass the codeVerifier
        );
      } else {
        console.log("Authentication cancelled or failed");
        return { type: result.type, serverId };
      }
    } catch (error) {
      handleAuthError(error, dispatch);
    } finally {
      dispatch(setFhirLoading(false));
    }
  };

// Helper functions

async function fetchWellKnownConfig(iss) {
  return fetch(`${iss}/.well-known/smart-configuration`).then((res) =>
    res.json()
  );
}

export const exchangeCodeForToken =
  (code, connectionString, serverId, codeVerifier) => async (dispatch) => {
    dispatch(setFhirLoading(true));
    try {
      const { client_id: clientId, clientSecret, iss } = connectionString;
      const wellKnownConfig = await fetchWellKnownConfig(iss);
      const { token_endpoint: tokenEndpoint } = wellKnownConfig;

      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "com.fiacregiraneza.myapp",
        path: "redirect",
      });

      const encodedClientCredentials = base64encode(
        `${clientId}:${encodeURIComponent(clientSecret)}`
      );

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier, // Include codeVerifier
      });

      // Using fetch like in Home.jsx instead of axios
      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encodedClientCredentials}`,
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Token exchange response:", data);

      // Update state with token response
      dispatch(setFhirAccessToken(data.access_token));
      dispatch(
        setServerData({
          serverId,
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            token_type: data.token_type,
            scope: data.scope,
            patient: data.patient,
            id_token: data.id_token,
          },
        })
      );

      return {
        type: "success",
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        token_type: data.token_type,
        scope: data.scope,
        patient: data.patient,
        id_token: data.id_token,
      };
    } catch (error) {
      console.error("Token exchange error:", error);
      throw error;
    } finally {
      dispatch(setFhirLoading(false));
    }
  };

async function handleSuccessfulAuth(
  result,
  state,
  dispatch,
  serverId,
  connectionString,
  codeVerifier // Add codeVerifier parameter
) {
  console.log("Handling successful authentication");
  const {
    code,
    state: returnedState,
    error,
    error_description,
  } = result.params;

  if (error) {
    throw new Error(
      `Authorization error: ${error}. ${error_description || ""}`
    );
  }

  if (code) {
    if (returnedState !== state) {
      throw new Error("State mismatch. Possible CSRF attack.");
    }

    updateAuthState(dispatch, code, result.params, serverId);

    // Pass codeVerifier to exchangeCodeForToken
    const tokenResult = await dispatch(
      exchangeCodeForToken(code, connectionString, serverId, codeVerifier)
    );

    if (tokenResult.type === "success") {
      return tokenResult;
    } else {
      throw new Error(
        `Failed to exchange code for token: ${tokenResult.error}`
      );
    }
  } else {
    throw new Error("Failed to obtain authorization code");
  }
}

function updateAuthState(dispatch, code, params, serverId) {
  dispatch(setAuthorizationCode(code));
  dispatch(setFullParams(params));
  dispatch(
    setServerData({
      serverId,
      data: {
        authorizationCode: code,
        fullParams: params,
      },
    })
  );
}

function handleAuthError(error, dispatch) {
  console.error("FHIR2 Authentication error:", error);
  dispatch(setFhirError(error.message));
  throw error;
}

// Thunk for logging out from FHIR
/** 
export const logoutFromFHIR = (serverId) => async (dispatch) => {
  try {
    await deleteItemAsync("fhirAccessToken");
    dispatch(clearFhirAuth());
    if (serverId) {
      dispatch(clearServerAuth({ serverId }));
    }
  } catch (error) {
    console.error("FHIR Logout error:", error);
  }
};

export const logoutFromAllFHIR = () => async (dispatch) => {
  try {
    await deleteItemAsync("fhirAccessToken");
    dispatch(clearFhirAuth());
    dispatch(clearAllServerAuth());
  } catch (error) {
    console.error("FHIR Logout All error:", error);
  }
};
**/
