import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {API_BASE_URL} from '../config/server';

export const baseUrl = API_BASE_URL?.STAGING_API_BASE_URL;

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
