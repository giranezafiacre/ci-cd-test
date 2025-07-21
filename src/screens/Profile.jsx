import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { ScaledSheet } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Poppins_500Medium,
  Poppins_800ExtraBold,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { AntDesign } from "@expo/vector-icons";
import { InfoField } from "../components/InfoField";
import { logoutUser } from "../features/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const Profile = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.authentication?.userData);

  let [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
  });

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    GoogleSignin.signOut();
  }, [dispatch]);

  if (!fontsLoaded || !userData) {
    return null; // or a loader
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.rootContainer}>
        <View style={styles.upperContainer}>
          <Text style={styles.profile}>Profile Information</Text>
        </View>
        <View style={styles.mainContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View style={styles.insideMainContainer}>
              <Text style={styles.informationTitle}>PERSONAL INFORMATION</Text>
              <View style={styles.activeProfile}>
                <View style={styles.initialsContainer}>
                  <Text style={styles.initialsText}>
                    {" "}
                    {userData?.firstname?.[0] ?? ""} {userData?.lastname?.[0] ?? ""}{" "}
                  </Text>
                </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.nameText}>
                    {" "}
                    {userData?.firstname ?? ""} {userData?.lastname ?? ""}{" "}
                  </Text>
                </View>
              </View>
              <InfoField placeholder="First Name" value={userData?.firstname ?? ""} />
              <InfoField placeholder="Second Name" value={userData?.lastname ?? ""} />
            </View>
            <View style={styles.insideMainContainer}>
              <Text style={styles.informationTitle}>CONTACT INFORMATION</Text>
              <InfoField
                placeholder="Phone number"
                value={userData?.phoneNumber ?? ""}
              />
              <InfoField placeholder="Email"
                value={userData?.emailAddress ?? ""} />
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogout}>
              <AntDesign name="logout" size={24} color="#ffffff" />
              <Text style={styles.loginText}>SIGN OUT</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#01306C",
  },
  rootContainer: {
    flex: 1,
    backgroundColor: "#01306C",
  },
  upperContainer: {
    paddingHorizontal: "20@s",
    // backgroundColor: "#01306C",
  },
  profile: {
    textAlign: "center",
    paddingVertical: "20@s",
    color: "#FFFFFF",
    fontFamily: "Poppins_800ExtraBold",
    fontSize: "20@s",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopEndRadius: "20@s",
    borderTopStartRadius: "20@s",
  },
  scrollViewContent: {
    paddingBottom: "100@s",
    flexGrow: 1,
  },
  insideMainContainer: {
    // flexGrow: 1,
    margin: "15@s",
    backgroundColor: "#F0F0F0",
    borderRadius: "20@s",
    padding: "20@s",
    paddingBottom: "30@s",
  },
  informationTitle: {
    color: "#7D3C3F",
    fontSize: "18@s",
    fontFamily: "Poppins_600SemiBold",
  },
  activeProfile: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: "10@vs",
    borderBottomWidth: 1,
    borderBottomColor: "#7D3C3F",
    marginTop: "20@s",
  },
  initialsContainer: {
    width: "45@s",
    height: "45@s",
    borderRadius: "50@s",
    backgroundColor: "#01306C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "20@s",
  },
  initialsText: {
    color: "white",
    fontSize: "16@s",
    fontWeight: "bold",
  },
  nameContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: "16@s",
    // fontWeight: "bold",
    color: "#01306C",
    fontFamily: "Poppins_600SemiBold",
  },
  informationSubtitle: {
    color: "#01306C",
    fontSize: "18@s",
    fontFamily: "Poppins_600SemiBold",
  },
  loginButton: {
    backgroundColor: "#01306C",
    borderRadius: "10@s",
    padding: "10@s",
    margin: "15@s",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: "16@s",
    fontFamily: "Poppins_800ExtraBold",
    marginLeft: "15@s",
  },
});
