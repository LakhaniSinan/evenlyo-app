import {useCallback, useState} from 'react';
import {getNotifications} from '../services/Notifications';

const useNotifications = () => {
  const [notification, setNotificaiton] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      const status = res?.status || 0;
      const data = res?.data || {};
      if (status === 200 || status === 201) {
        const list = Array.isArray(data?.data) ? data.data : [];
        setNotificaiton(list);
        return {success: true, data: list};
      }
      return {success: false, message: data?.message || 'Failed to fetch notifications'};
    } catch (error) {
      console.log('fetchNotifications error:', error);
      return {success: false, message: 'Something went wrong'};
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notification,
    loading,
    setLoading,
    fetchNotifications,
    setNotificaiton,
  };
};

export default useNotifications;
