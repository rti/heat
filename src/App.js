import './App.css';

import React from 'react';

const location_default = '';

class Thermometer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      weather: null,
    }

    // https://reactjs.org/docs/handling-events.html
    this.handleLocationChange = this.handleLocationChange.bind(this);
  }

  handleLocationChange(e) {
    this.queryWeather(e.target.value);
  }

  queryWeather(city) {
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + city +
      '&units=metric&appid=')
    .then(res => res.json())
    .then((data) => {
      this.setState({ weather: data });
    })
    .catch(console.log);
  }

  componentDidMount() {
    this.queryWeather(location_default);
  }

  render() {
    return (
      <div className="container">
        <div className="input">
          <header className="header">
              Check for heat in
            </header>
          <LocationInput handleChange={this.handleLocationChange} />
        </div>
        <div className="output">
          <Scale weather={this.state.weather} />
        </div>
      </div>
    );
  }
}

class LocationInput extends React.Component {
  render() {
    return (<input type="text" className="location-input"
      placeholder="Enter a location" onChange={this.props.handleChange} />);
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
        <text x={43} y={padding + liquid_0_y + (liquid_step * item * -1)}
          className="scale-number" key={'scale-number-' + i}>
          {item}
        </text>
      );
    });

    return (
      <svg className="thermometer-container"
        width="200" height="400" viewBox="0 0 60 130">
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
