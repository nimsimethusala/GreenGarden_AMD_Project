import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import {
  getAllCategories,
  deleteCategory,
} from "@/services/categoryService";
import { CategoryDoc } from "@/types/Category";
import CategoryForm from "@/components/form/CategoryForm";

const CategoryScreen = () => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDoc | null>(
    null
  );
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  // Load categories
  const loadCategories = async () => {
    showLoader();
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEdit = (category: CategoryDoc) => {
    setEditingCategory(category);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this category?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          showLoader();
          try {
            await deleteCategory(id);
            loadCategories();
          } catch (err) {
            console.error("Delete failed:", err);
            Alert.alert("Error", "Failed to delete category");
          } finally {
            hideLoader();
          }
        },
      },
    ]);
  };

  const renderCategoryCard = ({ item }: { item: CategoryDoc }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: currentTheme === "light" ? "#fff" : "#374151" },
      ]}
    >
      <Text
        style={[
          styles.cardTitle,
          { color: currentTheme === "light" ? "#065f46" : "#d1fae5" },
        ]}
      >
        {item.name}
      </Text>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
          <Feather name="edit-2" size={20} color="#fbbf24" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id!)} style={styles.iconButton}>
          <Feather name="trash-2" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme === "light" ? "#f0fdf4" : "#1f2937" },
      ]}
    >

    {/* Screen Header */}
    <View style={styles.headerWrapper}>
        <Text
            style={[
            styles.header,
            { color: currentTheme === "light" ? "#065f46" : "#d1fae5" },
            ]}
        >
            Manage Categories
        </Text>
    </View>

    {/* Theme Toggle Button */}
    <View style={styles.toggleWrapper}>
        <TouchableOpacity
            style={styles.themeToggle}
            onPress={() =>
            setCurrentTheme(currentTheme === "light" ? "dark" : "light")
            }
        >
            {currentTheme === "light" ? (
            <Feather name="moon" size={22} color="#374151" />
            ) : (
            <Feather name="sun" size={22} color="#fbbf24" />
            )}
        </TouchableOpacity>
    </View>


      <FlatList
        data={categories}
        keyExtractor={(item) => item.id!}
        renderItem={renderCategoryCard}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingCategory(null);
          setIsFormVisible(true);
        }}
      >
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <CategoryForm
        visible={isFormVisible}
        onClose={() => {
          setIsFormVisible(false);
          loadCategories();
        }}
        editingCategory={editingCategory}
        currentTheme={currentTheme}
      />
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headerWrapper: {
    marginVertical: 30,
    marginHorizontal: 10,
    alignItems: "center", // center text horizontally
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
  },
  toggleWrapper: {
    position: "absolute",
    top: 30,
    right: 20,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  card: {
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 12,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#10b981",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});
