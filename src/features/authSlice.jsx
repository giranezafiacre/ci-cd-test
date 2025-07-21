import { createSlice } from "@reduxjs/toolkit";
// import { setItemAsync, deleteItemAsync, getItemAsync } from "expo-secure-store";
import axios from "axios";
import { SERVER_HOST, SERVER_PORT } from "@env";
import Parse from "../../parseConfig";
import GoogleSignin from "../../googleSignInConfig";
import * as webBrowser from "expo-web-browser";

import { getGoogleToken } from "./utils"; // temporary testing delete after

webBrowser.maybeCompleteAuthSession();

const initialState = {
  userData: null,
  isLoggedIn: false,
  isLoading: false,
  token: null,
  error: null,
};

export const authSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    endLoading: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    loginSuccess: (state, action) => {
      state.userData = action.payload.user;
      state.isLoggedIn = true;
      state.isLoading = false;
    },

    logout: (state) => {
      return initialState;
    },
  },
});

export const { loginSuccess, logout, startLoading, endLoading } =
  authSlice.actions;

let storeRef;

export const setStoreRef = (store) => {
  storeRef = store;
};

export default authSlice.reducer;

// Created an axios instance
// const api = axios.create({
//   baseURL: "http://172.29.108.87:5000",
//   timeout: 60000,
// });

class AxiosApi {
  constructor(access_token, refresh_token) {
    this.accessToken = access_token;
    this.refreshToken = refresh_token;
    this.api = axios.create({
      baseURL: `http://${SERVER_HOST}:${SERVER_PORT}`,
      //baseURL: "http://172.29.108.87:5000",
      timeout: 60000,
    });

    this.api.interceptors.request.use(
      async (config) => {
        console.log("configs");
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        console.log("configs have been set");
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log("clearly some sort of error occured", error);
          console.log(originalRequest);
          try {
            const response = await axios.post(
              `http://${SERVER_HOST}:${SERVER_PORT}/refresh-token`,
              // "http://172.29.108.87:5000/refresh-token",
              { refreshToken }
            );

            console.log("GOT SOME SORT OF RESPONSE");

            const {
              newAccessToken,
              newRefreshToken,
              accessTokenExpiry,
              refreshTokenExpiry,
            } = response.data;

            console.log("NEW ACCESS TOKEN RECEIVED", newAccessToken);

            this.setAccessToken(newAccessToken);
            this.setRefreshToken(newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${this.access_token}`;
            return axios(originalRequest);
          } catch (error) {
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(access_token) {
    this.accessToken = access_token;
  }

  setRefreshToken(refresh_token) {
    this.refreshToken = refresh_token;
  }
}

const axios_api = new AxiosApi(null, null);

export const loginUser2 = (data) => async (dispatch) => {
  dispatch(startLoading());
  try {
    console.log("PROCEEDING TO ATTEMPT TO LOGIN");
    const response = await axios_api.api.post("/login", {
      username: data.username,
      password: data.password,
    });

    console.log("log info ", response);

    // const response = await api.post("/login", {
    //   userName: data.username,
    //   password: data.password,
    // });

    const { sessionToken, firstname, lastname, emailAddress, phoneNumber } =
      response.data;

    axios_api.setAccessToken(sessionToken);

    // const {
    //   accessToken,
    //   refreshToken,
    //   accessTokenExpiry,
    //   refreshTokenExpiry,
    //   user,
    // } = response.data;

    dispatch(
      loginSuccess({
        user: { firstname, lastname, emailAddress, phoneNumber },
        sessionToken,
        //refreshToken,
        //accessTokenExpiry,
        //refreshTokenExpiry,
      })
    );
    dispatch(endLoading(null));
  } catch (error) {
    console.error("Login error:", error);
    dispatch(endLoading(error.message));
    alert(`Login failed: ${error.message}`);
  }
};

export const loginUser = (data) => async (dispatch) => {
  dispatch(startLoading());
  try {
    console.log("PROCEEDING TO ATTEMPT TO LOGIN");

    await Parse.User.logIn(data.username, data.password); // going to save to the disk

    let currentUser = Parse.User.current();

    dispatch(
      loginSuccess({
        user: {
          username: currentUser.getUsername(),
          firstname: currentUser.getfirstname(),
          lastname: currentUser.getlastname(),
          emailAddress: currentUser.getemailAddress(),
          phoneNumber: currentUser.getphoneNumber(),
        },
      })
    );

    dispatch(endLoading(null));
  } catch (error) {
    console.error("Login error:", error);
    dispatch(endLoading(error.message));
    alert(`Login failed: ${error.message}`);
  }
};

export const loginGoogleUser = () => async (dispatch) => {
  dispatch(startLoading());

  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    console.log(`http://${SERVER_HOST}:${SERVER_PORT}`)
    console.log("||||||||||", userInfo);

    const authData = {
      id_token: userInfo.data.idToken,
      id: userInfo.data.user.id,
    };

    await Parse.Cloud.run("createUserGoogle_v2", { userInfo });
    // console.log('res: ', res)
    Parse.User.logInWith("google", { authData })
      .then((user) => {
        dispatch(
          loginSuccess({
            user: {
              username: user.getUsername(),
              firstname: user.getfirstname(),
              lastname: user.getlastname(),
              emailAddress: user.getemailAddress(),
              phoneNumber: "",
            },
          })
        );
      })
      .catch((error) => {
        console.error("Error logging in with Google:", error);
      });

    dispatch(endLoading(null));

    console.log("the process is complete");
  } catch (error) {
    console.error("Login google error:", error);
    dispatch(endLoading(error.message));
    alert(`Login failed: ${error.message}`);
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await Parse.User.logOut();

    // perhaps include logic for handling the fact that when I logout should wipe the list of visited hospitals, unless the same user logs in

    let maybeuser = await Parse.User.current();

    console.log("current user", maybeuser);

    dispatch(logout());
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export { axios_api };
