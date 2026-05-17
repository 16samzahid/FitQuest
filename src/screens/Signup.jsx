// signup screen for new users
// this creates a firebase auth account and then sets up the parent and child records in firestore
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Pressable, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../config/FirebaseConfig";
import { createParentAndChild } from "../services/userService";

const Signup = () => {
  // used to move between signup and login screens
  const navigation = useNavigation();

  // stores the email and password typed into the form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // stores signup errors so they can be shown to the user
  const [error, setError] = useState(null);

  const signUp = async () => {
    try {
      // create the user account in firebase authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      console.log("User created:", userCredential.user);

      // get the new user's uid so it can be used as the parent id
      const user = userCredential.user;
      const parentID = user.uid;

      // create the linked parent, child and default task documents in firestore
      createParentAndChild(parentID);
    } catch (err) {
      // show clearer messages for common signup errors
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters");
      } else {
        setError("Something went wrong. Please try again.");
      }

      // useful for debugging the exact firebase error during development
      // setError(err.message);
      console.log("Error during sign up:", err);
    }

    console.log("Sign up attempted with email:", email);
    // create a new parent and child document in firestore
  };

  const login = async () => {
    // take users back to the login screen if they already have an account
    navigation.replace("Login");
  };

  return (
    <SafeAreaView className="flex-1 justify-center px-6 bg-gray-50">
      {/* app title */}
      <Text className="text-3xl font-bold text-center mb-6">FitQuest</Text>

      {/* email input */}
      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* password input, hidden using secureTextEntry */}
      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* show any signup error below the inputs */}
      {error && (
        <Text className="text-red-600 text-center mb-2 font-semibold">
          {error}
        </Text>
      )}

      {/* creates the firebase account and firestore records */}
      <Pressable
        className="border border-indigo-600 py-4 rounded-xl"
        onPress={signUp}
      >
        <Text className="text-indigo-600 text-center font-semibold">
          Sign up
        </Text>
      </Pressable>

      {/* link back to login for existing users */}
      <Pressable onPress={login}>
        <Text className="text-gray-600 text-center font-semibold mt-4 text-md">
          Already have an account? Log in
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Signup;
