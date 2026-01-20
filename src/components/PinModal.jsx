import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

const CORRECT_PIN = "1234";

export default function PinModal({ visible, onClose, onSuccess }) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");

  const inputs = useRef([]);

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      setPin(["", "", "", ""]);
      setError("");
    }
  }, [visible]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError("");

    // Move to next box
    if (value && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      inputs.current[index - 1].focus();
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
      inputs.current[0].focus();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
            width: "50%",
            backgroundColor: "white",
            padding: 20,
            borderRadius: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 14 }}>
            Enter Parent PIN
          </Text>

          {/* PIN boxes */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 10,
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
                  width: 50,
                  height: 55,
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 10,
                  fontSize: 24,
                  textAlign: "center",
                }}
              />
            ))}
          </View>

          {!!error && (
            <Text style={{ color: "#dc2626", marginBottom: 8 }}>{error}</Text>
          )}

          {/* Buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 18,
            }}
          >
            <Pressable onPress={onClose} style={{ padding: 10 }}>
              <Text style={{ color: "#6b7280", fontSize: 16 }}>Cancel</Text>
            </Pressable>

            <Pressable onPress={handleConfirm} style={{ padding: 10 }}>
              <Text style={{ color: "#2563eb", fontWeight: "700", fontSize: 16 }}>
                Confirm
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
