import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { Barometer } from 'expo-sensors';
import * as SplashScreen from 'expo-splash-screen';
import * as Location from 'expo-location';

import { key } from './key.json'; // Open Weather Map API key

export default function App() {
  const [location, setLocation] = useState(null);
  const [retries, setRetries] = useState(0);
  const [locationPermissions, setLocationPermissions] = useState(null);
  const [barometerAvailable, setBarometerAvailable] = useState(null);
  const [pressure, setPressure] = useState(null)
  const [caption, setCaption] = useState(null)
  const captionsPositive = ["...yeah", "sure", "it seems so", "why not", "yes"]
  const captionsNegative = ["not really", "who's gonna check anyway", "...no", "well..."]

  let chooseRandomWord = (array) => {
    let max = array.length;
    return (array[(Math.floor(Math.random() * max) + 1) % max])
  }

  let callWeatherStation = () => {
    let lat = location.coords.latitude.toString();
    let lon = location.coords.longitude.toString();
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`)
      .then(function (response) { return response.json(); })
      .then(function (response) {
        setPressure(response.main.pressure);
        if (pressure != 1013) {
          setCaption(chooseRandomWord(captionsPositive))
        } else {
          setCaption(chooseRandomWord(captionsNegative))
        }
        SplashScreen.hideAsync();
      });
  }

  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
      if (await Barometer.isAvailableAsync()) {
        setBarometerAvailable(true);
        Barometer.addListener(barometerData => {
          setPressure(barometerData.pressure)
        })
        if (pressure != 1013) {
          setCaption(chooseRandomWord(captionsPositive))
        } else {
          setCaption(chooseRandomWord(captionsNegative))
        }
        SplashScreen.hideAsync();
      }
      else {
        setBarometerAvailable(false);
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
          setLocationPermissions(false);
          SplashScreen.hideAsync();
        } else {
          setLocationPermissions(true);
          setLocation(await Location.getCurrentPositionAsync({ accuracy: 6 }));
          if (location == null) {
            setRetries(retries + 1);
          } else {
            callWeatherStation();
          }
        }
      }
    })();
  }, [retries]);

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

  if (!barometerAvailable && !locationPermissions) {
    return (
      <View style={styles.container}>
        <Image source={require('./assets/splash.png')} style={styles.backgroundImage}></Image>
        <Text style={styles.captionTextStyle}>Location permission not granted.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Image source={require('./assets/splash.png')} style={styles.backgroundImage}></Image>
      <Text style={styles.pressureTextStyle}>{pressure} hPa</Text>
      <Text style={styles.captionTextStyle}>{caption}</Text>
    </View>
  );
}