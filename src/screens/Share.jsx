import {
  getHospitalKey,
  getTokenInfo,
  deleteTokenInfo,
  createFolder,
  setPermission,
  uploadFile,
  getGoogleToken,
  // saveTokenInfo,
} from "../features/utils";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import DatePicker from "@react-native-community/datetimepicker";
import Parse from "../../parseConfig";
import { AntDesign } from "@expo/vector-icons";
import {
  useFonts,
  Poppins_500Medium,
  Poppins_800ExtraBold,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { ScaledSheet } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
// import RNPickerSelect from "react-native-picker-select";
import { Picker } from "@react-native-picker/picker";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';


const HospitalSelectionScreen = ({ route, navigation }) => {
  let [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [email, setEmail] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [days, setDays] = useState(0);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [authorizationStatuses, setAuthorizationStatuses] = useState([]);
  const [googleToken, setGoogleToken] = useState();

  const handleGoogleAuth = async () => {
    let tokens = await getGoogleToken();
    setGoogleToken(tokens);
  };

  useEffect(() => {
    handleGoogleAuth();
  }, []);


  const { hospitals } = route.params;

  const fetchHospitals = async () => {
    try {
      const hospitalIds = hospitals.map((hospital) => hospital.hospital_id);
      const response = await Parse.Cloud.run("getHospitalConnectionStrings", {
        hospitalIds,
      });
      // const data = await response.json();
      const data = response;
      setFilteredHospitals(data);
    } catch (err) {
      console.error("Failed to load hospitals", err);
    }
  };

  const getHospitalToken = async (hospitalInfo, index) => {
    const hospitalKey = await getHospitalKey(JSON.stringify(hospitalInfo));
    const tokenInfo = JSON.parse(await getTokenInfo(hospitalKey));
    return { index, hospitalKey, tokenInfo };
  };

  const getAuthorizationStatuses = async (hospitals) => {
    try {
      const results = await Promise.all(
        hospitals.map(async (hospital, index) => {
          return await getHospitalToken(hospital, index);
        })
      );
      setAuthorizationStatuses(results);
    } catch (error) {
      console.error("Error processing observations:", error);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [hospitals]);

  useEffect(() => {
    if (filteredHospitals.length === 0) return;
    getAuthorizationStatuses(filteredHospitals);
  }, [filteredHospitals]);

  const options = [
    { label: "1 week", value: 7 },
    { label: "2 weeks", value: 14 },
    { label: "1 month", value: 30 },
    { label: "3 months", value: 90 },
  ];
  // const testGoogleOperations = async () => {


  //   try {
  //     console.log("Stored share info in AsyncStorage googleToken: ", googleToken);
  //     // const patientPDFBinary = await generatePDFBinary(patientDataList, userData);
  //     const folder_id = await createFolder(googleToken);
  //     // const patientNames = `${userData.firstname} ${userData.lastname}`
  //     // const fileId = await uploadFile(googleToken, folder_id, patientPDFBinary, patientNames);
  //     //'Fiacre Giraneza_2025-05-14.pdf'
  //     const pdfAsset = require('./Fiacre_Giraneza_2025-05-14.pdf');
  //     const asset = Asset.fromModule(pdfAsset);
  //     await asset.downloadAsync();

  //     const localUri = asset.localUri;
  //     const destUri = FileSystem.documentDirectory + 'Fiacre_Giraneza_2025-05-14.pdf';

  //     await FileSystem.copyAsync({
  //       from: localUri,
  //       to: destUri,
  //     });

  //     console.log('File copied to:', destUri);
  //     const fileId = await uploadFile(googleToken, folder_id, destUri, 'Fiacre Giraneza');
  //     console.log('Uploaded file ID:', fileId);
  //     console.log("Stored share info in AsyncStorage ✅");
  //     const permission_id = await setPermission(
  //       googleToken,
  //       fileId,
  //       // emailAddress
  //       'fgiranez@andrew.cmu.edu'
  //     );
  //     const shareRecord = {
  //       sharedWith: 'fgiranez@andrew.cmu.edu',
  //       patient: 'patientNames',
  //       fileId,
  //       permissionId: permission_id,
  //       fileUrl: `https://drive.google.com/file/d/${fileId}/view`,
  //       sharedAt: new Date().toISOString(),
  //       revokeAt: new Date(Date.now() + (1 * 60 * 1000)).toISOString(), // revoke after N days
  //       // revokeAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(), // revoke after N days
  //       accessToken: googleToken,
  //     };
  //     const existing = await AsyncStorage.getItem("sharedDocs");
  //     const parsed = existing ? JSON.parse(existing) : [];

  //     parsed.push(shareRecord);
  //     await AsyncStorage.setItem("sharedDocs", JSON.stringify(parsed));
  //     console.log("Stored share info in AsyncStorage ✅");
  //   } catch (error) {
  //     console.error("Failed to store share info ❌:", error);
  //   }

  //   // setgoogledriveUrl(`https://drive.google.com/file/d/${fileId}/view`);
  // };

  const handleSubmit = async () => {
    console.log('startDate: ', startDate)
    console.log('endDate: ', endDate)
    console.log('email: ', email)
    console.log('days: ', days)
    // await testGoogleOperations();
    navigation.navigate("FHIR Auth", {
      connectionStrings: filteredHospitals,
      interval: { start: startDate.toUTCString(), end: endDate.toUTCString() },
      authStatus: authorizationStatuses,
      email: email,
      days: days,
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="black" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <View style={styles.upperContainer}>
            <Text style={styles.title}>Access and Share Records</Text>
          </View>
          <View style={styles.lowerContainer}>
            <Text style={styles.label}>Select Start Date:</Text>
            {!showStartPicker && Platform.OS === "android" && (<TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.datePicker}>
              <Text>{startDate.toDateString()}</Text>
            </TouchableOpacity>)}
            {showStartPicker && Platform.OS === "android" && (
              <DatePicker
                mode="date"
                display="spinner"
                value={startDate}
                onChange={(event, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) setStartDate(selectedDate);
                }}
              />
            )}
            {Platform.OS === "ios" && (<DatePicker
              style={styles.datePicker}
              mode="date"
              value={startDate}
              onChange={(event, date) => setStartDate(date)}
            />)}
            <Text style={styles.label}>Select End Date:</Text>
            {!showEndPicker && Platform.OS === "android" && (<TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.datePicker}>
              <Text>{endDate.toDateString()}</Text>
            </TouchableOpacity>)}
            {showEndPicker && Platform.OS === "android" && (
              <DatePicker
                mode="date"
                display="spinner"
                value={endDate}
                onChange={(event, selectedDate) => {
                  setShowEndPicker(false);
                  if (selectedDate) setEndDate(selectedDate);
                }}
              />
            )}
            {Platform.OS === "ios" && (<DatePicker
              style={styles.datePicker}
              mode="date"
              value={endDate}
              onChange={(event, date) => setEndDate(date)}
            />)}
            <Text style={styles.label}>
              Enter Medical Officer's email address:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Text style={styles.label}>Record Access Duration:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.pickerStyles}
                selectedValue={selectedOption}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedOption(itemValue);
                  setDays(options[itemIndex].value);
                }}
              >
                {options.map((option) => (
                  <Picker.Item
                    key={option.label}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <AntDesign name="logout" size={24} color="#ffffff" />
              <Text style={styles.submitText}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "space-between",
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
  lowerContainer: {
    paddingVertical: "10@s",
  },
  pickerContainer: {
    flex: 1,
    //alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: "10@s",
    marginVertical: "8@s",
    paddingHorizontal: "10@s",
    //height: "200@s", // Set a fixed height
    paddingVertical: "5@s",
    //justifyContent: "center", // Center the picker vertically
  },
  pickerStyles: {
    flex: 1,
    //height: "50@s", // Adjust height to ensure proper alignment
    //"#FF0000",
    color: "black",
  },
  // pickerStyles: {
  //   // width: "70%",
  //   backgroundColor: "gray",
  //   color: "white",
  // },
  label: {
    fontSize: "16@s",
    color: "#01306C",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: "10@s",
  },
  datePicker: {
    width: "100%",
    marginVertical: "8@s",
  },
  input: {
    height: "40@s",
    borderColor: "gray",
    borderWidth: 1,
    marginVertical: "8@s",
    paddingHorizontal: "8@s",
    borderRadius: "5@s",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: "16@s",
  },
  optionButton: {
    padding: "10@s",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: "5@s",
  },
  selectedOptionButton: {
    backgroundColor: "lightblue",
  },
  optionText: {
    fontSize: "16@s",
  },
  submitButton: {
    backgroundColor: "#01306C",
    borderRadius: "10@s",
    padding: "10@s",
    margin: "15@s",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "20@s", // Add margin to separate from the picker
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: "16@s",
    fontFamily: "Poppins_800ExtraBold",
    marginLeft: "15@s",
  },
});

export default HospitalSelectionScreen;
