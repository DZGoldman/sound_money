import React, { Component } from "react";
import "./App.css";
import { ReactMic } from "react-mic";
import forge from "node-forge";
import bitcoin from "bitcoinjs-lib";
import $ from "jquery";
import QR from "./QR";
import { Animated } from "react-animated-css";

// var hash = bitcoin.crypto.sha256(Buffer.from('correct horalsdhljkasdfkladhsfse battery staple'))
// console.log(hash)
// const keyPair = bitcoin.ECPair.fromPrivateKey(hash)
// const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
// console.log(address)
var hash = "";
const recordTime = 3;

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
    QRs: false,
    showOffline: false
  };

  // phases: start, instr1, instr2, record, qr
  initInstr1 = () => {
    // todo: online status
    this.setState(
      {
        phase: "instr1",
        showHead: false,
        nextButtonText: ""
      },
      () => {
        this.setMessage(
          "1. disconnect your internet access (recommended)",
          () => this.setState({ nextButtonText: "next" })
        );
      }
    );
  };

  initInstr2 = () => {
    // todo: online status
    this.setState(
      {
        phase: "instr2",
        nextButtonText: ""
      },
      () => {
        this.setMessage(
          "2. ensure audio is connected; the red line should be active",
          () => this.setState({ nextButtonText: "next", recording: true })
        );
      }
    );
  };

  initRecording = () => {
    this.setState(
      {
        phase: "record",
        message: "",
        nextButtonText: "",
        recording: false
      },
      () => {
        var count = 3;
        this.setState({
          shortCountDown: count
        });
        const intID = window.setInterval(() => {
          count--;
          this.setState({
            shortCountDown: count
          });

          if (count == 0) {
            window.clearInterval(intID);
            this.startRecording();
          }
        }, 1000);
      }
    );
  };
  componentDidMount = () => {
    window.r = this;

    $(() => {
      window.addEventListener("offline", this.goOffline, false);
      // window.setTimeout(()=>{
      //   $('#next-button').animate({opacity: 1}, 1000)

      // }, 500)
    });
  };

  goOffline = () => {
    console.log("went offline");
    this.setState({
      showOffline: true
    });
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
        recording: false,
        phase: "endRecord"
      },
      () => {
        hash = hash + +new Date() + Math.random();
        var privk = bitcoin.crypto.sha256(Buffer.from(hash));
        // console.log(privk)
        const keyPair = bitcoin.ECPair.fromPrivateKey(privk);
        const { address } = bitcoin.payments.p2pkh({
          pubkey: keyPair.publicKey
        });
        this.setState({
          QRs: {
            private: keyPair.toWIF(),
            address
          }
        });

        // var md = forge.md.sha256.create();
        // md.update(hash);
        // console.log(md.digest().toHex())
      }
    );
  };
  onData = blob => {
    if (this.state.phase != "record") return;
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
      this.finalize();
    }, recordTime * 1000);
  };

  initStopRecording() {}
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

  nextClick = () => {
    const { phase } = this.state;
    if (phase == "start") {
      this.initInstr1();
    } else if (phase == "instr1") {
      this.initInstr2();
    } else if (phase == "instr2") {
      this.initRecording();
    }
  };

  render() {
    const {
      showHead,
      nextButtonText,
      shortCountDown,
      phase,
      recording,
      QRs,
      showOffline
    } = this.state;
    return (
      <div className="App">
        {QRs && <QR QRs={QRs} />}
        <div id="header-container">
          <div id="header">{showHead && "sound money"}</div>
          <div id="sub">
            {showHead && "paper wallet generator from audio entropy"}
          </div>
        </div>
        {showOffline && <div id="offline">you went offline (apparantly)</div>}
        <div id="message">{this.state.message}</div>
        <div id="next-button-wrapper">
          {this.state.nextButtonText && (
            <Animated
              animationIn="fadeIn"
              animationOut="fadeOut"
              isVisible={true}
            >
              <div onClick={this.nextClick} id="next-button">
                <span>{this.state.nextButtonText}</span>
              </div>
            </Animated>
          )}
        </div>
        <div>{shortCountDown > 0 && shortCountDown}</div>
        <div id="make-noise">
          {recording && phase == "record" && "make noise"}
        </div>
        <ReactMic
          record={this.state.recording} // defaults -> false.  Set to true to begin recording
          // onStop={this.finalize} // callback to execute when audio stops recording
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
