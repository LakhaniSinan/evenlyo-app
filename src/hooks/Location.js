// src/hooks/useLocation.js
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {helper} from '../helper';
import {setLocation} from '../redux/slice/location';

const useLocation = () => {
  const dispatch = useDispatch();

  const fetchAndSaveLocation = useCallback(async () => {
    try {
      const permission = await helper.checkLocationPermission();
      if (permission !== 'granted') {
        console.warn('Location permission not granted');
        return;
      }

      const position = await helper.getCurrentLocation();

      const address = await helper.getLocationAddress(
        position.coords.latitude,
        position.coords.longitude,
        'AIzaSyAvPVhgFVY2qv4c6kvukvIP2krPJe9dZGA',
      );

      dispatch(
        setLocation({
          coords: position.coords,
          address,
        }),
      );
    } catch (err) {
      console.error('Location Error:', err);
    }
  }, [dispatch]);

  return {fetchAndSaveLocation};
};

export default useLocation;
