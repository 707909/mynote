import { Stack } from "expo-router";
import { useEffect } from "react";

import { initDatabase } from "../config/database";

export default function RootLayout() {

  useEffect(() => {
    initDatabase();
  }, []);

  return <Stack />;
}
