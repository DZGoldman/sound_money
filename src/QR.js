import React, { PureComponent } from "react";
import "./App.css";
import { ReactMic } from "react-mic";

var QRCode = require("qrcode");

class QR extends PureComponent {
  state = {};
  componentDidMount() {
    var addressCanvas = document.getElementById("address-qr");
    var privateCanvas = document.getElementById("private-qr");
    QRCode.toCanvas(addressCanvas, this.props.QRs.address, function(error) {
      if (error) console.error(error);
    });

    QRCode.toCanvas(privateCanvas, this.props.QRs.private, function(error) {
      if (error) console.error(error);
    });
  }

  print = () => {
    this.props.preparePrint(window.print)
    
  };

  render() {
    return (
      <div id="canvas-component-wrapper">
      <div id='qrs-wrapper'>
        <div className="qr-wrapper">
          <div>
            <canvas id="address-qr" className='qr-canvas'/>{" "}
          </div>
          <div className='canvas-label-row'>btc private key</div>
          <div className='canvas-key-row'>{this.props.QRs.private}</div>
        </div>
        <div className="qr-wrapper">
          <div>
            <canvas id="private-qr" className='qr-canvas' />
          </div>
          <div className='canvas-label-row'>btc public address</div>
          <div className='canvas-key-row'>{this.props.QRs.address}</div>
        </div>
        </div>
      <div id='outputs'>
        {this.props.showPrint && <div id='print-button' onClick={this.props.preparePrint}>print</div>}
      </div>
      </div>
    );
  }
}

export default QR;
