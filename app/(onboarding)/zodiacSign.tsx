import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Svg, Path, G } from "react-native-svg";
import { FontAwesome } from "@expo/vector-icons";
import { authClient } from "../../lib/auth-client";
import { useFonts } from "expo-font";

const ZODIAC_DATA = [
  { key: "aries", name: "Aries", icon: "fire" },
  { key: "taurus", name: "Taurus", icon: "leaf" },
  { key: "gemini", name: "Gemini", icon: "comments-o" },
  { key: "cancer", name: "Cancer", icon: "moon-o" },
  { key: "leo", name: "Leo", icon: "sun-o" },
  { key: "virgo", name: "Virgo", icon: "pagelines" },
  { key: "libra", name: "Libra", icon: "balance-scale" },
  { key: "scorpio", name: "Scorpio", icon: "bolt" },
  { key: "sagittarius", name: "Sagittarius", icon: "send-o" },
  { key: "capricorn", name: "Capricorn", icon: "diamond" },
  { key: "aquarius", name: "Aquarius", icon: "lightbulb-o" },
  { key: "pisces", name: "Pisces", icon: "tint" },
] as const;

// Define a type for the zodiac sign keys
type ZodiacSignKey = (typeof ZODIAC_DATA)[number]["key"];

const SLICE_STYLE = {
  fill: "#2C2C54",
  stroke: "#4B4B8C",
  strokeWidth: 2,
};
const SELECTED_SLICE_STYLE = {
  fill: "#7A7AE8",
  stroke: "#4B4B8C",
  strokeWidth: 2,
};
const ICON_COLOR = "#D4D4FF";
const SELECTED_ICON_COLOR = "#FFFFFF";
const TEXT_COLOR = "#D4D4FF";
const SELECTED_TEXT_COLOR = "#FFFFFF";

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const d = [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    cx,
    cy,
    "Z",
  ].join(" ");
  return d;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export default function ZodiacSignScreen() {
  const router = useRouter();
  const [selectedSignKey, setSelectedSignKey] = useState<
    ZodiacSignKey | undefined
  >(undefined);

  const [fontsLoaded, fontError] = useFonts({
    FontAwesome: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf"),
  });

  useEffect(() => {
    if (fontError) {
      console.error("[ZodiacSignScreen] Font loading error:", fontError);
    }
  }, [fontError]);

  console.log("[ZodiacSignScreen] FontAwesome family:", "FontAwesome");

  const { data: sessionData, isPending: isSessionStillLoading } =
    authClient.useSession();

  // Add a state for screen width to handle potential orientation changes if needed, though not strictly necessary for initial load.
  // For simplicity, we'll calculate it once initially.
  const screenWidth = Dimensions.get("window").width;

  useFocusEffect(
    React.useCallback(() => {
      console.log("ZodiacSignScreen focused (First Screen - SVG Wheel)");
      if (!isSessionStillLoading && !sessionData?.user) {
        router.replace("/(auth)/sign-in");
      }
    }, [sessionData, isSessionStillLoading, router])
  );

  const handleNext = () => {
    if (!selectedSignKey) {
      Alert.alert("Bitte wähle dein Sternzeichen aus.");
      return;
    }
    const selectedSignObject = ZODIAC_DATA.find(
      (s) => s.key === selectedSignKey
    );
    console.log(
      `[ZodiacSignScreen] Navigating to element selection with zodiac: ${selectedSignObject?.name}`
    );
    // Typed navigation params
    router.push({
      pathname: "/(onboarding)/element",
      params: { zodiacSign: selectedSignObject?.name || "" }, // Ensure param is always a string
    });
  };

  const handleSkip = () => {
    // Typed navigation params
    router.push({
      pathname: "/(onboarding)/element",
      params: { zodiacSign: "" },
    });
  };

  if (isSessionStillLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A5ACD" />
        <Text style={styles.loadingText}>
          {isSessionStillLoading
            ? "Lade Sitzungsdaten..."
            : "Lade Schriftarten..."}
        </Text>
      </View>
    );
  }

  // Responsive sizing
  const wheelDiameter = screenWidth * 0.85; // Use 85% of screen width for the wheel diameter
  const wheelRadius = wheelDiameter / 2;
  const centerSvg = wheelRadius; // SVG viewBox will be 0 0 diameter diameter, G is translated by radius,radius
  const centerTextOverlay = wheelDiameter / 2; // Center for absolute text positioning

  // Adjust icon and label radius based on the new wheelRadius
  const iconRadius = wheelRadius * 0.75; // Adjusted from 0.8
  const textLabelRadius = wheelRadius * 0.55; // Adjusted from 0.6

  const sliceAngle = 360 / ZODIAC_DATA.length;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <Text style={styles.progressText}>Schritt 1/3</Text>
      </View>
      <Text style={styles.title}>Dein Sternzeichen</Text>
      <Text style={styles.subtitle}>
        Tippe auf ein Symbol im Kreis, um dein Sternzeichen zu wählen.
      </Text>

      <View
        style={[
          styles.wheelContainer,
          { width: wheelDiameter, height: wheelDiameter },
        ]}
      >
        <Svg
          height={wheelDiameter}
          width={wheelDiameter}
          viewBox={`0 0 ${wheelDiameter} ${wheelDiameter}`}
        >
          <G x={centerSvg} y={centerSvg}>
            {ZODIAC_DATA.map((sign, index) => {
              const startAngle = index * sliceAngle;
              const endAngle = (index + 1) * sliceAngle;
              const isSelected = selectedSignKey === sign.key;

              const arcPath = describeArc(
                0,
                0,
                wheelRadius,
                startAngle,
                endAngle - 1
              );

              return (
                <G key={sign.key}>
                  <Path
                    d={arcPath}
                    fill={
                      isSelected ? SELECTED_SLICE_STYLE.fill : SLICE_STYLE.fill
                    }
                    stroke={
                      isSelected
                        ? SELECTED_SLICE_STYLE.stroke
                        : SLICE_STYLE.stroke
                    }
                    strokeWidth={
                      isSelected
                        ? SELECTED_SLICE_STYLE.strokeWidth
                        : SLICE_STYLE.strokeWidth
                    }
                  />
                </G>
              );
            })}
          </G>
        </Svg>

        {/* Overlay TouchableOpacity for interaction, and React Native Text for Icons and Labels */}
        {ZODIAC_DATA.map((sign, index) => {
          const angle = index * sliceAngle + sliceAngle / 2;

          // Center of the slice for positioning the TouchableOpacity
          // We'll use a circular touch area around the icon position for simplicity
          const touchableCenterPos = polarToCartesian(
            centerTextOverlay,
            centerTextOverlay,
            iconRadius,
            angle
          );
          const touchableRadius = wheelRadius * 0.25; // Make this a bit generous, e.g., 25% of wheel radius

          const iconPos = polarToCartesian(
            centerTextOverlay,
            centerTextOverlay,
            iconRadius,
            angle
          );
          const labelPos = polarToCartesian(
            centerTextOverlay,
            centerTextOverlay,
            textLabelRadius,
            angle
          );

          const iconFontSize = wheelRadius * 0.15;
          const labelFontSize = wheelRadius * 0.08;

          const iconCode =
            FontAwesome.glyphMap[
              sign.icon as keyof typeof FontAwesome.glyphMap
            ];
          const iconCharacter =
            typeof iconCode === "number" ? String.fromCharCode(iconCode) : "?";

          if (typeof iconCode !== "number") {
            console.warn(
              `[ZodiacSignScreen] Glyph for icon '${sign.icon}' is not a number:`,
              iconCode
            );
          }

          return (
            <TouchableOpacity
              key={`touchable-${sign.key}`}
              style={{
                position: "absolute",
                left: touchableCenterPos.x - touchableRadius, // Center the touchable area
                top: touchableCenterPos.y - touchableRadius,
                width: touchableRadius * 2,
                height: touchableRadius * 2,
                borderRadius: touchableRadius, // Make it circular
                // backgroundColor: 'rgba(255,0,0,0.2)', // For debugging touch area
                alignItems: "center", // To help center content if needed, though icon/text are also absolute
                justifyContent: "center",
              }}
              onPress={() => {
                console.log(
                  `[ZodiacSignScreen] TouchableOpacity for ${sign.key} pressed`
                );
                setSelectedSignKey(sign.key);
              }}
            >
              {/* Icon and Text are now children, but still absolutely positioned relative to wheelContainer */}
              {/* So their own positioning logic needs to be relative to the main wheelContainer still, not the TouchableOpacity */}
              <Text
                style={{
                  position: "absolute", // Still absolute to the wheelContainer
                  left:
                    iconPos.x -
                    iconFontSize / 2 -
                    (touchableCenterPos.x - touchableRadius), // Adjust relative to TouchableOpacity's corner
                  top:
                    iconPos.y -
                    iconFontSize / 2 -
                    (touchableCenterPos.y - touchableRadius),
                  fontFamily: "FontAwesome",
                  fontSize: iconFontSize,
                  color:
                    selectedSignKey === sign.key
                      ? SELECTED_ICON_COLOR
                      : ICON_COLOR,
                  textAlign: "center",
                }}
              >
                {iconCharacter}
              </Text>
              <Text
                style={{
                  position: "absolute", // Still absolute to the wheelContainer
                  left:
                    labelPos.x -
                    sign.name.length * labelFontSize * 0.35 -
                    (touchableCenterPos.x - touchableRadius),
                  top:
                    labelPos.y -
                    labelFontSize / 2 -
                    (touchableCenterPos.y - touchableRadius),
                  fontSize: labelFontSize,
                  color:
                    selectedSignKey === sign.key
                      ? SELECTED_TEXT_COLOR
                      : TEXT_COLOR,
                  textAlign: "center",
                }}
              >
                {sign.name.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          onPress={handleSkip}
          style={[styles.button, styles.skipButton]}
        >
          <Text style={styles.buttonText}>Überspringen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.button, styles.nextButton]}
          disabled={!selectedSignKey}
        >
          <Text style={styles.buttonText}>Weiter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  progressBarContainer: ViewStyle;
  progressText: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  wheelContainer: ViewStyle;
  navigationButtons: ViewStyle;
  button: ViewStyle;
  skipButton: ViewStyle;
  nextButton: ViewStyle;
  buttonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: "#1A1A2E",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
  },
  loadingText: {
    color: "#E0E0E0",
    marginTop: 10,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressText: {
    color: "#E0E0E0",
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#AEAEAE",
    marginBottom: 20, // Reduced margin slightly
    textAlign: "center",
  },
  wheelContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20, // Reduced margin slightly
    // width and height are now set dynamically via inline style
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    position: "absolute",
    bottom: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  skipButton: {
    backgroundColor: "#4A403D",
  },
  nextButton: {
    backgroundColor: "#6A5ACD",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
