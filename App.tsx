// Fortune Calendar v1.4.0g
import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useAppStore } from './src/store/useAppStore';
import { SplashScreen } from './src/components/SplashScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { FortuneScreen } from './src/screens/FortuneScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { YearCalendarScreen } from './src/screens/YearCalendarScreen';

// Error Boundary
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean; error: string}> {
  state = { hasError: false, error: '' };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error: error.message }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('App Error:', error, info); }
  render() {
    if (this.state.hasError) return <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:20}}><Text style={{color:'red',fontSize:16}}>Error: {this.state.error}</Text></View>;
    return this.props.children;
  }
}

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{name}</Text>
);

export default function App() {
  const init = useAppStore((s) => s.init);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    init();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ErrorBoundary>
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#FF69B4',
          tabBarInactiveTintColor: '#999',
          headerShown: true,
          headerTitleAlign: 'center',
        }}
      >
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            title: '月',
            tabBarIcon: ({ focused }) => <TabIcon name="📅" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Year"
          component={YearCalendarScreen}
          options={{
            title: '年',
            tabBarIcon: ({ focused }) => <TabIcon name="📆" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Fortune"
          component={FortuneScreen}
          options={{
            title: '占い',
            tabBarIcon: ({ focused }) => <TabIcon name="🔮" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: '履歴',
            tabBarIcon: ({ focused }) => <TabIcon name="📜" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '設定',
            tabBarIcon: ({ focused }) => <TabIcon name="⚙️" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
    </ErrorBoundary>
  );
}
