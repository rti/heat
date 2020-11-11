import React from 'react';

import './App.css';
import Forkmeongithub from './forkmeongithub.js';
import OpenWeatherMapLogo from './openweathermaplogo.js';

const LOCATION_DEFAULT = 'Berlin';

// the app's main component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // the location string entered by the user
      location: LOCATION_DEFAULT,

      // data provided by weather api
      weather: null,

      // currently loading data from api flag
      loading: false,
    }

    // starting the api request after a short timeout only if there was no more
    // input given by the user. this reduces the amount of request sent to the
    // api while typing.
    this.queryStartTimeout = null;

    // aborting any currently running api request before starting a new one in
    // order to prevent race conditions
    this.queryAbortController = null;

    // https://reactjs.org/docs/handling-events.html
    this.handleLocationChange = this.handleLocationChange.bind(this);
  }

  // the user entered characters into the location input
  handleLocationChange(e) {
    this.setState({location: e.target.value})

    // if there was an api request about to start, cancel
    clearTimeout(this.queryStartTimeout);

    // if there is an abort controller, abort any possibly running api requests
    if(this.queryAbortController !== null ) {
      this.queryAbortController.abort();
    }

    // start the next api request after a short delay
    this.setState({
      queryStartTimeout: setTimeout(() =>
        this.queryWeather(), 200),
    })
  }

  // request data from weather api
  queryWeather() {
    this.setState({loading: true});

    // a fresh abort controller required for every fetch()
    this.queryAbortController = new AbortController();

    // start the actual request and store the result in this.state.weather
    fetch('/.netlify/functions/weather?q=' + this.state.location, {
        signal: this.queryAbortController.signal
    })
    .then(res => res.json())
    .then((data) => {
      this.setState({ weather: data, loading: false });
    })
    .catch((e) => {
      this.setState({loading: false});
    });
  }

  componentDidMount() {
    // inicially query the weather once for LOCATION_DEFAULT
    this.queryWeather();
  }

  render() {
    return (
      <div className="container">
        <Forkmeongithub />
        <div className="input">
          <header className="header">
              Check for heat in
            </header>
          <LocationInput
            location={this.state.location}
            handleChange={this.handleLocationChange} />
        </div>
        <div className="output">
          <Thermometer weather={this.state.weather} />
        </div>
        <div className="loading-wrapper">
          <div
            className="loading"
            style={{display: this.state.loading === true ? 'block':'none'}}>
            Loading...
          </div>
        </div>
        <OpenWeatherMapLogo />
      </div>
    );
  }
}

// user location text input
class LocationInput extends React.Component {
  render() {
    return (<input type="text" className="location-input"
      value={this.props.location} placeholder="Enter a location"
      onChange={this.props.handleChange} />);
  }
}

// thermometer visulization
class Thermometer extends React.Component {
  render() {
    // temperature in degree celsius
    let temp = null;

    // get temperature
    if(this.props.weather && this.props.weather.main) {
      temp = this.props.weather.main.temp;
    }

    // minimum and maximum temperature to display via liquid level
    const liquid_min = -15;
    const liquid_max = 45;

    // liquid level to display
    let liquid = Math.max(liquid_min, Math.min(liquid_max, temp));

    // padding of the thermometer inside the svg element
    const padding = 10;

    // liquid delta per degree celsius
    const liquid_step = 1.5;

    // liquid y position at 0°C
    const liquid_0_y = 73;

    // liquid height position at 0°C
    const liquid_0_height = 28;

    // temperature to consider "hot"
    const liquid_hot_threshold = 20;

    // generate rect to display thermometer liquid
    let liquid_rect = null;
    if(temp != null) {
      const liquid_y = (liquid * liquid_step * -1) + liquid_0_y;
      const liquid_height = (liquid * liquid_step) + liquid_0_height;

      liquid_rect = (
        <rect width={28} height={liquid_height}
          x={padding + 1} y={padding + liquid_y - 2} ry={0} rx={0}
          className={temp > liquid_hot_threshold ?
            'liquid-hot' : 'liquid-cold'} />
      );
    }

    // generate numbers on the side of the thermometer, the scale
    let scale = [];
    [-10, 0, 10, 20, 30, 40].forEach((item, i) => {
      scale.push(
        <text x={42} y={padding + liquid_0_y + (liquid_step * item * -1)}
          className="scale-number" key={'scale-number-' + i}>
          {item}
        </text>
      );
    });

    // render thermometer container, thermometer, liquid, scale and temp display
    return (
      <svg className="thermometer-container"
        viewBox="0 0 50 130" style={{height:'70vh'}}>
        <rect width={30} height={100}
          x={padding} y={padding} ry={0} rx={0}
          className="thermometer" />
        {liquid_rect}
        {scale}
        <text x={17} y={125} className="temp-display">
          {temp != null ? Math.floor(temp) + '°C' : 'N/A '}
        </text>
      </svg>
    );
  }
}

export default App;
