import { FONT, RADIUS, SPACING } from "@/constants/theme";
import React, { memo, useCallback, useEffect, useRef } from "react";
import {
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = memo(
  ({ length, value, onChange }) => {
    const inputRef = useRef<TextInput>(null);

    // Focus input on mount and when component regains focus
    useEffect(() => {
      // Add a small delay to ensure the component is fully mounted
      const focusTimer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);

      const focusListener = Keyboard.addListener("keyboardDidHide", () => {
        if (inputRef.current) {
          inputRef.current.blur();
        }
      });

      return () => {
        clearTimeout(focusTimer);
        focusListener.remove();
      };
    }, []);

    // Re-focus when value changes
    useEffect(() => {
      if (inputRef.current && Platform.OS === "android") {
        inputRef.current.focus();
      }
    }, [value]);

    // Handle input changes
    const handleChange = useCallback(
      (text: string) => {
        // Only allow numbers and limit to length
        const cleanText = text.replace(/[^0-9]/g, "").slice(0, length);
        console.log("OTP Input change:", { original: text, cleaned: cleanText });
        onChange(cleanText);
      },
      [length, onChange]
    );

    const handlePress = useCallback(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    // Split value into array and pad with empty strings
    const digits = value.padEnd(length, "").split("");

    console.log("OTP Input render:", { value, digits, length });

    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.container}>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={length}
            style={[
              styles.hiddenInput,
              Platform.OS === "ios" ? styles.iosInput : styles.androidInput,
            ]}
            caretHidden={true}
            autoComplete="off"
            textContentType="oneTimeCode"
            autoFocus={true}
          />
          <View style={styles.boxesContainer}>
            {digits.map((digit, index) => (
              <TouchableWithoutFeedback key={index} onPress={handlePress}>
                <View
                  style={[
                    styles.box,
                    digit ? styles.boxFilled : styles.boxEmpty,
                    value.length === index && styles.boxFocused,
                  ]}
                >
                  <Text style={styles.digit}>{digit}</Text>
                </View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

OTPInput.displayName = "OTPInput";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  hiddenInput: {
    width: 300, // Make it wide enough to cover the boxes
    height: 60,
    opacity: 0,
    position: "absolute",
    zIndex: 1,
  },
  iosInput: {
    left: 0,
    top: 0,
  },
  androidInput: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0,
    height: "100%",
    width: "100%",
  },
  boxesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  box: {
    width: 55,
    height: 55,
    borderRadius: RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    // Add shadow for better visibility
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  boxEmpty: {
    borderColor: "#E2E8F0", // Light gray border
    backgroundColor: "#FFFFFF",
  },
  boxFilled: {
    borderColor: "#003625", // Primary green color
    backgroundColor: "#F8FAFC", // Very light background
  },
  boxFocused: {
    borderColor: "#003625", // Primary green color
    borderWidth: 2,
    backgroundColor: "#F0FDF4", // Light green background
  },
  digit: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: "#0F172A", // Dark text
    textAlign: "center",
  },
});

export default OTPInput;