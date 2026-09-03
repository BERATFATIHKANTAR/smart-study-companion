import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Alert, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type TimerMode = 'WORK' | 'BREAK';

export default function PomodoroScreen() {
  const router = useRouter();

  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  // State Yönetimi
  const [mode, setMode] = useState<TimerMode>('WORK');
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // 3-2-1 Geri Sayım State'leri
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownVal, setCountdownVal] = useState(3);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 3-2-1 Geri Sayım Mantığı
  useEffect(() => {
    if (isCountingDown) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdownVal((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setIsCountingDown(false);
            setIsActive(true); 
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isCountingDown]);

  // Ana Pomodoro Sayacı Mantığı
  useEffect(() => {
    if (isActive && !isCountingDown) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isCountingDown, mode]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (mode === 'WORK') {
      const nextSessionsCount = completedSessions + 1;
      setCompletedSessions(nextSessionsCount);
      
      Alert.alert('Tebrikler! 🎉', 'Bir çalışma oturumunu başarıyla tamamladın. Şimdi mola zamanı!', [
        { text: 'Molayı Başlat', onPress: () => startBreakMode() }
      ]);
    } else {
      Alert.alert('Mola Bitti! 📚', 'Dinlendiysen yeni çalışma oturumuna başlayabilirsin.', [
        { text: 'Çalışmaya Dön', onPress: () => startWorkMode() }
      ]);
    }
  };

  const startBreakMode = () => {
    setMode('BREAK');
    setTimeLeft(BREAK_TIME);
    setIsActive(false);
    setIsCountingDown(true);
    setCountdownVal(3);
  };

  const startWorkMode = () => {
    setMode('WORK');
    setTimeLeft(WORK_TIME);
    setIsActive(false);
    setIsCountingDown(true);
    setCountdownVal(3);
  };

  const toggleTimer = () => {
    if (isActive) {
      setIsActive(false);
    } else {
      setIsCountingDown(true);
      setCountdownVal(3);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsCountingDown(false);
    setTimeLeft(mode === 'WORK' ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Garanti çalışan, derin odaklanma sağlayan yüksek çözünürlüklü okyanus görseli URL'i
  const oceanBackgroundUri = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop';

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Arka plan görseli - Aktiflik durumuna göre opaklık (opacity) ile kontrol ediliyor */}
      <ImageBackground 
        source={{ uri: oceanBackgroundUri }} 
        style={[StyleSheet.absoluteFillObject, { opacity: (isActive || isCountingDown) ? 1 : 0 }]}
        blurRadius={Platform.OS === 'ios' ? 3 : 1}
      />

      {/* ÜST BAR */}
      <View style={[styles.header, (isActive || isCountingDown) && styles.headerTranslucent]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Podmodro Sayacı</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ANA GÖVDE */}
      <View style={styles.content}>
        
        {/* AKTİF MOD GÖSTERGESİ */}
        <View style={[styles.modeBadge, mode === 'BREAK' && styles.modeBadgeBreak]}>
          {mode === 'WORK' ? (
            <>
              <BookOpen size={16} color="#A5F3FC" style={{ marginRight: 6 }} />
              <Text style={styles.modeText}>Odaklanma Zamanı</Text>
            </>
          ) : (
            <>
              <Coffee size={16} color="#FED7AA" style={{ marginRight: 6 }} />
              <Text style={[styles.modeText, { color: '#FED7AA' }]}>Mola Zamanı</Text>
            </>
          )}
        </View>

        {/* DAİRESEL SAYAÇ VE GERİ SAYIM ALANI */}
        <View style={[
          styles.timerCircle, 
          mode === 'BREAK' && styles.timerCircleBreak,
          (isActive || isCountingDown) && styles.timerCircleActive
        ]}>
          {isCountingDown ? (
            <Text style={styles.countdownText}>{countdownVal}</Text>
          ) : (
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          )}
          <Text style={styles.timerSubText}>
            {isCountingDown ? 'Başlıyor...' : isActive ? 'Odaklanma Aktif' : 'Durduruldu'}
          </Text>
        </View>

        {/* İSTATİSTİK SKOR KARTI */}
        <View style={[styles.statsCard, (isActive || isCountingDown) && styles.statsCardTranslucent]}>
          <Text style={styles.statsLabel}>Bugün Tamamlanan Toplam Oturum</Text>
          <Text style={styles.statsValue}>{completedSessions} / 4</Text>
        </View>

        {/* KONTROL BUTONLARI */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={resetTimer} style={styles.controlButtonCircle} activeOpacity={0.8}>
            <RotateCcw size={22} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={toggleTimer} 
            style={[
              styles.mainPlayButton, 
              mode === 'BREAK' && styles.mainPlayButtonBreak,
              (isActive || isCountingDown) && styles.mainPlayButtonActive
            ]} 
            activeOpacity={0.9}
          >
            {isActive || isCountingDown ? (
              <Pause size={28} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <Play size={28} color="#071E3D" strokeWidth={2.5} style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              setIsActive(false);
              setIsCountingDown(false);
              setMode(mode === 'WORK' ? 'BREAK' : 'WORK');
              setTimeLeft(mode === 'WORK' ? BREAK_TIME : WORK_TIME);
            }}
            style={styles.controlButtonCircle} 
            activeOpacity={0.8}
          >
            {mode === 'WORK' ? <Coffee size={22} color="#94A3B8" /> : <BookOpen size={22} color="#94A3B8" />}
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071E3D',
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
    zIndex: 10,
  },
  headerTranslucent: {
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(7, 30, 61, 0.5)',
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
    zIndex: 10,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.4)',
    marginBottom: 40,
  },
  modeBadgeBreak: {
    backgroundColor: 'rgba(198, 92, 66, 0.15)',
    borderColor: 'rgba(198, 92, 66, 0.4)',
  },
  modeText: {
    color: '#A5F3FC',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 6,
    borderColor: '#2DD4BF',
    backgroundColor: '#112240',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  timerCircleBreak: {
    borderColor: '#C85C42',
    shadowColor: '#C85C42',
  },
  timerCircleActive: {
    backgroundColor: 'rgba(7, 30, 61, 0.8)',
    borderColor: '#00B4D8',
    shadowColor: '#00B4D8',
  },
  timerText: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  countdownText: {
    fontSize: 74,
    fontWeight: '800',
    color: '#00B4D8',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  timerSubText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsCard: {
    backgroundColor: '#112240',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#1F4068',
    width: '100%',
  },
  statsCardTranslucent: {
    backgroundColor: 'rgba(17, 34, 64, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statsLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    width: '100%',
  },
  controlButtonCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#112240',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1F4068',
    marginHorizontal: 20,
  },
  mainPlayButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2DD4BF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mainPlayButtonBreak: {
    backgroundColor: '#C85C42',
    shadowColor: '#C85C42',
  },
  mainPlayButtonActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
});