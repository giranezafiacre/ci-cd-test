import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Login } from "../screens/Login";
import { Register } from "../screens/Register";
import { useSelector } from "react-redux";
import { MainNavigation } from "./MainNavigation";

const Stack = createNativeStackNavigator();
const { Navigator, Screen } = Stack;

/** export const AppNavigation = () => {

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Screen name="Login" component={Login} />
      <Screen name="Register" component={Register} />
      <Screen name="Home" component={Home} />
    </Navigator>
  );
}; */

export const AppNavigation = () => {
  const isLoggedIn = useSelector((state) => state.authentication.isLoggedIn);

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isLoggedIn ? (
        <>
          <Screen name="Login" component={Login} />
          <Screen name="Register" component={Register} />
        </>
      ) : (
        <Screen name="Main" component={MainNavigation} />
      )}
    </Navigator>
  );
};
