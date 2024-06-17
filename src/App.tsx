import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

/**
 * State declaration for <App />
 */
interface IState {
  data: ServerRespond[],
  showGraph: boolean, // Flag to control the streaming of data
  interval?: NodeJS.Timeout | null, // Declare interval as optional
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      // data saves the server responds.
      // We use this state to parse data down to the child element (Graph) as element property
      data: [],
      showGraph: false, // Initialize to false as streaming is not started initially
      interval: null, // Initialize interval to null
    };
  }

  /**
   * Lifecycle method that starts data streaming when component mounts.
   * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
   */
  componentDidMount() {
    this.startStreaming();
  }

  /**
   * Start streaming data from the server.
   * This function fetches data every 100ms from the server until the component unmounts.
   */
  startStreaming() {
    let interval: NodeJS.Timeout;
    interval = setInterval(() => {
      this.getDataFromServer();
    }, 100);
    this.setState({ showGraph: true, interval });
  }
  

  /**
   * Stop streaming data from the server.
   * This function clears the interval set for fetching data.
   */
  stopStreaming() {
    if (this.state.interval) {
      clearInterval(this.state.interval);
      this.setState({ interval: null });
    }
  }
  

  /**
   * Get new data from server and update the state with the new data.
   * The function also handles duplicate data by checking the timestamp.
   */
  getDataFromServer() {
    DataStreamer.getData((serverResponds: ServerRespond[]) => {
      this.setState((prevState) => ({
        data: [...prevState.data, ...serverResponds.filter((newData) => (
          !prevState.data.some((prevData) => (
            newData.timestamp === prevData.timestamp && newData.stock === prevData.stock
          ))
        ))],
      }));
    });
  }
  

  /**
   * Render Graph react component with state.data parse as property data
   */
  renderGraph() {
    return <Graph data={this.state.data} />;
  }
  

  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            onClick={() => { this.startStreaming() }}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Clear interval to stop data streaming when component is unmounted.
   */
  componentWillUnmount() {
    this.stopStreaming();
  }
}

export default App;
