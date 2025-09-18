import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@/context/ThemeContext";

type Props = {
  onImagePicked: (fileBlob: Blob | null, uri?: string | null) => void;
  initialUri?: string | null;
  size?: number;
};

export default function ProfileImagePicker({
  onImagePicked,
  initialUri = null,
  size = 110,
}: Props) {
  const { currentTheme } = useTheme();
  const [localUri, setLocalUri] = useState<string | null>(initialUri);
  const [loading, setLoading] = useState(false);

  const askPermissions = async () => {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (camera.status !== "granted" || media.status !== "granted") {
      Alert.alert(
        "Permissions required",
        "Camera and gallery permissions are required."
      );
      return false;
    }
    return true;
  };

  const pickFromGallery = async () => {
    const ok = await askPermissions();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      await handlePickedUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const ok = await askPermissions();
    if (!ok) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      await handlePickedUri(result.assets[0].uri);
    }
  };

  const handlePickedUri = async (uri: string) => {
    try {
      setLoading(true);
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const blob = await (await fetch(manipResult.uri)).blob();

      setLocalUri(manipResult.uri);
      onImagePicked(blob, manipResult.uri);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not process image.");
      onImagePicked(null, null);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setLocalUri(null);
    onImagePicked(null, null);
  };

  const openPickerOptions = () => {
    Alert.alert("Choose Option", "", [
      { text: "Camera", onPress: takePhoto },
      { text: "Gallery", onPress: pickFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      {/* Profile Circle */}
      <TouchableOpacity
        onPress={openPickerOptions}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: currentTheme === "light" ? "rgba(10, 122, 43, 0.3)" : "rgba(7, 184, 137, 0.3)",
          borderWidth: currentTheme === "light" ? 0 : 1,
          borderColor: currentTheme === "light" ? "transparent" : "rgba(7, 184, 137, 0.3)",
        }}
      >
        {loading ? (
          <ActivityIndicator color={currentTheme === "light" ? "#000" : "#fff"} />
        ) : localUri ? (
          <Image
            source={{ uri: localUri }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Icon
            name="camera-alt"
            size={34}
            color={currentTheme === "light" ? "#0a7a2b" : "#07b889"}
          />
        )}
      </TouchableOpacity>

      {/* Remove Option */}
      {localUri && (
        <TouchableOpacity
          onPress={removeImage}
          style={{
            marginTop: 8,
            backgroundColor:
              currentTheme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: currentTheme === "light" ? "red" : "#ff6b6b",
              fontWeight: "600",
            }}
          >
            Remove
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
