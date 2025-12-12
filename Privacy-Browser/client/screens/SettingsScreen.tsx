import React from "react";
import { View, StyleSheet, Pressable, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingsItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
}

function SettingsItem({ icon, title, subtitle, onPress, iconColor }: SettingsItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsItem,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor || BrandColors.primary }]}>
        <Feather name={icon} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.itemContent}>
        <ThemedText type="body" style={styles.itemTitle}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h3">ON Browser</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Privacy-First Mobile Browser
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            PRIVACY & SECURITY
          </ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: theme.backgroundDefault }]}>
            <SettingsItem
              icon="shield"
              title="Privacy Suite"
              subtitle="Fingerprint protection, WebRTC blocking"
              onPress={() => navigation.navigate("PrivacySuite")}
              iconColor={BrandColors.secondary}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SettingsItem
              icon="filter"
              title="AdBlock Settings"
              subtitle="Manage ad blocking preferences"
              onPress={() => navigation.navigate("AdBlock")}
              iconColor={BrandColors.primary}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SettingsItem
              icon="code"
              title="UserScripts"
              subtitle="Manage custom JavaScript scripts"
              onPress={() => navigation.navigate("UserScripts")}
              iconColor="#9C27B0"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            BROWSING
          </ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: theme.backgroundDefault }]}>
            <SettingsItem
              icon="bookmark"
              title="Bookmarks"
              subtitle="Saved pages"
              onPress={() => navigation.navigate("Bookmarks")}
              iconColor="#FF9800"
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SettingsItem
              icon="clock"
              title="History"
              subtitle="Recently visited pages"
              onPress={() => navigation.navigate("History")}
              iconColor="#607D8B"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
            ON Browser v1.0.0
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Built with privacy in mind
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  sectionContent: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemTitle: {
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginLeft: 60,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
});
