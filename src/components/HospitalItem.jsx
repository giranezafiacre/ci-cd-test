import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

export const HospitalItem = ({ name, country, connectionString, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.hospitalContainer}
      onPress={() => onPress(connectionString)}
    >
      <View style={styles.hospitalContent}>
        <MaterialCommunityIcons
          name="hospital-building"
          size={24}
          color="#ffffff"
        />
      </View>
      <View style={styles.hospitalInfoContainer}>
        <Text style={styles.hospitalName}>{name}</Text>
        <Text style={styles.hospitalCountry}>{country}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  hospitalContainer: {
    flexDirection: "row",
    marginTop: "15@s",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: "15@s",
  },
  hospitalContent: {
    backgroundColor: "#01306C",
    borderRadius: "5@s",
    padding: "10@s",
    alignItems: "center",
    justifyContent: "center",
    width: "50@s",
    height: "50@s",
  },
  hospitalInfoContainer: {
    marginLeft: "15@s",
  },
  hospitalName: {
    color: "#01306C",
    fontWeight: "bold",
    fontSize: "14@s",
  },
  hospitalCountry: {
    color: "#651B1E",
    fontSize: "12@s",
    marginTop: "2@s",
  },
});
