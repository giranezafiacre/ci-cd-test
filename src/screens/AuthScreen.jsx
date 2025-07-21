import { initiateLoginFHIR } from "../features/fhirAuthSlice";
import { useCallback, useEffect, useState } from "react";
import { Alert, View, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { dataFetcher, saveTokenInfo } from "../features/utils";
import { JSONPath } from "jsonpath-plus";
import {
  processAllergies,
  processImmunization,
  processMedicationStatements,
  processObservations,
} from "../features/resourceParser";
import createAxiosInstance from "../features/tokenManager";
//import { saveTokenInfo } from "./utils";

const FHIRAuthScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();

  const [patientDataList, setPatientDataList] = useState({
    observations: [],
    immunizations: [],
    allergyIntolerances: [],
    medicationStatements: [],
  });
  const [attemptedAuthServers, setAttemptedServers] = useState(new Set());
  const [authrequired, setAuthRequired] = useState([]);
  const [authuncertainity, setAuthUncertainity] = useState([]);
  const [authrequiredExtra, setAuthRequiredExtra] = useState([]);
  const [isProcessingAxios, setIsProcessingAxios] = useState(false);
  const [axiosQueue, setAxiosQueue] = useState([]);
  const [noExtraAuthRequiredHandled, setNoExtraAuthRequiredHandled] = useState(
    []
  );
  const [unreachableServers, setUnreachableServers] = useState([]);

  const { connectionStrings, interval, authStatus, email, days } = route.params;

  const createBins = async (candidateHospitals) => {
    console.log("These are the hospitals to be filtered", candidateHospitals);
    const authrequired = candidateHospitals.filter((candidateHospital) => {
      return !candidateHospital.tokenInfo;
    });

    const authuncertainity = candidateHospitals.filter((candidateHospital) => {
      return candidateHospital.tokenInfo;
    });

    return { authrequired, authuncertainity };
  };

  const authenticateServers = async (authList) => {
    for (const [index, hospitalInfo] of authList.entries()) {
      await handleFHIRAuth(hospitalInfo);
    }
  };

  useEffect(() => {
    console.log("UNREACHABLE SERVERS ------: ", unreachableServers);

    if (isProcessingAxios) return;

    if (
      !authrequired.every((hospitalInfo) =>
        attemptedAuthServers.has(hospitalInfo.hospitalKey)
      )
    )
      return;

    if (
      !authrequiredExtra.every((hospitalInfo) =>
        attemptedAuthServers.has(hospitalInfo.hospitalKey)
      )
    )
      return;

    const noExtraAuthRequired = authuncertainity.filter(
      (hospitalInfo) => !authrequiredExtra.includes(hospitalInfo)
    );

    const noExtraAuthRequiredSet = new Set(
      noExtraAuthRequiredHandled.map((hospitalInfo) => hospitalInfo.hospitalKey)
    );

    if (
      !noExtraAuthRequired.every((hospitalInfo) =>
        noExtraAuthRequiredSet.has(hospitalInfo.hospitalKey)
      )
    )
      return;

    const allEmpty = Object.values(patientDataList).every(
      (arr) => Array.isArray(arr) && arr.length === 0
    );

    console.log(
      "UNREACHABLE SERVERS ------: ",
      JSON.stringify(unreachableServers)
    );

    if (allEmpty) {
      console.log("There is nothing to be appended");
    } else {
      console.log(
        "%%%%%%%%%%%%%%%%%% YIPPY READY TO COMBINE THE DATA INTO A PDF %%%%%%%%%%%%"
      );

      navigation.navigate("Records Upload", {
        patientDataList: patientDataList,
        unavailableHospitals: unreachableServers,
        interval: interval,
        email: email,
        days: days,
      });
    }

    // navigation.navigate("Records Upload", {
    //   patientDataList: patientDataList,
    //   unavailableHospitals: unreachableServers,
    //   interval: interval,
    //   email: email,
    //   days: days,
    // });

    // if (!noAuthRequired.every((hospitalInfo) =>
    //   attemptedAuthServers.has(hospitalInfo.hospitalKey)
    // )) return;

    // if (!noExtraAuthRequired.every((hospitalInfo) =>
    //   attemptedAuthServers.has(hospitalInfo.hospitalKey)
    // )) return;

    // console.log("CURRENT PATIENT DATA LIST");

    // console.log(patientDataList);

    // console.log(
    //   "%%%%%%%%%%%%%%%%%% YIPPY READY TO COMBINE THE DATA INTO A PDF %%%%%%%%%%%%"
    // );

    // if (authenticatedServers.size === connectionStrings.length) {
    //   Alert.alert("******************");
    //   combineAndSharePatientData();
    // }

    // const authComplete =
    //   connectionStrings.length -
    //   (authuncertainity.length +
    //     authrequired.length -
    //     authrequiredExtra.length);

    // if (authComplete === 0) {
    //   // THERE MIGHT BE A MISSING CONDITION
    //   console.log(
    //     "%%%%%%%%%%%%%%%%%% YIPPY READY TO COMBINE THE DATA INTO A PDF %%%%%%%%%%%%"
    //   );
    // }
  }, [
    patientDataList,
    isProcessingAxios,
    authrequired,
    authrequiredExtra,
    noExtraAuthRequiredHandled,
    unreachableServers,
  ]);

  useEffect(() => {
    const fetchAuthData = async () => {
      const { authrequired, authuncertainity } = await createBins(authStatus);

      setAuthRequired(authrequired);
      setAuthUncertainity(authuncertainity);
    };

    fetchAuthData();
  }, [authStatus]);

  useEffect(() => {
    if (authrequired.length > 0) {
      authenticateServers(authrequired)
        .then(() => {
          console.log("All authentication attempts completed.");
        })
        .catch((error) => {
          console.error("Error during authentication:", error);
        });
    }
  }, [authrequired]);

  useEffect(() => {
    const canAuthenticateExtra = authrequired.every((hospitalInfo) =>
      attemptedAuthServers.has(hospitalInfo.hospitalKey)
    );

    if (canAuthenticateExtra && authrequiredExtra.length > 0) {
      authenticateServers(authrequiredExtra)
        .then(() => {
          console.log(
            "All authentication attempts for authrequiredExtra completed."
          );
        })
        .catch((error) => {
          console.error(
            "Error during authentication for authrequiredExtra:",
            error
          );
        });
    }
  }, [authrequiredExtra, attemptedAuthServers]);

  const handleAxiosInstances = useCallback(
    async (axiosInstances, handleError = false) => {
      console.log("******** HANDLING AXIOS INSTANCES *************");
      const endPoints = [
        // "/Patient",  // unique case its endpoint is different from the others includes no search parameters
        "/AllergyIntolerance",
        "/Immunization",
        "/Observation",
        "/MedicationStatement",
      ];

      const failedToFetch = [];

      const succeededToFetch = [];

      const networkErrors = [];

      await Promise.all(
        axiosInstances.map(async (axiosInstance) => {
          // console.log("for the instance", axiosInstance.hospitalTokenDetails);
          console.log(
            "for the instance",
            axiosInstance.tokenManager.hospitalTokenInfo
          );
          return Promise.all(
            endPoints.map((endPoint) => {
              return fetchPatientData(axiosInstance, endPoint);
            })
          )
            .then(async (responses) => {
              // updateBin(succeededToFetch, axiosInstance.hospitalTokenDetails);
              updateBin(
                succeededToFetch,
                axiosInstance.tokenManager.hospitalTokenInfo
              );
              return Promise.all(
                responses.map((response) => {
                  return processPatientData(response);
                })
              ).then((processedDataArray) => {
                // Merge all processed data into one object
                const mergedData = processedDataArray.reduce((acc, data) => {
                  return { ...acc, ...data }; // Assuming each processedData returns an object with the same structure
                }, {}); // Make sure to provide an initial value for reduce

                return mergePatientData(mergedData); // Ensure this line is reachable
              });
            })

            .catch((error) => {
              console.log("+++++ AN ERROR OCCURED :", error);
              console.log("ERROR DETAILS", error.response);
              // if (handleError == true) {

              if (handleError) {
                // if (error.response && error.response.status === 401) {

                if (
                  error.response &&
                  error.response.data &&
                  error.response.data.error === "invalid_grant"
                ) {
                  // Handle invalid refresh token
                  // axiosInstance.tokenManager.hospitalTokenInfo.tokenInfo = null;
                  updateBin(
                    failedToFetch,
                    axiosInstance.tokenManager.hospitalTokenInfo
                  );
                } else if (
                  error.message &&
                  error.message.includes("Network Error")
                ) {
                  // Handle network errors

                  updateBin(
                    networkErrors,
                    axiosInstance.tokenManager.hospitalTokenInfo
                  );
                  // networkErrors.push(axiosInstance.tokenManager.hospitalTokenInfo);
                }

                // axiosInstance.hospitalTokenDetails.tokenInfo = null;
                // axiosInstance.tokenManager.hospitalTokenInfo.tokenInfo = null;
                // updateBin(failedToFetch, axiosInstance.tokenManager.hospitalTokenInfo);
              }
            });
        })
      );

      console.log("All the axios instances have been handled");

      if (handleError == true) {
        console.log("!!! FAILED TO FETCH FROM THESE", failedToFetch);

        console.log("!!! MANAGED TO FETCH FROM THESE", succeededToFetch);
        setAuthRequiredExtra(failedToFetch);
        setNoExtraAuthRequiredHandled(succeededToFetch);
        // setUnreachableServers(networkErrors);
        setUnreachableServers((prev) => [...prev, ...networkErrors]);
      }
    }
  );

  const handleFHIRAuth = useCallback(
    async (hospitalInfo) => {
      try {
        const connectionString = connectionStrings[hospitalInfo.index];

        console.log(connectionString);

        const serverId = hospitalInfo.hospitalKey;

        if (attemptedAuthServers.has(serverId)) {
          console.log(
            `Already attempted authentication with Server ${serverId}. Skipping.`
          );

          return;
        }

        const result = await dispatch(
          initiateLoginFHIR(connectionString, serverId)
        );

        if (result && result.type === "success") {
          console.log(`Authentication successful for server: ${serverId}`);
          Alert.alert(
            "Success",
            `Successfully logged in to FHIR server: ${serverId}`
          );

          setAttemptedServers((prev) => {
            const newSet = new Set(prev);
            newSet.add(serverId);
            return newSet;
          });

          // console.log("+++++++", result);

          // uncomment after testing
          // saveTokenInfo(hospitalInfo.hospitalKey, hospitalInfo.tokenInfo)

          saveTokenInfo(hospitalInfo.hospitalKey, JSON.stringify(result));

          const updatedHospitalInfo = {
            ...hospitalInfo,
            tokenInfo: result, // result.data
          };

          addToAxiosQueue(updatedHospitalInfo, connectionString.iss);
        } else {
          setAttemptedServers((prev) => {
            const newSet = new Set(prev);
            newSet.add(serverId);
            return newSet;
          });

          console.log("Authentication failed or cancelled");
          Alert.alert(
            "Error",
            `Failed to authenticate with FHIR server: ${serverId}`
          );
        }
      } catch (error) {
        // console.log(hospitalInfo);
        console.log("......////", error.response);
        if (error.message && error.message.includes("Network request failed")) {
          setUnreachableServers((prev) => [...prev, hospitalInfo]);
        }

        // console.log(unreachableServers);
        // console.error("FHIR Authentication error:", error);
        // console.log("Failed FHIR AUTH FOR ", hospitalInfo);
        // console.error("error details", error);
        // console.log(error);
        // Alert.alert(
        //   "Error",
        //   error.message || "Failed to authenticate with FHIR"
        // );
      }
    },
    [dispatch, attemptedAuthServers]
    //[dispatch, authenticatedServers]
  );

  // Function to add to the axios queue
  const addToAxiosQueue = (hospitalInfo, iss) => {
    setAxiosQueue((prevQueue) => [...prevQueue, { hospitalInfo, iss }]);
  };

  const processAxiosQueue = async () => {
    if (axiosQueue.length === 0 || isProcessingAxios) return;

    setIsProcessingAxios(true);

    // Create all Axios instances
    const axiosInstances = axiosQueue.map(({ hospitalInfo, iss }) =>
      createAxiosInstance(iss, hospitalInfo, connectionStrings)
    );

    console.log("NUMBER OF INSTANCES TO PROCESS", axiosInstances.length);

    // Handle all instances
    await handleAxiosInstances(axiosInstances);

    console.log("PROCESSED AUTHENTICATED AXIOS INSTANCES");

    // Update the queue to remove processed items
    setAxiosQueue((prevQueue) =>
      prevQueue.filter((_, index) => index >= axiosInstances.length)
    );

    // Set processing flag to false
    setIsProcessingAxios(false);
  };

  // useEffect to trigger processing whenever the axios queue changes
  useEffect(() => {
    console.log("queue processing might occur");
    processAxiosQueue();
  }, [axiosQueue]);

  const updateBin = async (bin, item) => {
    bin.push(item); // if adding at the start we could use unshift
  };

  useEffect(() => {
    console.log("Executing use effect of Authuncertainity");
    console.log("These may not require authentication", authuncertainity);

    if (authuncertainity.length === 0) {
      return;
    }

    const axiosInstances = authuncertainity.map((hospitalInfo) =>
      createAxiosInstance(
        connectionStrings[hospitalInfo.index].iss,
        hospitalInfo,
        connectionStrings
      )
    );

    handleAxiosInstances(axiosInstances, true);

    console.log("handled axios for hospitals");
  }, [authuncertainity]);

  const fetchPatientData = async (axiosInstance, endPoint) => {
    console.log(`Fetching data from1 ${endPoint}...`);
    console.log(`Fetching tokenemanager from1 ${axiosInstance.tokenManager.hospitalTokenInfo.tokenInfo.patient}...`);
    try {
      const response = await axiosInstance.get(
        `${endPoint}/?patient=${axiosInstance.tokenManager.hospitalTokenInfo.tokenInfo.patient}` //&category=${observation_codes.join(",")}`
      );
      console.log(`success Fetching data from1 ${response.data}...`);
      return {
        endPoint,
        data: response.data,
      };
    } catch (error) {
      console.error(`Error one12 fetching data from ${endPoint}:`, error);
      throw error; // Rethrow the error to handle it in the calling function
    }
  };

  const processPatientData = async (patientData) => {
    if (patientData.endPoint === "/Patient") {
      return;
    } else if (patientData.endPoint === "/AllergyIntolerance") {
      const allergyIntolerances = await processAllergies(
        JSONPath("$.entry[*].resource", patientData.data)
      );

      return { allergyIntolerances };
    } else if (patientData.endPoint === "/Immunization") {
      const immunizations = await processImmunization(
        JSONPath("$.entry[*].resource", patientData.data),
        interval
      );

      return { immunizations };
    } else if (patientData.endPoint === "/Observation") {
      const observations = await processObservations(
        JSONPath("$.entry[*].resource", patientData.data),
        interval
      );

      return { observations };
    } else if (patientData.endPoint === "/MedicationStatement") {
      const medicationStatements = await processMedicationStatements(
        JSONPath("$.entry[*].resource", patientData.data),
        interval
      );

      return { medicationStatements };
    }
  };

  const mergePatientData = async (processedPatientData) => {
    setPatientDataList((prev) => {
      let updatedList = { ...prev };

      if (processedPatientData.observations) {
        updatedList = {
          ...updatedList,
          observations: [
            ...updatedList.observations,
            ...processedPatientData.observations,
          ],
        };
      }

      if (processedPatientData.immunizations) {
        updatedList = {
          ...updatedList,
          immunizations: [
            ...updatedList.immunizations,
            ...processedPatientData.immunizations,
          ],
        };
      }
      if (processedPatientData.allergyIntolerances) {
        updatedList = {
          ...updatedList,
          allergyIntolerances: [
            ...updatedList.allergyIntolerances,
            ...processedPatientData.allergyIntolerances,
          ],
        };
      }
      if (processedPatientData.medicationStatements) {
        updatedList = {
          ...updatedList,
          medicationStatements: [
            ...updatedList.medicationStatements,
            ...processedPatientData.medicationStatements,
          ],
        };
      }

      return updatedList;
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

export default FHIRAuthScreen;
