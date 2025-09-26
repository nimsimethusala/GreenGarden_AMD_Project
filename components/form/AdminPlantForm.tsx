// components/AdminPlantForm.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase"; 
import { PlantDoc } from "@/types/Plant";
import { createPlant, updatePlant } from "@/services/plantService";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface CategoryDoc {
  id?: string;
  name: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Props {
  theme: any;
  visible: boolean;
  onClose: () => void;
  onSave: (plant: PlantDoc) => void;
  editingPlant: PlantDoc | null;
}

// Default theme as fallback
const defaultTheme = {
  primary_background: "#f0fdf4",
  secondary_background: "#fff",
  primary_text: "#065f46",
  secondary_text: "#4b5563",
  accent: "#10b981",
  card_background: "#fff",
};

export default function AdminPlantForm({ theme, visible, onClose, onSave, editingPlant }: Props) {
  const currentTheme = theme || defaultTheme;
  
  const [plantName, setPlantName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [image, setImage] = useState<string | null>("");
  const [saving, setSaving] = useState(false);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);

  // Reset form when modal becomes visible or editingPlant changes
  useEffect(() => {
    if (visible) {
      setPlantName(editingPlant?.plantName || "");
      setSelectedCategories(editingPlant?.categoryIds || []);
      setImage(editingPlant?.images?.[0] || "");
    }
  }, [visible, editingPlant]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        const data: CategoryDoc[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as CategoryDoc),
        }));
        setCategories(data);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

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

  const handleSave = async () => {
    if (!plantName.trim()) return Alert.alert("Validation", "Plant name is required.");
    if (!image) return Alert.alert("Validation", "Plant image is required.");
    if (selectedCategories.length === 0) 
      return Alert.alert("Validation", "Please select at least one category.");

    setSaving(true);

    const plantData: Partial<PlantDoc> = {
      plantName: plantName.trim(),
      categoryIds: selectedCategories,
      images: [image],
      createdBy: "admin",
      createdByRole: "admin",
    };

    try {
      if (editingPlant) {
        await updatePlant(editingPlant, plantData);
        onSave({ ...editingPlant, ...plantData } as PlantDoc);
      } else {
        await createPlant(plantData);
        onSave({ ...plantData, id: Date.now().toString() } as PlantDoc);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to save plant.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal 
        animationType="slide" 
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={{ flex: 1, backgroundColor: currentTheme.primary_background }}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: currentTheme.accent + '20' }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.primary_text }]}>
              {editingPlant ? "Edit Plant" : "Add New Plant"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={currentTheme.accent} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Image Picker */}
            <View style={styles.imageSection}>
              <Text style={[styles.sectionLabel, { color: currentTheme.primary_text }]}>
                Plant Image
              </Text>
              <View style={{ position: "relative" }}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.plantImage} />
                ) : (
                  <View
                    style={[
                      styles.imagePlaceholder,
                      { backgroundColor: currentTheme.accent + '20' }
                    ]}
                  >
                    <MaterialIcons name="local-florist" size={50} color={currentTheme.accent} />
                  </View>
                )}
                <TouchableOpacity
                  onPress={showImagePickerOptions}
                  style={[
                    styles.imageOverlay,
                    { backgroundColor: currentTheme.accent, borderColor: currentTheme.primary_background }
                  ]}
                >
                  <Feather name={image ? "edit-2" : "camera"} size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Plant Details */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionLabel, { color: currentTheme.primary_text }]}>
                Plant Details
              </Text>
              
              <TextInput
                placeholder="Plant Name"
                placeholderTextColor={currentTheme.secondary_text}
                value={plantName}
                onChangeText={setPlantName}
                style={[
                  styles.textInput,
                  { 
                    borderColor: currentTheme.accent,
                    color: currentTheme.primary_text,
                    backgroundColor: currentTheme.secondary_background,
                  }
                ]}
              />
            </View>

            {/* Categories */}
            <View style={styles.categoriesSection}>
              <Text style={[styles.sectionLabel, { color: currentTheme.primary_text }]}>
                Categories
              </Text>
              <Text style={[styles.sectionSubLabel, { color: currentTheme.secondary_text }]}>
                Select one or more categories
              </Text>
              
              {loadingCategories ? (
                <ActivityIndicator size="small" color={currentTheme.accent} style={{ marginBottom: 20 }} />
              ) : (
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
                            borderColor: selected ? currentTheme.accent : currentTheme.secondary_text,
                            backgroundColor: selected ? currentTheme.accent + "20" : "transparent",
                          }
                        ]}
                      >
                        <Text style={[
                          styles.categoryText,
                          { 
                            color: selected ? currentTheme.accent : currentTheme.secondary_text,
                          }
                        ]}>
                          {cat.name}
                        </Text>
                        {selected && (
                          <Feather 
                            name="check" 
                            size={16} 
                            color={currentTheme.accent} 
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.submitButton,
                { 
                  backgroundColor: currentTheme.accent,
                  opacity: saving ? 0.6 : 1,
                }
              ]}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingPlant ? "Update Plant" : "Add Plant"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Image Source Selection Modal for Android - FIXED VERSION */}
      <Modal
        visible={showImageSourceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageSourceModal(false)}
      >
        <View style={styles.androidModalContainer}>
          {/* Background overlay that closes the modal */}
          <TouchableOpacity 
            style={styles.androidModalBackground}
            activeOpacity={1}
            onPress={() => setShowImageSourceModal(false)}
          />
          
          {/* Modal content - this won't trigger the background press */}
          <View style={[styles.androidModalContent, { backgroundColor: currentTheme.card_background }]}>
            <Text style={[styles.androidModalTitle, { color: currentTheme.primary_text }]}>
              Choose Image Source
            </Text>
            
            <TouchableOpacity 
              style={styles.androidModalOption}
              onPress={handleTakePhoto}
            >
              <Feather name="camera" size={24} color={currentTheme.accent} />
              <Text style={[styles.androidModalOptionText, { color: currentTheme.primary_text }]}>
                Take Photo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.androidModalOption}
              onPress={handlePickFromGallery}
            >
              <Feather name="image" size={24} color={currentTheme.accent} />
              <Text style={[styles.androidModalOptionText, { color: currentTheme.primary_text }]}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.androidModalCancel, { borderTopColor: currentTheme.secondary_text + '20' }]}
              onPress={() => setShowImageSourceModal(false)}
            >
              <Text style={[styles.androidModalCancelText, { color: currentTheme.secondary_text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = {
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  imageSection: {
    alignItems: "center" as const,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
    alignSelf: "flex-start" as const,
  },
  sectionSubLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  plantImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    borderRadius: 60,
    width: 120,
    height: 120,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  imageOverlay: {
    position: "absolute" as const,
    bottom: 0,
    right: 0,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 3,
  },
  inputSection: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
  },
  categoryPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  submitButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center" as const,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  // Android Modal Styles
  androidModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  androidModalBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  androidModalContent: {
    borderRadius: 12,
    padding: 20,
    width: 300,
    margin: 20,
  },
  androidModalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  androidModalOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  androidModalOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  androidModalCancel: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginTop: 8,
    borderTopWidth: 1,
  },
  androidModalCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
};