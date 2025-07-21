import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text } from "react-native";
import { store } from "./src/features/store";
import { Provider, useDispatch} from "react-redux";
import { AppNavigation } from "./src/navigation/AppNavigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import "./googleSignInConfig";
import './parseConfig';
import { registerBackgroundTask, revokeDuePermissions } from "./src/features/utils";
import GoogleSignin from "./googleSignInConfig";
import { logoutUser } from "./src/features/authSlice";

// import BackgroundFetch from "react-native-background-fetch";

// const BackgroundTask = async () => {
//   const now = new Date();
//   const docs = await getSharedDocuments();

//   const filtered = [];

//   for (const doc of docs) {
//     const revokedAt = new Date(doc.revokedAt);
//     if (revokedAt <= now) {
//       try {
//         await deleteDriveFile(doc.fileId); // Delete from Drive
//       } catch (err) {
//         console.error("Error deleting file:", err);
//         filtered.push(doc); // Retry later if failed
//       }
//     } else {
//       filtered.push(doc); // Keep future docs
//     }
//   }

//   await updateSharedDocuments(filtered);
// };

// export const configureBackgroundFetch = async () => {
//   const status = await BackgroundFetch.configure(
//     {
//       minimumFetchInterval: 1440, // once a day
//       startOnBoot: true,
//       enableHeadless: true,
//       requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
//     },
//     async (taskId) => {
//       console.log("[BackgroundFetch] task:", taskId);
//       await BackgroundTask();
//       BackgroundFetch.finish(taskId);
//     },
//     (error) => {
//       console.error("[BackgroundFetch] failed to start", error);
//     }
//   );
// };

