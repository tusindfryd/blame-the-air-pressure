import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { Barometer } from 'expo-sensors';
import * as SplashScreen from 'expo-splash-screen';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import { key } from './key.json'; // Open Weather Map API key

export default function App() {
  const [location, setLocation] = useState(null);
  const [retries, setRetries] = useState(0);
  const [locationPermissions, setLocationPermissions] = useState(null);
  const [barometerAvailable, setBarometerAvailable] = useState(null);
  const [pressure, setPressure] = useState(null);
  const [caption, setCaption] = useState(null);
  const [showCredits, setShowCredits] = useState(false);

  const captionsPositive = ["yeah", "sure", "it seems so", "apparently", "yes"];
  const captionsNegative = ["not really", "it's normal", "nothing unusual here", "could be something else"];

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
        if (pressure > (1013 + 5) || pressure < (1013 - 5)) {
          setCaption(chooseRandomWord(captionsPositive))
        } else {
          setCaption(chooseRandomWord(captionsNegative))
        }
        SplashScreen.hideAsync();
      });
  }

  useEffect(() => {
    (async () => {
      SplashScreen.preventAutoHideAsync();
      if (await Barometer.isAvailableAsync()) {
        setBarometerAvailable(true);
        Barometer.addListener(barometerData => {
          setPressure(barometerData.pressure)
        })
        if (pressure > (1013 + 5) || pressure < (1013 - 5)) {
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
      position: "absolute"
    },
    container: {
      height: Dimensions.get('screen').height,
      width: Dimensions.get('screen').width,
      position: "absolute",
      justifyContent: "center",
    },
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
      {!showCredits &&
        <Text style={{ textAlign: "center" }}>
          <Text style={{ fontSize: 40 }}>{pressure} hPa</Text>{'\n'}
          {caption}
        </Text>
      }
      {showCredits &&
        <Text style={{ textAlign: "center" }}>
          <Text style={{ fontWeight: "bold" }}>Credits:{"\n"}</Text>
            Background photo: Miguel Á. Padriñán (Pexels){"\n"}
            Icon: Murat Kalkavan (Icons8){"\n"}
          {!barometerAvailable && <Text>Data: Open Weather Map{"\n"}{"\n"}</Text>}
        </Text>
      }
      <Ionicons name="ios-more"
        onPress={() => showCredits ? setShowCredits(false) : setShowCredits(true)}
        size={24}
        color="#a9b5bc"
        style={{
          position: "absolute",
          top: 50,
          right: 30
        }}
      />
    </View>
  );
}