import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  TABS: "@on_browser_tabs",
  BOOKMARKS: "@on_browser_bookmarks",
  HISTORY: "@on_browser_history",
  USERSCRIPTS: "@on_browser_userscripts",
  PRIVACY_SETTINGS: "@on_browser_privacy",
  ADBLOCK_SETTINGS: "@on_browser_adblock",
  BLOCKED_ADS_COUNT: "@on_browser_blocked_count",
};

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  isActive: boolean;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  visitedAt: number;
}

export interface UserScript {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  matchPattern: string;
}

export interface PrivacySettings {
  canvasProtection: boolean;
  webglSpoofing: boolean;
  fontBlocking: boolean;
  audioProtection: boolean;
  resolutionSpoofing: boolean;
  webrtcBlocking: boolean;
  antiProxyDetection: boolean;
  smartTimezone: boolean;
  randomUserAgent: boolean;
  currentUserAgent: string;
}

export interface AdBlockSettings {
  enabled: boolean;
  allowHomepageAds: boolean;
  customFilters: string[];
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  canvasProtection: true,
  webglSpoofing: true,
  fontBlocking: true,
  audioProtection: true,
  resolutionSpoofing: true,
  webrtcBlocking: true,
  antiProxyDetection: true,
  smartTimezone: true,
  randomUserAgent: true,
  currentUserAgent: "",
};

export const DEFAULT_ADBLOCK_SETTINGS: AdBlockSettings = {
  enabled: true,
  allowHomepageAds: true,
  customFilters: [],
};

export const USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
];

export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function getTabs(): Promise<BrowserTab[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TABS);
    return data ? JSON.parse(data) : [{ id: "1", url: "https://www.google.com", title: "Google", isActive: true }];
  } catch {
    return [{ id: "1", url: "https://www.google.com", title: "Google", isActive: true }];
  }
}

export async function saveTabs(tabs: BrowserTab[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
}

export async function getBookmarks(): Promise<Bookmark[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveHistory(history: HistoryItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export async function getUserScripts(): Promise<UserScript[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USERSCRIPTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveUserScripts(scripts: UserScript[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USERSCRIPTS, JSON.stringify(scripts));
}

export async function getPrivacySettings(): Promise<PrivacySettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
    return data ? { ...DEFAULT_PRIVACY_SETTINGS, ...JSON.parse(data) } : DEFAULT_PRIVACY_SETTINGS;
  } catch {
    return DEFAULT_PRIVACY_SETTINGS;
  }
}

export async function savePrivacySettings(settings: PrivacySettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(settings));
}

export async function getAdBlockSettings(): Promise<AdBlockSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ADBLOCK_SETTINGS);
    return data ? { ...DEFAULT_ADBLOCK_SETTINGS, ...JSON.parse(data) } : DEFAULT_ADBLOCK_SETTINGS;
  } catch {
    return DEFAULT_ADBLOCK_SETTINGS;
  }
}

export async function saveAdBlockSettings(settings: AdBlockSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ADBLOCK_SETTINGS, JSON.stringify(settings));
}

export async function getBlockedAdsCount(): Promise<number> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_ADS_COUNT);
    return data ? parseInt(data, 10) : 0;
  } catch {
    return 0;
  }
}

export async function incrementBlockedAdsCount(): Promise<number> {
  const count = await getBlockedAdsCount();
  const newCount = count + 1;
  await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_ADS_COUNT, newCount.toString());
  return newCount;
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}
