import React from 'react';

import './App.css';
import Forkmeongithub from './forkmeongithub.js';
import OpenWeatherMap from './openweathermap.js';

const LOCATION_DEFAULT = 'Berlin';

class Thermometer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: LOCATION_DEFAULT,
      weather: null,
      loading: false,
    }

    this.queryStartTimeout = null;
    this.queryAbortController = null;

    // https://reactjs.org/docs/handling-events.html
    this.handleLocationChange = this.handleLocationChange.bind(this);
  }

  handleLocationChange(e) {
    this.setState({location: e.target.value})

    clearTimeout(this.queryStartTimeout);

    if(this.queryAbortController !== null ) {
      this.queryAbortController.abort();
    }

    this.setState({
      queryStartTimeout: setTimeout(() =>
        this.queryWeather(), 200),
    })
  }

  queryWeather() {
    this.setState({loading: true});

    this.queryAbortController = new AbortController();

    fetch('/.netlify/functions/weather?q=' + this.state.location, {
        signal: this.queryAbortController.signal
    })
    .then(res => res.json())
    .then((data) => {
      this.setState({ weather: data, loading: false });
    })
    .catch((e) => {
      // console.log(e);
      this.setState({loading: false});
    });
  }

  componentDidMount() {
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
          <Scale weather={this.state.weather} />
        </div>
        <div className="loading-wrapper">
          <div
            className="loading"
            style={{display: this.state.loading === true ? 'block':'none'}}>
            Loading...
          </div>
        </div>
        <OpenWeatherMap />
      </div>
    );
  }
}

class LocationInput extends React.Component {
  render() {
    return (<input type="text" className="location-input"
      value={this.props.location} placeholder="Enter a location"
      onChange={this.props.handleChange} />);
  }
}

class Scale extends React.Component {
  render() {
    let temp = null;

    if(this.props.weather && this.props.weather.main) {
      temp = this.props.weather.main.temp;
    }

    const liquid_min = -15;
    const liquid_max = 45;

    let liquid = Math.max(liquid_min, Math.min(liquid_max, temp));

    const padding = 10;

    const liquid_step = 1.5;
    const liquid_0_y = 73;
    const liquid_0_height = 28;
    const liquid_hot_threshold = 20;

    const liquid_y = (liquid * liquid_step * -1) + liquid_0_y;
    const liquid_height = (liquid * liquid_step) + liquid_0_height;

    let liquid_rect = null;
    if(temp != null) {
      liquid_rect = (
        <rect width={28} height={liquid_height}
          x={padding + 1} y={padding + liquid_y - 2} ry={0} rx={0}
          className={temp > liquid_hot_threshold ?
            'liquid-hot' : 'liquid-cold'} />
      );
    }

    let scale = [];
    [-10, 0, 10, 20, 30, 40].forEach((item, i) => {
      scale.push(
        <text x={42} y={padding + liquid_0_y + (liquid_step * item * -1)}
          className="scale-number" key={'scale-number-' + i}>
          {item}
        </text>
      );
    });

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

function App() {
  return (
    <div className="app">
      <Thermometer />
    </div>
  );
}

export default App;
