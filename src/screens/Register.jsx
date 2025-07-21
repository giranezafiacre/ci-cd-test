//require("dotenv").config();
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MaterialIcons,
  FontAwesome,
  AntDesign,
  FontAwesome5,
} from "@expo/vector-icons";
import {
  useFonts,
  Poppins_500Medium,
  Poppins_800ExtraBold,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { StatusBar } from "expo-status-bar";
import { ScaledSheet } from "react-native-size-matters";
import { LoginTextField } from "../components/LoginTextField";
import { Button } from "../components/Button.jsx";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { SERVER_HOST, SERVER_PORT } from "@env";
import Parse from "../../parseConfig";

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

export const Register = () => {
  const [viewPassword, setViewPassword] = useState("");
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });

  let [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
  });

  const navigation = useNavigation();

  const registerUser = async () => {
    try {
      console.log(userData);
      //console.log(SERVER_PORT);

      await Parse.Cloud.run("createUser", { userData });

      navigation.goBack();
    } catch (error) {
      console.log("-----------------------------");
      console.log(error);
      Alert.alert("Error", "Failed to register user.");
    }
  };

  const handleInputChange = (field, value) => {
    setUserData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSignIp = () => {
    navigation.navigate("Login");
  };

  if (!fontsLoaded) {
    return null;
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="black" backgroundColor="#ffffff" />
      <View style={styles.Container}>
        <View style={styles.upperContainer}>
          <Text style={styles.head1}>Register</Text>
          <Text style={styles.paragraph}>Create your new account</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <KeyboardAvoidingView>
            <View style={styles.main}>
              <LoginTextField
                OnChangeText={(text) => handleInputChange("username", text)}
                value={userData.username}
                Placeholder={"Username"}
                icon={
                  <MaterialIcons name="contact-page" size={23} color="black" />
                }
              />
              <LoginTextField
                OnChangeText={(text) => handleInputChange("firstName", text)}
                value={userData.firstName}
                Placeholder={"First name"}
                icon={
                  <MaterialIcons name="contact-page" size={23} color="black" />
                }
              />
              <LoginTextField
                OnChangeText={(text) => handleInputChange("lastName", text)}
                value={userData.lastName}
                Placeholder={"Second name"}
                icon={
                  <MaterialIcons name="contact-page" size={23} color="black" />
                }
              />
              <LoginTextField
                OnChangeText={(text) => handleInputChange("phoneNumber", text)}
                value={userData.phoneNumber}
                Placeholder={"Mobile"}
                icon={<FontAwesome5 name="mobile" size={24} color="black" />}
              />
              <LoginTextField
                OnChangeText={(text) => handleInputChange("email", text)}
                value={userData.email}
                Placeholder={"Email"}
                icon={<MaterialIcons name="email" size={24} color="black" />}
              />
              <LoginTextField
                OnChange={(text) => setViewPassword(text)}
                OnChangeText={(text) => handleInputChange("password", text)}
                secureTextEntry={true}
                value={userData.password}
                Placeholder={"Password"}
                icon={
                  <TouchableOpacity
                    onPress={() => setViewPassword(!viewPassword)}
                  >
                    <FontAwesome5 name="lock" size={24} color="black" />
                  </TouchableOpacity>
                }
              />
              <TouchableOpacity style={styles.button} onPress={registerUser}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>

              <Text style={styles.haveAccount}>Already have an account?</Text>
              <TouchableOpacity onPress={handleSignIp}>
                <Text style={styles.signInText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  scrollViewContent: {
    // paddingBottom: "10@s",
  },
  Container: {
    backgroundColor: "#ffffff",
    height: height,
    width: width,
    flex: 1,
  },
  upperContainer: {
    padding: "10@s",
  },
  image: {
    width: "120@s",
    height: "100@s",
    alignSelf: "center",
    marginTop: "20@s",
  },
  head1: {
    // fontFamily: "Poppins_800ExtraBold",
    // alignSelf: "center",
    fontFamily: "Poppins_800ExtraBold",
    fontSize: "22@s",
    paddingTop: "30@s",
    color: "#01306C",
  },
  paragraph: {
    color: "#01306C",
    fontFamily: "Poppins_600SemiBold",
    fontSize: "14@s",
  },
  main: {
    height: height,
    paddingVertical: "10@s",
    marginTop: "20@s",
    paddingTop: "50@s",
    padding: "20@s",
    backgroundColor: "#01306C",
    // marginBottom: "50@s",
  },
  texts: {
    // fontFamily: "Poppins_500Medium",
    fontSize: "15@s",
    marginLeft: "15@s",
    color: "#2E3A59",
  },
  button: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#01306C",
    fontSize: "10@s",
    fontFamily: "Poppins_800ExtraBold",
  },
  haveAccount: {
    fontSize: "14@s",
    fontFamily: "Poppins_800ExtraBold",
    color: "#ffffff",
    marginTop: "20@s",
  },
  signInText: {
    color: "crimson",
    fontSize: "12@s",
    fontFamily: "Poppins_600SemiBold",
  },
});
