import { StyleSheet, Text, View } from 'react-native';

export default function KesfetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Keşfet Sayfası</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#071E3D' },
  text: { color: '#ffffff', fontSize: 18 }
});