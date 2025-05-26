import OTPInput from "@/components/auth/OTPInput";
import Button from "@/components/ui/Button";
import { COLORS, FONT, RADIUS, SPACING } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { colors } from "@/src/utils/colors";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useAction, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
declare global {
  var hasOTPBeenSentForUser: Record<string, boolean>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
  },
  header: {
    alignItems: "center",
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  logoContainer: {
      width: 60,
      height: 60,
      borderRadius: 18,
      backgroundColor: "rgba(74, 222, 128, 0.15)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    logoImage: {
      width: "50%",
      height: "50%",
      resizeMode: "contain",
    },
  title: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: colors.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.size.md,
    color: colors.Secondary,
    textAlign: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: SPACING.xl,
  },
  otpContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: colors.white,
    borderRadius: RADIUS.lg,
    // Add subtle shadow for better definition
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  otpHint: {
    fontSize: FONT.size.sm,
    color: colors.Secondary,
    marginTop: SPACING.md,
    textAlign: "center",
    fontWeight: FONT.weight.medium,
  },
  verifyButton: {
    width: "100%",
    marginBottom: SPACING.lg,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  resendText: {
    fontSize: FONT.size.sm,
    color: colors.Secondary,
    marginBottom: SPACING.xs,
  },
  resendButton: {
    minHeight: 0,
    padding: 0,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FONT.size.sm,
    color: colors.white,
    marginLeft: SPACING.xs,
  },
});

export default function VerifyEmail() {
  const { user } = useUser();
  const router = useRouter();
  const sendOTP = useAction(api.users.sendEmailOTP);
  const verifyOTP = useMutation(api.users.verifyEmailOTP);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const hasInitializedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSendOTP = useCallback(
    async (isResend: boolean = false) => {
      console.log("Sending OTP for user:", {
        userId: user?.id,
        isResend,
        resendDisabled,
      });
      if (!user || resendDisabled) return;

      try {
        setLoading(true);
        const result = await sendOTP({ clerkId: user.id });
        console.log("OTP send result:", result);

        if (result.success) {
          if (isResend) {
            setResendDisabled(true);
            setCountdown(60);
            Alert.alert(
              "Verification Code Sent",
              "A new verification code has been sent to your email. Please check your inbox and spam folder."
            );
          }
        } else {
          const errorMessage =
            result.message || "Failed to send verification code.";
          console.error("Failed to send OTP:", errorMessage, result.details);

          Alert.alert("Verification Code Error", errorMessage, [
            {
              text: "Try Again",
              onPress: () => {
                if (isResend) {
                  setResendDisabled(false);
                  setCountdown(0);
                }
              },
            },
          ]);
        }
      } catch (error: any) {
        console.error("Error sending OTP:", error);

        const errorMessage =
          error.message ||
          "Failed to send verification code. Please try again.";

        Alert.alert("Error", errorMessage, [
          {
            text: "Try Again",
            onPress: () => {
              if (isResend) {
                setResendDisabled(false);
                setCountdown(0);
              }
            },
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [user, resendDisabled, sendOTP]
  );

  const handleResendOTP = useCallback(() => {
    handleSendOTP(true);
  }, [handleSendOTP]);
  const handleVerifyOTP = useCallback(async () => {
    console.log("Verifying OTP:", { otp, length: otp.length });
    if (!user || !otp || otp.length !== 6) {
      Alert.alert(
        "Invalid Code",
        "Please enter the 6-digit verification code sent to your email."
      );
      return;
    }

    try {
      setLoading(true);
      const result = await verifyOTP({
        clerkId: user.id,
        otp,
      });

      console.log("OTP verification result:", result);

      if (result.verified) {
        Alert.alert(
          "Verification Successful",
          "Your email has been verified successfully!",
          [
            {
              text: "Continue",
              onPress: () => {
                try {
                  router.replace("/auth/profile-setup");
                } catch (error) {
                  console.error("Navigation error after verification:", error);
                  // Fallback navigation
                  setTimeout(() => {
                    try {
                      router.push("/auth/profile-setup");
                    } catch (fallbackError) {
                      console.error(
                        "Fallback navigation failed:",
                        fallbackError
                      );
                    }
                  }, 500);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Verification Failed",
          "The verification code is invalid or has expired. Please try again or request a new code.",
          [
            {
              text: "Try Again",
              onPress: () => setOtp(""),
            },
            {
              text: "Request New Code",
              onPress: () => {
                setOtp("");
                handleResendOTP();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      let errorMessage = "Please try again.";

      if (error.message) {
        if (error.message.includes("expired")) {
          errorMessage =
            "Your verification code has expired. Please request a new code.";
        } else if (error.message.includes("Invalid")) {
          errorMessage =
            "The verification code you entered is incorrect. Please check and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Verification Failed", errorMessage, [
        {
          text: "Try Again",
          onPress: () => setOtp(""),
        },
        {
          text: "Request New Code",
          onPress: () => {
            setOtp("");
            handleResendOTP();
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [user, otp, verifyOTP, router, handleResendOTP]);
  useEffect(() => {
    if (!user) {
      try {
        router.replace("/auth/login");
      } catch (error) {
        console.error("Navigation error in verify-email:", error);
        // Fallback navigation
        setTimeout(() => {
          try {
            router.push("/auth/login");
          } catch (fallbackError) {
            console.error("Fallback navigation failed:", fallbackError);
          }
        }, 500);
      }
      return;
    }
    if (!global.hasOTPBeenSentForUser) {
      global.hasOTPBeenSentForUser = {};
    }
    const userKey = user.id || "unknown";
    if (!hasInitializedRef.current && !global.hasOTPBeenSentForUser[userKey]) {
      console.log("Initializing first-time OTP send for user:", userKey);
      hasInitializedRef.current = true;
      global.hasOTPBeenSentForUser[userKey] = true;
      const timer = setTimeout(() => {
        handleSendOTP(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      console.log("Skipping OTP send - already initialized for user:", userKey);
    }
  }, [user, router, handleSendOTP]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
        >

          <View style={styles.header}>
              <View style={styles.logoContainer}>
                    <Image
                      source={require('@/assets/images/ctrl-logoo.png')}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
          </View>
            <Ionicons name="mail-unread" size={40} color={colors.primary} />
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to your email
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.otpContainer}>
              <Text style={[styles.otpHint, { marginBottom: SPACING.md, marginTop: 0 }]}>
                Enter 6-digit verification code
              </Text>
              <OTPInput length={6} value={otp} onChange={setOtp} />
              <Text style={[styles.otpHint, { fontSize: FONT.size.xs, marginTop: SPACING.sm }]}>
                Current code: {otp || "None entered"}
              </Text>
            </View>

            <Button
              variant="primary"
              size="lg"
              onPress={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              loading={loading}
              style={styles.verifyButton}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>

            {!loading && (
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>
                <Button
                  variant="text"
                  onPress={handleResendOTP}
                  disabled={resendDisabled}
                  style={styles.resendButton}
                >
                  {resendDisabled ? `Resend in ${countdown}s` : "Resend Code"}
                </Button>
              </View>
            )}

            <View style={styles.infoContainer}>
              <Ionicons
                name="information-circle"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoText}>
                Do you still encounter issues? follow the guide below.
              </Text>
            </View>

            <View style={[styles.infoContainer, { marginTop: SPACING.md }]}>
              <Ionicons
                name="help-circle"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoText}>
                If you still can't verify your email, please try the following:
                {"\n\n"}• Check your email address that you used
                {"\n"}• Check your internet connection
                {"\n"}• Try refreshing the page
                {"\n"}• Add Ctrlhomecamp01@gmail.com to your contacts
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}