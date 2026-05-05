import React, { useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/hooks/useAuth";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    "TTSquares-Thin": require("./assets/fonts/Squares Thin.otf"),
    "TTSquares-ThinItalic": require("./assets/fonts/Squares Thin Italic.otf"),
    "TTSquares-Light": require("./assets/fonts/Squares Light.otf"),
    "TTSquares-LightItalic": require("./assets/fonts/Squares Light italic.otf"),
    "TTSquares-Regular": require("./assets/fonts/Squares Regular.otf"),
    "TTSquares-Italic": require("./assets/fonts/Squares Italic.otf"),
    "TTSquares-Bold": require("./assets/fonts/Squares Bold.otf"),
    "TTSquares-BoldItalic": require("./assets/fonts/Squares Bold Italic.otf"),
    "TTSquares-Black": require("./assets/fonts/Squares Black.otf"),
    "TTSquares-BlackItalic": require("./assets/fonts/Squares Black Italic.otf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator onReady={onLayoutRootView} />
    </AuthProvider>
  );
}
