import PlantForm from "@/components/UserPlantForm";
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { deletePlant, subscribeUserPlants, toggleFavorite } from "@/services/plantService";
import { PlantDoc } from "@/types/Plant";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";

const PlantScreen = () => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const [plants, setPlants] = useState<PlantDoc[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PlantDoc[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPlant, setEditingPlant] = useState<PlantDoc | null>(null);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  // Load user plants
  useEffect(() => {
    if (!user?.id) return;
    showLoader();
    const unsub = subscribeUserPlants(
      user.id,
      (data) => {
        setPlants(data);
        setFilteredPlants(data);
        hideLoader();
      },
      () => hideLoader()
    );
    return () => unsub();
  }, [user]);

  // Filter plants
  useEffect(() => {
    let data = plants;
    if (searchText.trim() !== "") {
      data = data.filter((p) =>
        p.plantName.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredPlants(data);
  }, [searchText, plants]);

  const handleEdit = (plant: PlantDoc) => {
    setEditingPlant(plant);
    setIsFormVisible(true);
  };

  const handleDelete = async (plant: PlantDoc) => {
    if (!user?.id) return;

    // Only allow deleting user's own plants
    if (plant.createdBy !== user.id) {
      return Alert.alert("Error", "You can only delete your own plants.");
    }

    showLoader();
    try {
      await deletePlant(plant); // pass the whole plant object
    } catch (err) {
      console.log("Delete failed:", err);
      Alert.alert("Error", "Failed to delete plant.");
    } finally {
      hideLoader();
    }
  };

  const handleToggleFavorite = async (plant: PlantDoc) => {
    if (!user?.id) return;
    await toggleFavorite(user.id, plant.id!, !plant.approved);
  };

  const renderPlantCard = ({ item }: { item: PlantDoc }) => {
    const isAdminPlant = item.createdByRole === "admin";

    return (
      <View
        style={{
          flex: 1,
          margin: 6,
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Image
          source={{ uri: item.images?.[0] || "https://via.placeholder.com/150" }}
          style={{ width: "100%", height: 200, borderRadius: 12 }}
          resizeMode="contain"
        />

        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            color: "#065f46",
            marginVertical: 8,
          }}
        >
          {item.plantName}
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {/* Show Cart + Favorite only for admin plants */}
          {isAdminPlant && (
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity style={{ marginRight: 12 }}>
                <Feather name="shopping-cart" size={20} color="#10b981" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
                <Feather
                  name="star"
                  size={20}
                  color={item.approved ? "#facc15" : "#d1d5db"}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Always show Edit + Delete for owner */}
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{ marginRight: 12 }}
              onPress={() => handleEdit(item)}
            >
              <Feather name="edit-2" size={20} color="#fbbf24" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)}>
              <Feather name="trash-2" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f0fdf4", paddingHorizontal: 12 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          textAlign: "center",
          marginVertical: 16,
          color: "#065f46",
        }}
      >
        Search Plants
      </Text>

      <TextInput
        placeholder="Search by name..."
        placeholderTextColor={
          currentTheme === "light" ? "#6b7280" : "#c3f7ef"
        }
        value={searchText}
        onChangeText={setSearchText}
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 12,
          fontSize: 16,
          marginBottom: 12,
        }}
      />

      <FlatList
        data={filteredPlants}
        keyExtractor={(item) => item.id!}
        renderItem={renderPlantCard}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 30,
          right: 30,
          backgroundColor: "#10b981",
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
          elevation: 5,
        }}
        onPress={() => {
          setEditingPlant(null);
          setIsFormVisible(true);
        }}
      >
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <PlantForm
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        editingPlant={editingPlant}
        currentTheme={currentTheme}
      />
    </View>
  );
};

export default PlantScreen;
