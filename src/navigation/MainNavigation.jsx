import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScaledSheet } from "react-native-size-matters";
import { useSelector, useDispatch } from "react-redux";
import { PlatformHospitals } from "../screens/PlatformHospitals";
import {
  FontAwesome5,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { UserHospitals } from "../screens/UserHospitals";
import { Home } from "../screens/Home";
import { Profile } from "../screens/Profile";
import HospitalSelectionScreen from "../screens/Share";
import QRScreen from "../screens/ResultQR";
import FHIRAuthScreen from "../screens/AuthScreen";
import { RecordsUpload } from "../screens/RecordUpload";

import { logoutUser } from "../features/authSlice";
import {
  useNavigation,
  useFocusEffect,
  useIsFocused,
} from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";

const recordStack = createNativeStackNavigator();
function RecordStackScreen() {
  // Receive the innerNavigation prop
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useFocusEffect(
    React.useCallback(() => {
      if (isFocused) {
        const state = navigation.getState();

        const recordsStackRouteIndex = state.routes.findIndex(
          (route) => route.name === "Records stacked"
        );
        if (recordsStackRouteIndex) {
          let modifiedArray = state.routes.map((item) => {
            return {
              name: item.name,
              key: item.key,
              params: item.name === "Records stacked" ? undefined : item.params,
            };
          });

          navigation.dispatch(
            CommonActions.reset({
              index: recordsStackRouteIndex,
              routes: modifiedArray,
            })
          );
        }
      }
    }, [navigation, isFocused])
  );

  return (
    <recordStack.Navigator>
      <recordStack.Screen
        name="UserHospitals"
        component={UserHospitals}
        options={{ headerShown: false }}
      />
      <recordStack.Screen
        name="Records Share"
        component={HospitalSelectionScreen}
        options={{ headerShown: false }}
      />
      <recordStack.Screen name="FHIR Auth" component={FHIRAuthScreen} />
      <recordStack.Screen
        name="Records Upload"
        component={RecordsUpload}
        options={{ headerShown: false }}
      />
      <recordStack.Screen name="Drive QR" component={QRScreen} />
    </recordStack.Navigator>
  );
}

const Tabs = createBottomTabNavigator();
const { Navigator, Screen } = Tabs;

export const MainNavigation = () => {
  const userData = useSelector((state) => state.authentication.userData);
  const dispatch = useDispatch();

  if (!userData) {
    console.log("isLoggedIn3: ", userData);
    dispatch(logoutUser());
    alert(`Login failed`);
    return null;
  }

  return (
    <Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#01306C",
          height: 60,
          borderRadius: 50,
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 15,
          paddingHorizontal: 20,
          paddingBottom: 10,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarActiveTintColor: "#FFFFFF",
        // tabBarInactiveTintColor: "#37D37F",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
        tabBarShowLabel: false,
        contentStyle: { backgroundColor: "#01306C" },
      }}
    >
      <Screen
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => {
            return (
              <MaterialCommunityIcons
                name="home-circle"
                size={30}
                color={color}
              />
            );
          },
        }}
        name="Home"
        component={Home}
      />
      <Screen
        options={{
          title: "PlatformHospitals",
          tabBarIcon: ({ color, size }) => {
            return (
              <FontAwesome5
                style={styles.icon}
                name="hospital"
                size={size}
                color={color}
              />
            );
          },
        }}
        name="PlatformHospitals"
        component={PlatformHospitals}
      />
      <Screen
        options={{
          title: "User Hospitals",
          tabBarIcon: ({ color, size }) => {
            return (
              <FontAwesome5
                style={styles.icon}
                name="hospital-user"
                size={size}
                color={color}
              />
            );
          },
        }}
        name="Records stacked"
        component={RecordStackScreen}
      />
      <Screen
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => {
            return <FontAwesome name="user" size={size} color={color} />;
          },
        }}
        name="Profile"
        component={Profile}
      />
    </Navigator>
  );
};

const styles = ScaledSheet.create({
  icon: {
    marginBottom: "-5@s",
  },
});
