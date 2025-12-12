import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Switch, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import {
  getAdBlockSettings,
  saveAdBlockSettings,
  getBlockedAdsCount,
  AdBlockSettings,
  DEFAULT_ADBLOCK_SETTINGS,
} from "@/lib/storage";

interface ToggleRowProps {
  title: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

function ToggleRow({ title, description, value, onToggle }: ToggleRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() => onToggle(!value)}
      style={[styles.toggleRow, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.toggleContent}>
        <ThemedText type="body" style={styles.toggleTitle}>
          {title}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {description}
        </ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.backgroundSecondary, true: BrandColors.primary }}
        thumbColor="#FFFFFF"
      />
    </Pressable>
  );
}

export default function AdBlockScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [settings, setSettings] = useState<AdBlockSettings>(DEFAULT_ADBLOCK_SETTINGS);
  const [blockedCount, setBlockedCount] = useState(0);
  const [newFilter, setNewFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadSettings = useCallback(async () => {
    const [loaded, count] = await Promise.all([
      getAdBlockSettings(),
      getBlockedAdsCount(),
    ]);
    setSettings(loaded);
    setBlockedCount(count);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = async (key: keyof AdBlockSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveAdBlockSettings(newSettings);
  };

  const addFilter = async () => {
    if (!newFilter.trim()) return;
    const newSettings = {
      ...settings,
      customFilters: [...settings.customFilters, newFilter.trim()],
    };
    setSettings(newSettings);
    await saveAdBlockSettings(newSettings);
    setNewFilter("");
  };

  const removeFilter = async (index: number) => {
    const newSettings = {
      ...settings,
      customFilters: settings.customFilters.filter((_, i) => i !== index),
    };
    setSettings(newSettings);
    await saveAdBlockSettings(newSettings);
  };

  const estimatedDataSaved = (blockedCount * 150).toFixed(0);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: BrandColors.primary + "15" }]}>
            <Feather name="shield" size={24} color={BrandColors.primary} />
            <ThemedText type="h3" style={{ color: BrandColors.primary }}>
              {blockedCount.toLocaleString()}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Ads Blocked
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: BrandColors.secondary + "15" }]}>
            <Feather name="zap" size={24} color={BrandColors.secondary} />
            <ThemedText type="h3" style={{ color: BrandColors.secondary }}>
              {estimatedDataSaved} KB
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Data Saved
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            GENERAL
          </ThemedText>

          <ToggleRow
            title="Enable AdBlock"
            description="Block ads and trackers while browsing"
            value={settings.enabled}
            onToggle={(v) => updateSetting("enabled", v)}
          />

          <ToggleRow
            title="Allow Ads on Homepage"
            description="Show ads on Google and search homepages"
            value={settings.allowHomepageAds}
            onToggle={(v) => updateSetting("allowHomepageAds", v)}
          />
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.sectionHeader, { backgroundColor: theme.backgroundDefault }]}
          >
            <ThemedText type="body" style={styles.toggleTitle}>
              Custom Filter Lists
            </ThemedText>
            <Feather
              name={showFilters ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>

          {showFilters ? (
            <View style={[styles.filtersContainer, { backgroundColor: theme.backgroundDefault }]}>
              <View style={styles.filterInputRow}>
                <TextInput
                  style={[
                    styles.filterInput,
                    { backgroundColor: theme.backgroundSecondary, color: theme.text },
                  ]}
                  value={newFilter}
                  onChangeText={setNewFilter}
                  placeholder="Enter filter pattern (e.g., *.ads.com)"
                  placeholderTextColor={theme.textSecondary}
                  onSubmitEditing={addFilter}
                />
                <Pressable
                  onPress={addFilter}
                  style={({ pressed }) => [
                    styles.addButton,
                    { backgroundColor: BrandColors.primary, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Feather name="plus" size={20} color="#FFFFFF" />
                </Pressable>
              </View>

              {settings.customFilters.length === 0 ? (
                <ThemedText
                  type="caption"
                  style={[styles.emptyFilters, { color: theme.textSecondary }]}
                >
                  No custom filters added
                </ThemedText>
              ) : (
                settings.customFilters.map((filter, index) => (
                  <View
                    key={index}
                    style={[styles.filterItem, { backgroundColor: theme.backgroundSecondary }]}
                  >
                    <ThemedText type="small" style={{ flex: 1 }}>
                      {filter}
                    </ThemedText>
                    <Pressable
                      onPress={() => removeFilter(index)}
                      hitSlop={8}
                      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                    >
                      <Feather name="x" size={18} color={theme.error} />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          ) : null}
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="info" size={20} color={BrandColors.primary} />
          <ThemedText type="caption" style={[styles.infoText, { color: theme.textSecondary }]}>
            AdBlock uses pattern matching to remove ads. Some websites may not function correctly
            with ad blocking enabled. You can add exceptions for specific sites using custom filters.
          </ThemedText>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  toggleContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleTitle: {
    fontWeight: "500",
    marginBottom: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  filtersContainer: {
    padding: Spacing.md,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    marginTop: -Spacing.sm,
  },
  filterInputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterInput: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyFilters: {
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  infoCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
  },
});
