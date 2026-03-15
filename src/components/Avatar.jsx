import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";

export default function Avatar({ width = 300, height = 300 }) {
  const { pet, loading, childAccessories } = useAppData();
  const [accessories, setAccessories] = useState([]);
  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const snap = await getDocs(collection(db, "Accessories"));

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAccessories(list);
      } catch (error) {
        console.error("Error fetching accessories:", error);
      }
    };

    fetchAccessories();
  }, []);
  console.log(
    "Rendering Avatar with pet:",
    pet,
    "and accessories:",
    childAccessories,
  );

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!pet?.imageURL || !pet?.moodImageURL) {
    return null;
  }

  return (
    <View className="w-44 h-44 items-center justify-center self-center mt-10 relative">
      {/* Base pet */}
      <Image
        source={{ uri: pet.imageURL }}
        style={{ width, height }}
        resizeMode="contain"
      />

      {/* Smile overlay */}
      <Image
        source={{ uri: pet.moodImageURL }}
        style={{
          position: "absolute",
          width,
          height,
        }}
        resizeMode="contain"
      />

      {/* Accessories */}
      {childAccessories
        ?.filter((a) => a.equipped)
        .map((childAccessory) => {
          const accessory = accessories.find(
            (a) => a.id === childAccessory.accessoryID,
          );

          if (!accessory) return null;

          return (
            <Image
              key={childAccessory.id}
              source={{ uri: accessory.imageURL }}
              style={{
                position: "absolute",
                width,
                height,
              }}
              resizeMode="contain"
            />
          );
        })}
    </View>
  );
}
