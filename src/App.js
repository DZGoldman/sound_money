import React, { Component } from "react";
import "./App.css";
import { ReactMic } from "react-mic";
import forge from "node-forge";
import bitcoin from "bitcoinjs-lib";

// var hash = bitcoin.crypto.sha256(Buffer.from('correct horalsdhljkasdfkladhsfse battery staple'))
// console.log(hash)
// const keyPair = bitcoin.ECPair.fromPrivateKey(hash)
// const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
// console.log(address)
var hash = "";
const recordTime = 20;

var QRCode = require("qrcode");

class App extends Component {
  state = {
    phase: "start",
    recording: false,
    message: "",
    showHead: true,
    nextButtonText: "click to start",
    shortCountDown: 0,
    mainCountDown: 0,
    // make noise
    showQRs: false
  };

  // phases: start, instructions1, instrucitons2, record, qr

  componentDidMount = () => {
    window.r = this;
    // this.startRecording()

    // var canvas = document.getElementById('canvas')

    // QRCode.toCanvas(canvas, '12Yr17SCr5TuDzbr56s36nY9qBYYpM5Lm2', function (error) {
    //   if (error) console.error(error)
    //   console.log('success!');
    // })
    // window.print();
  };

  sha256 = str => {
    var md = forge.md.sha256.create();
    md.update(hash);
    return md.digest().toHex();
  };
  finalize = () => {
    console.log("finalizing");
    this.setState(
      {
        recording: false
      },
      () => {
        hash = hash + +new Date() + Math.random();
        var privk = bitcoin.crypto.sha256(Buffer.from(hash));
        // console.log(privk)
        const keyPair = bitcoin.ECPair.fromPrivateKey(privk);
        console.log("privkey", keyPair.toWIF());
        const { address } = bitcoin.payments.p2pkh({
          pubkey: keyPair.publicKey
        });
        console.log("pub address compressed", address);

        // var md = forge.md.sha256.create();
        // md.update(hash);
        // console.log(md.digest().toHex())
      }
    );
  };
  onData = blob => {
    var reader = new FileReader();
    reader.addEventListener("loadend", () => {
      var buf = reader.result;

      var byteArray = new Uint8Array(buf);
      var byteStr = [...byteArray].join("");
      hash += byteStr;
      // console.log(hash.length)
      // if (hash.length > 300000){
      //          // this.setState({recording: false})
      //   hash = this.sha256(hash)
      // }
    });
    reader.readAsArrayBuffer(blob);
  };

  startRecording = () => {
    this.setState({
      recording: true
    });

    window.setTimeout(() => {
      console.log("stopping recording");
      this.setState({
        recording: false
      });
    }, recordTime * 1000);
  };

  setMessage = (msg, then) => {
    this.state.message && this.setState({ message: "", showNext: false });
    var i = 0;
    const intId = window.setInterval(() => {
      this.setState({ message: this.state.message + msg[i] });
      i++;
      if (i >= msg.length) {
        window.clearInterval(intId);
        then && then();
      }
    }, 20);
  };

  render() {
    return (
      <div className="App">
        {/* <canvas id="canvas"></canvas> */}

        {this.state.showHead && (
          <div id="header-container">
            <div id="header">sound money</div>
            <div id="sub">paper wallet generator from audio entropy</div>
          </div>
        )}
        <div id="message">{this.state.message}</div>
      {this.state.nextButtonText && <div id="next-button">{this.state.nextButtonText}</div> }
        {this.state.showNext && <button onClick={this.nextPhase}>next</button>}
        <ReactMic
          record={this.state.recording} // defaults -> false.  Set to true to begin recording
          onStop={this.finalize} // callback to execute when audio stops recording
          onData={this.onData} // callback to execute when chunk of audio data is available
          strokeColor={"red"} // sound wave color
          backgroundColor={"black"} // background color
          className={"ts"}
        />
      </div>
    );
  }
}

export default App;
