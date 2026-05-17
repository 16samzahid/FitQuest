// shop component for the child pet screen
// this lets the child change pet colours and buy/equip accessories using coins
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Audio } from "expo-av";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";

const Shop = () => {
  // get the pet, child, owned accessories and refresh function from app context
  const { pet, setPet, child, childAccessories, refreshData } = useAppData();

  // controls whether the user is viewing colours or accessories
  const [activeTab, setActiveTab] = useState("colours");

  // stores the available colours and accessories fetched from firestore
  const [colours, setColours] = useState([]);
  const [accessories, setAccessories] = useState([]);

  // gets the screen width so the colour circles can be sized responsively
  const { width } = useWindowDimensions();

  // circle size for each colour item, accounting for padding and spacing
  const circleSize = (width - 60) / 3;

  const playSound = async () => {
    try {
      // play a confirmation sound after a successful accessory purchase
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/purchase_success.mp3"),
      );
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const handleAccessoryPress = async (item, owned) => {
    console.log(
      `Accessory ${item.id} pressed, owned: ${owned}, equipped: ${owned && childAccessories.find((a) => a.accessoryID === item.id)?.equipped}`,
    );

    // stop if the child profile has not loaded
    if (!child) return;

    try {
      if (owned) {
        // if the child already owns the accessory, pressing it toggles equipped/unequipped
        const accessoryDoc = childAccessories.find(
          (a) => a.accessoryID === item.id,
        );
        if (!accessoryDoc) return;

        await updateDoc(doc(db, "ChildAccessory", accessoryDoc.id), {
          equipped: !accessoryDoc.equipped,
        });
      } else {
        // if the child does not own it yet, check they have enough coins first
        if (child.coins < item.price) {
          alert("Not enough coins!");
          return;
        }

        // subtract the accessory price from the child's coins
        await updateDoc(doc(db, "Child", child.id), {
          coins: child.coins - item.price,
        });

        // create a child-accessory record to show ownership
        // equipped is true so the item is worn straight after purchase
        await addDoc(collection(db, "ChildAccessory"), {
          childID: child.id,
          accessoryID: item.id,
          equipped: true,
        });

        playSound();
      }
    } catch (error) {
      console.error("Accessory action failed:", error);
    }
  };

  const changeColour = (colourId) => async () => {
    // do not update colour if no child profile is available
    if (!child) {
      console.warn("changeColour called with no child");
      return;
    }

    // optimistic update, so the selected colour changes immediately in the UI
    setPet((prev) => ({ ...prev, colourID: colourId }));

    try {
      // fetch the selected colour document so the pet image can also be updated
      const colourSnap = await getDoc(doc(db, "Colours", colourId));

      if (colourSnap.exists()) {
        const imageURL = colourSnap.data().imageURL;

        // save the selected colour to the child's pet data in firestore
        await updateDoc(doc(db, "Child", child.id), {
          "pet.colourID": colourId,
        });

        // update the local pet data with both the colour id and image url
        setPet((prev) => ({ ...prev, colourID: colourId, imageURL }));
      }
    } catch (error) {
      console.error("Error fetching colour imageURL:", error);
    }
  };

  const fetchShopData = async () => {
    try {
      // load all available pet colours and accessories from firestore
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
    // fetch the available colours and accessories when the shop first loads
    fetchShopData();
  }, []);

  return (
    <View className="rounded-t-3xl flex-1 w-full mt-5">
      {/* tabs let the child switch between colour customisation and accessories */}
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

      {/* scrollable shop content */}
      <ScrollView
        className="flex-1 bg-gray-300 p-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* colours tab shows available pet colours */}
        {activeTab === "colours" ? (
          <View className="flex-row flex-wrap">
            {colours.map((colour) => (
              <View key={colour.id} className="w-1/3 items-center mb-4">
                {/* pressing a colour updates the pet colour */}
                <Pressable
                  onPress={changeColour(colour.id)}
                  style={{
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    backgroundColor: colour.hex,

                    // selected colour gets a thicker black border
                    borderWidth: pet?.colourID === colour.id ? 4 : 1,
                    borderColor:
                      pet?.colourID === colour.id ? "black" : "transparent",
                  }}
                />

                <Text className="mt-2 font-semibold text-sm text-center">
                  {colour.name}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          /* accessories tab shows items the child can buy, own or equip */
          <View className="flex-row flex-wrap justify-between">
            {accessories.map((item) => {
              // check if the child already owns this accessory
              const accessoryRecord = childAccessories?.find(
                (a) => a.accessoryID === item.id,
              );

              const owned = !!accessoryRecord;
              const equipped = accessoryRecord?.equipped;

              return (
                // pressing the card either buys the item or toggles whether it is equipped
                <Pressable
                  key={item.id}
                  className={`h-40 w-40 rounded-xl bg-white mb-4 p-3 ${
                    owned && equipped
                      ? "border-4 border-black"
                      : "border border-transparent"
                  }`}
                  onPress={() => handleAccessoryPress(item, owned)}
                >
                  {/* accessory image */}
                  <View className="flex-1 items-center justify-center">
                    <Image
                      source={{ uri: item.thumbnailURL }}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </View>

                  {/* accessory name */}
                  <Text className="text-center font-semibold text-lg mt-1">
                    {item.name}
                  </Text>

                  {/* show owned/equipped status if bought, otherwise show price */}
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
