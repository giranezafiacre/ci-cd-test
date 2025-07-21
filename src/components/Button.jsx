import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { ScaledSheet } from "react-native-size-matters";
// import { useFonts, Poppins_500Medium } from "@expo-google-fonts/poppins";

export const Button = ({ text, icons, action, customMargin, loading }) => {
  //   let [fontsLoaded] = useFonts({ Poppins_500Medium });

  //   if (!fontsLoaded) {
  //     return null;
  //   }
  return (
    <View style={[styles.btn, { marginTop: customMargin }]}>
      <Pressable onPress={action} style={styles.pressable}>
        {loading ? (
          <ActivityIndicator style={styles.btnText} size={30} color={"#fff"} />
        ) : (
          //   <Text style={styles.btnText}>{text}</Text>
          icons
        )}
        {/* {icon} */}
      </Pressable>
    </View>
  );
};

const styles = ScaledSheet.create({
  btn: {
    // marginTop: "30@s",
    // paddingRight: "10@s",
    backgroundColor: "#3ab976",
    width: "50@s",
    height: "50@s",
    borderRadius: "100@s",
    alignSelf: "center",
    justifyContent: "center",
    marginVertical: "20@s",
  },
  btnText: {
    color: "white",
    alignSelf: "center",
    paddingTop: "8@s",
    fontSize: "18@s",
    // fontFamily: "Poppins_500Medium",
  },
  pressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
