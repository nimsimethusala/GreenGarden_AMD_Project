import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
} from "react-native";
import { createPlant, updatePlant } from "@/services/plantService";
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { PlantDoc } from "@/types/Plant";
import PlantImagePicker from "./PlantImagePicker";

interface PlantFormProps {
  visible: boolean;
  onClose: () => void;
  editingPlant?: PlantDoc | null;
  currentTheme: "light" | "dark";
}

const PlantForm: React.FC<PlantFormProps> = ({
  visible,
  onClose,
  editingPlant,
  currentTheme,
}) => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const isNew = !editingPlant;

  const [plantName, setPlantName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const isAdmin = user?.role === "admin"; // check role

  useEffect(() => {
    if (visible) {
      if (editingPlant) {
        setPlantName(editingPlant.plantName);
        setDescription(editingPlant.description || "");
        setImage(editingPlant.images?.[0] || null);
      } else {
        setPlantName("");
        setDescription("");
        setImage(null);
      }
    }
  }, [visible, editingPlant]);

  const handleSubmit = async () => {
    if (!plantName.trim()) {
      Alert.alert("Validation", "Plant Name is required");
      return;
    }
    if (!image) {
      Alert.alert("Validation", "Image is required");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    try {
      showLoader();

      if (isNew) {
        await createPlant({
          plantName,
          description: isAdmin ? description : undefined,
          images: [image],
          createdBy: user.id,
          createdByRole: isAdmin ? "admin" : "user",
        });
      } else {
        await updatePlant(user.id, editingPlant!.id!, {
          plantName,
          description: isAdmin ? description : undefined,
          images: [image],
          createdByRole: isAdmin ? "admin" : "user",
        });
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to save plant");
    } finally {
      hideLoader();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "90%",
            backgroundColor: currentTheme === "light" ? "#fff" : "#111",
            borderRadius: 16,
            padding: 20,
          }}
        >
          {/* Close button */}
          <TouchableOpacity onPress={onClose} style={{ alignSelf: "flex-end" }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: currentTheme === "light" ? "#000" : "#fff",
              }}
            >
              X
            </Text>
          </TouchableOpacity>

          {/* Image Picker */}
          <View style={{ alignItems: "center", marginVertical: 16 }}>
            <PlantImagePicker
              initialUri={image}
              size={150}
              onImagePicked={(_, uri) => setImage(uri || null)}
            />
          </View>

          {/* Plant Name */}
          <RNTextInput
            placeholder="Plant Name"
            placeholderTextColor={
              currentTheme === "light" ? "#0a7a2b" : "#c3f7ef"
            }
            value={plantName}
            onChangeText={setPlantName}
            style={{
              borderBottomWidth: 1,
              borderBottomColor:
                currentTheme === "light" ? "#0a7a2b" : "#c3f7ef",
              marginBottom: 16,
              color: currentTheme === "light" ? "#000" : "#fff",
              paddingVertical: 6,
            }}
          />

          {/* Description (only admin can see & edit) */}
          {isAdmin && (
            <RNTextInput
              placeholder="Description"
              placeholderTextColor={
                currentTheme === "light" ? "#0a7a2b" : "#c3f7ef"
              }
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{
                borderBottomWidth: 1,
                borderBottomColor:
                  currentTheme === "light" ? "#0a7a2b" : "#c3f7ef",
                marginBottom: 16,
                color: currentTheme === "light" ? "#000" : "#fff",
                paddingVertical: 6,
              }}
            />
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: "#10b981",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16 }}>
              {isNew ? "Add Plant" : "Update Plant"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PlantForm;