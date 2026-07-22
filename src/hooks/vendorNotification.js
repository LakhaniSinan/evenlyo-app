import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';
import {setUnreadCount} from '../redux/slice/notifications';
import {getVendorNotifications} from '../services/Notifications';
import {setVendorUnreadCount} from '../redux/slice/vendorNotificationsCount';

const useVendorNotifications = () => {
  const [notification, setNotificaiton] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const fetchVendorNotifications = useCallback(
    async ({isRefresh = false} = {}) => {
      try {
        if (!isRefresh) {
          setLoading(true);
        }

        const res = await getVendorNotifications();

        const status = res?.status || 0;
        const data = res?.data || {};

        if (status === 200 || status === 201) {
          const list = Array.isArray(data?.data) ? data.data : [];

          const unreadCount = list.filter(item => !item?.isRead).length;

          dispatch(setVendorUnreadCount(unreadCount));

          setNotificaiton(list);

          return {
            success: true,
            data: list,
          };
        }

        return {
          success: false,
          message: data?.message || 'Failed to fetch vendor notifications',
        };
      } catch (error) {
        console.log('fetchVendorNotifications error:', error);

        return {
          success: false,
          message: 'Something went wrong',
        };
      } finally {
        if (!isRefresh) {
          setLoading(false);
        }
      }
    },
    [dispatch],
  );

  return {
    notification,
    loading,
    setLoading,
    fetchVendorNotifications,
    setNotificaiton,
  };
};

export default useVendorNotifications;
