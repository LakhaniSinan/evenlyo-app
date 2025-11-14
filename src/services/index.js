import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// export const baseUrl = 'https://evenlyo-backend-20036df510ad.herokuapp.com/api';
// export const baseUrl = 'https://0g01d8wd-5000.inc1.devtunnels.ms/api';
// export const baseUrl = 'https://cp5h187s-5000.inc1.devtunnels.ms/api';
export const baseUrl = 'https://1qsx0vd0-5000.inc1.devtunnels.ms/api';
// export const baseUrl = 'http://192.168.0.35:5000/api';

const api = async (path, params, method) => {
  let userToken = await AsyncStorage.getItem('token');
  userToken = JSON.parse(userToken);

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
      return error.response;
    });
};

export default api;
