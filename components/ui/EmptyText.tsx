import React from "react";
import { Text } from "react-native";
import { styles } from "../../styles/profileScreen";

interface EmptyTextProps {
  text: string;
}

export const EmptyText = ({ text }: EmptyTextProps) => <Text>{text}</Text>;
