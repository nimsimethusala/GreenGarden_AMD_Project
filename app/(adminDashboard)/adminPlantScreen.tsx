import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AdminPlantForm from "@/components/form/AdminPlantForm";
import { PlantDoc } from "@/types/Plant";
import {
  createPlant,
  updatePlant,
  deletePlant,
  subscribeAllPlants,
} from "@/services/plantService";

const USER_ID = "admin";

export default function AdminPlantScreen() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<PlantDoc | null>(null);
  const [plants, setPlants] = useState<PlantDoc[]>([]);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  const currentColors = themeMode === "light" ? lightTheme : darkTheme;

  // Subscribe to admin plants
  useEffect(() => {
    const unsubscribe = subscribeAllPlants(
      (data) => setPlants(data),
      (err) => console.error(err)
    );
    return () => unsubscribe();
  }, []);

  // Save or update plant
  const handleSavePlant = async (plant: PlantDoc) => {
    try {
      if (plant.id) {
        // update existing
        await updatePlant(plant, { ...plant });
      } else {
        // create new
        await createPlant({
          ...plant,
          createdBy: USER_ID,
          createdByRole: "admin",
        });
      }
      setIsFormOpen(false);
      setEditingPlant(null);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to save plant.");
    }
  };

  // Delete plant
  const handleDeletePlant = (plant: PlantDoc) => {
    Alert.alert("Delete Plant", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (!plant.id) throw new Error("Plant ID missing");
            await deletePlant(plant);
          } catch (err: any) {
            console.error(err);
            Alert.alert("Error", err.message || "Failed to delete plant.");
          }
        },
      },
    ]);
  };

  const renderPlantCard = ({ item }: { item: PlantDoc }) => (
    <View style={[styles.card, { backgroundColor: currentColors.card }]}>
      {item.images && item.images.length > 0 ? (
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      ) : (
        <View
          style={[styles.image, { backgroundColor: currentColors.secondary }]}
        >
          <Feather name="image" size={28} color={currentColors.accent} />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={[styles.plantName, { color: currentColors.textPrimary }]}>
          {item.plantName}
        </Text>
        <Text
          style={[styles.plantDetails, { color: currentColors.textSecondary }]}
        >
          Rs. {item.price} | Stock: {item.stock}
        </Text>

        {/* Actions below text */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => {
              setEditingPlant(item);
              setIsFormOpen(true);
            }}
            style={styles.iconBtn}
          >
            <Feather name="edit" size={20} color={currentColors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeletePlant(item)}>
            <Feather name="trash" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentColors.background }]}>
        <Text style={[styles.headerText, { color: currentColors.textPrimary }]}>
          Plants
        </Text>
        <TouchableOpacity
          onPress={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
        >
          {themeMode === "light" ? (
            <Feather name="moon" size={24} color={currentColors.accent} />
          ) : (
            <Feather name="sun" size={24} color={currentColors.accent} />
          )}
        </TouchableOpacity>
      </View>

      {/* Plant List */}
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={renderPlantCard}
      />

      {/* Floating Button */}
      <TouchableOpacity
        onPress={() => {
          setEditingPlant(null);
          setIsFormOpen(true);
        }}
        style={[styles.fab, { backgroundColor: currentColors.accent }]}
      >
        <Feather name="plus" size={28} color={currentColors.icon} />
      </TouchableOpacity>

      {/* Form Modal */}
      {isFormOpen && (
        <AdminPlantForm
          theme={currentColors}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPlant(null);
          }}
          onSave={handleSavePlant}
          editingPlant={editingPlant}
        />
      )}
    </View>
  );
}

// Themes
const lightTheme = {
  background: "#f0fdf4",
  secondary: "#fff",
  card: "#fff",
  textPrimary: "#065f46",
  textSecondary: "#4b5563",
  accent: "#10b981",
  icon: "#fff",
};

const darkTheme = {
  background: "#1f2937",
  secondary: "#374151",
  card: "#374151",
  textPrimary: "#d1fae5",
  textSecondary: "#9ca3af",
  accent: "#10b981",
  icon: "#fff",
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginTop: 30,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  headerText: { fontSize: 28, fontWeight: "600" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 5,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  plantName: { fontSize: 16, fontWeight: "600" },
  plantDetails: { fontSize: 14 },
  actions: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  iconBtn: { marginRight: 12 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});
