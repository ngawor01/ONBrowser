import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, SectionList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getHistory, saveHistory, HistoryItem, getTabs, saveTabs } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HistorySection {
  title: string;
  data: HistoryItem[];
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [sections, setSections] = useState<HistorySection[]>([]);

  const loadHistory = useCallback(async () => {
    const history = await getHistory();
    const grouped = groupByDate(history);
    setSections(grouped);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton onPress={clearHistory}>
          <Feather name="trash-2" size={20} color={theme.error} />
        </HeaderButton>
      ),
    });
  }, [navigation, theme.error]);

  const groupByDate = (items: HistoryItem[]): HistorySection[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const grouped: Record<string, HistoryItem[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Earlier: [],
    };

    items.forEach((item) => {
      const date = new Date(item.visitedAt);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) {
        grouped.Today.push(item);
      } else if (date.getTime() === yesterday.getTime()) {
        grouped.Yesterday.push(item);
      } else if (date >= lastWeek) {
        grouped["This Week"].push(item);
      } else {
        grouped.Earlier.push(item);
      }
    });

    return Object.entries(grouped)
      .filter(([_, data]) => data.length > 0)
      .map(([title, data]) => ({ title, data }));
  };

  const openHistoryItem = async (url: string) => {
    const tabs = await getTabs();
    const updatedTabs = tabs.map((t) => ({
      ...t,
      isActive: false,
    }));
    updatedTabs.push({
      id: Date.now().toString(),
      url,
      title: "Loading...",
      isActive: true,
    });
    await saveTabs(updatedTabs);
    navigation.goBack();
  };

  const deleteHistoryItem = async (id: string) => {
    const history = await getHistory();
    const newHistory = history.filter((h) => h.id !== id);
    await saveHistory(newHistory);
    setSections(groupByDate(newHistory));
  };

  const clearHistory = async () => {
    await saveHistory([]);
    setSections([]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <Pressable
      onPress={() => openHistoryItem(item.url)}
      style={({ pressed }) => [
        styles.historyItem,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.historyIcon, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name="globe" size={18} color={theme.textSecondary} />
      </View>
      <View style={styles.historyContent}>
        <ThemedText type="body" numberOfLines={1} style={styles.historyTitle}>
          {item.title}
        </ThemedText>
        <ThemedText type="caption" numberOfLines={1} style={{ color: theme.textSecondary }}>
          {item.url}
        </ThemedText>
      </View>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
        {formatTime(item.visitedAt)}
      </ThemedText>
      <Pressable
        onPress={() => deleteHistoryItem(item.id)}
        hitSlop={8}
        style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Feather name="x" size={18} color={theme.textSecondary} />
      </Pressable>
    </Pressable>
  );

  const renderSectionHeader = ({ section }: { section: HistorySection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.backgroundRoot }]}>
      <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: "600" }}>
        {section.title}
      </ThemedText>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { borderColor: theme.textSecondary }]}>
        <Feather name="clock" size={40} color={theme.textSecondary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        No Browsing History
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        Your recently visited pages will appear here
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {sections.length === 0 ? (
        renderEmptyState()
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          stickySectionHeadersEnabled
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  historyContent: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  historyTitle: {
    fontWeight: "500",
    marginBottom: 2,
  },
  deleteButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
});
