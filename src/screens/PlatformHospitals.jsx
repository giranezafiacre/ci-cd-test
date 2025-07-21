import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ScaledSheet } from "react-native-size-matters";
import {
  useFonts,
  Poppins_500Medium,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import { CountryPicker } from "react-native-country-codes-picker";
import HospitalContainer from "../components/HospitalContainer";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
// import { axios_api } from "../features/authSlice";
//import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Parse from "../../parseConfig";
import { useFocusEffect } from "@react-navigation/native";
/*
export const PlatformHospitals = ({ navigation }) => {
  const [show, setShow] = useState(false);
  const [countryName, setCountryName] = useState("");
  const [selectedHospitals, setSelectedHospitals] = useState({});
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [globalHospitals, setGlobalHospitals] = useState([]);
  const [countryHospitals, setCountryHospitals] = useState([]);
  const [isAnyHospitalSelected, setIsAnyHospitalSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedHospitals, setSavedHospitals] = useState([]);

  let [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_800ExtraBold,
  });

  const fetchHospitals = async () => {
    try {
      //const api = useSelector((state) => state.authentication.api);
      //await AsyncStorage.clear();
      // const response = await axios_api.api.get("/hospital-address"); //await api.get("/connection-strings");

      console.log("attempting to fetch hospitals");

      const response = await Parse.Cloud.run("getHospitalsAddresses");

      console.log("cloud function returned", response);

      setGlobalHospitals(response);
      setFilteredHospitals(response);

      // setGlobalHospitals(response.data);
      // setFilteredHospitals(response.data);
    } catch (err) {
      console.error("Failed to load hospitals", err);
      setError("Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedHospitals = async () => {
    try {
      const saved = await AsyncStorage.getItem("savedHospitals");
      if (saved !== null) {
        console.log("found saved data");
        console.log(JSON.parse(saved));
        setSavedHospitals(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load saved hospitals", err);
    }
  };

  useEffect(() => {
    fetchHospitals();
    // setFilteredHospitals(globalHospitals)
    loadSavedHospitals();
  }, []);

  useEffect(() => {
    if (countryName !== "" && countryName !== undefined) {
      //console.log("the current country name", countryName);
      // console.log("these are the country hospitals", globalHospitals);
      const filtered = globalHospitals.filter(
        (hospital) => hospital.country === countryName
      );
      setCountryHospitals(filtered);
      setFilteredHospitals(filtered);
    } else {
      // fetchHospitals();
      setFilteredHospitals(globalHospitals);
    }
  }, [countryName]);

  const handleHospitalSelection = (hospital_id, isSelected) => {
    setSelectedHospitals((prev) => ({ ...prev, [hospital_id]: isSelected }));
    setIsAnyHospitalSelected(
      Object.values({ ...selectedHospitals, [hospital_id]: isSelected }).some(
        Boolean
      )
    );
  };

  const clearCountry = () => {
    setCountryName("");
    setShow(false);
  };

  const handleAddSelectedHospitals = async () => {
    console.log(filteredHospitals);
    console.log(selectedHospitals);
    const selectedHospitalList = filteredHospitals.filter(
      (hospital) => selectedHospitals[hospital.hospital_id]
    );
    console.log(selectedHospitalList);
    const updatedSavedHospitals = [...savedHospitals, ...selectedHospitalList];
    setSavedHospitals(updatedSavedHospitals);
    try {
      await AsyncStorage.setItem(
        "savedHospitals",
        JSON.stringify(updatedSavedHospitals)
      );
    } catch (err) {
      console.error("Failed to save hospitals", err);
    }
    if (navigation) {
      // navigation.navigate("Home", {
      //   hospitals: selectedHospitalList,
      // });
      navigation.navigate("Records stacked", {});
    } else {
      console.warn("Navigation is not available");
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.SafeArea}>
      <StatusBar backgroundColor="#01306C" style="light" />
      <View style={styles.container}>
        <Text style={styles.title}>Available Hospitals</Text>
        <View style={styles.countrySection}>
          <View style={styles.pickerButtonContainer}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShow(true)}
            >
              <Text style={styles.pickerButtonText}>
                {countryName || "Select a country"}
              </Text>
            </TouchableOpacity>
            {countryName ? (
              <TouchableOpacity
                onPress={clearCountry}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={24} color="#01306C" />
              </TouchableOpacity>
            ) : null}
          </View>
          <CountryPicker
            show={show}
            pickerButtonOnPress={(item) => {
              setCountryName(item.name.en);
              setShow(false);
            }}
            onBackdropPress={() => setShow(false)}
            style={{
              modal: { height: 500 },
              textInput: {
                color: "#000",
                height: 50,
                borderBottomWidth: 1,
                borderColor: "#ccc",
                marginBottom: 10,
              },
              countryName: { color: "#000" },
            }}
            enableModalAvoiding={false}
            searchPlaceholder="Search country"
            searchPlaceholderTextColor="#999"
            showCloseButton={true}
          />
        </View>
        <Text style={styles.lowerTitle}>
          Select hospitals you have ever visited
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.lowerSection}>
              {filteredHospitals.map((hospital) => (
                <HospitalContainer
                  key={hospital.hospital_id}
                  hospital_id={hospital.hospital_id}
                  hospitalName={hospital.name}
                  country={hospital.country}
                  onSelect={handleHospitalSelection}
                  isDisabled={savedHospitals.some(
                    (savedHospital) =>
                      savedHospital.hospital_id === hospital.hospital_id
                  )}
                />
              ))}
            </View>
          </ScrollView>
        )}
        {isAnyHospitalSelected && (
          <View style={styles.buttonContainer}>
            <Button
              text="Add Selected"
              icons={<Ionicons name="add-circle" size={24} color="#ffffff" />}
              action={handleAddSelectedHospitals}
              customMargin={1}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
*/

export const PlatformHospitals = ({ navigation }) => {
  const [show, setShow] = useState(false);
  const [countryName, setCountryName] = useState("");
  const [selectedHospitals, setSelectedHospitals] = useState({});
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [globalHospitals, setGlobalHospitals] = useState([]);
  const [countryHospitals, setCountryHospitals] = useState([]);
  const [isAnyHospitalSelected, setIsAnyHospitalSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedHospitals, setSavedHospitals] = useState([]);
  const [checkedHospitals, setCheckedHospitals] = useState({});

  let [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_800ExtraBold,
  });

  const fetchHospitals = async () => {
    try {
      console.log("attempting to fetch hospitals");
      const response = await Parse.Cloud.run("getHospitalsAddresses");
      console.log("cloud function returned", response);
      setGlobalHospitals(response);
      setFilteredHospitals(response);
    } catch (err) {
      setError("Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedHospitals = async () => {
    try {
      const saved = await AsyncStorage.getItem("savedHospitals");
      if (saved !== null) {
        console.log("found saved data");
        console.log(JSON.parse(saved));
        setSavedHospitals(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load saved hospitals", err);
    }
  };

  useEffect(() => {
    fetchHospitals();
    loadSavedHospitals();
  }, []);

  useEffect(() => {
    console.log("CURRENT COUNTRY NAME", countryName);
    if (countryName !== "" && countryName !== undefined) {
      const filtered = globalHospitals.filter(
        (hospital) => hospital.country === countryName
      );
      setCountryHospitals(filtered);
      setFilteredHospitals(filtered);
    } else {
      setFilteredHospitals(globalHospitals);
    }
  }, [countryName]);

  useFocusEffect(
    React.useCallback(() => {
      // Reset state when screen is focused
      setSelectedHospitals({});
      setIsAnyHospitalSelected(false);
      setCountryName("");
      setSavedHospitals([]);
      setCheckedHospitals({});
      fetchHospitals();
      loadSavedHospitals();
    }, [])
  );

  const handleHospitalSelection = (hospital_id, isSelected) => {
    setSelectedHospitals((prev) => ({ ...prev, [hospital_id]: isSelected }));
    setIsAnyHospitalSelected(
      Object.values({ ...selectedHospitals, [hospital_id]: isSelected }).some(
        Boolean
      )
    );
    setCheckedHospitals((prev) => ({ ...prev, [hospital_id]: isSelected }));
  };

  const clearCountry = () => {
    setCountryName("");
    setShow(false);
  };

  const handleAddSelectedHospitals = async () => {
    const selectedHospitalList = filteredHospitals.filter(
      (hospital) => selectedHospitals[hospital.hospital_id]
    );
    const updatedSavedHospitals = [
      ...new Set([...savedHospitals, ...selectedHospitalList]),
    ];
    setSavedHospitals(updatedSavedHospitals);
    try {
      await AsyncStorage.setItem(
        "savedHospitals",
        JSON.stringify(updatedSavedHospitals)
      );
    } catch (err) {
      console.error("Failed to save hospitals", err);
    }
    if (navigation) {
      navigation.navigate("Records stacked", {});
    } else {
      console.warn("Navigation is not available");
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <SafeAreaView style={styles.SafeArea}>
      <StatusBar backgroundColor="#01306C" style="light" />
      <View style={styles.container}>
        <Text style={styles.title}>Available Hospitals</Text>
        <View style={styles.countrySection}>
          <View style={styles.pickerButtonContainer}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShow(true)}
            >
              <Text style={styles.pickerButtonText}>
                {countryName || "Select a country"}
              </Text>
            </TouchableOpacity>
            {countryName ? (
              <TouchableOpacity
                onPress={clearCountry}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={24} color="#01306C" />
              </TouchableOpacity>
            ) : null}
          </View>
          <CountryPicker
            show={show}
            pickerButtonOnPress={(item) => {
              setCountryName(item.name.en);
              setShow(false);
            }}
            onBackdropPress={() => setShow(false)}
            style={{
              modal: { height: 500 },
              textInput: {
                color: "#000",
                height: 50,
                borderBottomWidth: 1,
                borderColor: "#ccc",
                marginBottom: 10,
              },
              countryName: { color: "#000" },
            }}
            enableModalAvoiding={false}
            searchPlaceholder="Search country"
            searchPlaceholderTextColor="#999"
            showCloseButton={true}
          />
        </View>
        <Text style={styles.lowerTitle}>
          Select hospital you want to check in
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.lowerSection}>
              {filteredHospitals.map((hospital) => (
                <HospitalContainer
                  key={hospital.hospital_id}
                  hospital_id={hospital.hospital_id}
                  hospitalName={hospital.name}
                  country={hospital.country}
                  onSelect={handleHospitalSelection}
                  isDisabled={savedHospitals.some(
                    (savedHospital) =>
                      savedHospital.hospital_id === hospital.hospital_id
                  )}
                  isChecked={checkedHospitals[hospital.hospital_id] || false}
                />
              ))}
            </View>
          </ScrollView>
        )}
        {isAnyHospitalSelected && (
          <View style={styles.buttonContainer}>
            <Button
              text="Add Selected"
              icons={<Ionicons name="add-circle" size={24} color="#ffffff" />}
              action={handleAddSelectedHospitals}
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
    backgroundColor: "#01306C",
  },
  container: {
    flex: 1,
    padding: "20@s",
    backgroundColor: "#01306C",
  },
  title: {
    fontSize: "20@s",
    fontFamily: "Poppins_800ExtraBold",
    color: "#ffffff",
    textAlign: "center",
  },
  countrySection: {
    marginTop: "20@s",
    marginBottom: "10@s",
  },
  countryLabel: {
    color: "#ffffff",
    marginBottom: "10@s",
  },
  pickerButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pickerButton: {
    backgroundColor: "#ffffff",
    padding: "10@s",
    borderRadius: "5@s",
    flex: 1,
  },
  pickerButtonText: {
    color: "#01306C",
    fontFamily: "Poppins_500Medium",
  },
  clearButton: {
    marginLeft: "10@s",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: "100@s",
  },
  buttonContainer: {
    position: "absolute",
    bottom: "60@s",
    left: "20@s",
    right: "20@s",
  },
  lowerSection: {
    marginTop: "10@s",
    flex: 1,
    paddingBottom: "20@s",
  },
  lowerTitle: {
    color: "#FFFFFF",
    fontSize: "16@s",
    fontFamily: "Poppins_800ExtraBold",
    paddingVertical: "10@s",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: "20@s",
  },
});
