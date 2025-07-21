import { isWithinInterval } from "date-fns";
import { JSONPath } from "jsonpath-plus";
// import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
// import SInfo from "react-native-sensitive-info";
import Parse from "../../parseConfig";
import timestamp from "unix-timestamp";
import axios from "axios";
import { googleAuth } from "../../googleSignInConfig";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import * as webBrowser from "expo-web-browser";
import { Asset } from 'expo-asset';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from "@react-native-async-storage/async-storage";


webBrowser.maybeCompleteAuthSession();

// best practice implies we should prompt and ask for the permission only when needed
// https://developers.google.com/identity/protocols/oauth2#2.-obtain-an-access-token-from-the-google-authorization-server.

// const getGoogleToken = async () => {
//   if (Parse.User.authenticated()) {
//     const authData = await Parse.User.get("authData");

//     const googlePayload = await Parse.Cloud.run("verifyIdToken", { authData });

//     if (googlePayload.exp > timestamp.now()) {
//     } else {
//     }
//   }

//   return null;
// };

export const getGoogleToken = async () => {
  googleAuth.setScope(["https://www.googleapis.com/auth/drive.file"]);
  await googleAuth.GoogleSignin.hasPlayServices();
  const userInfo = await googleAuth.GoogleSignin.signIn();

  const authData = {
    id_token: userInfo.data.idToken,
    id: userInfo.data.user.id,
  };

  console.log("done signing in user");

  const googlePayload = await Parse.Cloud.run("verifyIdToken", { authData });

  if (googlePayload.exp > timestamp.now()) {
    let tokens = await googleAuth.GoogleSignin.getTokens();

    console.log("==google tokens", tokens.accessToken);

    return tokens.accessToken;
  }

  return null;
};

export const createFolder = async (accessToken) => {
  const today = new Date(); // ✅ Define 'today' properly
  const formattedDate = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const folderMetadata = {
    name: `medical records-${formattedDate}`,
    mimeType: "application/vnd.google-apps.folder",
  };

  try {
    const response = await axios.post(
      "https://www.googleapis.com/drive/v3/files",
      folderMetadata,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Folder ID:", response.data.id);
    return response.data.id;
  } catch (error) {
    console.error("Error creating folder:", error);
  }
};

export const uploadFile = async (accessToken, folderId, pdfFile, patientNames) => {
  const boundary = "foo_bar_baz";
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const fileMetadata = {
    name: `${patientNames}_${formattedDate}.pdf`,
    mimeType: "application/pdf",
    parents: [folderId],
  };

  try {
    // const fileContent = await FileSystem.readAsStringAsync(
    //   `file://${pdfFile.filePath}`,
    //   { encoding: FileSystem.EncodingType.Base64 }
    // );
    const fileContent = await FileSystem.readAsStringAsync(
      pdfFile, // directly use the file URI string, no 'file://' prefix needed if already present
      { encoding: FileSystem.EncodingType.Base64 }
    );
    const decodedFileContent = Buffer.from(fileContent, "base64");

    const metadataPart = `
--${boundary}
Content-Type: application/json; charset=UTF-8

${JSON.stringify(fileMetadata)}
`;

    const mediaPart = `
--${boundary}
Content-Type: application/pdf
Content-Transfer-Encoding: binary

`;

    const endPart = `
--${boundary}--
`;

    const body = Buffer.concat([
      Buffer.from(metadataPart, "utf8"),
      Buffer.from(mediaPart, "utf8"),
      decodedFileContent, // Correct file content here
      Buffer.from(endPart, "utf8"),
    ]);

    const response = await axios.post(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": body.length,
        },
      }
    );
    console.log("File ID:", response.data.id);
    console.log("Response Data:", response.data);
    return response.data.id;
  } catch (error) {
    console.error("Error uploading file:", error);
    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
      console.error("Response Headers:", error.response.headers);
    }
  }
};

