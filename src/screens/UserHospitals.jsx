// import { ScrollView, StyleSheet, Text, View } from "react-native";
// import React, { useState, useEffect } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { StatusBar } from "expo-status-bar";
// import { ScaledSheet } from "react-native-size-matters";
// import {
//   useFonts,
//   Poppins_500Medium,
//   Poppins_800ExtraBold,
// } from "@expo-google-fonts/poppins";
// import HospitalBox from "../components/HospitalBox";
// import { Button } from "../components/Button";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";

// export const UserHospitals = () => {
//   const navigation = useNavigation();

//   const [selectedHospitals, setSelectedHospitals] = useState({});
//   const [isAnyHospitalSelected, setIsAnyHospitalSelected] = useState(false);
//   const [savedHospitals, setSavedHospitals] = useState([]);

//   useEffect(() => {
//     const loadSavedHospitals = async () => {
//       try {
//         const saved = await AsyncStorage.getItem("savedHospitals");
//         if (saved !== null) {
//           console.log(saved);
//           setSavedHospitals(JSON.parse(saved));
//         }
//       } catch (err) {
//         console.error("Failed to load saved hospitals", err);
//       }
//     };

//     const unsubscribe = navigation.addListener("focus", loadSavedHospitals);

//     return unsubscribe;
//   }, [navigation]);

//   const handleHospitalSelection = (id, isSelected) => {
//     setSelectedHospitals((prev) => ({ ...prev, [id]: isSelected }));
//     setIsAnyHospitalSelected(
//       Object.values({ ...selectedHospitals, [id]: isSelected }).some(Boolean)
//     );
//   };

//   const handleSelectedHospitals = () => {
//     console.log("saved hospitals", savedHospitals);
//     const selectedHospitalList = savedHospitals.filter(
//       (hospital) => selectedHospitals[hospital.hospital_id]
//     );
//     console.log("selected hospitals before nav", selectedHospitalList);
//     if (navigation) {
//       navigation.navigate("Records Share", {
//         hospitals: selectedHospitalList,
//       });
//     } else {
//       console.warn("Navigation is not available");
//     }
//   };

//   let [fontsLoaded] = useFonts({
//     Poppins_500Medium,
//     Poppins_800ExtraBold,
//   });

//   if (!fontsLoaded) {
//     return null;
//   }

//   return (
//     <SafeAreaView style={styles.SafeArea}>
//       <StatusBar style="black" backgroundColor="#ffffff" />
//       <View style={styles.container}>
//         <View style={styles.upperContainer}>
//           <Text style={styles.title}>Hospitals You Have Visited</Text>
//         </View>
//         <ScrollView
//           style={styles.scrollView}
//           contentContainerStyle={styles.scrollViewContent}
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.lowerContainer}>
//             {savedHospitals.map((hospital) => (
//               <HospitalBox
//                 key={hospital.hospital_id}
//                 id={hospital.hospital_id}
//                 hospitalName={hospital.name}
//                 country={hospital.country}
//                 onSelect={handleHospitalSelection}
//               />
//             ))}
//           </View>
//         </ScrollView>
//         {isAnyHospitalSelected && (
//           <View style={styles.buttonContainer}>
//             <Button
//               title="Proceed to Fetch"
//               icons={
//                 <MaterialIcons name="navigate-next" size={24} color="#ffffff" />
//               }
//               action={handleSelectedHospitals}
//               customMargin={1}
//             />
//           </View>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = ScaledSheet.create({
//   SafeArea: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   container: {
//     flex: 1,
//     padding: "20@s",
//     backgroundColor: "#FFFFFF",
//   },
//   upperContainer: {
//     borderBottomWidth: "0.5@s",
//     borderColor: "#01306C",
//     alignItems: "center",
//     marginBottom: "20@s",
//   },
//   title: {
//     color: "#01306C",
//     fontSize: "18@s",
//     fontFamily: "Poppins_800ExtraBold",
//     marginBottom: "20@s",
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollViewContent: {
//     paddingBottom: "100@s",
//   },
//   lowerContainer: {
//     paddingVertical: "10@s",
//   },
//   buttonContainer: {
//     position: "absolute",
//     bottom: "60@s",
//     left: "20@s",
//     right: "20@s",
//   },
// });

import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ScaledSheet } from "react-native-size-matters";
import {
  useFonts,
  Poppins_500Medium,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import HospitalBox from "../components/HospitalBox";
import { Button } from "../components/Button";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native"; // Import useRoute

export const UserHospitals = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Access the current route

  const [selectedHospitals, setSelectedHospitals] = useState({});
  const [isAnyHospitalSelected, setIsAnyHospitalSelected] = useState(false);
  const [savedHospitals, setSavedHospitals] = useState([]);

  useEffect(() => {
    const loadSavedHospitals = async () => {
      try {
        const saved = await AsyncStorage.getItem("savedHospitals");
        if (saved !== null) {
          console.log(saved);
          setSavedHospitals(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Failed to load saved hospitals", err);
      }
    };

    const unsubscribe = navigation.addListener("focus", loadSavedHospitals);

    return unsubscribe;
  }, [navigation]);

  const handleHospitalSelection = (id, isSelected) => {
    setSelectedHospitals((prev) => ({ ...prev, [id]: isSelected }));
    setIsAnyHospitalSelected(
      Object.values({ ...selectedHospitals, [id]: isSelected }).some(Boolean)
    );
  };

  const handleSelectedHospitals = () => {
    console.log("saved hospitals", savedHospitals);
    const selectedHospitalList = savedHospitals.filter(
      (hospital) => selectedHospitals[hospital.hospital_id]
    );
    console.log("selected hospitals before nav", selectedHospitalList);
    if (navigation) {
      navigation.navigate("Records Share", {
        hospitals: selectedHospitalList,
      });
    } else {
      console.warn("Navigation is not available");
    }
  };

  let [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.SafeArea}>
      <StatusBar style="black" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          <Text style={styles.title}>Hospitals You Have Visited</Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.lowerContainer}>
            {savedHospitals.map((hospital) => (
              <HospitalBox
                key={hospital.hospital_id}
                id={hospital.hospital_id}
                hospitalName={hospital.name}
                country={hospital.country}
                onSelect={handleHospitalSelection}
              />
            ))}
          </View>
        </ScrollView>
        {isAnyHospitalSelected && (
          <View style={styles.buttonContainer}>
            <Button
              title="Proceed to Fetch"
              icons={
                <MaterialIcons name="navigate-next" size={24} color="#ffffff" />
              }
              action={handleSelectedHospitals}
              customMargin={1}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  SafeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    padding: "20@s",
    backgroundColor: "#FFFFFF",
  },
  upperContainer: {
    borderBottomWidth: "0.5@s",
    borderColor: "#01306C",
    alignItems: "center",
    marginBottom: "20@s",
  },
  title: {
    color: "#01306C",
    fontSize: "18@s",
    fontFamily: "Poppins_800ExtraBold",
    marginBottom: "20@s",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: "100@s",
  },
  lowerContainer: {
    paddingVertical: "10@s",
  },
  buttonContainer: {
    position: "absolute",
    bottom: "60@s",
    left: "20@s",
    right: "20@s",
  },
});
