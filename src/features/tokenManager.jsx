import axios from "axios";
import { fetchWellKnownConfig } from "./utils";
import { saveTokenInfo, getTokenInfo } from "./utils";
import { encode as base64encode } from "base-64";

class TokenManager {
  constructor(hospitalTokenInfo) {
    this.accessToken = hospitalTokenInfo.tokenInfo.access_token;
    this.refreshToken = hospitalTokenInfo.tokenInfo.refresh_token;
    this.hospitalTokenInfo = hospitalTokenInfo;
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  setTokens({ accessToken, refreshToken }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  getAccessToken() {
    return this.accessToken;
  }

  async refreshAccessToken(baseURL, connectionStrings) {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const wellKnownConfig = await fetchWellKnownConfig(baseURL);
      const { token_endpoint } = wellKnownConfig;
      const clientId =
        connectionStrings[this.hospitalTokenInfo.index].client_id;
      const clientSecret =
        connectionStrings[this.hospitalTokenInfo.index].clientSecret;
      const encodedClientCredentials = base64encode(
        `${clientId}:${encodeURIComponent(clientSecret)}`
      );

      console.log("clientId", clientId);
      console.log("clientsecret", clientSecret);
      console.log("encoded credentials", encodedClientCredentials);
      console.log("the token end point", token_endpoint);

      console.log("current refresh token", this.refreshToken);

      const response = await axios.post(
        token_endpoint,
        { grant_type: "refresh_token", refresh_token: this.refreshToken },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${encodedClientCredentials}`,
          },
        }
      );

      console.log("Token refresh response:", response.data);

      const newAccessToken = response.data.access_token;

      // if (newAccessToken) {
      if (response.data.refresh_token) {
        this.setTokens({
          accessToken: newAccessToken,
          refreshToken: response.data.refresh_token,
        });
        saveTokenInfo(
          this.hospitalTokenInfo.hospitalKey,
          JSON.stringify(response.data)
        );
      } else {
        this.setTokens({
          accessToken: newAccessToken,
          refreshToken: this.hospitalTokenInfo.tokenInfo.refresh_token,
        });
        this.hospitalTokenInfo.tokenInfo.access_token = newAccessToken;
        this.hospitalTokenInfo.tokenInfo.expires_in = response.data.expires_in;
        saveTokenInfo(
          this.hospitalTokenInfo.hospitalKey,
          this.hospitalTokenInfo.tokenInfo
        );
      }

      this.isRefreshing = false;
      this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
      this.refreshSubscribers = [];

      return newAccessToken;
      // } else {
      //   throw new Error("Failed to obtain new access token");
      // }
    } catch (error) {
      console.error("Token refresh error:", error);
      console.error("The message", error.response);
      // console.error("error code", error.response.status);

      if (
        error.response &&
        error.response.data &&
        error.response.data.error === "invalid_grant"
      ) {
        // Handle expired or invalid refresh token
        console.error(
          "Refresh token is invalid or expired. User needs to re-authenticate."
        );
        this.setTokens({ accessToken: null, refreshToken: null }); // Clear both tokens
        this.hospitalTokenInfo.tokenInfo = null; // Clear token info
      }

      this.isRefreshing = false;
      this.refreshSubscribers.forEach((callback) => callback(null, error));
      this.refreshSubscribers = [];
      throw error;
    }
  }
}

const createAxiosInstance = (baseURL, hospitalTokenInfo, connectionStrings) => {
  console.log("^^^^^^^creating instance^^^^^^^^^^^^^");

  const tokenManager = new TokenManager(hospitalTokenInfo);

  const instance = axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.tokenManager = tokenManager;

  instance.interceptors.request.use(
    async (config) => {
      const accessToken = tokenManager.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error?.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccessToken = await tokenManager.refreshAccessToken(
            baseURL,
            connectionStrings
          );
          console.log("NEW ACCESS TOKEN RECEIVED", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (error) {
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );

  console.log("@@@@@@@@ instance created @@@@@@@@@@");

  return instance;
};

export default createAxiosInstance;
