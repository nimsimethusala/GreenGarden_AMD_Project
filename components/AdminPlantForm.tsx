import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { createPlant, updatePlant } from "@/services/plantService";
import { PlantDoc } from "@/types/Plant";

interface AdminPlantFormProps {
  visible: boolean;
  onClose: () => void;
  editingPlant?: PlantDoc | null;
  currentTheme: "light" | "dark";
}

const AdminPlantForm: React.FC<AdminPlantFormProps> = ({
  visible,
  onClose,
  editingPlant,
  currentTheme,
}) => {
  const isNew = !editingPlant;
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const [plantName, setPlantName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "pending">("public");
  const [image, setImage] = useState<string | null>(null);

  // Reset or prefill form
  useEffect(() => {
    if (visible) {
      if (editingPlant) {
        setPlantName(editingPlant.plantName);
        setDescription(editingPlant.description || "");
        setPrice(editingPlant.price?.toString() || "");
        setStock(editingPlant.stock?.toString() || "");
        setVisibility(editingPlant.visibility || "public");
        setImage(editingPlant.images?.[0] || null);
      } else {
        setPlantName("");
        setDescription("");
        setPrice("");
        setStock("");
        setVisibility("public");
        setImage(null);
      }
    }
  }, [visible, editingPlant]);

  // Image picker
  const handlePickImage = async () => {
    const buttons: { text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }[] = [
        {
        text: "Camera",
        onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            });
            if (!result.canceled) setImage(result.assets[0].uri);
        },
        },
        {
        text: "Gallery",
        onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            });
            if (!result.canceled) setImage(result.assets[0].uri);
        },
        },
    ];

    // Add "Remove" option only if an image is already uploaded
    if (image) {
        buttons.push({
        text: "Remove",
        onPress: () => setImage(null),
        style: "destructive",
        });
    }

    buttons.push({ text: "Cancel", style: "cancel" });

    Alert.alert("Select Image", "Choose an image source", buttons);
  };


  // Submit handler
  const handleSubmit = async () => {
    if (!plantName.trim()) return Alert.alert("Validation", "Plant name is required");
    if (!price.trim() || isNaN(Number(price)))
      return Alert.alert("Validation", "Valid price is required");
    if (!stock.trim() || isNaN(Number(stock)))
      return Alert.alert("Validation", "Valid stock is required");
    if (!image) return Alert.alert("Validation", "Image is required");

    try {
      showLoader();

      const payload: Partial<PlantDoc> = {
        plantName,
        description,
        price: Number(price),
        stock: Number(stock),
        visibility,
        images: [image],
        createdBy: user?.id || "",
        createdByRole: "admin",
      };

      if (isNew) {
        await createPlant(payload);
      } else {
        await updatePlant(editingPlant!, payload);
      }

      onClose();
    } catch (err) {
      console.log("Error saving plant:", err);
      Alert.alert("Error", `Failed to ${isNew ? "create" : "update"} plant`);
    } finally {
      hideLoader();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, width: "90%", maxHeight: "90%" }}>
          {/* Close */}
          <TouchableOpacity onPress={onClose} style={{ alignSelf: "flex-end" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>X</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Image Upload */}
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

            {/* Plant Name */}
            <TextInput
              placeholder="Name"
              placeholderTextColor={currentTheme === "light" ? "#0a7a2b" : "#74f7d5"}
              value={plantName}
              onChangeText={setPlantName}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: currentTheme === "light" ? "#0a7a2b" : "#74f7d5",
                marginTop: 20,
                paddingVertical: 6,
                color: currentTheme === "light" ? "#000" : "#fff",
              }}
            />

            {/* Description */}
            <TextInput
              placeholder="Description"
              placeholderTextColor={currentTheme === "light" ? "#0a7a2b" : "#74f7d5"}
              value={description}
              onChangeText={setDescription}
              multiline
              style={{
                borderBottomWidth: 1,
                borderBottomColor: currentTheme === "light" ? "#0a7a2b" : "#74f7d5",
                marginTop: 20,
                paddingVertical: 6,
                color: currentTheme === "light" ? "#000" : "#fff",
              }}
            />

            {/* Price */}
            <TextInput
              placeholder="Price"
              keyboardType="numeric"
              placeholderTextColor={currentTheme === "light" ? "#0a7a2b" : "#74f7d5"}
              value={price}
              onChangeText={setPrice}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: currentTheme === "light" ? "#0a7a2b" : "#74f7d5",
                marginTop: 20,
                paddingVertical: 6,
                color: currentTheme === "light" ? "#000" : "#fff",
              }}
            />

            {/* Stock */}
            <TextInput
              placeholder="Stock"
              keyboardType="numeric"
              placeholderTextColor={currentTheme === "light" ? "#0a7a2b" : "#74f7d5"}
              value={stock}
              onChangeText={setStock}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: currentTheme === "light" ? "#0a7a2b" : "#74f7d5",
                marginTop: 20,
                paddingVertical: 6,
                color: currentTheme === "light" ? "#000" : "#fff",
              }}
            />

            {/* Visibility */}
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#065f46", marginBottom: 8 }}>
                Visibility
              </Text>
              {(["public", "private", "pending"] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setVisibility(opt)}
                  style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: visibility === opt ? "#10b981" : "#d1d5db",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    {visibility === opt && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#10b981" }} />}
                  </View>
                  <Text style={{ fontSize: 16, color: "#374151" }}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={{
                marginTop: 30,
                backgroundColor: "#10b981",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
                {isNew ? "Add Plant" : "Update Plant"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AdminPlantForm;
