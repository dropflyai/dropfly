import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function ConnectivityLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background.light },
      }}
    >
      <Stack.Screen name="[matchId]" />
      <Stack.Screen
        name="reveal"
        options={{
          animation: 'fade',
        }}
      />
    </Stack>
  );
}
