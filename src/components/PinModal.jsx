import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useAppData } from "../context/AppDataContext";

import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
} from "firebase/auth";

export default function PinModal({ visible, onClose, onSuccess }) {
  const { parent } = useAppData();

  const CORRECT_PIN = parent?.pin || "1234";

  const [screen, setScreen] = useState("pin"); // pin | password | revealPin

  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checkingPassword, setCheckingPassword] = useState(false);

  const inputs = useRef([]);

  useEffect(() => {
    if (!visible) {
      resetAll();
    }
  }, [visible]);

  const resetAll = () => {
    setScreen("pin");
    setPin(["", "", "", ""]);
    setError("");
    setPassword("");
    setPasswordError("");
    setCheckingPassword(false);
  };

  const closeEverything = () => {
    resetAll();
    onClose();
  };

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError("");

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = () => {
    const enteredPin = pin.join("");

    if (enteredPin.length !== 4) {
      setError("Enter 4 digits");
      return;
    }

    if (enteredPin === CORRECT_PIN) {
      setPin(["", "", "", ""]);
      setError("");
      onSuccess();
    } else {
      setError("Incorrect PIN");
      setPin(["", "", "", ""]);
      inputs.current[0]?.focus();
    }
  };

  const handleForgotPin = () => {
    setPassword("");
    setPasswordError("");
    setScreen("password");
  };

  const handlePasswordConfirm = async () => {
    if (!password.trim()) {
      setPasswordError("Please enter your password");
      return;
    }

    try {
      setCheckingPassword(true);
      setPasswordError("");

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !user.email) {
        setPasswordError("Could not find the signed-in user");
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, password);

      await reauthenticateWithCredential(user, credential);

      setPassword("");
      setPasswordError("");
      setScreen("revealPin");
    } catch (err) {
      console.log("Password check error:", err);
      setPasswordError("Incorrect password");
    } finally {
      setCheckingPassword(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      hardwareAccelerated={true}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "85%",
            maxWidth: 380,
            backgroundColor: "white",
            padding: 28,
            borderRadius: 20,
          }}
        >
          {screen === "pin" && (
            <>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  marginBottom: 24,
                  textAlign: "center",
                }}
              >
                Enter Parent PIN
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 16,
                  gap: 16,
                }}
              >
                {pin.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputs.current[index] = ref)}
                    value={digit}
                    onChangeText={(value) => handleChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    secureTextEntry
                    style={{
                      width: 60,
                      height: 65,
                      borderWidth: 2,
                      borderColor: "#d1d5db",
                      borderRadius: 12,
                      fontSize: 28,
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  />
                ))}
              </View>

              {!!error && (
                <Text
                  style={{
                    color: "#dc2626",
                    marginBottom: 12,
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {error}
                </Text>
              )}

              <Pressable onPress={handleForgotPin}>
                <Text
                  style={{
                    color: "#2563eb",
                    fontSize: 16,
                    fontWeight: "700",
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  Forgot PIN?
                </Text>
              </Pressable>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 24,
                  gap: 12,
                }}
              >
                <Pressable
                  onPress={closeEverything}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 12,
                    backgroundColor: "#f3f4f6",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#6b7280", fontWeight: "600" }}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirm}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 12,
                    backgroundColor: "#2563eb",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {screen === "password" && (
            <>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                Confirm Password
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                Enter your account password to view your parent PIN.
              </Text>

              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError("");
                }}
                placeholder="Account password"
                secureTextEntry
                autoCapitalize="none"
                style={{
                  borderWidth: 2,
                  borderColor: passwordError ? "#dc2626" : "#d1d5db",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 16,
                }}
              />

              {!!passwordError && (
                <Text
                  style={{
                    color: "#dc2626",
                    marginTop: 10,
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {passwordError}
                </Text>
              )}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 24,
                  gap: 12,
                }}
              >
                <Pressable
                  onPress={() => {
                    setPassword("");
                    setPasswordError("");
                    setScreen("pin");
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 12,
                    backgroundColor: "#f3f4f6",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#6b7280", fontWeight: "600" }}>
                    Back
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handlePasswordConfirm}
                  disabled={checkingPassword}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 12,
                    backgroundColor: checkingPassword ? "#93c5fd" : "#2563eb",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {checkingPassword ? "Checking..." : "Confirm"}
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {screen === "revealPin" && (
            <>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                Your Parent PIN
              </Text>

              <Text
                style={{
                  fontSize: 15,
                  color: "#6b7280",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                Your current parent PIN is:
              </Text>

              <View
                style={{
                  backgroundColor: "#f3f4f6",
                  paddingVertical: 18,
                  paddingHorizontal: 30,
                  borderRadius: 16,
                  marginBottom: 24,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 34,
                    fontWeight: "900",
                    letterSpacing: 8,
                    color: "#111827",
                  }}
                >
                  {CORRECT_PIN}
                </Text>
              </View>

              <Pressable
                onPress={closeEverything}
                style={{
                  width: "100%",
                  paddingVertical: 15,
                  borderRadius: 12,
                  backgroundColor: "#2563eb",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>OK</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
