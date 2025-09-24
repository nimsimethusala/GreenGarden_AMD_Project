import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { CategoryDoc } from "@/types/Category";

interface CategorySectionProps {
  categories: CategoryDoc[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary_background }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Categories Button */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            { 
              backgroundColor: selectedCategory === "All" 
                ? colors.accent 
                : colors.secondary_background,
              borderColor: colors.accent,
            }
          ]}
          onPress={() => onCategorySelect("All")}
        >
          <Text style={[
            styles.categoryText,
            { 
              color: selectedCategory === "All" 
                ? colors.primary_background 
                : colors.primary_text 
            }
          ]}>
            All
          </Text>
        </TouchableOpacity>

        {/* Dynamic Categories from Firebase */}
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              { 
                backgroundColor: selectedCategory === category.name 
                  ? colors.accent 
                  : colors.secondary_background,
                borderColor: colors.accent,
              }
            ]}
            onPress={() => onCategorySelect(category.name)}
          >
            <Text style={[
              styles.categoryText,
              { 
                color: selectedCategory === category.name 
                  ? colors.primary_background 
                  : colors.primary_text 
              }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CategorySection;