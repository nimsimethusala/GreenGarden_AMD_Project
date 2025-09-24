import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { PlantDoc } from "@/types/Plant";
import { subscribeAllPlants, toggleFavorite } from "@/services/plantService";
import HeaderSection from "@/components/section/HeaderSection";
import FavoriteSection from "@/components/section/FavoriteSection";

const HomePage = () => {
  const { user } = useAuth();
  const { colors, currentTheme, toggleTheme } = useTheme();
  const router = useRouter();
  const [favoritePlants, setFavoritePlants] = useState<PlantDoc[]>([]);
  const [allPlants, setAllPlants] = useState<PlantDoc[]>([]);

  // Subscribe to all plants (both admin and user plants)
  useEffect(() => {
    const unsubscribe = subscribeAllPlants(
      (plants) => {
        setAllPlants(plants);
        
        // Filter only favorite plants from all available plants
        const favorites = plants
          .filter(plant => plant.isFavorite === true)
          .slice(0, 10);
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
      
      // Update local state immediately for better UX
      setAllPlants(prevPlants => 
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

  const handleSeeMore = () => {
    router.push("/favorite" as any);
  };

  const handleSeePlants = () => {
    router.push("/my-plants" as any);
  };

  const handlePlantPress = (plant: PlantDoc) => {
    // Navigate to plant details page
    router.push({
      pathname: "/plant-details",
      params: { plantId: plant.id }
    } as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary_background }]}>
      {/* Fixed Header */}
      <HeaderSection 
        title="Home"
        showThemeToggle={true}
      />
      
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Message */}
        <ImageBackground
          source={colors.backgroundImage}
          style={{ height: 120, marginHorizontal: 10, borderRadius: 12, overflow: "hidden", marginTop: 10 }}
          resizeMode="cover"
        >
          <View style={[  styles.welcomeSection, { backgroundColor: colors.secondary_background + "85" }]}>
            <Text style={[styles.welcomeTitle, { color: colors.secondary_text }]}>
              Welcome{user ? `, ${user.username}` : ''}!
            </Text>
          </View>
        </ImageBackground>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary_text }]}>
            My Garden Stats
          </Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card_background }]}>
              <Text style={[styles.statNumber, { color: colors.accent }]}>
                {allPlants.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondary_text }]}>
                Total Plants
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card_background }]}>
              <Text style={[styles.statNumber, { color: colors.accent }]}>
                {favoritePlants.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondary_text }]}>
                Favorites
              </Text>
            </View>
          </View>
        </View>

        {/* Favorite Plants Section */}
        <FavoriteSection/>

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
  welcomeSection: {
    flex: 1, 
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
    height: "100%",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  welcomeTitle: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: "400",
  },
  section: {
    marginTop: 36,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 22,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: "600",
  },
  comingSoon: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 15,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  spacer: {
    height: 20,
  },
});

export default HomePage;