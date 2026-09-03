import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Home, Camera, BookOpen, User } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false, // İşte sihirli dokunuş! Üstteki varsayılan başlıkları tamamen gizler.
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      {/* 
        Eğer şablondan kalan diğer sekmelerin varsa (örneğin "two") 
        onları da projemize göre (Kamera/Tara, Hata Defteri, Profil vb.) 
        burada tanımlayabilirsin.
      */}
    </Tabs>
  );
}