import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const Shop = ({ colours = [], accessories = [] }) => {
  const [activeTab, setActiveTab] = useState("colours");

  return (
    <View className="bg-white rounded-t-3xl h-[395px] w-full overflow-hidden mt-5">
      {/* Tabs */}
      <View className="flex-row">
        <Pressable
          onPress={() => setActiveTab("colours")}
          className={`flex-1 h-8 items-center justify-center border border-black rounded-tl-3xl ${
            activeTab === "colours" ? "bg-gray-300" : "bg-white"
          }`}
        >
          <Text className="font-bold text-sm">Colours</Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("accessories")}
          className={`flex-1 h-8 items-center justify-center border border-black rounded-tr-3xl ${
            activeTab === "accessories" ? "bg-gray-300" : "bg-white"
          }`}
        >
          <Text className="font-bold text-sm">Accessories</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 bg-gray-300 p-4">
        {activeTab === "colours" ? (
          <View className="flex-row flex-wrap justify-between">
            {colours.map((colour, index) => (
              <Pressable
                key={index}
                className="h-32 w-32 rounded-full mb-4 border-2 border-black"
                style={{ backgroundColor: colour }}
              />
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {accessories.map((item, index) => (
              <Pressable
                key={index}
                className="h-40 w-40 rounded-xl bg-gray-400 mb-4"
              >
                <Text className="text-center mt-2 font-semibold">
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Shop;
