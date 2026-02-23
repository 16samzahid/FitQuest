import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";

const Shop = () => {
  const { pet, setPet, child } = useAppData();
  const [activeTab, setActiveTab] = useState("colours");
  const [colours, setColours] = useState([]);
  const [accessories, setAccessories] = useState([]);

  const changeColour = (colourId) => async () => {
    // console.log("Changing colour to ID:", colourId);

    // Fetch the imageURL for this colour from Firestore
    try {
      const colourSnap = await getDoc(doc(db, "Colours", colourId));
      if (colourSnap.exists()) {
        const imageURL = colourSnap.data().imageURL;
        await updateDoc(doc(db, "Child", child.id), {
          "pet.colourID": colourId,
          "pet.imageURL": imageURL,
        });
        setPet((prev) => ({ ...prev, colourID: colourId, imageURL }));
        console.log("Updated pet with new colour and imageURL");
      }
    } catch (error) {
      console.error("Error fetching colour imageURL:", error);
    }
  };

  const fetchShopData = async () => {
    try {
      const colourSnap = await getDocs(collection(db, "Colours"));
      const accessorySnap = await getDocs(collection(db, "Accessories"));
      if (!colourSnap.empty && !accessorySnap.empty) {
        const shops = colourSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setColours(shops);
        const accessories = accessorySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAccessories(accessories);
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
    <View className="rounded-t-3xl flex-1 w-full mt-5">
      {/* Tabs */}
      <View className="flex-row">
        <Pressable
          onPress={() => setActiveTab("colours")}
          className={`flex-1 h-8 items-center justify-center rounded-t-3xl ${
            activeTab === "colours" ? "bg-gray-300" : "bg-white"
          }`}
        >
          <Text className="font-bold text-lg">Colours</Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("accessories")}
          className={`flex-1 h-8 items-center justify-center rounded-t-3xl ${
            activeTab === "accessories" ? "bg-gray-300" : "bg-white"
          }`}
        >
          <Text className="font-bold text-lg">Accessories</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 bg-gray-300 p-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {activeTab === "colours" ? (
          <View className="flex-row flex-wrap">
            {colours.map((colour) => (
              <View key={colour.id} className="w-1/3 items-center mb-4">
                <Pressable
                  className={`h-32 w-32 rounded-full ${
                    pet?.colourID === colour.id
                      ? "border-4 border-black"
                      : "border border-transparent"
                  }`}
                  style={{ backgroundColor: colour.hex }}
                  onPress={changeColour(colour.id)}
                />
                <Text className="mt-2 font-semibold text-sm text-center">
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
                className="h-40 w-40 rounded-xl bg-white mb-4 p-3"
              >
                {/* Image Container */}
                <View className="flex-1 items-center justify-center">
                  <Image
                    source={{ uri: item.thumbnailURL }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                </View>

                {/* Name */}
                <Text className="text-center font-semibold text-lg mt-1">
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
