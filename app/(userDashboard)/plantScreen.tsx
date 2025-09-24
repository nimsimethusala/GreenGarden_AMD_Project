import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { subscribeAllPlants, toggleFavorite } from "@/services/plantService";
import { PlantDoc } from "@/types/Plant";
import { getAllCategories } from "@/services/categoryService";
import { CategoryDoc } from "@/types/Category";
import HeaderSection from "@/components/section/HeaderSection";
import CategorySection from "@/components/section/CategorySection";

const PlantsPage = () => {
  const { colors, currentTheme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [plants, setPlants] = useState<PlantDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filteredPlants, setFilteredPlants] = useState<PlantDoc[]>([]);

  // Fetch all plants (both admin and user plants)
  useEffect(() => {
    const unsubscribe = subscribeAllPlants(
      (plantsData) => {
        setPlants(plantsData);
      },
      (error) => {
        console.error("Error fetching plants:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    loadCategories();
  }, []);

  // Filter plants by category using categoryIds
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredPlants(plants);
    } else {
      // Find the selected category ID
      const selectedCat = categories.find(cat => 
        cat.name.toLowerCase() === selectedCategory.toLowerCase()
      );
      
      if (selectedCat) {
        const filtered = plants.filter(plant => 
          plant.categoryIds?.includes(selectedCat.id!)
        );
        setFilteredPlants(filtered);
      } else {
        setFilteredPlants([]);
      }
    }
  }, [plants, categories, selectedCategory]);

  // Get category name by ID
  const getCategoryName = (categoryIds: string[]): string => {
    if (!categoryIds || categoryIds.length === 0) return "Uncategorized";
    
    const categoryNames = categoryIds.map(catId => {
      const category = categories.find(cat => cat.id === catId);
      return category ? category.name : "Unknown";
    });
    
    return categoryNames.join(" | ");
  };

  const handleToggleFavorite = async (plant: PlantDoc) => {
    if (!user?.id) return;
    
    try {
      const currentFavoriteStatus = plant.isFavorite || false;
      await toggleFavorite(user.id, plant, !currentFavoriteStatus);
      
      // Update local state immediately for better UX
      setPlants(prevPlants => 
        prevPlants.map(p => 
          p.id === plant.id 
            ? { ...p, isFavorite: !currentFavoriteStatus }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Plant Placeholder Component
  const PlantPlaceholder = () => (
    <View style={[styles.plantImage, styles.imagePlaceholder, { backgroundColor: colors.accent + "20" }]}>
      <MaterialIcons name="local-florist" size={24} color={colors.accent} />
    </View>
  );

  // Plant Card Component
  const PlantCard = ({ plant }: { plant: PlantDoc }) => (
    <View style={[styles.plantCard, { backgroundColor: colors.card_background }]}>
      {plant.images?.[0] ? (
        <Image 
          source={{ uri: plant.images[0] }} 
          style={styles.plantImage}
          resizeMode="cover"
        />
      ) : (
        <PlantPlaceholder />
      )}
      
      <View style={styles.plantInfo}>
        <Text style={[styles.plantName, { color: colors.primary_text }]} numberOfLines={1}>
          {plant.plantName}
        </Text>
        <Text style={[styles.plantType, { color: colors.secondary_text }]} numberOfLines={1}>
          {getCategoryName(plant.categoryIds || [])}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.favoriteButton,
          { 
            backgroundColor: plant.isFavorite 
              ? colors.accent + "20" 
              : colors.secondary_background + "50" 
          }
        ]}
        onPress={() => handleToggleFavorite(plant)}
      >
        <MaterialIcons 
          name={plant.isFavorite ? "favorite" : "favorite-border"} 
          size={20} 
          color={plant.isFavorite ? colors.secondary_text : colors.secondary_text} 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.primary_background }]}>
      {/* Fixed Header */}
      <HeaderSection title="All Plants" showThemeToggle={true} />
      
      {/* Category Filter Section */}
      <CategorySection 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        // colors={colors}
      />
      
      {/* Plants Count */}
      <View style={styles.plantsCountContainer}>
        <Text style={[styles.plantsCount, { color: colors.secondary_text }]}>
          {filteredPlants.length} {filteredPlants.length === 1 ? 'plant' : 'plants'} found
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.plantsContainer}>
          {filteredPlants.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="local-florist" size={80} color={colors.secondary_text + "50"} />
              <Text style={[styles.emptyTitle, { color: colors.primary_text }]}>
                {selectedCategory === "All" 
                  ? "No Plants Available"
                  : `No Plants in ${selectedCategory}`
                }
              </Text>
              <Text style={[styles.emptyText, { color: colors.secondary_text }]}>
                {selectedCategory === "All" 
                  ? "Plants will appear here once they are added to the system."
                  : `There are no plants in the ${selectedCategory} category yet.`
                }
              </Text>
            </View>
          ) : (
            filteredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))
          )}
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  plantsCountContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  plantsCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  plantsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  plantCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  plantInfo: {
    flex: 1,
    marginLeft: 16,
  },
  plantName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  plantType: {
    fontSize: 14,
    marginBottom: 8,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  spacer: {
    height: 20,
  },
  themeToggle: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});

export default PlantsPage;