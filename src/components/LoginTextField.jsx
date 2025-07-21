import React, { useState } from "react";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { ScaledSheet } from "react-native-size-matters";

export const LoginTextField = ({
  Placeholder,
  icon,
  customHeight,
  OnChangeText,
  value,
  secureTextEntry,
  multiline,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <View
      style={[
        styles.Input,
        { height: customHeight },
        isFocused && styles.focusedInput,
      ]}
    >
      <TextInput
        placeholder={Placeholder}
        placeholderTextColor={isFocused ? "white" : "gray"}
        onChangeText={OnChangeText}
        style={[
          { height: customHeight, flex: 1 },
          isFocused && styles.focusedText,
        ]}
        secureTextEntry={secureTextEntry}
        value={value}
        multiline={multiline}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {icon && (
        <TouchableOpacity>
          {React.cloneElement(icon, {
            color: isFocused ? "white" : "black",
          })}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = ScaledSheet.create({
  Input: {
    width: "320@s",
    borderRadius: "10@s",
    borderWidth: "1@s",
    borderColor: "#000000",
    marginVertical: "5@s",
    padding: "10@vs",
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
  },
  focusedInput: {
    borderColor: "white",
  },
  focusedText: {
    color: "white",
  },
});
