import {useEffect} from 'react';
import {Platform} from 'react-native';
import {useDispatch} from 'react-redux';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {setLocation} from '../redux/slice/location';
import {helper} from '../helper';
import store from '../redux';

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
      // First check if we already have permission
      const permissionStatus = await helper.checkLocation();

      // If not granted, request permission
      if (permissionStatus !== 'granted') {
        const granted = await requestLocationPermission();
        if (!granted) {
          console.log('Location permission denied');
          return;
        }
      }

      // Get location after permission is granted
      const position = await helper.getCurrentLocation();
      console.log('Raw position data:', position);

      if (position) {
        try {
          // Use Google Maps Geocoding API to get address details
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=AIzaSyAvPVhgFVY2qv4c6kvukvIP2krPJe9dZGA`
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

            console.log('Geocoding response:', {
              fullAddress,
              city,
              state,
              rawData: data.results[0]
            });

            // Construct the location data with real address
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
            console.log('Location data dispatched:', locationData);
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
