import { NativeTabs } from 'expo-router/native-tabs';

import { useColors } from '@/theme';

export default function TabsLayout() {
  const c = useColors();
  return (
    <NativeTabs tintColor={c.accent} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="projects">
        <NativeTabs.Trigger.Label>Projects</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="experience">
        <NativeTabs.Trigger.Label>Experience</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'briefcase', selected: 'briefcase.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="certificates">
        <NativeTabs.Trigger.Label>Certificates</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'rosette', selected: 'rosette' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="contact">
        <NativeTabs.Trigger.Label>Contact</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'envelope', selected: 'envelope.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
