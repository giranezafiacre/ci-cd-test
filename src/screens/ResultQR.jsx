import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

const QRScreen = ({ route }) => {
  const { gdriveUrl } = route.params;

  return (
    <View style={styles.container}>
      {gdriveUrl ? (
        <>
          <QRCode value={gdriveUrl} size={200} />
          <Text style={styles.successText}>Records shared successfully!</Text>
        </>
      ) : (
        <Text style={styles.errorText}>Records sharing unsuccessful.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  successText: {
    marginTop: 16,
    fontSize: 18,
    color: "green",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default QRScreen;
