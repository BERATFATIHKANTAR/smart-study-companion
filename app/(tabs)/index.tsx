import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Check, 
  Trash2, 
  BookOpen, 
  ChevronRight, 
  Play, 
  Sparkles,
  FileText
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
}

export default function HomeScreen() {
  const router = useRouter();

  // Günlük Hedefler state'i
  const [goals, setGoals] = useState<DailyGoal[]>([
    { id: '1', text: '30 Matematik sorusu çöz', completed: true },
    { id: '2', text: '2 Oturum Pomodoro çalış', completed: false },
  ]);
  const [inputText, setInputText] = useState('');

  // Tamamlanan hedef yüzdesi hesaplama
  const completedCount = goals.filter(g => g.completed).length;
  const progressPercentage = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const handleAddGoal = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setGoals(prev => [...prev, { id: Date.now().toString(), text: trimmed, completed: false }]);
    setInputText('');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      <LinearGradient colors={['#071E3D', '#0F4C81', '#1E3A8A']} style={styles.gradientBackground}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. ÜST HEADER & MASKOT */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greetingText}>Hoş Geldin Arkadaşım 👋</Text>
              <Text style={styles.subGreetingText}>Bugün harika işler başarmaya hazır mısın?</Text>
            </View>
            <Image 
              source={require('../../assets/images/smart_dolphin.png')} 
              style={styles.headerImage} 
              resizeMode="contain"
            />
          </View>

          {/* İÇERİK GÖVDESİ */}
          <View style={styles.contentBody}>

            {/* 2. PODMODRO KONTROL PANELİ */}
            <TouchableOpacity 
              style={styles.pomodoroCard}
              onPress={() => router.push('/pomodoro')}
              activeOpacity={0.9}
            >
              <LinearGradient colors={['#134E5E', '#71B280']} style={styles.pomodoroGradient}>
                <View style={styles.pomodoroLeft}>
                  <View style={styles.timerCircle}>
                    <Text style={styles.timerText}>25:00</Text>
                    <Text style={styles.timerSubText}>Odaklanma</Text>
                  </View>
                </View>

                <View style={styles.pomodoroRight}>
                  <View style={styles.pomodoroBadge}>
                    <Sparkles size={12} color="#FDE047" />
                    <Text style={styles.pomodoroBadgeText}>Podomodro Oturumu</Text>
                  </View>
                  <Text style={styles.pomodoroTitle}>Çalışmaya Başla</Text>
                  <Text style={styles.pomodoroDesc}>Zihnini topla, zamanı verimli kullan.</Text>

                  <TouchableOpacity style={styles.startButton} onPress={() => router.push('/pomodoro')}>
                    <Play size={14} color="#134E5E" fill="#134E5E" />
                    <Text style={styles.startButtonText}>BAŞLAT</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* 3. DİNAMİK GÜNLÜK HEDEFLER */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>🎯 Günlük Hedefler</Text>
                  <Text style={styles.sectionSubtitle}>
                    {goals.length > 0 ? `${completedCount}/${goals.length} tamamlandı` : 'Henüz hedef eklenmedi'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/hedefler')}>
                  <Text style={styles.manageGoalsLink}>Tümünü Gör</Text>
                </TouchableOpacity>
              </View>

              {/* İlerleme Çubuğu */}
              {goals.length > 0 && (
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                </View>
              )}

              {/* Hedef Listesi */}
              <View style={styles.goalsListWrapper}>
                {goals.length === 0 ? (
                  <Text style={styles.emptyGoalsText}>Bugün için henüz bir hedef belirlemedin.</Text>
                ) : (
                  goals.map((goal) => (
                    <View key={goal.id} style={styles.goalRowContainer}>
                      <TouchableOpacity 
                        style={styles.goalRow}
                        onPress={() => toggleGoal(goal.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.checkbox, goal.completed && styles.checkboxChecked]}>
                          {goal.completed && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                        </View>
                        <Text style={[styles.goalText, goal.completed && styles.goalTextCompleted]}>
                          {goal.text}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)} style={styles.goalDeleteBtn}>
                        <Trash2 size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              {/* Hızlı Ekleme Girişi */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inlineInput}
                  placeholder="Yeni bir hedef ekle..."
                  placeholderTextColor="#94A3B8"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleAddGoal}
                  maxLength={70}
                />
                <TouchableOpacity 
                  style={[styles.inlineAddButton, !inputText.trim() && styles.inlineAddButtonDisabled]} 
                  onPress={handleAddGoal}
                  disabled={!inputText.trim()}
                >
                  <Plus size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. NOT DEFTERİ & HIZLI ERİŞİM */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>📝 Çalışma Notlarım</Text>
                <TouchableOpacity onPress={() => router.push('/notlarim')}>
                  <ChevronRight size={20} color="#0F4C81" />
                </TouchableOpacity>
              </View>

              <View style={styles.notebookGrid}>
                <TouchableOpacity 
                  style={[styles.noteBox, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}
                  onPress={() => router.push('/notlarim')}
                >
                  <FileText size={18} color="#0284C7" />
                  <Text style={styles.noteBoxTitle}>Önemli Notlar</Text>
                  <Text style={styles.noteBoxDesc}>Ders özetleri ve formüller</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.noteBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
                  onPress={() => router.push('/notlarim')}
                >
                  <BookOpen size={18} color="#D97706" />
                  <Text style={styles.noteBoxTitle}>Kilit Kavramlar</Text>
                  <Text style={styles.noteBoxDesc}>Unutmaman gereken detaylar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. MOTİVASYON SÖZÜ KARTI */}
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>"Başarı, her gün tekrarlanan küçük çabaların toplamıdır."</Text>
              <Text style={styles.quoteAuthor}>— Robert Collier</Text>
            </View>

          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071E3D',
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 10,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subGreetingText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  headerImage: {
    width: 65,
    height: 65,
  },
  contentBody: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  pomodoroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  pomodoroGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  pomodoroLeft: {
    marginRight: 18,
  },
  timerCircle: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerSubText: {
    color: '#E0F2FE',
    fontSize: 9,
    marginTop: 2,
  },
  pomodoroRight: {
    flex: 1,
  },
  pomodoroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  pomodoroBadgeText: {
    color: '#FDE047',
    fontSize: 10,
    fontWeight: '600',
  },
  pomodoroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pomodoroDesc: {
    color: '#E0F2FE',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    color: '#134E5E',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  manageGoalsLink: {
    fontSize: 12,
    color: '#0F4C81',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  goalsListWrapper: {
    marginTop: 5,
  },
  emptyGoalsText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 12,
    textAlign: 'center',
  },
  goalRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  goalText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  goalDeleteBtn: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inlineInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: '#1E293B',
  },
  inlineAddButton: {
    backgroundColor: '#0F4C81',
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineAddButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  notebookGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  noteBox: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  noteBoxTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 8,
  },
  noteBoxDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quoteCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  quoteText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  quoteAuthor: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
});