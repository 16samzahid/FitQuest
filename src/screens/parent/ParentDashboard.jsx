import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ParentDashboard = () => {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 px-4">
        <Text>Parent Dashboard</Text>
      </View>
    </SafeAreaView>
  );
};

export default ParentDashboard;
