/*
 * API endpoint to forward weather information from openweathermap.org
 *
 * parameters:
 *  q - the location to query weather information from
 *
 * result:
 *  openweathermap json https://openweathermap.org/current#parameter
 */

const fetch = require('node-fetch');

const API_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather';
const API_KEY = process.env.OPENWEATHERMAP_API_KEY

exports.handler = async (event, context) => {
  const location = event.queryStringParameters.q;

  return fetch(
    API_ENDPOINT + '?q=' + location +'&appid=' + API_KEY + '&units=metric')
  .then(response => response.text())
  .then(data => ({
    statusCode: 200,
    contentType: 'application/json; charset=utf-8',
    body: data,
  }))
  .catch(error => ({
    statusCode: 500,
    body: String(error),
  }));
};
