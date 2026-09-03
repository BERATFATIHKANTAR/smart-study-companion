import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Plus, Target, Trash2, Edit2, Check, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Veritabanı yapısına uygun Tip Tanımı
interface Goal {
  id: string;
  title: string;
  targetDate: string; // "Aralık 2026" veya "2 Hafta İçinde" gibi esnek hedefler için
}

export default function HedeflerScreen() {
  const router = useRouter();

  // Hedefler Listesi State'i (Başlangıçta tamamen boş)
  const [goals, setGoals] = useState<Goal[]>([]);

  // Yeni Hedef Ekleme State'leri
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  // Düzenleme (Edit) Modu State'leri
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');

  // 1. Yeni Hedef Ekleme
  const handleAddGoal = async () => {
    const trimmedTitle = newTitle.trim();
    const trimmedDate = newDate.trim();

    if (!trimmedTitle) {
      Alert.alert('Uyarı', 'Lütfen bir hedef başlığı girin.');
      return;
    }

    const newGoal: Goal = {
      id: Math.random().toString(36).substring(2, 9),
      title: trimmedTitle,
      targetDate: trimmedDate || 'Süre Belirtilmedi',
    };

    try {
      // 🚀 DB TODO: await api.post('/goals', newGoal);
      setGoals(prevGoals => [newGoal, ...prevGoals]);
      setNewTitle('');
      setNewDate('');
    } catch (error) {
      Alert.alert('Hata', 'Hedef kaydedilemedi.');
    }
  };

  // 2. Hedef Silme
  const handleDeleteGoal = (id: string) => {
    Alert.alert(
      'Hedefi Sil',
      'Bu hedefi silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              // 🚀 DB TODO: await api.delete(`/goals/${id}`);
              setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
            } catch (error) {
              Alert.alert('Hata', 'Hedef silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  // 3. Düzenleme Modunu Açma
  const startEditing = (goal: Goal) => {
    setEditingId(goal.id);
    setEditTitle(goal.title);
    setEditDate(goal.targetDate);
  };

  // 4. Düzenleme İptal
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDate('');
  };

  // 5. Güncellenen Hedefi Kaydetme
  const handleUpdateGoal = async (id: string) => {
    const trimmedTitle = editTitle.trim();
    const trimmedDate = editDate.trim();

    if (!trimmedTitle) {
      Alert.alert('Uyarı', 'Hedef başlığı boş bırakılamaz.');
      return;
    }

    try {
      // 🚀 DB TODO: await api.put(`/goals/${id}`, { title: trimmedTitle, targetDate: trimmedDate });
      setGoals(prevGoals =>
        prevGoals.map(goal =>
          goal.id === id ? { ...goal, title: trimmedTitle, targetDate: trimmedDate || 'Süre Belirtilmedi' } : goal
        )
      );
      setEditingId(null);
    } catch (error) {
      Alert.alert('Hata', 'Değişiklikler kaydedilemedi.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" backgroundColor="#071E3D" />

      {/* ÜST BAR (HEADER) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gelecek Hedeflerim</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* YENİ HEDEF EKLEME FORMU */}
        <View style={styles.interactiveArea}>
          <Text style={styles.interactiveTitle}>🎯 Yeni Hedef Belirle</Text>
          
          <TextInput
            style={styles.customInput}
            placeholder="Ne başarmak istiyorsun?"
            placeholderTextColor="#64748B"
            value={newTitle}
            onChangeText={setNewTitle}
            maxLength={60}
          />
          
          <TextInput
            style={styles.customInput}
            placeholder="Hedef Süresi (Örn: 3 Ay, 2026 Sonu...)"
            placeholderTextColor="#64748B"
            value={newDate}
            onChangeText={setNewDate}
            maxLength={30}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleAddGoal} activeOpacity={0.8}>
            <Plus size={18} color="#071E3D" style={{ marginRight: 6 }} />
            <Text style={styles.saveButtonText}>Hedeflere Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* HEDEFLER LİSTESİ */}
        <View style={styles.goalsContainer}>
          {goals.length === 0 ? (
            // Boş State Görünümü
            <View style={styles.emptyStateContainer}>
              <Target size={44} color="#1F4068" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyStateText}>Henüz bir hedef eklemedin.</Text>
              <Text style={styles.emptyStateSubtext}>
                Kendine meydan okumak için yukarıdan ilk hedefini hemen ekle!
              </Text>
            </View>
          ) : (
            goals.map(goal => {
              const isEditing = editingId === goal.id;

              return (
                <View key={goal.id} style={styles.goalCard}>
                  {isEditing ? (
                    // DÜZENLEME AKTİFKEN GÖSTERİLECEK INLINE FORM
                    <View>
                      <TextInput
                        style={[styles.customInput, styles.editInput]}
                        value={editTitle}
                        onChangeText={setEditTitle}
                        maxLength={60}
                      />
                      <TextInput
                        style={[styles.customInput, styles.editInput]}
                        value={editDate}
                        onChangeText={setEditDate}
                        maxLength={30}
                      />
                      <View style={styles.editActionsContainer}>
                        <TouchableOpacity
                          style={[styles.actionButtonCircle, { backgroundColor: '#10B981' }]}
                          onPress={() => handleUpdateGoal(goal.id)}
                        >
                          <Check size={16} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButtonCircle, { backgroundColor: '#64748B' }]}
                          onPress={cancelEditing}
                        >
                          <X size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    // NORMAL HEDEF KART GÖRÜNÜMÜ
                    <View style={styles.cardContentRow}>
                      <View style={styles.goalTextWrapper}>
                        <Text style={styles.goalTitle}>✨ {goal.title}</Text>
                        <Text style={styles.goalDate}>📅 Süre: {goal.targetDate}</Text>
                      </View>
                      
                      <View style={styles.cardActions}>
                        <TouchableOpacity onPress={() => startEditing(goal)} style={styles.iconButton}>
                          <Edit2 size={16} color="#94A3B8" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)} style={styles.iconButton}>
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071E3D', // Ana Koyu Mavi Tema
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F4068',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 36,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  interactiveArea: {
    backgroundColor: '#1F4068', // Bir tık açık lacivert form alanı
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  interactiveTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  customInput: {
    backgroundColor: '#071E3D',
    borderRadius: 8,
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  editInput: {
    backgroundColor: '#1F4068',
    borderWidth: 1,
    borderColor: '#3A6073',
  },
  saveButton: {
    backgroundColor: '#00B4D8', // Canlı mavi/turkuaz buton
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: '#071E3D',
    fontSize: 14,
    fontWeight: '700',
  },
  goalsContainer: {
    marginTop: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 6,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 4,
    lineHeight: 18,
  },
  goalCard: {
    backgroundColor: '#162447',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F4068',
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTextWrapper: {
    flex: 1,
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  goalDate: {
    fontSize: 12,
    color: '#00B4D8',
    marginTop: 6,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
  },
  editActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  actionButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});