import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  getTabs,
  saveTabs,
  BrowserTab,
  getPrivacySettings,
  getAdBlockSettings,
  saveHistory,
  getHistory,
  getBookmarks,
  saveBookmarks,
  PrivacySettings,
  AdBlockSettings,
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_ADBLOCK_SETTINGS,
  getRandomUserAgent,
  savePrivacySettings,
} from "@/lib/storage";
import { generatePrivacyScript, generateAdBlockScript } from "@/lib/privacy-scripts";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BrowserScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const webViewRef = useRef<WebView>(null);

  const [tabs, setTabs] = useState<BrowserTab[]>([]);
  const [currentUrl, setCurrentUrl] = useState("https://www.google.com");
  const [inputUrl, setInputUrl] = useState("");
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [isSecure, setIsSecure] = useState(true);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [adBlockSettings, setAdBlockSettings] = useState<AdBlockSettings>(DEFAULT_ADBLOCK_SETTINGS);
  const [activeProtections, setActiveProtections] = useState(0);
  const [isUrlFocused, setIsUrlFocused] = useState(false);

  const loadSettings = useCallback(async () => {
    const [loadedTabs, privacy, adblock] = await Promise.all([
      getTabs(),
      getPrivacySettings(),
      getAdBlockSettings(),
    ]);

    setTabs(loadedTabs);
    const activeTab = loadedTabs.find((t) => t.isActive);
    if (activeTab) {
      setCurrentUrl(activeTab.url);
      setInputUrl(activeTab.url);
    }

    let settings = privacy;
    if (privacy.randomUserAgent && !privacy.currentUserAgent) {
      settings = { ...privacy, currentUserAgent: getRandomUserAgent() };
      await savePrivacySettings(settings);
    }
    setPrivacySettings(settings);
    setAdBlockSettings(adblock);

    const count = Object.entries(privacy).filter(
      ([key, value]) => key !== "currentUserAgent" && value === true
    ).length;
    setActiveProtections(count);

    if (privacy.smartTimezone) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          await Location.getCurrentPositionAsync({});
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadSettings();
    });
    return unsubscribe;
  }, [navigation, loadSettings]);

  const navigateToUrl = (url: string) => {
    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      if (finalUrl.includes(".") && !finalUrl.includes(" ")) {
        finalUrl = "https://" + finalUrl;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
      }
    }
    setCurrentUrl(finalUrl);
    setInputUrl(finalUrl);
    updateActiveTab(finalUrl, pageTitle);
  };

  const updateActiveTab = async (url: string, title: string) => {
    const updatedTabs = tabs.map((tab) =>
      tab.isActive ? { ...tab, url, title: title || url } : tab
    );
    setTabs(updatedTabs);
    await saveTabs(updatedTabs);
  };

  const addToHistory = async (url: string, title: string) => {
    const history = await getHistory();
    const newItem = {
      id: Date.now().toString(),
      url,
      title: title || url,
      visitedAt: Date.now(),
    };
    const filtered = history.filter((h) => h.url !== url);
    await saveHistory([newItem, ...filtered].slice(0, 500));
  };

  const handleNavigationChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setIsLoading(navState.loading);
    setIsSecure(navState.url.startsWith("https://"));

    if (navState.url && navState.url !== currentUrl) {
      setCurrentUrl(navState.url);
      setInputUrl(navState.url);
    }
    if (navState.title) {
      setPageTitle(navState.title);
    }
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    if (currentUrl && pageTitle) {
      updateActiveTab(currentUrl, pageTitle);
      addToHistory(currentUrl, pageTitle);
    }
  };

  const toggleBookmark = async () => {
    const bookmarks = await getBookmarks();
    const existing = bookmarks.find((b) => b.url === currentUrl);
    if (existing) {
      await saveBookmarks(bookmarks.filter((b) => b.url !== currentUrl));
    } else {
      await saveBookmarks([
        { id: Date.now().toString(), url: currentUrl, title: pageTitle || currentUrl, createdAt: Date.now() },
        ...bookmarks,
      ]);
    }
  };

  const isHomepage =
    currentUrl === "https://www.google.com" ||
    currentUrl === "https://www.google.com/" ||
    currentUrl.startsWith("https://www.google.com/webhp");

  const injectedScript = `
    ${generatePrivacyScript(privacySettings)}
    ${generateAdBlockScript(adBlockSettings.enabled, isHomepage, adBlockSettings.allowHomepageAds)}
    true;
  `;

  const renderWebView = () => {
    if (Platform.OS === "web") {
      return (
        <View style={[styles.webFallback, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="globe" size={64} color={theme.textSecondary} />
          <ThemedText type="h4" style={styles.webFallbackTitle}>
            ON Browser
          </ThemedText>
          <ThemedText type="body" style={[styles.webFallbackText, { color: theme.textSecondary }]}>
            Run this app in Expo Go on your mobile device to use the browser functionality
          </ThemedText>
        </View>
      );
    }

    return (
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webView}
        onNavigationStateChange={handleNavigationChange}
        onLoadEnd={handleLoadEnd}
        injectedJavaScript={injectedScript}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        allowsBackForwardNavigationGestures
        userAgent={privacySettings.randomUserAgent ? privacySettings.currentUserAgent : undefined}
        renderLoading={() => (
          <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
          </View>
        )}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundRoot }]} />
        )}
        <View style={styles.headerContent}>
          <Pressable
            onPress={() => navigation.navigate("Settings")}
            style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="menu" size={24} color={theme.text} />
          </Pressable>

          <View style={[styles.urlBar, { backgroundColor: theme.urlBarBackground }]}>
            {isSecure ? (
              <Feather name="lock" size={16} color={theme.sslSecure} style={styles.urlIcon} />
            ) : (
              <Feather name="alert-triangle" size={16} color={theme.sslInsecure} style={styles.urlIcon} />
            )}
            <TextInput
              style={[styles.urlInput, { color: theme.text }]}
              value={isUrlFocused ? inputUrl : currentUrl}
              onChangeText={setInputUrl}
              onFocus={() => {
                setIsUrlFocused(true);
                setInputUrl(currentUrl);
              }}
              onBlur={() => setIsUrlFocused(false)}
              onSubmitEditing={() => navigateToUrl(inputUrl)}
              placeholder="Search or enter URL"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              selectTextOnFocus
            />
            {isLoading ? (
              <ActivityIndicator size="small" color={BrandColors.primary} style={styles.urlIcon} />
            ) : null}
          </View>

          <Pressable
            onPress={() => navigation.navigate("TabManager")}
            style={({ pressed }) => [styles.tabCounter, { opacity: pressed ? 0.6 : 1, backgroundColor: BrandColors.primary }]}
          >
            <ThemedText style={styles.tabCountText}>{tabs.length}</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("PrivacySuite")}
            style={({ pressed }) => [styles.shieldButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="shield" size={22} color={activeProtections > 0 ? BrandColors.secondary : theme.textSecondary} />
            {activeProtections > 0 ? (
              <View style={[styles.protectionBadge, { backgroundColor: BrandColors.secondary }]}>
                <ThemedText style={styles.protectionBadgeText}>{activeProtections}</ThemedText>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>{renderWebView()}</View>

      <View style={[styles.bottomToolbar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundRoot }]} />
        )}
        <View style={styles.toolbarContent}>
          <Pressable
            onPress={() => webViewRef.current?.goBack()}
            disabled={!canGoBack}
            style={({ pressed }) => [styles.toolbarButton, { opacity: pressed || !canGoBack ? 0.4 : 1 }]}
          >
            <Feather name="chevron-left" size={28} color={theme.text} />
          </Pressable>

          <Pressable
            onPress={() => webViewRef.current?.goForward()}
            disabled={!canGoForward}
            style={({ pressed }) => [styles.toolbarButton, { opacity: pressed || !canGoForward ? 0.4 : 1 }]}
          >
            <Feather name="chevron-right" size={28} color={theme.text} />
          </Pressable>

          <Pressable
            onPress={() => webViewRef.current?.reload()}
            style={({ pressed }) => [styles.toolbarButton, { opacity: pressed ? 0.4 : 1 }]}
          >
            <Feather name="refresh-cw" size={24} color={theme.text} />
          </Pressable>

          <Pressable
            onPress={toggleBookmark}
            style={({ pressed }) => [styles.toolbarButton, { opacity: pressed ? 0.4 : 1 }]}
          >
            <Feather name="bookmark" size={24} color={theme.text} />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("History")}
            style={({ pressed }) => [styles.toolbarButton, { opacity: pressed ? 0.4 : 1 }]}
          >
            <Feather name="clock" size={24} color={theme.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  urlBar: {
    flex: 1,
    height: Spacing.urlBarHeight,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  urlIcon: {
    marginRight: Spacing.sm,
  },
  urlInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  tabCounter: {
    width: Spacing.tabCounterSize,
    height: Spacing.tabCounterSize,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  tabCountText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  shieldButton: {
    padding: Spacing.xs,
    position: "relative",
  },
  protectionBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  protectionBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  webFallbackTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  webFallbackText: {
    textAlign: "center",
  },
  bottomToolbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Spacing.bottomToolbarHeight + 40,
    zIndex: 100,
  },
  toolbarContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.lg,
  },
  toolbarButton: {
    padding: Spacing.sm,
  },
});
