import { NavigationBar } from '@/components/NavigationBar';
import { WebScrollView } from '@/components/WebScrollView';
import { useAudioContext } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMLU } from '@/contexts/MLUContext';
import { router, Stack } from 'expo-router';
import { BookOpenCheck, CheckSquare, Lightbulb, LogOut } from 'lucide-react-native';
import { Image, Platform, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { currentPodcast } = useAudioContext();
  const { user, logout } = useAuth();
  const { stats } = useMLU();
  
  // Calculate bottom padding based on mini player visibility
  const bottomPadding = currentPodcast ? 120 : 40;

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const content = (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" />
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Navigation Bar */}
      <NavigationBar 
        onBackPress={() => router.back()}
        showUploadButton={false}
      />

      <WebScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 76, paddingBottom: bottomPadding }}
        className="flex-1"
      >
        {/* Profile Card */}
        <View className="mx-6 mb-6 bg-white rounded-3xl">
          <View className="flex-row items-start p-4 gap-6">
            <View className="w-[66px] h-[66px] bg-gray-200 rounded-full overflow-hidden items-center justify-center">
              {user?.name ? (
                <Text className="text-2xl font-semibold text-gray-700">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              ) : (
                <Image 
                  source={require('@/assets/images/cover-album.png')} 
                  style={{ width: 66, height: 66 }}
                  resizeMode="cover"
                />
              )}
            </View>
            
            <View className="flex-1 justify-center gap-2">
              <Text className="text-xl font-medium text-slate-950">
                {user?.name || 'Guest User'}
              </Text>
              <Text className="text-base text-slate-600">
                {user?.email || 'No email available'}
              </Text>
              <Text className="text-sm text-slate-500">
                User ID: {user?.uuid || 'N/A'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              className="p-2 rounded-full bg-red-50"
              activeOpacity={0.7}
            >
              <LogOut size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Learning Log */}
        <View className="px-6 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-semibold text-black">Learning log</Text>
            <View className="bg-[#4a44591a] px-3 py-1.5 rounded-xl">
              <Text className="text-sm font-medium text-black">{stats.completedMLUs} MLUs</Text>
            </View>
          </View>

          {/* Completed MLUs List */}
          <View className="gap-3">
            {stats.completedList.length === 0 ? (
              <View className="bg-white rounded-3xl p-4">
                <Text className="text-sm text-slate-500 text-center">
                  Complete quizzes to see your learning progress here
                </Text>
              </View>
            ) : (
              stats.completedList.map((completion, index) => (
                <TouchableOpacity
                  key={`${completion.quizId}-${index}`}
                  className="bg-white rounded-3xl p-4"
                  onPress={() => {
                    // Navigate to specific podcast detail page
                    router.push(`/podcast/${completion.podcastId}`);
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                      <Text className="text-sm font-medium text-black mb-1">
                        {completion.podcastTitle}
                      </Text>
                      <Text className="text-xs text-slate-500">
                        Score: {completion.score}% • {new Date(completion.completedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="w-8 h-8 bg-[#D5FF88] rounded-full items-center justify-center">
                      <Lightbulb size={16} color="#3D4A24" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

      </WebScrollView>
    </View>
  );

  if (Platform.OS === 'web') {
    return content;
  }

  return (
    <SafeAreaView className="flex-1">
      {content}
    </SafeAreaView>
  );
}