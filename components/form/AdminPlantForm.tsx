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
}

export default function AdminPlantForm({ theme, onClose, onSave, editingPlant }: Props) {
  const [plantName, setPlantName] = useState(editingPlant?.plantName || "");
  const [description, setDescription] = useState(editingPlant?.description || "");
  const [price, setPrice] = useState(editingPlant?.price?.toString() || "");
  const [stock, setStock] = useState(editingPlant?.stock?.toString() || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(editingPlant?.categoryIds || []);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [image, setImage] = useState<string | null>(editingPlant?.images?.[0] || "");
  const [saving, setSaving] = useState(false);

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

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!plantName.trim()) return Alert.alert("Validation", "Plant name is required.");
    if (!price || isNaN(Number(price))) return Alert.alert("Validation", "Price must be a number.");
    if (!stock || isNaN(Number(stock))) return Alert.alert("Validation", "Stock must be a number.");
    if (!image) return Alert.alert("Validation", "Plant image is required.");

    setSaving(true);

    const plantData: Partial<PlantDoc> = {
      plantName: plantName.trim(),
      description,
      price: Number(price),
      stock: Number(stock),
      categoryIds: selectedCategories,
      images: [image],
      createdBy: "admin", // adjust if using actual user
      createdByRole: "admin",
    };

    try {
      if (editingPlant) {
        // update existing
        await updatePlant(editingPlant, plantData);
        onSave({ ...editingPlant, ...plantData } as PlantDoc);
      } else {
        // create new
        await createPlant(plantData);
        // Temporary: generate id using timestamp (replace with Firestore id if needed)
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
    <Modal animationType="slide">
      <View style={{ flex: 1, backgroundColor: theme.secondary_background }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
          <Text style={{ fontSize: 25, fontWeight: "600", color: theme.primary_text }}>
            {editingPlant ? "Edit Plant" : "Add Plant"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color={theme.accent} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Image Picker */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View style={{ position: "relative" }}>
              {image ? (
                <Image source={{ uri: image }} style={{ width: 100, height: 100, borderRadius: 50 }} />
              ) : (
                <View
                  style={{
                    backgroundColor: "#10b98120",
                    borderRadius: 50,
                    width: 100,
                    height: 100,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons name="local-florist" size={50} color="#10b981" />
                </View>
              )}
              <TouchableOpacity
                onPress={handlePickImage}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#10b981",
                  borderRadius: 25,
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#fff",
                }}
              >
                <Feather name={image ? "edit-2" : "camera"} size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Inputs */}
          <TextInput
            placeholder="Plant Name"
            placeholderTextColor={theme.secondary_text}
            value={plantName}
            onChangeText={setPlantName}
            style={{
              borderWidth: 1,
              borderColor: theme.accent,
              marginBottom: 12,
              padding: 10,
              borderRadius: 8,
              color: theme.primary_text,
            }}
          />
          <TextInput
            placeholder="Description"
            placeholderTextColor={theme.secondary_text}
            value={description}
            onChangeText={setDescription}
            multiline
            style={{
              borderWidth: 1,
              borderColor: theme.accent,
              marginBottom: 12,
              padding: 10,
              borderRadius: 8,
              color: theme.primary_text,
              minHeight: 80,
            }}
          />
          <TextInput
            placeholder="Price"
            placeholderTextColor={theme.secondary_text}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: theme.accent,
              marginBottom: 12,
              padding: 10,
              borderRadius: 8,
              color: theme.primary_text,
            }}
          />
          <TextInput
            placeholder="Stock"
            placeholderTextColor={theme.secondary_text}
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: theme.accent,
              marginBottom: 12,
              padding: 10,
              borderRadius: 8,
              color: theme.primary_text,
            }}
          />

          {/* Categories */}
          <Text style={{ color: theme.primary_text, marginBottom: 8 }}>Select Categories</Text>
          {loadingCategories ? (
            <ActivityIndicator size="small" color={theme.accent} style={{ marginBottom: 20 }} />
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
              {categories.map((cat) => {
                const selected = selectedCategories.includes(cat.id!);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => toggleCategory(cat.id!)}
                    style={{
                      borderWidth: 1,
                      borderColor: selected ? theme.accent : theme.secondary_text,
                      backgroundColor: selected ? theme.accent + "20" : "transparent",
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      margin: 4,
                    }}
                  >
                    <Text style={{ color: selected ? theme.accent : theme.secondary_text }}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: theme.accent,
              padding: 14,
              borderRadius: 10,
              alignItems: "center",
              opacity: saving ? 0.6 : 1,
            }}
            disabled={saving}
          >
            <Text style={{ color: theme.icon_accent, fontWeight: "600" }}>
              {saving ? "Saving..." : "Save Plant"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
