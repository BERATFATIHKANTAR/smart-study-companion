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
import { ArrowLeft, Plus, ClipboardList, Trash2, Edit2, Check, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface CustomNote {
  id: string;
  title: string;
  content: string;
}

export default function NotlarimScreen() {
  const router = useRouter();

  // Not Listesi State'i
  const [customNotes, setCustomNotes] = useState<CustomNote[]>([]);
  
  // Yeni Not Ekleme State'leri
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Düzenleme (Edit) Modu State'leri
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // 1. Yeni Not Ekleme
  const handleAddNote = async () => {
    const trimmedTitle = newTitle.trim();
    const trimmedContent = newContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      Alert.alert('Uyarı', 'Lütfen ders başlığını ve notunuzu doldurun.');
      return;
    }

    const newNote: CustomNote = {
      id: Math.random().toString(36).substring(2, 9),
      title: trimmedTitle,
      content: trimmedContent
    };

    try {
      // 🚀 DB TODO: await api.post('/notes', newNote);
      setCustomNotes(prevNotes => [newNote, ...prevNotes]);
      setNewTitle('');
      setNewContent('');
    } catch (error) {
      Alert.alert('Hata', 'Not kaydedilemedi.');
    }
  };

  // 2. Not Silme (Delete)
  const handleDeleteNote = (id: string) => {
    Alert.alert(
      'Notu Sil',
      'Bu notu defterinizden silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              // 🚀 DB TODO: await api.delete(`/notes/${id}`);
              setCustomNotes(prevNotes => prevNotes.filter(note => note.id !== id));
            } catch (error) {
              Alert.alert('Hata', 'Not silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  // 3. Düzenleme Modunu Açma
  const startEditing = (note: CustomNote) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  // 4. Düzenleme İptal
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  // 5. Güncellenen Notu Kaydetme (Update)
  const handleUpdateNote = async (id: string) => {
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      Alert.alert('Uyarı', 'Başlık ve içerik alanı boş bırakılamaz.');
      return;
    }

    try {
      // 🚀 DB TODO: await api.put(`/notes/${id}`, { title: trimmedTitle, content: trimmedContent });
      setCustomNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, title: trimmedTitle, content: trimmedContent } : note
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
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* ÜST BAR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ders Defterim</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.notebookBackground}>
          <Text style={styles.notebookMainHeader}>Öğrenci Çalışma Notları</Text>
          <View style={styles.blueUnderline} />

          {/* YENİ NOT EKLEME FORMU */}
          <View style={styles.interactiveArea}>
            <Text style={styles.interactiveTitle}>📝 Deftere Yeni Not Yaz</Text>
            <TextInput
              style={styles.customInputTitle}
              placeholder="Ders / Konu Başlığı Yaz..."
              placeholderTextColor="#64748B"
              value={newTitle}
              onChangeText={setNewTitle}
              maxLength={50}
            />
            <TextInput
              style={styles.customInputContent}
              placeholder="Formül, kural veya önemli açıklamayı buraya girin..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
              value={newContent}
              onChangeText={setNewContent}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddNote} activeOpacity={0.8}>
              <Plus size={18} color="#071E3D" style={{ marginRight: 6 }} />
              <Text style={styles.saveButtonText}>Deftere Kaydet</Text>
            </TouchableOpacity>
          </View>

          {/* NOT LİSTESİ */}
          <View style={styles.notesListContainer}>
            {customNotes.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <ClipboardList size={40} color="#1F4068" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyStateText}>Defteriniz henüz boş.</Text>
                <Text style={styles.emptyStateSubtext}>İlk ders notunuzu yukarıdan ekleyebilirsiniz.</Text>
              </View>
            ) : (
              customNotes.map((note) => {
                const isEditing = editingId === note.id;

                return (
                  <View key={note.id} style={styles.addedNoteCard}>
                    {isEditing ? (
                      // DÜZENLEME AKTİFKEN GÖSTERİLECEK INLINE FORM
                      <View>
                        <TextInput
                          style={[styles.customInputTitle, styles.editInput]}
                          value={editTitle}
                          onChangeText={setEditTitle}
                          maxLength={50}
                        />
                        <TextInput
                          style={[styles.customInputContent, styles.editInput, { minHeight: 60 }]}
                          value={editContent}
                          onChangeText={setEditContent}
                          multiline
                        />
                        <View style={styles.editActionsContainer}>
                          <TouchableOpacity 
                            style={[styles.actionButtonCircle, { backgroundColor: '#10B981' }]} 
                            onPress={() => handleUpdateNote(note.id)}
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
                      // NORMAL NOT GÖRÜNÜMÜ
                      <View>
                        <View style={styles.cardHeaderRow}>
                          <Text style={styles.addedNoteTitle}>📌 {note.title}</Text>
                          <View style={styles.cardActions}>
                            <TouchableOpacity onPress={() => startEditing(note)} style={styles.iconButton}>
                              <Edit2 size={16} color="#94A3B8" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteNote(note.id)} style={styles.iconButton}>
                              <Trash2 size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={styles.redUnderlineSmall} />
                        <Text style={styles.addedNoteContent}>{note.content}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071E3D', // Pomodoro sayfasıyla aynı ana koyu lacivert
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
  notebookBackground: {
    backgroundColor: '#071E3D', // Defter arka planı da ana temaya eşitlendi
    borderRadius: 16,
    minHeight: 500,
  },
  notebookMainHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginTop: 8,
  },
  blueUnderline: {
    height: 2,
    backgroundColor: '#2DD4BF', // Pomodoro turkuaz çizgisiyle eşleştirildi
    width: '70%',
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  interactiveArea: {
    backgroundColor: '#1F4068', // Bir tık açık lacivert giriş kutusu alanı
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#244A77',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  interactiveTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  customInputTitle: {
    backgroundColor: '#071E3D',
    borderRadius: 8,
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  customInputContent: {
    backgroundColor: '#071E3D',
    borderRadius: 8,
    fontSize: 13,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  editInput: {
    backgroundColor: '#1F4068',
    borderWidth: 1,
    borderColor: '#3A6073',
  },
  saveButton: {
    backgroundColor: '#00B4D8', // Canlı turkuaz buton rengi
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#071E3D',
    fontSize: 14,
    fontWeight: '700',
  },
  notesListContainer: {
    marginTop: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  addedNoteCard: {
    backgroundColor: '#162447',
    borderWidth: 1,
    borderColor: '#1F4068',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addedNoteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  editActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  redUnderlineSmall: {
    height: 1.5,
    backgroundColor: '#00B4D8', // Çizgiler de temaya uygun yapıldı
    width: '35%',
    marginVertical: 8,
  },
  addedNoteContent: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});