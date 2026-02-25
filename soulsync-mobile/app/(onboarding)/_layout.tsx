import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background.light },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="basics" />
      <Stack.Screen name="location" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="values" />
      <Stack.Screen name="attachment" />
      <Stack.Screen name="love-language" />
      <Stack.Screen name="voice-intro" />
      <Stack.Screen name="photos" />
    </Stack>
  );
}
