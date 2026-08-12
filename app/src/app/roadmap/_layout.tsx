import { Stack } from 'expo-router';

// The v3 roadmap route group (specs §5 v3). Citizen surface — dark ground, warm ink — because a
// v3 screen inherits its audience's language rather than inventing a third register
// (design-system.md §Gate 2, "No gate 3"). Each screen paints its own `bg`; no color lives here.
export default function RoadmapLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
