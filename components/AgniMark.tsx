import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { effects, palette } from '@/lib/theme';

export function AgniMark({ size = 42 }: { size?: number }) {
  return (
    <View style={[styles.shell, effects.blueGlow, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <Ionicons name="flame" size={size * 0.72} color={palette.fire} />
      <View style={styles.flash}>
        <Ionicons name="flash" size={size * 0.48} color={palette.blueBright} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06101E',
    borderWidth: 1,
    borderColor: '#1F5FAE',
  },
  flash: {
    position: 'absolute',
    right: -3,
    bottom: -2,
  },
});
