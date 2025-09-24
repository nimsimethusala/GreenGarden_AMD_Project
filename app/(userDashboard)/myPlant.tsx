import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { useTheme } from "@/context/ThemeContext";
import { deletePlant, subscribeUserPlants } from "@/services/plantService";
import { PlantDoc } from "@/types/Plant";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import PlantForm from "@/components/form/UserPlantForm";
import HeaderSection from "@/components/section/HeaderSection";
import { getAllCategories } from "@/services/categoryService";
import { CategoryDoc } from "@/types/Category";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PlantScreen = () => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const { colors } = useTheme();

  const [plants, setPlants] = useState<PlantDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PlantDoc[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingPlant, setEditingPlant] = useState<PlantDoc | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<PlantDoc | null>(null);

  // Load user plants and categories
  useEffect(() => {
    if (!user?.id) return;
    
    showLoader();
    
    // Subscribe to user plants
    const unsub = subscribeUserPlants(
      user.id,
      (data) => {
        setPlants(data);
        setFilteredPlants(data);
      },
      (error) => {
        console.error("Error loading plants:", error);
        hideLoader();
      }
    );

    // Load categories
    const loadCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        hideLoader();
      }
    };

    loadCategories();

    return () => unsub();
  }, [user]);

  // Filter by search
  useEffect(() => {
    let data = plants;
    if (searchText.trim() !== "") {
      data = data.filter((p) =>
        p.plantName.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredPlants(data);
  }, [searchText, plants]);

  // Get category names by IDs
  const getCategoryNames = (categoryIds: string[]): string => {
    if (!categoryIds || categoryIds.length === 0) return "Uncategorized";
    
    const categoryNames = categoryIds.map(catId => {
      const category = categories.find(cat => cat.id === catId);
      return category ? category.name : "Unknown";
    });
    
    return categoryNames.join(" | ");
  };

  // Open plant detail modal
  const handlePlantPress = (plant: PlantDoc) => {
    setSelectedPlant(plant);
    setIsDetailModalVisible(true);
  };

  // Edit plant
  const handleEdit = (plant: PlantDoc) => {
    setEditingPlant(plant);
    setIsFormVisible(true);
  };

  // Delete plant
  const handleDelete = async (plant: PlantDoc) => {
    if (!user?.id) return;
    if (plant.createdBy !== user.id) {
      return Alert.alert("Error", "You can only delete your own plants.");
    }

    Alert.alert(
      "Delete Plant",
      `Are you sure you want to delete "${plant.plantName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            showLoader();
            try {
              await deletePlant(plant);
            } catch (err) {
              console.log("Delete failed:", err);
              Alert.alert("Error", "Failed to delete plant.");
            } finally {
              hideLoader();
            }
          },
        },
      ]
    );
  };

  // Close detail modal
  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedPlant(null);
  };

  // Plant Placeholder Component
  const PlantPlaceholder = ({ size = 70 }: { size?: number }) => (
    <View style={[
      styles.imagePlaceholder, 
      { 
        backgroundColor: colors.accent + "20",
        width: size,
        height: size,
        borderRadius: size / 6,
      }
    ]}>
      <MaterialIcons name="local-florist" size={size / 3} color={colors.accent} />
    </View>
  );

  // Render plant card
  const renderPlantCard = (item: PlantDoc) => (
    <TouchableOpacity 
      key={item.id} 
      style={[styles.plantCard, { backgroundColor: colors.card_background }]}
      onPress={() => handlePlantPress(item)}
    >
      {/* Plant Image */}
      <View style={styles.imageContainer}>
        {item.images?.[0] ? (
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.plantImage}
            resizeMode="cover"
          />
        ) : (
          <PlantPlaceholder />
        )}
      </View>

      {/* Plant Info */}
      <View style={styles.plantInfo}>
        <Text style={[styles.plantName, { color: colors.primary_text }]} numberOfLines={1}>
          {item.plantName}
        </Text>
        <Text style={[styles.plantCategory, { color: colors.secondary_text }]} numberOfLines={1}>
          {getCategoryNames(item.categoryIds || [])}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.secondary_text + "20" }]}
          onPress={() => handleEdit(item)}
        >
          <Feather name="edit-2" size={18} color={colors.secondary_text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#ff4444' + "20", marginTop: 8 }]}
          onPress={() => handleDelete(item)}
        >
          <Feather name="trash-2" size={18} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Plant Detail Modal
  const PlantDetailModal = () => {
    if (!selectedPlant) return null;

    return (
      <Modal
        visible={isDetailModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card_background }]}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeDetailModal}
            >
              <Feather name="x" size={24} color={colors.primary_text} />
            </TouchableOpacity>

            {/* Plant Image */}
            <View style={styles.modalImageContainer}>
              {selectedPlant.images?.[0] ? (
                <Image 
                  source={{ uri: selectedPlant.images[0] }} 
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              ) : (
                <PlantPlaceholder size={120} />
              )}
            </View>

            {/* Plant Details */}
            <View style={styles.modalDetails}>
              <Text style={[styles.modalPlantName, { color: colors.primary_text }]}>
                {selectedPlant.plantName}
              </Text>
              
              <View style={styles.detailRow}>
                <Feather name="tag" size={16} color={colors.secondary_text} />
                <Text style={[styles.detailText, { color: colors.secondary_text }]}>
                  {getCategoryNames(selectedPlant.categoryIds || [])}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Feather name="user" size={16} color={colors.secondary_text} />
                <Text style={[styles.detailText, { color: colors.secondary_text }]}>
                  Added by: {selectedPlant.createdBy === user?.id ? "You" : selectedPlant.createdBy}
                </Text>
              </View>

              {selectedPlant.createdAt && (
                <View style={styles.detailRow}>
                  <Feather name="calendar" size={16} color={colors.secondary_text} />
                  <Text style={[styles.detailText, { color: colors.secondary_text }]}>
                    Added on: {new Date(selectedPlant.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalActionButton, { backgroundColor: colors.accent + "20" }]}
                onPress={() => {
                  closeDetailModal();
                  handleEdit(selectedPlant);
                }}
              >
                <Feather name="edit-2" size={18} color={colors.accent} />
                <Text style={[styles.modalActionText, { color: colors.accent }]}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalActionButton, { backgroundColor: '#ff4444' + "20" }]}
                onPress={() => {
                  closeDetailModal();
                  handleDelete(selectedPlant);
                }}
              >
                <Feather name="trash-2" size={18} color="#ff4444" />
                <Text style={[styles.modalActionText, { color: '#ff4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary_background }]}>
      {/* Header Section */}
      <HeaderSection title="My Plants" showThemeToggle={true} />
      
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search plants..."
            placeholderTextColor={colors.secondary_text}
            value={searchText}
            onChangeText={setSearchText}
            style={[
              styles.searchInput,
              { 
                backgroundColor: colors.secondary_background,
                color: colors.primary_text,
              }
            ]}
          />
          <Feather name="search" size={20} color={colors.secondary_text} style={styles.searchIcon} />
        </View>

        {/* Plants Count */}
        <View style={styles.plantsCountContainer}>
          <Text style={[styles.plantsCount, { color: colors.secondary_text }]}>
            {filteredPlants.length} {filteredPlants.length === 1 ? 'plant' : 'plants'} found
            {searchText && ` for "${searchText}"`}
          </Text>
        </View>

        {/* Plants List */}
        <View style={styles.plantsContainer}>
          {filteredPlants.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="local-florist" size={80} color={colors.secondary_text + "50"} />
              <Text style={[styles.emptyTitle, { color: colors.primary_text }]}>
                {searchText ? "No Plants Found" : "No Plants Added Yet"}
              </Text>
              <Text style={[styles.emptyText, { color: colors.secondary_text }]}>
                {searchText 
                  ? `No plants found matching "${searchText}"`
                  : "Start by adding your first plant"
                }
              </Text>
            </View>
          ) : (
            filteredPlants.map((item) => renderPlantCard(item))
          )}
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.secondary_text }]}
        onPress={() => {
          setEditingPlant(null);
          setIsFormVisible(true);
        }}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Plant Form */}
      <PlantForm
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        editingPlant={editingPlant}
      />

      {/* Plant Detail Modal */}
      <PlantDetailModal />
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
  searchContainer: {
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  searchInput: {
    borderRadius: 12,
    padding: 12,
    paddingLeft: 45,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    top: 14,
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
    gap: 16,
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
  imageContainer: {
    marginRight: 16,
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
  },
  plantName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  plantCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  actionButtons: {
    alignItems: "center",
    marginLeft: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  spacer: {
    height: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    padding: 4,
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  modalDetails: {
    marginBottom: 20,
  },
  modalPlantName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default PlantScreen;