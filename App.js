import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { Barometer } from 'expo-sensors';

export default function App() {
  const [pressure, setPressure] = useState(null)
  const [caption, setCaption] = useState(null)
  const captionsPositive = ["...yeah", "sure", "it seems so", "why not", "yes"]
  const captionsNegative = ["not really", "who's gonna check anyway", "...no", "well..."]

  let chooseRandomWord = (array) => {
    let max = array.length;
    return (array[(Math.floor(Math.random() * max) + 1) % max])
  }

  useEffect(() => {
    if (Barometer.isAvailableAsync()) {
      Barometer.addListener(barometerData => {
        setPressure(barometerData.pressure)
      })
      if (pressure != 1013) {
        setCaption(chooseRandomWord(captionsPositive))
      } else {
        setCaption(chooseRandomWord(captionsNegative))
      }
    }
  }, []);

  const styles = StyleSheet.create({
    backgroundImage: {
      height: Dimensions.get('screen').height,
      width: Dimensions.get('screen').width,
      position: "absolute",
    },
    container: {
      height: Dimensions.get('screen').height,
      width: Dimensions.get('screen').width,
      position: "absolute",
      justifyContent: "center"
    },
    pressureTextStyle: {
      textAlign: "center",
      fontSize: 40
    },
    captionTextStyle: {
      textAlign: "center"
    }
  });

  return (
    <View style={styles.container}>
      <Image source={require('./assets/splash.png')} style={styles.backgroundImage}></Image>
      <Text style={styles.pressureTextStyle}>{pressure} hPa</Text>
      <Text style={styles.captionTextStyle}>{caption}</Text>
    </View>
  );
}

