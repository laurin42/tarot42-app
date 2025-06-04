import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles/profileScreen";

interface ProfileInfoRowProps {
  label: string;
  value: string;
}

export const ProfileInfoRow: React.FC<ProfileInfoRowProps> = ({
  label,
  value,
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);
