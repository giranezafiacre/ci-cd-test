import { JSONPath } from "jsonpath-plus";
import {
  isValidDateTime,
  isValidTiming,
  isPeriodWithinInterval,
  getImageBase64,
} from "../features/utils";

import RNHTMLtoPDF from "react-native-html-to-pdf";
import RNFS from "react-native-fs";
import { Asset } from 'expo-asset';
import { btoa, toByteArray } from "react-native-quick-base64";
import Share from "react-native-share";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";

const getField = (paths, jsonObject) => {
  for (let i = 0; i < paths.length; i++) {
    const result = JSONPath({ path: paths[i].path, json: jsonObject });
    if (result.length > 0 && result[0] !== null) {
      return { name: paths[i].name, value: result[0] };
    }
  }

  return null; // or any default value if none are found
};

const isTimeFieldValid = async (field, recordsWindow) => {
  if (
    field.name === "effectiveDateTime" ||
    field.name === "occurrenceDateTime" ||
    field.name === "effectiveInstant"
  ) {
    return isValidDateTime(field.value, recordsWindow);
  } else if (field.name === "effectivePeriod") {
    return isPeriodWithinInterval(field.value, recordsWindow);
  } else if (field.name === "effectiveTiming") {
    return isValidTiming(field.value, recordsWindow);
  }
};

const isResourceValid = async (resource, recordsWindow) => {
  const field = resource.occuranceField || resource.effectiveField;

  return isTimeFieldValid(field, recordsWindow);
};

// AllergyIntolerance
/*
$.clinicalStatus.coding[*].code
$.verificationStatus.coding[*].code
$.code.coding[*] // fairly good, may need to be a mini table , maybe a hyperlink
$.code.text // what to display  or select from coding  $.code.coding[*].display ...any of the results
*/

const parseAllergyIntolerance = async (jsonObject) => {
  const clinicalStatus = JSONPath(
    "$.clinicalStatus.coding[*].code",
    jsonObject
  );

  const verificationStatus = JSONPath(
    "$.verificationStatus.coding[*].code",
    jsonObject
  );

  const coding = JSONPath("$.code.coding[*]", jsonObject); // fairly good, may need to be a mini table , maybe a hyperlink

  const codeText = JSONPath("$.code.text", jsonObject); // what to display  or select from coding  $.code.coding[*].display ...any of the results

  return { clinicalStatus, verificationStatus, coding, codeText };
};

export const processAllergies = async (allergies) => {
  try {
    const results = await Promise.all(allergies.map(parseAllergyIntolerance));
    // console.log("All allergies processed:", results);
    return results;
  } catch (error) {
    console.error("Error processing allergies:", error);
  }
};

// Immunization

/*
$.status
$.statusReason // may or may not be present
$.vaccineCode.coding[*]
$.vaccineCode.text
$.occurrenceDateTime or $.occurrenceString
*/

const parseImmunization = async (jsonObject) => {
  // export function getImmunizationDataElements(jsonObject){

  const occurancePaths = [
    { name: "occurrenceDateTime", path: "$.occurrenceDateTime" },
    { name: "occurrenceString", path: "$.occurrenceString" },
  ];

  const occuranceField = getField(occurancePaths, jsonObject);

  const status = JSONPath("$.status", jsonObject);

  const vaccineCode = JSONPath("$.vaccineCode.coding[*]", jsonObject);

  const vaccineCodeText = JSONPath("$.vaccineCode.text", jsonObject); // fairly good, may need to be a mini table , maybe a hyperlink

  return { occuranceField, status, vaccineCode, vaccineCodeText };
};

export const processImmunization = async (immunizations, interval) => {
  try {
    const results = await Promise.all(immunizations.map(parseImmunization));

    // console.log("All immunizations processed:", results);

    const validity = await Promise.all(
      results.map((immunization) => isResourceValid(immunization, interval))
    );

    const validResources = results.filter((_, index) => validity[index]);

    return validResources;
  } catch (error) {
    console.error("Error processing immunizations:", error);
  }
};

// Observation

/*
$.effectiveDateTime or $.effectivePeriod or $.effectiveTiming or $.effectiveInstant // may or not be present
$.valueQuantity or $.valueCodeableConcept or $.valueString or $.valueBoolean or $.valueInteger or $.valueRange or $.valueRatio or $.valueSampledData or $.valueTime or $.valueDateTime or $.valuePeriod // may or not be present
$.dataAbsentReason // may  or not be present
$.code.coding[*] // fairly good, may need to be a mini table , maybe a hyperlink
$.code.text // what to display  or select from coding  $.code.coding[*].display ...any of the results
$.category[*]  // codeable concept, so each has coding and code
$.status
*/

