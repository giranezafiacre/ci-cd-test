import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Ionicons,
  EvilIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  useFonts,
  Poppins_500Medium,
  Poppins_800ExtraBold,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useSelector } from "react-redux";

export const Home = () => {
  const [notificationCount, setNotificationCount] = useState(3);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const userData = useSelector((state) => state.authentication?.userData);

  const formatDate = (date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return {
      day: days[date.getDay()],
      date: `${date.getDate()} ${months[date.getMonth()]}`,
    };
  };

  let [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.SafeArea}>
      <StatusBar style="black" />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <View style={styles.rootContainer}>
            <View style={styles.upperContainer}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.upperNames}>
                    Hi, {userData?.firstname || userData?.username}
                  </Text>
                  <Text style={styles.upperGreetings}>
                    How are you feeling today?
                  </Text>
                </View>
                <View style={styles.topIcons}>
                  <TouchableOpacity style={styles.icon}>
                    <Ionicons
                      name="notifications-outline"
                      size={24}
                      color="#01306C"
                    />
                    {notificationCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {notificationCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.icon}>
                    <EvilIcons
                      name="search"
                      size={28}
                      color="#01306C"
                      style={{ marginBottom: 3 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <View style={styles.contentShadow} />
                <View style={styles.content}>
                  <View style={styles.insideContent}>
                    <Text style={styles.contentTitle}>
                      Do you know you can have access to your medical records
                      through this app
                    </Text>
                    <View style={styles.calendarContainer}>
                      <View style={styles.calendar}>
                        <Text style={styles.calendarText}>
                          {formatDate(currentDate).day}
                        </Text>
                        <Text style={styles.calendarText}>
                          {formatDate(currentDate).date}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.middleContainerWrapper}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.middleContainer}
              >
                <TouchableOpacity
                  style={styles.circleButton}
                  onPress={() => {
                    /* Navigation logic here */
                  }}
                >
                  <View style={styles.circle}>
                    <Ionicons
                      name="medical-outline"
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.circleText}>Medical Records</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.circleButton}
                  onPress={() => {
                    /* Navigation logic here */
                  }}
                >
                  <View style={styles.circle}>
                    <Ionicons
                      name="calendar-outline"
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.circleText}>Appointments</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.circleButton}
                  onPress={() => {
                    /* Navigation logic here */
                  }}
                >
                  <View style={styles.circle}>
                    <MaterialCommunityIcons
                      name="pill"
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.circleText}>Medications</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  SafeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: "40@s",
  },
  rootContainer: {
    flex: 1,
    padding: "20@s",
    backgroundColor: "#FFFFFF",
  },
  upperContainer: {
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  upperNames: {
    fontSize: "20@s",
    fontFamily: "Poppins_800ExtraBold",
    color: "#01306C",
  },
  upperGreetings: {
    color: "#01306C",
  },
  topIcons: {
    flexDirection: "row",
  },
  icon: {
    width: "40@s",
    height: "40@s",
    borderRadius: "20@s",
    borderWidth: 1,
    borderColor: "#01306C",
    marginLeft: "10@s",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: "-5@s",
    top: "-5@s",
    backgroundColor: "red",
    borderRadius: "10@s",
    width: "20@s",
    height: "20@s",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: "12@s",
    fontWeight: "bold",
  },
  contentShadow: {
    position: "absolute",
    bottom: "-1@s",
    left: "5@s",
    right: "5@s",
    height: "10@s",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderBottomLeftRadius: "10@s",
    borderBottomRightRadius: "10@s",
    zIndex: 0,
    ...Platform.select({
      ios: {
        opacity: 0.5,
      },
    }),
  },
  content: {
    backgroundColor: "#01306C",
    borderRadius: "10@s",
    marginTop: "40@s",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
    zIndex: 1,
    transform: [{ translateY: "-5@s" }],
  },
  insideContent: {
    padding: "12@s",
    alignItems: "center",
  },
  contentTitle: {
    fontSize: "16@s",
    color: "#FFFFFF",
    fontFamily: "Poppins_800ExtraBold",
  },
  calendarContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "15@s",
  },
  calendar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#9C9FA1",
    borderRadius: "20@s",
    paddingHorizontal: "15@s",
    paddingVertical: "10@s",
    width: "80%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  calendarText: {
    fontSize: "14@s",
    color: "#000000",
    fontFamily: "Poppins_600SemiBold",
    ...Platform.select({
      ios: {
        padding: "2@s",
      },
    }),
  },
  middleContainerWrapper: {
    marginTop: "30@s",
  },
  middleContainer: {
    flexDirection: "row",
    paddingHorizontal: "0@s",
  },
  circleButton: {
    alignItems: "center",
    marginRight: "20@s",
  },
  circle: {
    width: "60@s",
    height: "60@s",
    borderRadius: "30@s",
    backgroundColor: "#01306C",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  circleText: {
    marginTop: "8@s",
    fontSize: "12@s",
    color: "#01306C",
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  lowerContainerWrapper: {
    marginTop: "20@s",
    flex: 1,
  },
  lowerContainer: {
    paddingVertical: "5@s",
    flex: 1,
  },
  lowerTitle: {
    color: "#01306C",
    fontSize: "16@s",
    fontFamily: "Poppins_600SemiBold",
  },
  hospitalScrollView: {
    flex: 1,
  },
});
