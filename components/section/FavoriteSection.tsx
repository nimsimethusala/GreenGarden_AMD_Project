import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { PlantDoc } from "@/types/Plant";
import { subscribeAllPlants, toggleFavorite } from "@/services/plantService";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function FavoriteScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [plants, setPlants] = useState<PlantDoc[]>([]);
  const [favoritePlants, setFavoritePlants] = useState<PlantDoc[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeAllPlants(
      (plantsData) => {
        setPlants(plantsData);
        // Filter favorite plants directly from all plants
        const favorites = plantsData.filter((plant) => plant.isFavorite === true);
        setFavoritePlants(favorites);
      },
      (error) => {
        console.error("Error fetching plants:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleToggleFavorite = async (plant: PlantDoc) => {
    if (!user?.id) return;
    
    try {
      const currentFavoriteStatus = plant.isFavorite || false;
      await toggleFavorite(user.id, plant, !currentFavoriteStatus);
      
      // Update local state immediately
      setFavoritePlants(prev => 
        currentFavoriteStatus 
          ? prev.filter(p => p.id !== plant.id)
          : [...prev, { ...plant, isFavorite: true }]
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const PlantPlaceholder = () => (
    <View style={[styles.imagePlaceholder, { backgroundColor: colors.accent + "20" }]}>
      <MaterialIcons name="local-florist" size={28} color={colors.accent} />
    </View>
  );

  const renderPlantCard = ({ item }: { item: PlantDoc }) => (
    <View style={[styles.card, { backgroundColor: colors.card_background }]}>
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      ) : (
        <PlantPlaceholder />
      )}
      
      <View style={styles.plantInfo}>
        <Text style={[styles.plantName, { color: colors.primary_text }]}>
          {item.plantName}
        </Text>
        <Text style={[styles.plantDetails, { color: colors.secondary_text }]}>
          {item.categoryIds?.length > 0 ? `${item.categoryIds.length} categories` : 'No categories'}
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={() => handleToggleFavorite(item)}
        style={[styles.favoriteButton, { backgroundColor: colors.accent + "20" }]}
      >
        <Feather 
          name="heart" 
          size={20} 
          color={colors.accent} 
          fill={colors.accent}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.primary_background }]}>
      {/* Header Section without theme toggle */}
      {/* <HeaderSection title="Favorite Plants" showThemeToggle={false} /> */}
      <Text style={[styles.headerTitle, { color: colors.primary_text, fontSize: 24, fontWeight: "700", padding: 20 }]}>Favorite Plants</Text>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {favoritePlants.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="local-florist" size={80} color={colors.secondary_text + "50"} />
            <Text style={[styles.emptyStateTitle, { color: colors.primary_text }]}>
              No Favorite Plants Yet
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.secondary_text }]}>
              Plants you mark as favorite will appear here
            </Text>
            <TouchableOpacity 
              style={[styles.exploreButton, { backgroundColor: colors.accent }]}
              onPress={() => {/* Navigate to plants page */}}
            >
              <Text style={styles.exploreButtonText}>Explore Plants</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={[styles.favoritesCount, { color: colors.secondary_text }]}>
              {favoritePlants.length} {favoritePlants.length === 1 ? 'plant' : 'plants'} in favorites
            </Text>
            
            <FlatList
              data={favoritePlants}
              keyExtractor={(item) => item.id!}
              renderItem={renderPlantCard}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  favoritesCount: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  plantInfo: {
    flex: 1,
    justifyContent: "center",
  },
  plantName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  plantDetails: {
    fontSize: 14,
    marginBottom: 8,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  exploreButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});