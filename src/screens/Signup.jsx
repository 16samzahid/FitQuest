import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Pressable, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../config/FirebaseConfig";

const Signup = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  // useEffect(() => {
  //   if (__DEV__) {
  //     signInWithEmailAndPassword(
  //       auth,
  //       "sam.zahid6676@gmail.com",
  //       "zahid123",
  //     ).catch(() => {});
  //   }
  // }, []);

  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
    console.log("Sign up attempted with email:", email);
  };

  const login = async () => {
    // try {
    //   await signInWithEmailAndPassword(auth, email, password);
    // } catch (err) {
    //   setError(err.message);
    // }
    navigation.replace("Login");
  };

  return (
    <SafeAreaView className="flex-1 justify-center px-6 bg-gray-50">
      <Text className="text-3xl font-bold text-center mb-6">FitQuest</Text>

      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && (
        <Text className="text-red-600 text-center mb-2 font-semibold">
          Email already in use
        </Text>
      )}

      <Pressable
        className="border border-indigo-600 py-4 rounded-xl"
        onPress={signUp}
      >
        <Text className="text-indigo-600 text-center font-semibold">
          Sign up
        </Text>
      </Pressable>

      <Pressable onPress={login}>
        <Text className="text-gray-600 text-center font-semibold mt-4 text-md">
          Already have an account? Log in
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Signup;
