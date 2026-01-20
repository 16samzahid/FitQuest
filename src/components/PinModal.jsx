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
            width: "85%",
            maxWidth: 380,
            backgroundColor: "white",
            padding: 28,
            borderRadius: 20,
          }}
        >
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

          {/* PIN boxes */}
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

          {/* Buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 24,
              gap: 12,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: "#f3f4f6",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Text
                style={{ color: "#6b7280", fontSize: 17, fontWeight: "600" }}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              style={{
                flex: 1,
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: "#2563eb",
                alignItems: "center",
                shadowColor: "#2563eb",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{ color: "#ffffff", fontWeight: "700", fontSize: 17 }}
              >
                Confirm
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
