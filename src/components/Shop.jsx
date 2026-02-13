import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";

const Shop = ({ accessories = [] }) => {
  const { pet, setPet } = useAppData();
  const [activeTab, setActiveTab] = useState("colours");
  const [colours, setColours] = useState([]);

  const changeColour = (colourId) => async () => {
    console.log("Changing colour to ID:", colourId);

    // Fetch the imageURL for this colour from Firestore
    try {
      const colourSnap = await getDoc(doc(db, "Colours", colourId));
      if (colourSnap.exists()) {
        const imageURL = colourSnap.data().imageURL;
        setPet((prev) => ({ ...prev, colourID: colourId, imageURL }));
        console.log("Updated pet with new colour and imageURL");
      }
    } catch (error) {
      console.error("Error fetching colour imageURL:", error);
    }
  };

  const fetchShopData = async () => {
    try {
      const shopSnap = await getDocs(collection(db, "Colours"));
      if (!shopSnap.empty) {
        const shops = shopSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setColours(shops);
        console.log("Colours:", shops);
      } else {
        console.log("No colours found");
      }
    } catch (error) {
      console.error("Error fetching colours:", error);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  return (
    <View className="bg-white rounded-t-3xl flex-1 w-full mt-5">
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
      <ScrollView
        className="flex-1 bg-gray-300 p-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {activeTab === "colours" ? (
          <View className="flex-row flex-wrap justify-start gap-2">
            {colours.map((colour) => (
              <View key={colour.id} className="items-center mb-4">
                <Pressable
                  className="h-32 w-32 rounded-full border-2 border-black"
                  style={{ backgroundColor: colour.hex }}
                  onPress={changeColour(colour.id)}
                />
                <Text className="mt-2 font-semibold text-sm">
                  {colour.name}
                </Text>
              </View>
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