const parseObervation = async (jsonObject) => {
  // export function getObservationDataElements(jsonObject){

  const timePaths = [
    { name: "effectiveDateTime", path: "$.effectiveDateTime" },
    { name: "effectivePeriod", path: "$.effectivePeriod" },
    { name: "effectiveTiming", path: "$.effectiveTiming" },
    { name: "effectiveInstant", path: "$.effectiveInstant" },
  ];

  const effectiveField = getField(timePaths, jsonObject);

  const valuePaths = [
    { name: "valueQuantity", path: "$.valueQuantity" },
    { name: "valueCodeableConcept", path: "$.valueCodeableConcept" },
    { name: "valueString", path: "$.valueString" },
    { name: "valueBoolean", path: "$.valueBoolean" },
    { name: "valueInteger", path: "$.valueInteger" },
    { name: "valueRange", path: "$.valueRange" },
    { name: "valueRatio", path: "$.valueRatio" },
    { name: "valueSampledData", path: "$.valueSampledData" },
    { name: "valueTime", path: "$.valueTime" },
    { name: "valueDateTime", path: "$.valueDateTime" },
    { name: "valuePeriod", path: "$.valuePeriod" }, // may or not be present
  ];

  const valueField = getField(valuePaths, jsonObject);

  const dataAbsentReason = JSONPath("$.dataAbsentReason", jsonObject);

  const coding = JSONPath("$.code.coding[*]", jsonObject);

  const codeText = JSONPath("$.code.text", jsonObject);

  const category = JSONPath("$.category[*]", jsonObject);

  const status = JSONPath("$.status", jsonObject);

  return {
    effectiveField,
    valueField,
    dataAbsentReason,
    coding,
    codeText,
    category,
    status,
  };
};

export const processObservations = async (observations, interval) => {
  try {
    const results = await Promise.all(observations.map(parseObervation));

    // console.log("All observations processed:", results);

    const validity = await Promise.all(
      results.map((observation) => isResourceValid(observation, interval))
    );

    const validResources = results.filter((_, index) => validity[index]);

    return validResources;
  } catch (error) {
    console.error("Error processing observations:", error);
  }
};

// MedicationStatement

/*
$.status
$.statusReason //codeable concept
$.medicationCodeableConcept or $.medicationReference // actual medication
$.subject
$.context
$.effectiveDateTime or $.effectivePeriod or $.effectiveTiming or $.effectiveInstant
$.informationSource
$.dosage
$.dosage.text
*/

const parseMedicationStatement = async (jsonObject) => {
  // export function getMedicationStatementDataElements(jsonObject){

  const medicationPaths = [
    { name: "medicationCodeableConcept", path: "$.medicationCodeableConcept" },
    { name: "medicationReference", path: "$.medicationReference" },
  ];

  const medicationField = getField(medicationPaths, jsonObject);

  const effectivePaths = [
    { name: "effectiveDateTime", path: "$.effectiveDateTime" },
    { name: "effectivePeriod", path: "$.effectivePeriod" },
  ];

  const effectiveField = getField(effectivePaths, jsonObject);

  const status = JSONPath("$.status", jsonObject);

  const statusReason = JSONPath("$.statusReason", jsonObject);

  const subject = JSONPath("$.subject", jsonObject);

  const context = JSONPath("$.context", jsonObject);

  const informationSource = JSONPath("$.informationSource", jsonObject);

  const dosage = JSONPath("$.dosage", jsonObject);

  const dosageText = JSONPath("$.dosage.text", jsonObject);

  return {
    medicationField,
    effectiveField,
    status,
    statusReason,
    subject,
    context,
    informationSource,
    dosage,
    dosageText,
  };
};

export const processMedicationStatements = async (
  medicationStatements,
  interval
) => {
  try {
    const results = await Promise.all(
      medicationStatements.map(parseMedicationStatement)
    );

    // console.log("All medication statements processed:", results);

    const validity = await Promise.all(
      results.map((medicationStatement) =>
        isResourceValid(medicationStatement, interval)
      )
    );

    const validResources = results.filter((_, index) => validity[index]);

    return validResources;
  } catch (error) {
    console.error("Error processing medication statements:", error);
  }
};

