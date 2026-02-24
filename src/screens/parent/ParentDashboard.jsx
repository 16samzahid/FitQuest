import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ApproveTasks from "../../components/ApproveTasks";
import ProgressStats from "../../components/ProgressStats";

const ParentDashboard = () => {
  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-1 px-4">
        <Text className="text-[#7F7DCE] text-[30px] font-black p-2 mt-4 text-center">
          Dashboard
        </Text>

        <ProgressStats />
        <ApproveTasks />
      </View>
    </SafeAreaView>
  );
};

export default ParentDashboard;
