import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getBookmarks, saveBookmarks, Bookmark, getTabs, saveTabs } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const loadBookmarks = useCallback(async () => {
    const loaded = await getBookmarks();
    setBookmarks(loaded);
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const openBookmark = async (url: string) => {
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

  const deleteBookmark = async (id: string) => {
    const newBookmarks = bookmarks.filter((b) => b.id !== id);
    setBookmarks(newBookmarks);
    await saveBookmarks(newBookmarks);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderBookmarkItem = ({ item }: { item: Bookmark }) => (
    <Pressable
      onPress={() => openBookmark(item.url)}
      style={({ pressed }) => [
        styles.bookmarkItem,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.bookmarkIcon, { backgroundColor: BrandColors.primary + "20" }]}>
        <Feather name="bookmark" size={18} color={BrandColors.primary} />
      </View>
      <View style={styles.bookmarkContent}>
        <ThemedText type="body" numberOfLines={1} style={styles.bookmarkTitle}>
          {item.title}
        </ThemedText>
        <ThemedText type="caption" numberOfLines={1} style={{ color: theme.textSecondary }}>
          {item.url}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {formatDate(item.createdAt)}
        </ThemedText>
      </View>
      <Pressable
        onPress={() => deleteBookmark(item.id)}
        hitSlop={8}
        style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Feather name="trash-2" size={18} color={theme.error} />
      </Pressable>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { borderColor: theme.textSecondary }]}>
        <Feather name="star" size={40} color={theme.textSecondary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        No Bookmarks Yet
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        Save your favorite pages for quick access
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookmarkItem}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + Spacing.xl },
          bookmarks.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmptyState}
      />
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
  emptyList: {
    flex: 1,
  },
  bookmarkItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  bookmarkIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  bookmarkTitle: {
    fontWeight: "500",
    marginBottom: 2,
  },
  deleteButton: {
    padding: Spacing.sm,
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
