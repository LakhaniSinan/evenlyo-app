import {useEffect} from 'react';
import {Platform} from 'react-native';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {useDispatch} from 'react-redux';
import {helper} from '../helper';
import {setLocation} from '../redux/slice/location';

export const useLocation = () => {
  const dispatch = useDispatch();

  const requestLocationPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const initializeLocation = async () => {
    try {
      const permissionStatus = await helper.checkLocation();

      if (permissionStatus !== 'granted') {
        const granted = await requestLocationPermission();
        if (!granted) {
          console.log('Location permission denied');
          return;
        }
      }

      const position = await helper.getCurrentLocation();

      if (position) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=AIzaSyAZgyAHxugn3hINdg4b9vJUHJtUHpJYw2U`,
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            let city = '';
            let state = '';
            let fullAddress = '';

            // Parse address components
            data.results[0].address_components.forEach(component => {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
            });

            fullAddress = data.results[0].formatted_address;

            const locationData = {
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              },
              address: fullAddress,
              city: city,
              state: state,
            };

            dispatch(setLocation(locationData));
          }
        } catch (error) {
          console.error('Error getting address:', error);
          // Fallback to coordinates only if geocoding fails
          const locationData = {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            },
            address: `${position.coords.latitude}, ${position.coords.longitude}`,
            city: '',
            state: '',
          };
          dispatch(setLocation(locationData));
        }
      }
    } catch (error) {
      console.error('Error initializing location:', error);
    }
  };

  useEffect(() => {
    initializeLocation();
  }, []);

  return {
    refreshLocation: initializeLocation,
  };
};

export default useLocation;
