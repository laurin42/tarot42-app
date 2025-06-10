import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/profileCardStyles";
import type { ComponentProps } from "react";

type IoniconName = ComponentProps<typeof Ionicons>["name"] | string;

interface ProfileCardProps {
  title: string;
  icon: IoniconName;
  children: React.ReactNode;
  isEmpty?: boolean;
}

export const ProfileCard = ({
  title,
  icon,
  children,
  isEmpty = false,
}: ProfileCardProps) => (
  <View style={styles.profileCard}>
    <View style={styles.cardHeader}>
      <Ionicons
        name={icon as ComponentProps<typeof Ionicons>["name"]}
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
