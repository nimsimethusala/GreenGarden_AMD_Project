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
import { Feather } from "@expo/vector-icons";
import { addCategory, updateCategory } from "@/services/categoryService";
import { CategoryDoc } from "@/types/Category";
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { useTheme } from "@/context/ThemeContext";

export interface CategoryFormProps {
  visible: boolean;
  onClose: () => void;
  editingCategory: CategoryDoc | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ visible, onClose, editingCategory }) => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const { colors } = useTheme();

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
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card_background }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.title, { color: colors.primary_text }]}>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.primary_text} />
            </TouchableOpacity>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.primary_text }]}>
              Category Name
            </Text>
            <TextInput
              placeholder="Enter category name"
              placeholderTextColor={colors.secondary_text}
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                { 
                  backgroundColor: colors.secondary_background,
                  color: colors.primary_text,
                  borderColor: colors.accent
                }
              ]}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelButton, { backgroundColor: colors.secondary_background }]}
            >
              <Text style={[styles.cancelButtonText, { color: colors.secondary_text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.saveButtonText}>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});