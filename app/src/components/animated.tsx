import { cssInterop } from 'nativewind';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

/**
 * ANIMATED COMPONENTS THAT UNDERSTAND `className`.
 *
 * The defect this file exists to remove: react-native-web silently DROPS `className` on a
 * reanimated component. A `<Animated.View className="bg-o-primary flex-row px-4">` renders with no
 * background, no layout and no padding — and nothing warns, in the console or at the gate. It looks
 * like an animation bug, which is where the hour goes.
 *
 * It is written into `docs/loop-eng/plans/23-ui-overhaul.md` as a hard constraint, phrased as
 * "geometry goes on `style`". Following that by hand means every animated node in the app has to
 * restate its Tailwind classes as inline objects, and the first time anyone forgets, a card loses
 * its ground on the shipping target only. I hit it three times in one screen before catching it.
 *
 * `cssInterop` is NativeWind's own registration for exactly this: it teaches the library to compile
 * `className` into the `style` prop for a component it does not already know about. One call per
 * component, at module scope, and `className` works on them the way it does on a plain View.
 *
 * Import `AView` / `APressable` from here. Never call `Animated.createAnimatedComponent` in a
 * screen — an unregistered animated component is the bug above, reintroduced.
 */

export const AView = Animated.View;
cssInterop(AView, { className: 'style' });

export const APressable = Animated.createAnimatedComponent(Pressable);
cssInterop(APressable, { className: 'style' });
