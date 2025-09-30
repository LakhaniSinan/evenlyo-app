import axios from 'axios';

const baseUrl = 'https://evenlyo-backend-20036df510ad.herokuapp.com/api';
const Api = async (path, params, method) => {
  let options = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: method,
    ...(params && {data: JSON.stringify(params)}),
  };

  console.log(baseUrl, path, options, 'options');

  return axios(baseUrl + path, options)
    .then(response => {
      return response;
    })
    .catch(async error => {
      // Normalize error shape so callers can safely read .status and .data
      const status = error?.response?.status || 0;
      const data = error?.response?.data || {message: error?.message || 'Network error'};
      return {status, data};
    });
};

export default Api;
