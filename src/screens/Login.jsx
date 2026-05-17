// login screen for existing users
// this allows a parent to sign into their fitquest account using firebase authentication
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Pressable, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../config/FirebaseConfig";

const Login = () => {
  // navigation is used to move between the login and signup screens
  const navigation = useNavigation();

  // store the email and password typed by the user
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // stores any login error, so a message can be shown on the screen
  const [error, setError] = useState(null);

  const signIn = async () => {
    try {
      // firebase checks the email and password against registered users
      // if successful, the auth listener in AuthContext will detect the logged-in user
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // if login fails, store the error so the user gets feedback
      setError(err.message);
    }
  };

  const signUp = async () => {
    // replace the current screen with Signup so the user can create a new account
    navigation.replace("Signup");
  };

  return (
    <SafeAreaView className="flex-1 justify-center px-6 bg-gray-50">
      {/* app title */}
      <Text className="text-3xl font-bold text-center mb-6">FitQuest</Text>

      {/* email input field */}
      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* password input field.
          secureTextEntry hides the password while the user types */}
      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* show a simple error message if firebase login fails */}
      {error && (
        <Text className="text-red text-center mb-2 font-semibold">
          Username or Password incorrect
        </Text>
      )}

      {/* login button calls the firebase sign in function */}
      <Pressable
        className="bg-indigo-600 py-4 rounded-xl mb-3"
        onPress={signIn}
      >
        <Text className="text-white text-center font-semibold">Login</Text>
      </Pressable>

      {/* signup button takes the user to the signup screen */}
      <Pressable
        className="border border-indigo-600 py-4 rounded-xl"
        onPress={signUp}
      >
        <Text className="text-indigo-600 text-center font-semibold">
          Sign up
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Login;