export const setPermission = async (accessToken, fileId, emailAddress) => {
  const permission = {
    type: "user",
    role: "reader",
    emailAddress: emailAddress,
  };

  try {
    const response = await axios.post(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      permission,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Permission ID:", response.data.id);
    return response.data.id;
  } catch (error) {
    console.error("Error setting permission:", error);
  }
};

export const revokePermission = async (accessToken, fileId, permissionId) => {
  try {
    await axios.delete(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions/${permissionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("Permission revoked");
  } catch (error) {
    console.error("Error revoking permission:", error);
  }
};

export const fetchWellKnownConfig = async (iss) => {
  return fetch(`${iss}/.well-known/smart-configuration`).then((res) =>
    res.json()
  );
};

export const dataFetcher = async (tokenResponse, endPoint) => {
  if (!tokenResponse || !tokenResponse.accessToken) {
    console.error("Invalid token response");
    Alert.alert("Error", "Invalid token response");
    return;
  }

  if (!endPoint) {
    console.error("Invalid endpoint");
    Alert.alert("Error", "Invalid endpoint");
    return;
  }

  try {
    const response = await fetch(endPoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    Alert.alert("Error", `Failed to fetch data: ${error.message}`);
  }
};

export const isValidDateTime = async (timestamp, period) => {
  return isWithinInterval(timestamp, period);
};

function isEventWithinInterval(interval) {
  return function (eventTime) {
    return isWithinInterval(eventTime, interval);
  };
}

export const isPeriodWithinInterval = async (period, interval) => {
  startValid = isWithinInterval(period.start, interval);

  endValid = isWithinInterval(period.end, interval);

  return startValid || endValid;
};

export const isValidTiming = async (timing, interval) => {
  const events = JSONPath("$.event", timing);

  if (!events.length) {
    const boundsPeriod = JSONPath("$.repeat.boundsPeriod", timing);

    return isPeriodWithinInterval(boundsPeriod, interval);
  } else {
    return events.map(isEventWithinInterval(interval)).some(Boolean);
  }
};

export const getHospitalKey = async (hospitalInfo) => {
  console.log("current hospital info", hospitalInfo);

  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    hospitalInfo
  );

  console.log(digest);

  return digest;
};

export const saveTokenInfo = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Error saving token:", error);
  }
  // await SInfo.setItem(key, value, {
  //   sharedPreferencesName: "mySharedPrefs",
  //   keychainService: "myKeychain",
  // });
};

export const getTokenInfo = async (key) => {
  console.log("SEARCHING FOR THE TOKEN OF HOSPITAL", key);

  try {
    let result = AsyncStorage.getItem(key);
    // let result = await SInfo.getItem(key, {
    //   sharedPreferencesName: "mySharedPrefs",
    //   keychainService: "myKeychain",
    // });

    console.log("the token info is");
    console.log(result);

    return result;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

export const deleteTokenInfo = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log("Error deleting token: ", error);
  }
};

export const getImageBase64 = async (imageModule) => {
  try {
    const asset = Asset.fromModule(imageModule);
    await asset.downloadAsync();

    if (!asset.localUri) {
      console.error("Asset localUri is undefined");
      return null;
    }

    const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return `data:image/png;base64,${base64}`;
  } catch (err) {
    console.error("Error reading image:", err);
    return null;
  }
};

/**
 * Deletes a file from Google Drive by its file ID.
 * 
 * @param {string} accessToken - Google OAuth access token
 * @param {string} fileId - The ID of the file to be deleted
 * @returns {Promise<boolean>} - True if successful, false if not
 */
export const deleteFileFromGoogleDrive = async (accessToken, fileId) => {
  try {
    const response = await axios.delete(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`File with ID ${fileId} deleted successfully.`);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Status:", error.response.status);
    }
    return false;
  }
};


// revoke permissions
export const revokeDuePermissions = async () => {
  try {
    const stored = await AsyncStorage.getItem("sharedDocs");
    const sharedDocs = stored ? JSON.parse(stored) : [];

    const now = new Date();

    const updatedDocs = [];

    for (let doc of sharedDocs) {
      const revokeAt = new Date(doc.revokeAt);
      if (revokeAt <= now) {
        try {
          await revokePermission(doc.accessToken, doc.fileId, doc.permissionId);
          console.log(`successfully Revoked access for file: ${doc.fileId}`);
        } catch (error) {
          console.error(`Failed to revoke permission: ${doc.fileId}`, error);
          updatedDocs.push(doc); // keep in list if failed
        }
      } else {
        updatedDocs.push(doc); // still valid
      }
    }

    await AsyncStorage.setItem("sharedDocs", JSON.stringify(updatedDocs));
  } catch (err) {
    console.error("Failed to process revocations", err);
  }
};

// task definition
const BACKGROUND_TASK = 'revoke-permissions-task';

TaskManager.defineTask(BACKGROUND_TASK, async () => {
  try {
    console.log('[TaskManager] Running revokeDuePermissions...');
    await revokeDuePermissions(); // your function
    return BackgroundFetch.BackgroundFetchResult.NewData; // ✅ correct result
  } catch (error) {
    console.error('[TaskManager] Failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed; // ✅ correct failure return
  }
});

// register task
export async function registerBackgroundTask() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
      minimumInterval: 1*60 , // 1 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('✅ Background task registered');
  }
}



// export const storeSharedDocument = async (doc) => {
//   const existingDocs = await AsyncStorage.getItem("shared_documents");
//   const docs = existingDocs ? JSON.parse(existingDocs) : [];

//   docs.push(doc); // doc = { fileId, name, revokedAt }

//   await AsyncStorage.setItem("shared_documents", JSON.stringify(docs));
// };

// export const getSharedDocuments = async () => {
//   const docs = await AsyncStorage.getItem("shared_documents");
//   return docs ? JSON.parse(docs) : [];
// };

// export const updateSharedDocuments = async (docs) => {
//   await AsyncStorage.setItem("shared_documents", JSON.stringify(docs));
// };

// // Assume you have access token already
// export const deleteDriveFile = async (fileId, accessToken) => {
//   const res = await axios.delete(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   });
//   return res.status === 204;
// };
