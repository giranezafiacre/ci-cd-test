import React from "react";
import { View, Text } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import {
  useFonts,
  Poppins_500Medium,
  Poppins_800ExtraBold,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";

export const InfoField = ({ placeholder, value }) => {
  let [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>{placeholder}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flexDirection: "column",
    paddingVertical: "10@vs",
    borderBottomWidth: 1,
    borderBottomColor: "#7D3C3F",
  },
  placeholder: {
    fontSize: "14@s",
    fontFamily: "Poppins_500Medium",
    color: "#7D3C3F",
    marginBottom: "4@vs",
  },
  value: {
    fontSize: "16@s",
    color: "#01306C",
    fontFamily: "Poppins_600SemiBold",
  },
});
