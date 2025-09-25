import {useState, useCallback} from 'react';
import {getProfile} from '../services/Settings';

const useProfile = () => {
  const [profileData, setProfileData] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await getProfile();
      if (response.status === 200 || response.status === 201) {
        setProfileData(response?.data?.data);
        return {success: true, data: response?.data?.data};
      } else {
        return {success: false, message: response?.data?.message};
      }
    } catch (error) {
      console.log('Profile fetch error:', error);
      return {success: false, message: 'Something went wrong'};
    }
  }, []);

  return {profileData, fetchProfile};
};

export default useProfile;
