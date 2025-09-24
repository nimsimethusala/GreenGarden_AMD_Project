// screens/AdminScreen.tsx
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Image,
  Alert
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import AdminPlantForm from "@/components/form/AdminPlantForm";
import { PlantDoc } from "@/types/Plant";
import { CategoryDoc } from "@/types/Category";
import { subscribeAllPlants, subscribeCategories, deletePlant } from "@/services/plantService";
import HeaderSection from "@/components/section/HeaderSection";

export default function AdminScreen() {
  const { colors } = useTheme();
  const [isPlantFormVisible, setIsPlantFormVisible] = useState(false);
  const [editingPlant, setEditingPlant] = useState<PlantDoc | null>(null);
  const [plants, setPlants] = useState<PlantDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Load plants and categories
  useEffect(() => {
    const unsubscribePlants = subscribeAllPlants(
      (plantsData) => {
        setPlants(plantsData);
      },
      (error) => {
        console.error("Error loading plants:", error);
      }
    );

    const unsubscribeCategories = subscribeCategories(
      (categoriesData) => {
        setCategories(categoriesData);
      },
      (error) => {
        console.error("Error loading categories:", error);
      }
    );

    return () => {
      unsubscribePlants();
      unsubscribeCategories();
    };
  }, []);

  const handleOpenPlantForm = () => {
    setEditingPlant(null);
    setIsPlantFormVisible(true);
  };

  const handleClosePlantForm = () => {
    setIsPlantFormVisible(false);
    setEditingPlant(null);
  };

  const handleSavePlant = (plant: PlantDoc) => {
    console.log("Plant saved:", plant);
    handleClosePlantForm();
  };

  const handleEditPlant = (plant: PlantDoc) => {
    setEditingPlant(plant);
    setIsPlantFormVisible(true);
  };

  const handleDeletePlant = (plant: PlantDoc) => {
    Alert.alert(
      "Delete Plant",
      `Are you sure you want to delete "${plant.plantName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlant(plant);
              // Plant will be automatically removed from the list via the subscription
            } catch (error) {
              console.error("Error deleting plant:", error);
              Alert.alert("Error", "Failed to delete plant.");
            }
          }
        }
      ]
    );
  };

  // Filter plants by selected category
  const filteredPlants = selectedCategory === "All" 
    ? plants 
    : plants.filter(plant => plant.categoryIds.includes(selectedCategory));

  // Get plant categories for display
  const getPlantCategories = (plant: PlantDoc) => {
    return plant.categoryIds.map(catId => {
      const category = categories.find(cat => cat.id === catId);
      return category?.name || "Uncategorized";
    });
  };

  // Plant Placeholder Component
  const PlantPlaceholder = ({ colors }: { colors: any }) => (
    <View style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.accent + "20",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    }}>
      <MaterialIcons name="local-florist" size={24} color={colors.accent} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.primary_background }]}>
      {/* Header Section */}
      <HeaderSection title="Plants" />

      {/* Category Filter Section */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          onPress={() => setSelectedCategory("All")}
          style={[
            styles.categoryPill,
            { 
              backgroundColor: selectedCategory === "All" ? colors.accent + "20" : "transparent",
              borderColor: selectedCategory === "All" ? colors.accent : colors.secondary_text + "10",
            }
          ]}
        >
          <Text style={[
            styles.categoryText,
            { 
              color: selectedCategory === "All" ? colors.accent : colors.secondary_text,
              fontWeight: selectedCategory === "All" ? "600" : "400"
            }
          ]}>
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id!)}
            style={[
              styles.categoryPill,
              { 
                backgroundColor: selectedCategory === category.id ? colors.accent + "20" : "transparent",
                borderColor: selectedCategory === category.id ? colors.accent : colors.secondary_text + "50",
              }
            ]}
          >
            <Text style={[
              styles.categoryText,
              { 
                color: selectedCategory === category.id ? colors.accent : colors.secondary_text,
                fontWeight: selectedCategory === category.id ? "600" : "400"
              }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.secondary_text + "20" }]} />

      {/* Plants List */}
      <ScrollView style={styles.plantsContainer} showsVerticalScrollIndicator={false}>
        {filteredPlants.length === 0 ? (
          // Empty State
          <View style={styles.emptyState}>
            <MaterialIcons name="local-florist" size={64} color={colors.secondary_text + "50"} />
            <Text style={[styles.emptyStateText, { color: colors.secondary_text }]}>
              {selectedCategory === "All" 
                ? "No plants added yet" 
                : `No plants in ${categories.find(cat => cat.id === selectedCategory)?.name || "this category"}`
              }
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.secondary_text + "80" }]}>
              Tap the + button to add your first plant
            </Text>
          </View>
        ) : (
          // Plants List with vertical buttons
          filteredPlants.map((plant) => (
            <View key={plant.id} style={[
              styles.plantCard, 
              { backgroundColor: colors.secondary_background }
            ]}>
              <View style={styles.plantContent}>
                {/* Left side: Image and Info */}
                <TouchableOpacity 
                  style={styles.plantMainContent}
                  onPress={() => handleEditPlant(plant)}
                >
                  {plant.images?.[0] ? (
                    <Image 
                      source={{ uri: plant.images[0] }} 
                      style={styles.plantImage}
                    />
                  ) : (
                    <PlantPlaceholder colors={colors} />
                  )}
                  
                  <View style={styles.plantInfo}>
                    <Text style={[styles.plantName, { color: colors.primary_text }]}>
                      {plant.plantName}
                    </Text>
                    
                    <View style={styles.categoryTags}>
                      {getPlantCategories(plant).map((categoryName, index) => (
                        <Text 
                          key={index} 
                          style={[
                            styles.categoryTag,
                            { color: colors.secondary_text, backgroundColor: colors.secondary_text + "20" }
                          ]}
                        >
                          {categoryName}
                        </Text>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Right side: Action Buttons - Vertical */}
                <View style={styles.actionButtonsVertical}>
                  <TouchableOpacity
                    onPress={() => handleEditPlant(plant)}
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.secondary_text + "20" }
                    ]}
                  >
                    <Feather name="edit-2" size={18} color={colors.secondary_text} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleDeletePlant(plant)}
                    style={[
                      styles.actionButton,
                      { backgroundColor: '#ff4444' + "20", marginTop: 8 }
                    ]}
                  >
                    <Feather name="trash-2" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleOpenPlantForm}
        style={[
          styles.fab,
          { backgroundColor: colors.secondary_text }
        ]}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Plant Form Modal */}
      <AdminPlantForm
        theme={colors}
        visible={isPlantFormVisible}
        onClose={handleClosePlantForm}
        onSave={handleSavePlant}
        editingPlant={editingPlant}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryContainer: {
    maxHeight: 40,
    marginTop: 10,
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  categoryContent: {
    paddingRight: 16,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  plantsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  plantCard: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  plantContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    justifyContent: "space-between",
  },
  plantMainContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  plantImage: {
    width: 80,
    height: 100,
    borderRadius: 12,
    resizeMode: "cover",
    marginRight: 12,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  categoryTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    marginTop: 4,
  },
  actionButtonsVertical: {
    alignItems: "center",
    marginLeft: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});