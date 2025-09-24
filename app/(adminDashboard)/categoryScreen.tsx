import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { useTheme } from "@/context/ThemeContext";
import {
  getAllCategories,
  deleteCategory,
} from "@/services/categoryService";
import { CategoryDoc } from "@/types/Category";
import CategoryForm from "@/components/form/CategoryForm";
import HeaderSection from "@/components/section/HeaderSection";

const CategoryScreen = () => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const { colors, currentTheme, toggleTheme } = useTheme();

  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDoc | null>(
    null
  );

  // Load categories
  const loadCategories = async () => {
    showLoader();
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      Alert.alert("Error", "Failed to load categories");
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
    <View style={[styles.card, { backgroundColor: colors.card_background }]}>
      <View style={styles.cardContent}>
        <MaterialIcons name="category" size={24} color={colors.accent} style={styles.categoryIcon} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.primary_text }]}>
            {item.name}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          onPress={() => handleEdit(item)} 
          style={[styles.actionButton, { backgroundColor: colors.secondary_text + "20" }]}
        >
          <Feather name="edit-2" size={18} color={colors.secondary_text} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDelete(item.id!)} 
          style={[styles.actionButton, { backgroundColor: '#ff4444' + "20", marginLeft: 8 }]}
        >
          <Feather name="trash-2" size={18} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.primary_background }]}>
      {/* Header Section */}
      <HeaderSection title="Categories" showThemeToggle={true} />
      
      {/* Categories Count */}
      <View style={styles.countContainer}>
        <Text style={[styles.countText, { color: colors.secondary_text }]}>
          {categories.length} {categories.length === 1 ? 'category' : 'categories'} total
        </Text>
      </View>

      {/* Categories List */}
      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="category" size={80} color={colors.secondary_text + "50"} />
          <Text style={[styles.emptyTitle, { color: colors.primary_text }]}>
            No Categories Yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.secondary_text }]}>
            Start by adding your first category to organize plants
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id!}
          renderItem={renderCategoryCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.secondary_text }]}
        onPress={() => {
          setEditingCategory(null);
          setIsFormVisible(true);
        }}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Category Form Modal */}
      <CategoryForm
        visible={isFormVisible}
        onClose={() => {
          setIsFormVisible(false);
          setEditingCategory(null);
          loadCategories();
        }}
        editingCategory={editingCategory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  cardActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    opacity: 0.8,
  },
  fab: {
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
});

export default CategoryScreen;