import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";
import {
  useFonts,
  Poppins_500Medium,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";

const HospitalBox = ({ id, hospitalName, country, onSelect }) => {
  const [isChecked, setIsChecked] = useState(false);

  const toggleCheckbox = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onSelect(id, newCheckedState);
  };

  return (
    <TouchableOpacity onPress={toggleCheckbox} style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.hospitalName}>{hospitalName}</Text>
        <Text style={styles.country}>{country}</Text>
      </View>
      <MaterialCommunityIcons
        name={
          isChecked
            ? "checkbox-marked-circle-outline"
            : "checkbox-blank-circle-outline"
        }
        size={24}
        color={isChecked ? "#40CF82" : "gray"}
      />
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16@s",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: "15@s",
    backgroundColor: "#01306C",
  },
  infoContainer: {
    flex: 1,
  },
  hospitalName: {
    fontSize: "16@s",
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  country: {
    fontSize: "12@s",
    color: "#40CF82",
    fontFamily: "Poppins_800ExtraBold",
  },
});

export default HospitalBox;
