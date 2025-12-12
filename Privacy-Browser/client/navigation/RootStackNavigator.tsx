import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BrowserScreen from "@/screens/BrowserScreen";
import TabManagerScreen from "@/screens/TabManagerScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import PrivacySuiteScreen from "@/screens/PrivacySuiteScreen";
import AdBlockScreen from "@/screens/AdBlockScreen";
import UserScriptScreen from "@/screens/UserScriptScreen";
import BookmarksScreen from "@/screens/BookmarksScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Browser: undefined;
  TabManager: undefined;
  Settings: undefined;
  PrivacySuite: undefined;
  AdBlock: undefined;
  UserScripts: undefined;
  Bookmarks: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Browser"
        component={BrowserScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TabManager"
        component={TabManagerScreen}
        options={{
          presentation: "modal",
          headerTitle: "Tabs",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: "modal",
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="PrivacySuite"
        component={PrivacySuiteScreen}
        options={{
          headerTitle: "Privacy Suite",
        }}
      />
      <Stack.Screen
        name="AdBlock"
        component={AdBlockScreen}
        options={{
          headerTitle: "AdBlock Settings",
        }}
      />
      <Stack.Screen
        name="UserScripts"
        component={UserScriptScreen}
        options={{
          headerTitle: "UserScripts",
        }}
      />
      <Stack.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          presentation: "modal",
          headerTitle: "Bookmarks",
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          presentation: "modal",
          headerTitle: "History",
        }}
      />
    </Stack.Navigator>
  );
}