export const generatePDFBinary = async (patientDataList,userData) => {
  try {
    const combinedData = [patientDataList].reduce((acc, data) => {
      return { ...acc, ...data };
    }, {});

    // Generate Immunization Table Rows
    const immunizations = combinedData?.immunizations || [];
    const immunizationRows = immunizations
      ?.map((record) => {
        const date = record.occuranceField?.value?.split("T")[0] || "N/A"; // Extract date
        const status = record.status?.[0] || "N/A"; // Status
        const vaccineCode = record.vaccineCode?.[0]?.code || "N/A"; // Code
        const vaccineName = record.vaccineCode?.[0]?.display || "N/A"; // Name
        return `
      <tr>
        <td>${date}</td>
        <td>${status}</td>
        <td>${vaccineCode}</td>
        <td>${vaccineName}</td>
      </tr>
    `;
      })
      .join("");

    // Generate Table Rows
    const observations = combinedData.observations || [];
    const observationRows = observations
      .map((record) => {
        const dateTime = record.effectiveField.value?.split("T")[0] || "N/A";
        const observation = record.codeText?.[0] || "N/A";
        const value = record.valueField?.value?.value || "N/A";
        const unit = record.valueField?.value?.unit || "N/A";
        const category = record.category?.[0]?.coding?.[0]?.display || "N/A";

        return `
      <tr>
        <td>${dateTime}</td>
        <td>${observation}</td>
        <td>${value}</td>
        <td>${unit}</td>
        <td>${category}</td>
      </tr>
    `;
      })
      .join("");

    // Generate Allergy Intolerances Table Rows
    const allergyIntolerances = combinedData?.allergyIntolerances || [];
    const allergyRows = allergyIntolerances
      ?.map((record) => {
        const status = record?.clinicalStatus?.[0] || "N/A";
        const verificationStatus = record?.verificationStatus?.[0] || "N/A";
        const allergyCode = record?.coding?.[0]?.code || "N/A";
        const allergyName = record?.coding?.[0]?.display || "N/A";
        return `
      <tr>
        <td>${status}</td>
        <td>${verificationStatus}</td>
        <td>${allergyCode}</td>
        <td>${allergyName}</td>
      </tr>
    `;
      })
      .join("");

    // const imagePath=`${RNFS.MainBundlePath}/assets/cylab-logo-small.png`;
    const imageBase64 = await getImageBase64(require('../../assets/cylab-logo-small.png'));
    const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { margin: 20px; }
          .title { font-size: 24px; color: #007386; }
          .content { font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <div class="container">
        <div style="text-align: center; margin-bottom: 20px;">
        ${imageBase64 ? `<img 
          style="
           width:'100px';
           height:auto;
           object-fit:'contain';
           margin-bottom:20px;
           "
           src="${imageBase64}" alt="Report Image" width="200"/>` : ""}
          </div>
          <p>Patient Names: ${userData.firstname} ${userData.lastname}</p>
          <div class="title">Patient Immunization Records</div>
          <table>
          <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Vaccine Code</th>
                <th>Vaccine Name</th>
               </tr>
             </thead>
              <tbody>
                ${immunizationRows ||
      "<tr><td colspan='4'>No records available</td></tr>"
      }
              </tbody>
            </table>
            <div style="page-break-before: always;"></div>
            <br>
            <div class="title">Patient Observation Records</div>
            <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Observation</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${observationRows ||
      "<tr><td colspan='5'>No records available</td></tr>"
      }
            </tbody>
          </table>
          <div style="page-break-before: always;"></div>
          <br>
          <div class="title">Allergy Intolerances</div>
          <table>
            <thead>
              <tr>
                <th>Clinical Status</th>
                <th>Verification Status</th>
                <th>Allergy Code</th>
                <th>Allergy Name</th>
              </tr>
            </thead>
            <tbody>
              ${allergyRows ||
      "<tr><td colspan='4'>No records available</td></tr>"
      }
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;

    const options = {
      html: htmlContent,
    };

    const pdffile = await RNHTMLtoPDF.convert(options);

    return pdffile;
  } catch (error) {
    console.error("Error generating Binary pdf:", error);
    Alert.alert(
      "Error",
      `Internal server error`
    );
  }
};
