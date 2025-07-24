import React, { Component } from "react";
import "./App.css";
import forge from "node-forge";
import bitcoin from "bitcoinjs-lib";
import * as crypto from 'crypto';
import * as bs58check from 'bs58check';
import * as bip32 from 'bip32';
import $ from "jquery";
import QR from "./QR";
import AudioVisualizer from "./AudioVisualizer";
import { Animated } from "react-animated-css";
import Favicon from 'react-favicon';
import Social from './Social'

var hash = "";
const recordTime = 10;


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
    showOffline: false,
    showFoot: true,
    showPrint: true,
    blinker: true
  }


  // phases: start, instr1, instr2, record, qr
  initInstr1 = () => {
    // todo: online status
    this.setState(
      {
        phase: "instr1",
        showHead: false,
        nextButtonText: "",
        showFoot: false
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
          "2. ensure audio is connected (the red waveform should be active)",
          () => this.setState({ nextButtonText: "next", recording: true })
        );
      }
    );
  };

  tr = () =>{
    this.setState({recording: !this.state.recording})
  }
  initRecording = () => {
    this.setState(
      {
        phase: "record",
        message: "",
        nextButtonText: "",
        recording: false,
        blinker: false
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
    window.tr = this.tr

    $(() => {
      window.addEventListener("offline", this.goOffline, false);

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
              // Step 1: Convert a long string to a 32-byte SHA-256 hash
        const seed = crypto.createHash('sha256').update(hash).digest(); // 32 bytes

        // Step 2: Use that as entropy to generate a BIP32 root node
        const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin); // for testnet, use bitcoin.networks.testnet

        // Optional: Derive a child key
        const child = root.derivePath("m/0'/0/0");

        // Output private/public key and address
        console.log("private key raw", child.privateKey.toString('hex'));
        console.log("Private key (WIF):", child.toWIF());
        console.log("Public key:", child.publicKey.toString('hex'));
        const publicKey = child.publicKey.toString('hex');

        const sha256 = crypto.createHash('sha256').update(publicKey).digest();
        const ripemd160 = crypto.createHash('ripemd160').update(sha256).digest();
        const payload = Buffer.concat([Buffer.from([0x00]), ripemd160]); // 0x00 = mainnet
        const address = bs58check.encode(payload);
        // TODO: double check
        console.log('Public address:', address);
        
        this.setState({
          QRs: {
            private: child.toWIF(),
            address
          },
          showFoot: true
        });
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
      // if (hash.length > 300000){
      //          // this.setState({recording: false})
      //   hash = this.sha256(hash)
      // }
    });
    reader.readAsArrayBuffer(blob);
  };

  startRecording = () => {
    this.setState({
      recording: true,
      blinker: true
    });
    var count = recordTime
    const intId = window.setInterval(() => {
      console.log(count)
      this.setState({shortCountDown: count})
      count -- 
      if (count < 0){
        this.setState({shortCountDown: 0})
        window.clearInterval(intId)
        this.finalize();
      }
    }, 1000);
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
    }, 15);
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
  preparePrint = ()=>{
    this.setState({
      showPrint: false,
      showFoot: false
    }, ()=>{
      window.print()
    })
  }

  renderSocial = () => {
    if (this.state.QRs) {
      return (
        <Animated
          animationIn="fadeIn"
          animationOut="fadeOut"
          isVisible={true}
          animationInDelay={1000}
        >
          <Social />
        </Animated>
      );
    } else {
      return <Social />;
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
      showOffline,
      showFoot
    } = this.state;
    return (
      <div className="App">
                <Favicon url="https://d1o50x50snmhul.cloudfront.net/wp-content/uploads/2012/04/mg21428614.500-2_300.jpg" />

        {QRs &&      <Animated
              animationIn="fadeIn"
              animationOut="fadeOut"
              isVisible={true}
              animationInDelay={1000}
            >
        <QR 
        QRs={QRs} 
        showPrint={this.state.showPrint}
        preparePrint={this.preparePrint}
        />
            </Animated>
        }
        <div id="header-container">
          <div id="header">{showHead && "sound money"}</div>
          <div id="sub">
            {showHead && "bitcoin paper wallet from audio entropy"}
          </div>
        </div>
        {showOffline && <div id="offline">🔒 Offline Mode Active</div>}
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
        <div id="make-noise">
          {recording && phase == "record" && "make noise"}
        </div>
        <div id='short-cd'>{shortCountDown > 0 && shortCountDown}</div>
       {this.state.blinker && <AudioVisualizer
          record={this.state.recording}
          onData={this.onData}
          strokeColor={"red"}
          backgroundColor={"black"}
          className={"ts"}
        />}
        {showFoot && this.renderSocial()}
      </div>
    );
  }
}

export default App;
