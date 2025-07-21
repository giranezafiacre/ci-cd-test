import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ScaledSheet } from "react-native-size-matters";
import { LoginTextField } from "../components/LoginTextField";
import {
  useFonts,
  Poppins_500Medium,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import {
  // googleLoginUser,
  loginUser,
  loginGoogleUser,
} from "../features/authSlice";
// import { authenticateWithFHIR } from "../features/fhirAuthSlice";
import { useDispatch, useSelector } from "react-redux";

import {
  GoogleSigninButton,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import Parse from "../../parseConfig";

export const Login = () => {
  let [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_800ExtraBold,
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [viewPassword, setViewPassword] = useState(true);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.authentication.isLoading);
  const isLoggedIn = useSelector((state) => state.authentication.isLoggedIn);
  const error = useSelector((state) => state.authentication.error);

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleSignUp = () => {
    navigation.navigate("Register");
  };

  const handleGoogleLogin = async () => {
    await dispatch(loginGoogleUser())
      .then(() => {
        if (!error) {
          // navigation.navigate("Home");
        }
      })
      .catch((error) => {
        console.error("Login failed:", error);
      });
  };

  // normal login
  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Validation", "Please enter both username and password.");
      return;
    }
    dispatch(loginUser({ username, password }))
      .then(() => {
        if (!error) {
          setUsername("");
          setPassword("");
          // navigation.navigate("Home");
        }
      })
      .catch((error) => {
        console.error("Login failed:", error);
      });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#01306C" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.upperContainer}>
            <Text style={styles.head1}>Sign in</Text>
            <View style={styles.signUp}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.inText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.main}>
            <LoginTextField
              OnChangeText={setUsername}
              Placeholder="Username"
              icon={<MaterialIcons name="person" size={24} color="black" />}
              value={username}
            />

            <LoginTextField
              OnChangeText={setPassword}
              Placeholder="Password"
              secureTextEntry={viewPassword}
              value={password}
              icon={
                <TouchableOpacity
                  onPress={() => setViewPassword(!viewPassword)}
                >
                  <FontAwesome name="eye" size={24} color="black" />
                </TouchableOpacity>
              }
            />
            {error && (
              <Text style={styles.errorText}>
                {error.message || "An unknown error occurred"}
              </Text>
            )}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password ?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleGoogleLogin}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#01306C",
  },
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: "20@s",
  },
  upperContainer: {
    marginBottom: "20@s",
  },
  main: {
    flex: 1,
    justifyContent: "center",
  },
  image: {
    width: "120@s",
    height: "100@s",
    alignSelf: "center",
    marginTop: "20@s",
  },
  head1: {
    fontFamily: "Poppins_800ExtraBold",
    fontSize: "22@s",
    fontWeight: "bold",
    paddingTop: "30@s",
    color: "white",
  },
  texts: {
    // fontFamily: "Poppins_500Medium",
    fontSize: "15@s",
    marginLeft: "15@s",
    color: "#2E3A59",
  },
  forgotpswd: {
    flexDirection: "row",
    marginBottom: "20@s",
    alignSelf: "flex-end",
  },
  buttonContainer: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#3ab976",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  PswddTexts: {
    fontSize: "18@s",
    // fontFamily: "Poppins_500Medium",
  },
  forgotPswddText: {
    color: "crimson",
    // fontFamily: "Poppins_800ExtraBold",
    fontSize: "16@s",
  },
  forgotPassword: {
    marginTop: "15@s",
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "crimson",
    fontSize: "16@s",
    // fontFamily: "Poppins_800ExtraBold",
  },
  signUp: {
    marginTop: "10@s",
    flexDirection: "row",
    // justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    color: "#FFFFFF",
    fontSize: "16@s",
    fontFamily: "Poppins_800ExtraBold",
  },
  inText: {
    color: "#3ab976",
    fontSize: "16@s",
    marginLeft: "5@s",
    fontFamily: "Poppins_800ExtraBold",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: "10@s",
  },
  connectedText: {
    color: "green",
    fontSize: "16@s",
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
});
