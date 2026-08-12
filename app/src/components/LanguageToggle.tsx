import { Pressable, Text, View } from 'react-native';

import { setLanguage, useCopy, useLanguage, type Language } from '@/copy';

/**
 * BM / English segmented control — specs §5 v2's language toggle.
 *
 * Citizen register only (dark ground, `pill` radius, filled surfaces): it lives on onboarding and
 * at the foot of the history log, both citizen screens. The officer surface inherits whatever the
 * citizen chose; an officer screen carrying a consumer-style segmented control is exactly the
 * register mixing CLAUDE.md bans.
 *
 * Each half is its own 44 px tap target — the floor is on the PRESSABLE, not on the pill around it.
 * The two option labels are deliberately NOT translated: a speaker looking for their own language
 * must be able to find it while the app is in the other one.
 */

const OPTIONS: readonly Language[] = ['en', 'ms'];

export function LanguageToggle({ withLabel = false }: { withLabel?: boolean }) {
  const lang = useLanguage();
  const c = useCopy();

  return (
    <View className="flex-row items-center gap-3">
      {withLabel ? (
        <Text className="font-plex text-[15px] text-muted">{c.common.language}</Text>
      ) : null}
      <View className="flex-row overflow-hidden rounded-pill bg-surface">
        {OPTIONS.map((code) => {
          const on = lang === code;
          return (
            <Pressable
              key={code}
              onPress={() => setLanguage(code)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={code === 'en' ? c.common.languageEn : c.common.languageMs}
              className={`min-h-[44px] justify-center px-3.5 active:opacity-70 ${
                on ? 'bg-surface-raised' : ''
              }`}
            >
              <Text className={`font-plex-medium text-[13px] ${on ? 'text-ink' : 'text-muted'}`}>
                {code === 'en' ? c.common.languageEn : c.common.languageMs}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
