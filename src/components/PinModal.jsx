// parent pin modal
// this protects access to parent mode by asking for the parent pin
// it also includes a forgot pin flow where the parent can re-enter their account password
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useAppData } from "../context/AppDataContext";

import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
} from "firebase/auth";

export default function PinModal({ visible, onClose, onSuccess }) {
  // get the parent data from context so we can compare against the saved pin
  const { parent } = useAppData();

  // fallback pin is used in case the parent data has not loaded yet
  const CORRECT_PIN = parent?.pin || "1234";

  // controls which part of the modal is shown
  // pin = normal pin entry, password = forgot pin password check, revealPin = show pin
  const [screen, setScreen] = useState("pin"); // pin | password | revealPin

  // stores each digit of the pin separately so each box can be controlled
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");

  // used for the forgot pin flow
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checkingPassword, setCheckingPassword] = useState(false);

  // keeps references to the four pin input boxes so focus can move automatically
  const inputs = useRef([]);

  useEffect(() => {
    // whenever the modal closes, reset it back to the starting state
    if (!visible) {
      resetAll();
    }
  }, [visible]);

  const resetAll = () => {
    // clear all modal values so old errors/passwords do not stay next time it opens
    setScreen("pin");
    setPin(["", "", "", ""]);
    setError("");
    setPassword("");
    setPasswordError("");
    setCheckingPassword(false);
  };

  const closeEverything = () => {
    // reset everything before closing the modal
    resetAll();
    onClose();
  };

  const handleChange = (value, index) => {
    // only allow one digit in each pin box
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError("");

    // move to the next box automatically after typing a digit
    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // if the user presses backspace on an empty box, move back to the previous box
    if (e.nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = () => {
    // join the four input boxes into one pin string
    const enteredPin = pin.join("");

    // make sure all four digits have been entered
    if (enteredPin.length !== 4) {
      setError("Enter 4 digits");
      return;
    }

    if (enteredPin === CORRECT_PIN) {
      // if the pin is correct, clear the modal and allow parent mode access
      setPin(["", "", "", ""]);
      setError("");
      onSuccess();
    } else {
      // if the pin is wrong, clear it and focus back on the first box
      setError("Incorrect PIN");
      setPin(["", "", "", ""]);
      inputs.current[0]?.focus();
    }
  };

  const handleForgotPin = () => {
    // switch from pin entry to password confirmation
    setPassword("");
    setPasswordError("");
    setScreen("password");
  };

  const handlePasswordConfirm = async () => {
    // password is required before revealing the pin
    if (!password.trim()) {
      setPasswordError("Please enter your password");
      return;
    }

    try {
      setCheckingPassword(true);
      setPasswordError("");

      // get the currently signed-in firebase user
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !user.email) {
        setPasswordError("Could not find the signed-in user");
        return;
      }

      // create a credential using the user's email and the password they entered
      const credential = EmailAuthProvider.credential(user.email, password);

      // firebase checks the password by re-authenticating the current user
      await reauthenticateWithCredential(user, credential);

      // if the password is correct, reveal the saved parent pin
      setPassword("");
      setPasswordError("");
      setScreen("revealPin");
    } catch (err) {
      console.log("Password check error:", err);
      setPasswordError("Incorrect password");
    } finally {
      // stop the loading/checking state either way
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
      {/* dark overlay behind the modal */}
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* main modal box */}
        <View
          style={{
            width: "85%",
            maxWidth: 380,
            backgroundColor: "white",
            padding: 28,
            borderRadius: 20,
          }}
        >
          {/* normal pin entry screen */}
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

              {/* four separate pin input boxes */}
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

              {/* show pin error messages */}
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

              {/* forgot pin moves to password check screen */}
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

              {/* cancel and confirm buttons */}
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

          {/* password confirmation screen for forgot pin */}
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

              {/* account password input */}
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

              {/* show password error if re-authentication fails */}
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

              {/* back and confirm buttons */}
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

          {/* reveal pin screen, only shown after password is confirmed */}
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

              {/* show the current parent pin */}
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

              {/* close the modal after viewing the pin */}
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
