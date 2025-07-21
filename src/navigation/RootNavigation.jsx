import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigation } from "./AppNavigation";
import { Linking } from "react-native"; // Import Linking

const linkingConfig = {
  prefixes: ["com.fiacregiraneza.myapp://"],
  config: {
    screens: {
      Login: "Login",
      // Add other screens if needed
    },
  },
};

//healthydataportability
export const RootNavigation = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linkingConfig}>
        <AppNavigation />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({});
