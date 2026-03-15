import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {
  addDoc,
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
  const { pet, setPet, child, childAccessories, refreshData } = useAppData();
  const [activeTab, setActiveTab] = useState("colours");
  const [colours, setColours] = useState([]);
  const [accessories, setAccessories] = useState([]);

  const handleAccessoryPress = async (item, owned) => {
    console.log(
      `Accessory ${item.id} pressed, owned: ${owned}, equipped: ${owned && childAccessories.find((a) => a.accessoryID === item.id)?.equipped}`,
    );
    if (!child) return;

    try {
      if (owned) {
        const accessoryDoc = childAccessories.find(
          (a) => a.accessoryID === item.id,
        );
        if (!accessoryDoc) return;

        await updateDoc(doc(db, "ChildAccessory", accessoryDoc.id), {
          equipped: !accessoryDoc.equipped,
        });
      } else {
        if (child.coins < item.price) {
          alert("Not enough coins!");
          return;
        }

        await updateDoc(doc(db, "Child", child.id), {
          coins: child.coins - item.price,
        });

        await addDoc(collection(db, "ChildAccessory"), {
          childID: child.id,
          accessoryID: item.id,
          equipped: true,
        });

        const currentlyEquipped = childAccessories.filter((a) => a.equipped);
        await Promise.all(
          currentlyEquipped.map((other) =>
            updateDoc(doc(db, "ChildAccessory", other.id), {
              equipped: false,
            }),
          ),
        );
      }

      if (refreshData) {
        await refreshData();
      }
    } catch (error) {
      console.error("Accessory action failed:", error);
    }
  };

  const changeColour = (colourId) => async () => {
    if (!child) {
      console.warn("changeColour called with no child");
      return;
    }

    try {
      const colourSnap = await getDoc(doc(db, "Colours", colourId));

      if (colourSnap.exists()) {
        const imageURL = colourSnap.data().imageURL;

        await updateDoc(doc(db, "Child", child.id), {
          "pet.colourID": colourId,
          "pet.imageURL": imageURL,
        });

        setPet((prev) => ({ ...prev, colourID: colourId, imageURL }));
      }
    } catch (error) {
      console.error("Error fetching colour imageURL:", error);
    }
  };

  const fetchShopData = async () => {
    try {
      const colourSnap = await getDocs(collection(db, "Colours"));
      const accessorySnap = await getDocs(collection(db, "Accessories"));

      if (!colourSnap.empty) {
        const colours = colourSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setColours(colours);
      }

      if (!accessorySnap.empty) {
        const accessories = accessorySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAccessories(accessories);
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
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
        {/* COLOURS TAB */}
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
          /* ACCESSORIES TAB */
          <View className="flex-row flex-wrap justify-between">
            {accessories.map((item) => {
              const accessoryRecord = childAccessories?.find(
                (a) => a.accessoryID === item.id,
              );
              const owned = !!accessoryRecord;
              const equipped = accessoryRecord?.equipped;

              return (
                <Pressable
                  key={item.id}
                  className={`h-40 w-40 rounded-xl bg-white mb-4 p-3 ${
                    owned && equipped
                      ? "border-4 border-black"
                      : "border border-transparent"
                  }`}
                  onPress={() => handleAccessoryPress(item, owned)}
                >
                  {/* Image */}
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

                  {/* Price or Owned */}
                  {owned ? (
                    <Text
                      className={`font-semibold text-center mt-1 ${
                        equipped ? "text-blue-600" : "text-green-600"
                      }`}
                    >
                      {equipped ? "Equipped" : "Owned"}
                    </Text>
                  ) : (
                    <View className="flex-row items-center justify-center mt-1">
                      <FontAwesome5 name="coins" size={14} color="#FBBF24" />
                      <Text className="ml-1 font-semibold text-xl text-black">
                        {item.price}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Shop;
