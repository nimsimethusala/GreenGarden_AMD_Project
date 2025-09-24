import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActionSheetIOS,
  Platform,
  StyleSheet,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLoader } from "@/context/LoaderContext";
import { useTheme } from "@/context/ThemeContext";
import { getAuth, updateEmail, updatePassword } from "firebase/auth";
import { getApp } from "firebase/app";
import { UserProfile } from "@/types/User";
import { getUser, updateUser, removeAvatar } from "@/services/userService";
import HeaderSection from "@/components/section/HeaderSection";

const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    password: "",
    profileImage: "",
  });

  const { showLoader, hideLoader } = useLoader();
  const { colors, currentTheme, toggleTheme } = useTheme();
  const auth = getAuth(getApp());

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        showLoader();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userData = await getUser(currentUser.uid);
        if (userData) {
          setUser(userData);
          setEditForm({
            username: userData.username,
            email: userData.email,
            password: "",
            profileImage: userData.photoURL || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        hideLoader();
      }
    };

    fetchUser();
  }, []);

  // Request permissions
  const requestPermission = async (type: "camera" | "gallery") => {
    if (type === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    }
  };

  // Pick or remove image
  const handlePickImage = async () => {
    const options = ["Take Photo", "Choose from Gallery"];
    if (editForm.profileImage) options.push("Remove Photo");
    options.push("Cancel");

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: editForm.profileImage ? 2 : undefined,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) await pickFromCamera();
          else if (buttonIndex === 1) await pickFromGallery();
          else if (buttonIndex === 2 && editForm.profileImage) handleRemoveImage();
        }
      );
    } else {
      Alert.alert(
        "Profile Image",
        "Choose an option",
        [
          { text: "Take Photo", onPress: pickFromCamera },
          { text: "Choose from Gallery", onPress: pickFromGallery },
          ...(editForm.profileImage ? [{ text: "Remove Photo", onPress: handleRemoveImage }] : []),
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true }
      );
    }
  };

  const pickFromCamera = async () => {
    const granted = await requestPermission("camera");
    if (!granted) return Alert.alert("Permission required", "Please allow camera access");

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setEditForm({ ...editForm, profileImage: result.assets[0].uri });
  };

  const pickFromGallery = async () => {
    const granted = await requestPermission("gallery");
    if (!granted) return Alert.alert("Permission required", "Please allow gallery access");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setEditForm({ ...editForm, profileImage: result.assets[0].uri });
  };

  const handleRemoveImage = async () => {
    if (user?.id) await removeAvatar(user.id);
    setEditForm({ ...editForm, profileImage: "" });
  };

  // Save profile
  const handleSave = async () => {
    if (!editForm.username.trim() || !editForm.email.trim()) {
      return Alert.alert("Error", "Username and email are required");
    }

    try {
      showLoader();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Update Auth email/password
      if (editForm.email !== user?.email) await updateEmail(currentUser, editForm.email);
      if (editForm.password) await updatePassword(currentUser, editForm.password);

      // Update Firestore via userService
      await updateUser(currentUser.uid, {
        username: editForm.username,
        email: editForm.email,
      }, editForm.profileImage || null);

      const updatedUser = await getUser(currentUser.uid);
      if (updatedUser) {
        setUser(updatedUser);
        setIsEditing(false);
        setEditForm({ ...editForm, password: "" });
      }

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      hideLoader();
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        username: user.username,
        email: user.email,
        password: "",
        profileImage: user.photoURL || "",
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => await auth.signOut() },
    ]);
  };

  if (!user) return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.primary_background }]}>
      <Text style={{ color: colors.primary_text }}>Loading profile...</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.primary_background }]}>
      {/* Header Section */}
      <HeaderSection title="Profile" showThemeToggle={true} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card_background }]}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <View style={styles.imageWrapper}>
              {editForm.profileImage ? (
                <Image source={{ uri: editForm.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profilePlaceholder, { backgroundColor: colors.secondary_text + "20" }]}>
                  <MaterialIcons name="person" size={50} color={colors.secondary_text} />
                </View>
              )}
              <TouchableOpacity 
                onPress={handlePickImage} 
                style={[styles.imageEditButton, { backgroundColor: colors.secondary_text }]}
              >
                <Feather name={editForm.profileImage ? "edit-2" : "camera"} size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.username, { color: colors.primary_text }]}>{user.username}</Text>
            <Text style={[styles.userEmail, { color: colors.secondary_text }]}>{user.email}</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={[styles.label, { color: colors.primary_text }]}>Username</Text>
            {!isEditing ? (
              <View style={[styles.readOnlyField, { backgroundColor: colors.secondary_background }]}>
                <Text style={[styles.readOnlyText, { color: colors.primary_text }]}>{user.username}</Text>
              </View>
            ) : (
              <TextInput 
                value={editForm.username} 
                onChangeText={(text) => setEditForm({ ...editForm, username: text })} 
                placeholder="Enter username"
                placeholderTextColor={colors.secondary_text}
                style={[styles.textInput, { 
                  backgroundColor: colors.secondary_background,
                  color: colors.primary_text,
                  borderColor: colors.accent
                }]} 
              />
            )}

            <Text style={[styles.label, { color: colors.primary_text }]}>Email</Text>
            {!isEditing ? (
              <View style={[styles.readOnlyField, { backgroundColor: colors.secondary_background }]}>
                <Text style={[styles.readOnlyText, { color: colors.primary_text }]}>{user.email}</Text>
              </View>
            ) : (
              <TextInput 
                value={editForm.email} 
                onChangeText={(text) => setEditForm({ ...editForm, email: text })} 
                placeholder="Enter email" 
                keyboardType="email-address" 
                autoCapitalize="none"
                placeholderTextColor={colors.secondary_text}
                style={[styles.textInput, { 
                  backgroundColor: colors.secondary_background,
                  color: colors.primary_text,
                  borderColor: colors.accent
                }]} 
              />
            )}

            {isEditing && (
              <>
                <Text style={[styles.label, { color: colors.primary_text }]}>New Password (optional)</Text>
                <TextInput 
                  value={editForm.password} 
                  onChangeText={(text) => setEditForm({ ...editForm, password: text })} 
                  placeholder="Enter new password" 
                  secureTextEntry
                  placeholderTextColor={colors.secondary_text}
                  style={[styles.textInput, { 
                    backgroundColor: colors.secondary_background,
                    color: colors.primary_text,
                    borderColor: colors.accent
                  }]} 
                />
              </>
            )}
          </View>

          {/* Action Buttons */}
          {!isEditing ? (
            <TouchableOpacity 
              onPress={() => setIsEditing(true)} 
              style={[styles.editButton, { backgroundColor: colors.secondary_text }]}
            >
              <Feather name="edit-2" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity 
                onPress={handleCancel} 
                style={[styles.cancelButton, { backgroundColor: colors.secondary_background }]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.secondary_text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSave} 
                style={[styles.saveButton, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout Button */}
        {!isEditing && (
          <View style={styles.logoutContainer}>
            <TouchableOpacity 
              onPress={handleLogout} 
              style={[styles.logoutButton, { 
                backgroundColor: colors.card_background,
                borderColor: '#ff4444'
              }]}
            >
              <Feather name="log-out" size={18} color="#ff4444" style={{ marginRight: 8 }} />
              <Text style={[styles.logoutText, { color: '#ff4444' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePlaceholder: {
    borderRadius: 100,
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  imageEditButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 25,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 8,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  readOnlyField: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  readOnlyText: {
    fontSize: 13,
  },
  textInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  editButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: "center",
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  logoutButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  spacer: {
    height: 20,
  },
});

export default ProfileScreen;