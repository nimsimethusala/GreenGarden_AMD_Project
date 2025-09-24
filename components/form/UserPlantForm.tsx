import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
  ScrollView,
  Image,
  ActionSheetIOS,
  Platform,
  Dimensions,
} from "react-native";
import { createPlant, updatePlant } from "@/services/plantService";
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { useTheme } from "@/context/ThemeContext";
import { PlantDoc } from "@/types/Plant";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getAllCategories } from "@/services/categoryService";
import { CategoryDoc } from "@/types/Category";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PlantFormProps {
  visible: boolean;
  onClose: () => void;
  editingPlant?: PlantDoc | null;
}

const PlantForm: React.FC<PlantFormProps> = ({
  visible,
  onClose,
  editingPlant,
}) => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const { colors } = useTheme();
  const isNew = !editingPlant;

  const [plantName, setPlantName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingPlant) {
        setPlantName(editingPlant.plantName);
        setImage(editingPlant.images?.[0] || null);
        setSelectedCategories(editingPlant.categoryIds || []);
      } else {
        setPlantName("");
        setImage(null);
        setSelectedCategories([]);
        setPrice("");
        setStock("");
      }
    }
  }, [visible, editingPlant]);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Sorry, we need camera permissions to make this work!');
        }
      }
    })();
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickFromGallery();
          }
        }
      );
    } else {
      setShowImageSourceModal(true);
    }
  };

  const handleTakePhoto = async () => {
    setShowImageSourceModal(false);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handlePickFromGallery = async () => {
    setShowImageSourceModal(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image from gallery");
    }
  };

  const handleSubmit = async () => {
    if (!plantName.trim()) {
      Alert.alert("Validation", "Plant Name is required");
      return;
    }
    if (!image) {
      Alert.alert("Validation", "Image is required");
      return;
    }
    if (selectedCategories.length === 0) {
      Alert.alert("Validation", "Please select at least one category");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    try {
      showLoader();

      const plantData = {
        plantName: plantName.trim(),
        images: [image],
        categoryIds: selectedCategories,
        createdBy: user.id,
        createdByRole: "user" as "user",
      };

      if (isNew) {
        await createPlant(plantData);
      } else {
        await updatePlant(editingPlant!, plantData);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to save plant");
    } finally {
      hideLoader();
    }
  };

  const PlantPlaceholder = () => (
    <View style={[styles.imagePlaceholder, { backgroundColor: colors.accent + "20" }]}>
      <MaterialIcons name="local-florist" size={40} color={colors.accent} />
    </View>
  );

  return (
    <>
      <Modal transparent visible={visible} animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.primary_background }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.primary_text }]}>
                {isNew ? "Add New Plant" : "Edit Plant"}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.primary_text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Image Picker */}
              <View style={styles.imageSection}>
                <Text style={[styles.sectionLabel, { color: colors.primary_text }]}>
                  Plant Image
                </Text>
                <View style={styles.imageContainer}>
                  <TouchableOpacity onPress={showImagePickerOptions} style={styles.imagePicker}>
                    {image ? (
                      <Image source={{ uri: image }} style={styles.plantImage} />
                    ) : (
                      <PlantPlaceholder />
                    )}
                    <View style={[styles.imageOverlay, { backgroundColor: colors.accent }]}>
                      <Feather name="camera" size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.imageHint, { color: colors.secondary_text }]}>
                  Tap to choose from camera or gallery
                </Text>
              </View>

              {/* Plant Name */}
              <View style={styles.inputSection}>
                <Text style={[styles.sectionLabel, { color: colors.primary_text }]}>
                  Plant Name
                </Text>
                <RNTextInput
                  placeholder="Enter plant name"
                  placeholderTextColor={colors.secondary_text}
                  value={plantName}
                  onChangeText={setPlantName}
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: colors.primary_background,
                      color: colors.primary_text,
                      borderColor: colors.accent
                    }
                  ]}
                />
              </View>

              {/* Categories */}
              <View style={styles.categoriesSection}>
                <Text style={[styles.sectionLabel, { color: colors.primary_text }]}>
                  Categories
                </Text>
                <Text style={[styles.sectionSubLabel, { color: colors.secondary_text }]}>
                  Select one or more categories
                </Text>
                <View style={styles.categoriesContainer}>
                  {categories.map((cat) => {
                    const selected = selectedCategories.includes(cat.id!);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => toggleCategory(cat.id!)}
                        style={[
                          styles.categoryPill,
                          { 
                            backgroundColor: selected ? colors.accent + "20" : colors.secondary_background,
                            borderColor: selected ? colors.accent : colors.secondary_text + "50",
                          }
                        ]}
                      >
                        <Text style={[
                          styles.categoryText,
                          { 
                            color: selected ? colors.accent : colors.secondary_text,
                            fontWeight: selected ? "600" : "400"
                          }
                        ]}>
                          {cat.name}
                        </Text>
                        {selected && (
                          <Feather 
                            name="check" 
                            size={16} 
                            color={colors.accent} 
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitButton, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.submitButtonText}>
                  {isNew ? "Add Plant" : "Update Plant"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image Source Selection Modal for Android */}
      <Modal
        visible={showImageSourceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageSourceModal(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPressOut={() => setShowImageSourceModal(false)}
        >
          <View style={{ backgroundColor: colors.card_background, borderRadius: 12, padding: 20, width: 300 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.primary_text, marginBottom: 16, textAlign: 'center' }}>
              Choose Image Source
            </Text>
            
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8 }}
              onPress={handleTakePhoto}
            >
              <Feather name="camera" size={24} color={colors.accent} />
              <Text style={{ fontSize: 16, color: colors.primary_text, marginLeft: 12 }}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8 }}
              onPress={handlePickFromGallery}
            >
              <Feather name="image" size={24} color={colors.accent} />
              <Text style={{ fontSize: 16, color: colors.primary_text, marginLeft: 12 }}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ padding: 12, borderRadius: 8, marginTop: 8, alignItems: 'center' }}
              onPress={() => setShowImageSourceModal(false)}
            >
              <Text style={{ fontSize: 16, color: colors.secondary_text }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  modalContent: {
    width: screenWidth * 0.9, // Changed from '90%' to numeric value
    maxHeight: screenHeight * 0.8, // Changed from '80%' to numeric value
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  imageSection: {
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
    alignSelf: 'flex-start' as const,
  },
  sectionSubLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  imageContainer: {
    alignItems: 'center' as const,
  },
  imagePicker: {
    position: 'relative' as const,
  },
  plantImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  imageOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 3,
  },
  imageHint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  inputSection: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  categoryPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
  },
  categoryText: {
    fontSize: 14,
  },
  submitButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center' as const,
    marginBottom: 50,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
};

export default PlantForm;