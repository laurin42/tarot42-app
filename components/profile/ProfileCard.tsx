import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/profileCardStyles";

interface ProfileCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  isEmpty?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  title,
  icon,
  children,
  isEmpty = false,
}) => (
  <View style={styles.profileCard}>
    <View style={styles.cardHeader}>
      <Ionicons
        name={icon as any}
        size={20}
        color={isEmpty ? "#9CA3AF" : "#8B5CF6"}
      />
      <Text style={[styles.cardTitle, isEmpty && styles.emptyCardTitle]}>
        {title}
      </Text>
    </View>
    <View style={styles.cardContent}>{children}</View>
  </View>
);
