import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {icons} from '../assets';

export const baseUrl = 'https://evenlyo-backend-20036df510ad.herokuapp.com/api';

const api = async (path, params, method) => {
  let userToken = await AsyncStorage.getItem('token');
  userToken = JSON.parse(userToken);

  console.log(userToken, 'userTokenuserTokenuserTokenuserToken');

  let options = {
    timeout: 1000 * 10,
    headers: {
      'Content-Type': 'application/json',
      ...(userToken !== null && {
        Authorization: `Bearer ${userToken}`,
      }),
    },
    method: method,
    ...(params && {data: JSON.stringify(params)}),
  };

  console.log(baseUrl + path, options, 'options');
  return axios(baseUrl + path, options)
    .then(response => {
      return response;
    })
    .catch(async error => {
      if (error?.status == 401) {
        unauthorizePopup.current.isVisible({
          headings: 'Session Expired',
          message: error.response.data.message,
          iconss: icons.redcross,
        });
        return;
      }
      return error.response;
    });
};

export default api;
