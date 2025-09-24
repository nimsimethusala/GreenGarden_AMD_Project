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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase"; 
import { PlantDoc } from "@/types/Plant";
import { createPlant, updatePlant } from "@/services/plantService";

export interface CategoryDoc {
  id?: string;
  name: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Props {
  theme: any;
  onClose: () => void;
  onSave: (plant: PlantDoc) => void;
  editingPlant: PlantDoc | null;
  visible: boolean;
}

// Default theme as fallback
const defaultTheme = {
  background: "#f0fdf4",
  card: "#fff",
  textPrimary: "#065f46",
  textSecondary: "#4b5563",
  accent: "#10b981",
  icon: "#fff",
};

export default function AdminPlantForm({ theme, onClose, onSave, editingPlant, visible }: Props) {
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
        <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
          {/* Header */}
          <View style={{ 
            flexDirection: "row", 
            justifyContent: "space-between", 
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.accent + '20'
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: "600", 
              color: currentTheme.textPrimary 
            }}>
              {editingPlant ? "Edit Plant" : "Add New Plant"}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Feather name="x" size={24} color={currentTheme.accent} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Image Picker */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: "600", 
                color: currentTheme.textPrimary,
                marginBottom: 12,
                alignSelf: "flex-start"
              }}>
                Plant Image
              </Text>
              <View style={{ position: "relative" }}>
                {image ? (
                  <Image source={{ uri: image }} style={{ 
                    width: 120, 
                    height: 120, 
                    borderRadius: 60 
                  }} />
                ) : (
                  <View
                    style={{
                      backgroundColor: currentTheme.accent + '20',
                      borderRadius: 60,
                      width: 120,
                      height: 120,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="local-florist" size={50} color={currentTheme.accent} />
                  </View>
                )}
                <TouchableOpacity
                  onPress={showImagePickerOptions}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: currentTheme.accent,
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: currentTheme.background,
                  }}
                >
                  <Feather name={image ? "edit-2" : "camera"} size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Plant Details */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: "600", 
                color: currentTheme.textPrimary,
                marginBottom: 12
              }}>
                Plant Details
              </Text>
              
              <TextInput
                placeholder="Plant Name"
                placeholderTextColor={currentTheme.textSecondary}
                value={plantName}
                onChangeText={setPlantName}
                style={{
                  borderWidth: 1,
                  borderColor: currentTheme.accent,
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  backgroundColor: currentTheme.card,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Categories */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: "600", 
                color: currentTheme.textPrimary,
                marginBottom: 4
              }}>
                Categories
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: currentTheme.textSecondary,
                marginBottom: 12
              }}>
                Select one or more categories
              </Text>
              
              {loadingCategories ? (
                <ActivityIndicator size="small" color={currentTheme.accent} style={{ marginBottom: 20 }} />
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {categories.map((cat) => {
                    const selected = selectedCategories.includes(cat.id!);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => toggleCategory(cat.id!)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: selected ? currentTheme.accent : currentTheme.textSecondary,
                          backgroundColor: selected ? currentTheme.accent + "20" : "transparent",
                          borderRadius: 20,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          margin: 4,
                        }}
                      >
                        <Text style={{ 
                          color: selected ? currentTheme.accent : currentTheme.textSecondary,
                          fontSize: 14,
                          fontWeight: "500"
                        }}>
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
              style={{
                backgroundColor: currentTheme.accent,
                padding: 16,
                borderRadius: 10,
                alignItems: "center",
                opacity: saving ? 0.6 : 1,
              }}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ 
                  color: "#fff", 
                  fontSize: 16, 
                  fontWeight: "600" 
                }}>
                  {editingPlant ? "Update Plant" : "Add Plant"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
          <View style={{ backgroundColor: currentTheme.card, borderRadius: 12, padding: 20, width: 300 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: currentTheme.textPrimary, marginBottom: 16, textAlign: 'center' }}>
              Choose Image Source
            </Text>
            
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8 }}
              onPress={handleTakePhoto}
            >
              <Feather name="camera" size={24} color={currentTheme.accent} />
              <Text style={{ fontSize: 16, color: currentTheme.textPrimary, marginLeft: 12 }}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8 }}
              onPress={handlePickFromGallery}
            >
              <Feather name="image" size={24} color={currentTheme.accent} />
              <Text style={{ fontSize: 16, color: currentTheme.textPrimary, marginLeft: 12 }}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ padding: 12, borderRadius: 8, marginTop: 8, alignItems: 'center' }}
              onPress={() => setShowImageSourceModal(false)}
            >
              <Text style={{ fontSize: 16, color: currentTheme.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}