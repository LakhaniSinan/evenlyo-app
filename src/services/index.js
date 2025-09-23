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
      return error.response;
    });
};

export default Api;
