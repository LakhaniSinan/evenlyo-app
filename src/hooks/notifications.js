import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';
import {setUnreadCount} from '../redux/slice/notifications';
import {getNotifications} from '../services/Notifications';

const useNotifications = () => {
  const [notification, setNotificaiton] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const fetchNotifications = useCallback(
    async ({isRefresh = false} = {}) => {
      try {
        if (!isRefresh) {
          setLoading(true);
        }

        const res = await getNotifications();

        const status = res?.status || 0;
        const data = res?.data || {};

        if (status === 200 || status === 201) {
          const list = Array.isArray(data?.data) ? data.data : [];


          const unreadCount = list.filter(item => !item?.isClientRead).length;
          console.log(unreadCount, 'unreadCountunreadCountunreadCount');
          console.log(list, 'unreadCountunreadCountunreadCount');

          dispatch(setUnreadCount(unreadCount));

          setNotificaiton(list);

          return {
            success: true,
            data: list,
          };
        }

        return {
          success: false,
          message: data?.message || 'Failed to fetch notifications',
        };
      } catch (error) {
        console.log('fetchNotifications error:', error);

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
    fetchNotifications,
    setNotificaiton,
  };
};

export default useNotifications;
