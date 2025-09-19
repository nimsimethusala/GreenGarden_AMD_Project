import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { addCategory, updateCategory } from "@/services/categoryService";
import { CategoryDoc } from "@/types/Category";
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";

export interface CategoryFormProps {
  visible: boolean;
  onClose: () => void;
  editingCategory: CategoryDoc | null;
  currentTheme: "light" | "dark";
}

const CategoryForm: React.FC<CategoryFormProps> = ({visible, onClose, editingCategory, currentTheme }) => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const [name, setName] = useState("");

  // Load category when editing
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
    } else {
      setName("");
    }
  }, [editingCategory, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Category name is required");
      return;
    }

    showLoader();
    try {
      if (editingCategory?.id) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
        });
      } else {
        await addCategory({
          name: name.trim(),
          createdBy: user?.id || "admin",
        });
      }
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
      Alert.alert("Error", "Failed to save category");
    } finally {
      hideLoader();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {editingCategory ? "Edit Category" : "Add Category"}
          </Text>

          <TextInput
            placeholder="Category Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, { backgroundColor: "#d1d5db" }]}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.button, { backgroundColor: "#10b981" }]}
            >
              <Text style={styles.buttonText}>
                {editingCategory ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CategoryForm;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#065f46",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
