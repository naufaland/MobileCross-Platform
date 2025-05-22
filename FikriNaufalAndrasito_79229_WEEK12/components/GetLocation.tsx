import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";

const Geolocation = ({
  onLocationUpdate,
}: {
  onLocationUpdate: (
    longitude: number,
    latitude: number,
    location: Location.LocationObject
  ) => void;
}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        onLocationUpdate(
          location.coords.longitude,
          location.coords.latitude,
          location
        );
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Error getting location");
      }
    })();
  }, [onLocationUpdate]);

  let longitudeText = "Waiting...";
  let latitudeText = "Waiting...";

  if (errorMsg) {
    longitudeText = errorMsg;
    latitudeText = errorMsg;
  } else if (location) {
    longitudeText = `Longitude: ${location.coords.longitude}`;
    latitudeText = `Latitude: ${location.coords.latitude}`;
  }

  return (
    <View>
      <Text style={{ textAlign: "center" }}>{longitudeText}</Text>
      <Text style={{ textAlign: "center" }}>{latitudeText}</Text>
    </View>
  );
};

export default Geolocation;
