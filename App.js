import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Barometer } from 'expo-sensors';

export default function App() {
  const [pressure, setPressure] = useState(null)
  const [caption, setCaption] = useState(null)
  const captionsPositive = ["...yeah", "sure", "it seems so", "why not", "yes"]
  const captionsNegative = ["not really", "who's gonna check anyway", "...no", "well..."]

  useEffect(() => {
    if (Barometer.isAvailableAsync()) {
      Barometer.addListener(barometerData => {
        setPressure(barometerData.pressure)
      })
      if (pressure != 1013) {
        setCaption(captionsPositive[0])
      } else {
        setCaption(captionsNegative[0])
      }
    }
  }, []);


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center"
    },
    header: {

    },
    pressureTextStyle: {

    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'stretch',
      marginTop: 15,
    },
    button: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#eee',
      padding: 10,
    },
    sensor: {
      marginTop: 45,
      paddingHorizontal: 10,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Can You Blame the Atmospheric Pressure?
      </Text>
      <Text style={styles.pressureTextStyle}>{pressure} hPa</Text>
      <Text style={styles.captionTextStyle}>{caption}</Text>
    </View>
  );
}

