import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from "react-native";
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
import { getTabs, saveTabs, BrowserTab } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

export default function TabManagerScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [tabs, setTabs] = useState<BrowserTab[]>([]);

  const loadTabs = useCallback(async () => {
    const loadedTabs = await getTabs();
    setTabs(loadedTabs);
  }, []);

  useEffect(() => {
    loadTabs();
  }, [loadTabs]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton onPress={addNewTab}>
          <Feather name="plus" size={24} color={BrandColors.primary} />
        </HeaderButton>
      ),
    });
  }, [navigation]);

  const addNewTab = async () => {
    const newTab: BrowserTab = {
      id: Date.now().toString(),
      url: "https://www.google.com",
      title: "New Tab",
      isActive: true,
    };
    const updatedTabs = tabs.map((t) => ({ ...t, isActive: false }));
    updatedTabs.push(newTab);
    setTabs(updatedTabs);
    await saveTabs(updatedTabs);
    navigation.goBack();
  };

  const selectTab = async (tabId: string) => {
    const updatedTabs = tabs.map((t) => ({
      ...t,
      isActive: t.id === tabId,
    }));
    setTabs(updatedTabs);
    await saveTabs(updatedTabs);
    navigation.goBack();
  };

  const closeTab = async (tabId: string) => {
    let updatedTabs = tabs.filter((t) => t.id !== tabId);
    if (updatedTabs.length === 0) {
      updatedTabs = [
        {
          id: Date.now().toString(),
          url: "https://www.google.com",
          title: "New Tab",
          isActive: true,
        },
      ];
    } else if (tabs.find((t) => t.id === tabId)?.isActive) {
      updatedTabs[0].isActive = true;
    }
    setTabs(updatedTabs);
    await saveTabs(updatedTabs);
  };

  const closeAllTabs = async () => {
    const newTabs: BrowserTab[] = [
      {
        id: Date.now().toString(),
        url: "https://www.google.com",
        title: "New Tab",
        isActive: true,
      },
    ];
    setTabs(newTabs);
    await saveTabs(newTabs);
  };

  const renderTabCard = ({ item }: { item: BrowserTab }) => (
    <Pressable
      onPress={() => selectTab(item.id)}
      style={({ pressed }) => [
        styles.tabCard,
        {
          backgroundColor: item.isActive ? BrandColors.primary + "20" : theme.backgroundDefault,
          borderColor: item.isActive ? BrandColors.primary : theme.border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.tabCardHeader}>
        <Feather name="globe" size={16} color={theme.textSecondary} />
        <ThemedText numberOfLines={1} style={styles.tabTitle}>
          {item.title}
        </ThemedText>
        <Pressable
          onPress={() => closeTab(item.id)}
          hitSlop={8}
          style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Feather name="x" size={18} color={theme.textSecondary} />
        </Pressable>
      </View>
      <View style={[styles.tabPreview, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="caption" numberOfLines={2} style={{ color: theme.textSecondary }}>
          {item.url}
        </ThemedText>
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="square" size={48} color={theme.textSecondary} />
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        No tabs open
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={tabs}
        keyExtractor={(item) => item.id}
        renderItem={renderTabCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 80 },
        ]}
        ListEmptyComponent={renderEmptyState}
      />
      {tabs.length > 1 ? (
        <View style={[styles.closeAllContainer, { bottom: insets.bottom + Spacing.lg }]}>
          <Pressable
            onPress={closeAllTabs}
            style={({ pressed }) => [
              styles.closeAllButton,
              { backgroundColor: theme.error, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="trash-2" size={18} color="#FFFFFF" />
            <ThemedText style={styles.closeAllText}>Close All Tabs</ThemedText>
          </Pressable>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Spacing.lg,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  tabCard: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
  },
  tabCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  tabTitle: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    padding: 2,
  },
  tabPreview: {
    height: 80,
    borderRadius: BorderRadius.xs,
    padding: Spacing.sm,
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    marginTop: Spacing.md,
  },
  closeAllContainer: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: "center",
  },
  closeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  closeAllText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
