import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { useAppData } from "../context/AppDataContext";

export default function Avatar({
  width = 300,
  height = 300,
  showSpeechBubble = false,
}) {
  const { pet, loading, childAccessories, child } = useAppData();
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

  const getEncouragementMessage = () => {
    const health = child?.health ?? 0;
    const hunger = child?.hunger ?? 0;
    const happiness = child?.happiness ?? 0;

    const lowestStat = Math.min(health, hunger, happiness);

    if (lowestStat === hunger) {
      if (hunger < 40) return "I'm really hungry!";
      if (hunger < 60) return "How about a healthy snack?";
    }

    if (lowestStat === health) {
      if (health < 40) return "I need some exercise!";
      if (health < 60) return "Let's do something healthy!";
    }

    if (lowestStat === happiness) {
      if (happiness < 40) return "I feel a bit sad...";
      if (happiness < 60) return "Can we do something fun?";
    }

    return "I'm doing great!";
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!pet?.imageURL || !pet?.moodImageURL) {
    return null;
  }

  return (
    <View className="items-center self-center mt-8 relative">
      {showSpeechBubble && (
        <View
          className="items-center z-10"
          style={{
            position: "absolute",
            top: -30,
            left: -60,
          }}
        >
          <View className="max-w-[220px] rounded-2xl bg-white px-4 py-3 shadow">
            <Text className="text-center text-base font-semibold text-gray-700">
              {getEncouragementMessage()}
            </Text>
          </View>

          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 8,
              borderRightWidth: 8,
              borderTopWidth: 12,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: "white",
              marginTop: -1,
              marginLeft: 40,
            }}
          />
        </View>
      )}

      <View className="w-44 h-44 items-center justify-center relative mt-6">
        <Image
          source={{ uri: pet.imageURL }}
          style={{ width, height }}
          resizeMode="contain"
        />

        <Image
          source={{ uri: pet.moodImageURL }}
          style={{
            position: "absolute",
            width,
            height,
          }}
          resizeMode="contain"
        />

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
    </View>
  );
}
