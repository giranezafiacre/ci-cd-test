import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
// import LottieView from "lottie-react-native";
import {
  getGoogleToken,
  createFolder,
  uploadFile,
  setPermission,
  // updateFileMetadata,
  revokePermission,
} from "../features/utils";
import { generatePDFBinary } from "../features/resourceParser";
import { useSelector } from "react-redux";

export const RecordsUpload = ({ route, navigation }) => {
  const { patientDataList, unavailableHospitals, interval, email, days } =
    route.params;
  const userData = useSelector((state) => state.authentication?.userData);


  const [googleToken, setGoogleToken] = useState();
  const [recordsReady, setRecordsReady] = useState(false);

  const [googledriveUrl, setgoogledriveUrl] = useState(null);

  const handleGoogleAuth = async () => {
    let tokens = await getGoogleToken();
    setGoogleToken(tokens);
  };

  useEffect(() => {
    handleGoogleAuth();
  }, []);

  useEffect(() => {
    const allEmpty = Object.values(patientDataList).every(
      (arr) => Array.isArray(arr) && arr.length === 0
    );

    if (allEmpty) {
      console.log("There is nothing to be appended");
    } else {
      console.log(
        "%%%%%%%%%%%%%%%%%% YIPPY READY TO COMBINE THE DATA INTO A PDF %%%%%%%%%%%%"
      );
    }

    setRecordsReady(true);
  }, [patientDataList]);

  useEffect(() => {
    const handleGoogleOperations = async (patientDataList, emailAddress) => {
      const patientPDFBinary = await generatePDFBinary(patientDataList, userData);
      const folder_id = await createFolder(googleToken);
      const patientNames = `${userData.firstname} ${userData.lastname}`
      // const fileId = await uploadFile(googleToken, folder_id, patientPDFBinary, patientNames);
      //'Fiacre Giraneza_2025-05-14.pdf'
      const fileId = await uploadFile(googleToken, folder_id, patientPDFBinary, patientNames);
      const permission_id = await setPermission(
        googleToken,
        fileId,
        emailAddress
      );
      const shareRecord = {
        sharedWith: emailAddress,
        patient: patientNames,
        fileId,
        permissionId: permission_id,
        fileUrl: `https://drive.google.com/file/d/${fileId}/view`,
        sharedAt: new Date().toISOString(),
        revokeAt: new Date().toISOString(), // revoke after N days
        // revokeAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(), // revoke after N days
        accessToken: googleToken.accessToken,
      };
      try {
        const existing = await AsyncStorage.getItem("sharedDocs");
        const parsed = existing ? JSON.parse(existing) : [];

        parsed.push(shareRecord);
        await AsyncStorage.setItem("sharedDocs", JSON.stringify(parsed));
        console.log("Stored share info in AsyncStorage ✅");
        setgoogledriveUrl(`https://drive.google.com/file/d/${fileId}/view`);
      } catch (error) {
        console.error("Failed to store share info ❌:", error);
      }
    };

    try {
      if (recordsReady && googleToken) {
        handleGoogleOperations(patientDataList, email);
      }
    } catch (error) {
      console.error("Error occured", error);
    }
  }, [recordsReady, googleToken]);

  useEffect(() => {
    if (googledriveUrl) {
      navigation.navigate("Drive QR", {
        gdriveUrl: googledriveUrl, // `https://www.googleapis.com/drive/v3/files/${fileId}`,
      });
    }
  }, [googledriveUrl]);

  return (
    <View style={styles.container}>
      {!recordsReady && googleToken && (
        <View style={styles.messageContainer}>
          {/* <LottieView
            source={require("../../assets/processing.json")}
            autoPlay
            loop
            style={styles.animation}
          /> */}
          <Text style={styles.message}>Processing Records...</Text>
        </View>
      )}
      {recordsReady && googleToken && (
        <View style={styles.messageContainer}>
          {/* <LottieView
            source={require("../../assets/uploading.json")}
            autoPlay
            loop
            style={styles.animation}
          /> */}
          <Text style={styles.message}>
            Please wait... records uploading ongoing.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 200,
    height: 200,
  },
  message: {
    fontSize: 18,
    marginTop: 20,
  },
});
