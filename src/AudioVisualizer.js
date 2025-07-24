import React, { Component } from 'react';

class AudioVisualizer extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.animationId = null;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
  }

  componentDidMount() {
    this.setupCanvas();
    if (this.props.record) {
      this.startRecording();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.record !== this.props.record) {
      if (this.props.record) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    }
  }

  componentWillUnmount() {
    this.stopRecording();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  setupCanvas = () => {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set initial background
    ctx.fillStyle = this.props.backgroundColor || 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      
      // Configure analyser
      this.analyser.fftSize = 256;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      // Connect microphone to analyser
      this.microphone.connect(this.analyser);
      
      // Start visualization
      this.visualize();
      
      // Handle onData callback for the parent component
      if (this.props.onData) {
        this.handleAudioData(stream);
      }
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  handleAudioData = (stream) => {
    // Create a MediaRecorder to capture audio data
    const mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.props.onData) {
        this.props.onData(event.data);
      }
    };
    
    // Start recording and emit data every 100ms
    mediaRecorder.start(100);
    this.mediaRecorder = mediaRecorder;
  }

  stopRecording = () => {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    // Clear canvas
    const canvas = this.canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = this.props.backgroundColor || 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  getColorFromHeight = (barHeight) => {
    // Normalize bar height to 0-1 range
    const normalized = Math.min(Math.max(barHeight / 500, 0), 1);
    
    // Create a color spectrum from blue -> green -> yellow -> red
    let r, g, b;
    
    if (normalized < 0.25) {
      // Blue to Cyan (0-0.25)
      const t = normalized / 0.25;
      r = 0;
      g = Math.floor(255 * t);
      b = 255;
    } else if (normalized < 0.5) {
      // Cyan to Green (0.25-0.5)
      const t = (normalized - 0.25) / 0.25;
      r = 0;
      g = 255;
      b = Math.floor(255 * (1 - t));
    } else if (normalized < 0.75) {
      // Green to Yellow (0.5-0.75)
      const t = (normalized - 0.5) / 0.25;
      r = Math.floor(255 * t);
      g = 255;
      b = 0;
    } else {
      // Yellow to Red (0.75-1)
      const t = (normalized - 0.75) / 0.25;
      r = 255;
      g = Math.floor(255 * (1 - t));
      b = 0;
    }
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  visualize = () => {
    if (!this.analyser || !this.dataArray) return;
    
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Clear canvas
    ctx.fillStyle = this.props.backgroundColor || 'black';
    ctx.fillRect(0, 0, width, height);
    
    // Draw waveform
    const barWidth = (width / this.dataArray.length) * 1.2;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < this.dataArray.length; i++) {
      barHeight = (this.dataArray[i] / 255) * height;
      
      // Set color based on bar height
      ctx.fillStyle = this.getColorFromHeight(barHeight);
      
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
    
    // Continue animation
    this.animationId = requestAnimationFrame(this.visualize);
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        className={this.props.className}
        style={{
          width: '100%',
          height: '500px',
          backgroundColor: this.props.backgroundColor || 'black',
          ...this.props.style
        }}
      />
    );
  }
}

export default AudioVisualizer;