// This component will be wrapped by the Provider
const AppContent = () => {
  
  const dispatch = useDispatch();
  // useEffect(() => {
  //       dispatch(logoutUser());
  //       GoogleSignin.signOut();
  // }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer> 
        <AppNavigation />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default function App() {

  useEffect(() => {
    registerBackgroundTask();
  }, []);
  
  return (
    <Provider store={store}>
      <AppContent />
      <StatusBar style="auto" />
      
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});


// import React, { useEffect, useState } from "react";
// import { View, Button, Text, Image, StyleSheet } from "react-native";
// import * as WebBrowser from "expo-web-browser";

// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   isErrorWithCode,
//   statusCodes
// } from '@react-native-google-signin/google-signin';
// import * as DocumentPicker from "expo-document-picker";
// import axios from "axios";
// import { GoogleAuthProvider } from "./Providers/Auth/google";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import 'react-native-get-random-values';
// const Parse = require('parse/react-native.js');
// Parse.setAsyncStorage(AsyncStorage);
// // import { SERVER_HOST, SERVER_PORT } from '@env';


// WebBrowser.maybeCompleteAuthSession();

// export default function App() {
//   const [userInfo, setUserInfo] = useState(null);
//   const [authData, setAuthData] = useState(null);

//   // const [refreshKey, setRefreshKey] = useState(0); // Force re-render when needed
//   GoogleSignin.configure({
//     iosClientId: "960743488427-l05cgrg971uph3ksrsf8pn0lkk0lfo5m.apps.googleusercontent.com",
//     ClientId: "960743488427-7fj9a4ajcf5oll8tken7t8j230o7b0f7.apps.googleusercontent.com",
//     webClientId: "960743488427-lpd7n2vpr3k8em9eg0jo512kvo2hpd11.apps.googleusercontent.com",
//   })

//   // const doesGoogleUserExist = async (userInfo) => {

//   //   const emailPresent = await axios.post(
//   //     `http://172.29.106.234:1337/user-presence`,
//   //     userInfo
//   //   );

//   //   return emailPresent

//   // }


//   // // will call isGoogleCredentialValid using the old tokenID
//   // const isCredentialStale = async(userInfo) => {
//   //   const credentialStatus = await axios.post(
//   //     `http://172.29.106.234:1337/credential-status`,
//   //     userInfo
//   //   )

//   //   return isCredentialStale
//   // }

//   // const isGoogleCredentialValid = async(AuthData) => {
//   //   // perform google checks
//   //   // https://developers.google.com/identity/sign-in/web/backend-auth
//   // }

//   // const activateUserSession = async () => {

//   //   await GoogleSignin.hasPlayServices();
//   //   const userInfo = await GoogleSignin.signIn();

//   //   console.log("This is what user info contained ", userInfo)

//   //   if(doesGoogleUserExist(userInfo)){

//   //     if(isCredentialStale){
//   //         // validate new token id with google on the backend
//   //         if(isGoogleCredentialValid({id: userInfo.data.user.id, id_token: userInfo.data.idToken}))
//   //         {

//   //           // update the credentials using linkwith, one might have to delete the old ones first
//   //           // then login the user using the auth credentials

//   //         }
//   //         else{
//   //           // do not perform any update, simply fail to create a user/ stop them from logging into the app due to invalid credentials
//   //         }

//   //     }
//   //     else{

//   //        // then login the user using the auth credentials

//   //     }

//   //   }
//   //   else {
//   //     // validate new token id with google on the backend 

//   //     if(isGoogleCredentialValid({id: userInfo.data.user.id, id_token: userInfo.data.idToken}))
//   //       {

//   //         // set the credentials using linkwith
//   //         // then login the user using the auth credentials

//   //       }
//   //       else{
//   //         // do not perform any update, simply fail to create a user/ stop them from logging into the app due to invalid credentials
//   //       }

//   //   }


//   // }

//   // activateUserSession()
// //console.log(`http://${SERVER_HOST}:${SERVER_PORT}/parse`)

// const parseClientID = "myAppId";
// Parse.initialize(parseClientID);
// Parse.serverURL = `http://172.29.105.50:1337/parse`

// Parse.User._registerAuthenticationProvider(GoogleAuthProvider);

// const checkStatus = async () => {
//   try {
//     await GoogleSignin.hasPlayServices();
//     const userInfo = await GoogleSignin.signIn();

//     console.log(userInfo);

//     let maybeuser = await Parse.User.current()

//     console.log("current user", maybeuser)

//    await Parse.User.logOut()

//     // maybeuser = await Parse.User.current()

//     // console.log("current user", maybeuser)

//     // await activateGoogleSession(userInfo)

//     const authData = {
//       id_token: userInfo.data.idToken,
//       id: userInfo.data.user.id,
//     };

//     Parse.User.logInWith('google', { authData }).then((user) => {
//        console.log('############', user);
//      }).catch((error) => {
//        console.error('Error logging in with Google:', error);
//      });

//     console.log('the process is complete');
//   } catch (error) {
//     console.error('Error in checkStatus:', error);
//   }
// };


// const isGoogleCredentialValid = async(userData) => {
//   // console.log('isgoogle: ',authData)
//   // perform google checks
//   // https://developers.google.com/identity/sign-in/web/backend-auth

//   if (userData !== undefined){
//     return true
//   }

//   return false

// }

// const activateGoogleSession = async(userInfo) => {


// // Parse.Cloud.define("activateGoogleSession", async(request) => {

//   // console.log("the request in activate", request.params)

//   // const {userInfo} = request.params

//   console.log("This is what user info contained ", userInfo)

//   const authData = {id: userInfo.data.user.id, id_token: userInfo.data.idToken}

//   const [user, doesGoogleUserExist, userData] = await Promise.all([
//     Parse.Cloud.run("getUserByEmail", userInfo),
//     Parse.Cloud.run("doesGoogleUserExist", userInfo),
//     Parse.Cloud.run("verifyIdToken", {authData} )
//   ]);

//   console.log("STAGE 1")

//   // const userData = await verify(userInfo.data.idToken) // .then(() => {isGoogleTokenValid = true}).catch(console.error);

//   if(doesGoogleUserExist){

//     console.log("STAGE 2")

//     // Parse.User.log

//     Parse.User.logInWith('google', { authData }).then((user) => {
//       console.log('############', user);
//     }).catch((error) => {
//       console.error('Error logging in with Google:', error);
//     });
// /** 
//     if(await isCredentialStale(user)){


//     console.log("STAGE 2.1")
//         // validate new token id with google on the backend
//         if(await isGoogleCredentialValid(userData))
//         {
//           console.log("STAGE 2.1.1")
//           // update the credentials using linkwith, one might have to delete the old ones first
//           // then login the user using the auth credentials

//           await user.destroy({ useMasterKey: true });

//           await Parse.Cloud.run("createUserGoogle", {userData, authData} ) // request)

//           await Parse.User.logInWith("google", authData , { useMasterKey: true })

//         }
//         else{
//           // do not perform any update, simply fail to create a user/ stop them from logging into the app due to invalid credentials
//           console.log("STAGE 2.1.2")
//         }
//     }
//     else{
//       console.log("STAGE 2.2")

//        // then login the user using the auth credentials

//       console.log("((((((((((", user.get("authData").google)

//       Parse.User.logInWith("google", user.get("authData").google , { useMasterKey: true })

//     }
// **/
//   }
//   else {

//     console.log("STAGE 3")

//     await Parse.Cloud.run("createUserGoogle", {userData, authData} ) // request)

//     // linkeduser.linkWith('google', { authData }, { useMasterKey: true });

//     Parse.User.logInWith('google', { authData }).then((user) => {
//       console.log('############', user);
//     }).catch((error) => {
//       console.error('Error logging in with Google:', error);
//     });

//     // await Parse.Cloud.run("linkWithGoogle", {authData})

// /** 
//     // validate new token id with google on the backend 

//     if(await isGoogleCredentialValid(userData))
//       {

//         console.log("STAGE 3.1")

//         // set the credentials using linkwith
//         // then login the user using the auth credentials
//         await Parse.Cloud.run("createUserGoogle", {userData, authData} ) // request)

//         // linkeduser.linkWith('google', { authData }, { useMasterKey: true });

//         await Parse.Cloud.run("linkWithGoogle", {authData})

//         // await Parse.User.logInWith("google", authData , { useMasterKey: true })

//       }
//       else{

//         console.log("STAGE 3.2")
//         // do not perform any update, simply fail to create a user/ stop them from logging into the app due to invalid credentials
//       }
// **/

//   }

// }

//   const signIn = async () => {

    

//     // 2. link with
//     try {

//       // await GoogleSignin.hasPlayServices();
//       // const userInfo = await GoogleSignin.signIn();

//       console.log('afternoon logs userInfo: ', authData)

//       // const response = await axios.post(
//       //   `http://172.29.105.53:1337/link-with`,
//       //   authData
//       // );
//       const response = await axios.post(
//         `http://192.168.1.69:1337/register-test`,
//         authData
//       );
//       // if (response&& userInfo?.data?.user) {
//       //   setUserInfo(userInfo?.data?.user);
//       //   await AsyncStorage.setItem("@user", JSON.stringify(userInfo?.data?.user)); // Store valid data
//       //   // setRefreshKey(prevKey => prevKey + 1); // Trigger re-render
//       // } else {
//       //   console.log("No user data received from Google Sign-In");
//       // }
//     } catch (error) {
//       console.error('error with "link with": ', error)
//     }
//     // else {
//     // try {

//     //   // Store valid data
//     //   await GoogleSignin.hasPlayServices();
//     //   const userInfo = await GoogleSignin.signIn();

//     //   console.log('user info:\n', userInfo)
//     //   console.log('---------------------------------------------------------------------------------- ');
//     //   // Get Access Token
//     //   const tokens = await GoogleSignin.getTokens();
//     //   console.log('tokens: ', tokens)

//     //   const response = await axios.post(
//     //     `http://172.29.105.53:1337/register-test`,
//     //     {
//     //       userInfo,
//     //       accessToken: tokens.accessToken,
//     //     }
//     //   );

//     //   // console.log('user info function: ', userInfo);
//     //   console.log('---------------------------------------------------------------------------------- ');
//     //   console.log('user info function: ', userInfo.data.user);
//     //   if (userInfo?.data?.user) {
//     //     setUserInfo(userInfo?.data?.user);
//     //     await AsyncStorage.setItem("@user", JSON.stringify(userInfo?.data?.user)); // Store valid data
//     //     // setRefreshKey(prevKey => prevKey + 1); // Trigger re-render
//     //   } else {
//     //     console.log("No user data received from Google Sign-In");
//     //   }
//     // } catch (error) {
//     //   console.log('error: ', error)
//     //   if (isErrorWithCode(error)) {

//     //     switch (error.code) {
//     //       case statusCodes.SIGN_IN_CANCELLED:
//     //         break;
//     //       case statusCodes.IN_PROGRESS:
//     //         break;
//     //       case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
//     //         break;
//     //       default:
//     //     }
//     //   } else {
//     //     console.log(error)
//     //   }

//     // }
//     // }

//   }
//   const signUp = async () => {
//     console.log('signup')
//     // if (await checkStatus()) {
//     //   // if there are data in local storage
//     //   //1. pull the data
//     //   let userData = fetchUserInfo();
//     //   console.log('userdata afternoon: \n',userData)
//     //   const tokens = await GoogleSignin.getTokens();
//     //   console.log('tokens: ', tokens)

//     //   // 2. link with
//     //   const response = await axios.post(
//     //     `http://172.29.105.53:1337/link-with`,
//     //     {
//     //       authData: {
//     //         id: id,
//     //         id_token: tokens.idToken,
//     //         access_token: tokens.accessToken
//     //       },
//     //     }
//     //   );

//     // } else {
//     try {

//       // Store valid data
//       await GoogleSignin.hasPlayServices();
//       const userInfo = await GoogleSignin.signIn();
//       console.log("user info data", userInfo)
//       // Get Access Token
//       const tokens = await GoogleSignin.getTokens();
//       console.log('tokens: ', tokens)
//       // Store the new authData
//     const newAuthData = {
//       id: userInfo.user.id,
//       id_token: tokens.idToken,
//     };
//       setAuthData(newAuthData)
//       console.log('auth data: ',authData)
//       //AsyncStorage.setItem('authData', JSON.stringify(authData))
//       // console.log('authData: ', authData)
//       const response = await axios.post(
//         `http://192.168.1.69:1337/register-test`,
//         {
//           userInfo,
//           authData: authData,
//         }
//       );

//       // console.log('user info function: ', userInfo);
//       console.log('---------------------------------------------------------------------------------- \n',response);
//       console.log('user info function: ', userInfo.data.user);
//       if (userInfo?.data?.user) {
//         setUserInfo(userInfo?.data?.user);
//         // await AsyncStorage.setItem("@user", JSON.stringify(userInfo?.data?.user)); // Store valid data
//         // setRefreshKey(prevKey => prevKey + 1); // Trigger re-render
//       } else {
//         console.log("No user data received from Google Sign-In");
//       }
//     } catch (error) {
//       console.log('error: ', error)
//       if (isErrorWithCode(error)) {

//         switch (error.code) {
//           case statusCodes.SIGN_IN_CANCELLED:
//             break;
//           case statusCodes.IN_PROGRESS:
//             break;
//           case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
//             break;
//           default:
//         }
//       } else {
//         console.log(error)
//       }

//     }
//     // }

//   }

//   // // Load user info from AsyncStorage
//   useEffect(() => {
//     console.log("Updated authData: ", authData);
//   }, [authData]);
  

//   const uploadFileToDrive = async () => {
//     try {
//       // Pick a document
//       const result = await DocumentPicker.getDocumentAsync({
//         type: "*/*",
//         copyToCacheDirectory: true,
//       });

//       if (result.type === "cancel") {
//         Alert.alert("File selection canceled");
//         return;
//       }

//       const { uri, name } = result;

//       // Get Access Token
//       const tokens = await GoogleSignin.getTokens();
//       // console.log('tokens: ', tokens)

//       // Upload File to Google Drive
//       const fileData = new FormData();
//       fileData.append("file", {
//         uri,
//         name,
//         type: "application/pdf",
//       });

//       const response = await fetch("https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${tokens.accessToken}`,
//           "Content-Type": "multipart/related",
//         },
//         body: fileData,
//       });

//       if (response.ok) {
//         const responseData = await response.json();
//         Alert.alert("File Uploaded Successfully", `File ID: ${responseData.id}`);
//       } else {
//         Alert.alert("File Upload Failed", `Error: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       Alert.alert("Error", "Failed to upload file to Google Drive");
//     }
//   };


//   return (
//     <View
//       // key={refreshKey} 
//       style={styles.container}>
//       {!userInfo ? (
//         <>
//           <GoogleSigninButton
//             size={GoogleSigninButton.Size.Wide}
//             color={GoogleSigninButton.Color.Dark}
//             onPress={checkStatus} />
//         </>
//       ) : (
//         <View style={styles.profileContainer}>
//           {userInfo.photo && (
//             <Image
//               source={{ uri: userInfo.photo }}
//               style={styles.profileImage}
//             />
//           )}
//           <Text style={styles.profileName}>{userInfo.name}</Text>
//           <Button
//             title="Upload File to Google Drive"
//             onPress={uploadFileToDrive}
//           />
//           <Button
//             title="Logout"
//             onPress={async () => {
//               await AsyncStorage.removeItem("@user");
//               setUserInfo(null);
//               setAuthData(null)
//               // setRefreshKey(prevKey => prevKey + 1); // Force re-render
//               GoogleSignin.signOut()
//             }}
//           />
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f5f5f5",
//   },
//   profileContainer: {
//     alignItems: "center",
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 10,
//   },
//   profileName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
// });
