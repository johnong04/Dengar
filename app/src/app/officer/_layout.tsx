import { Stack } from 'expo-router';

// The officer route group. Light ground, crisp `card` radius, cobalt action — deliberately
// unmistakable from the citizen surface (design-system.md §Register rules, §Color — officer).
// Each screen paints its own `o-bg` ground; no raw color lives here.
export default function OfficerLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
