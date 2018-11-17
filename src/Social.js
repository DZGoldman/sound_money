import React from "react";
const Social = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.wrapper}>
        <span style = {styles.myName}>daniel goldman</span>
        <a  target="_blank" href="https://twitter.com/DZack23">
          <i style={styles.icon} className="fab fa-twitter"> </i>
        </a>
        <a target="_blank" href="https://github.com/DZGoldman/sound_money">
          <i style={styles.icon}  className="fab fa-github" />
        </a>
        <a target="_blank" href="https://medium.com/@dzack23">
          <i style={styles.icon}  className="fab fa-medium" />
        </a>
        <a target="_blank" href="http://danielzgoldman.com/">
          <i style={styles.icon}  className="fa fa-home" />
        </a>
      </div>
      <div style={styles.cryptoWrapper}>
        <div style={styles.donate}>BTC: 33STRJgjFgG2r8vEy9xLKN5dYfw26tSmVi </div> 
        <div style={styles.donate}>Eth: 0x36de2576CC8CCc79557092d4Caf47876D3fd416c </div>
        <div style={styles.donate}>XMR: 832DjfVp9ddVwQqq9hvXoHYfRL5f2kyRwDWFBaRdX3151sbp1VNvy5PdTRphnaa4RqGqJFRQfsHdnaPbtyfzQ6jKGtvJdPR </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    bottom: 15,
    position: "absolute",
    fontSize: 8
  },
  icon: {
    color: "white",
    fontSize: 13,
    marginLeft: 5
  },
  wrapper: {
    display: "flex",
    marginBottom: 5
  },
  child: {
    marginRight: 5
  },
  myName: {
    marginTop: 3
  },
  cryptoWrapper: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left"
  },
  donate: {
      marginBottom: 3
  }
};

export default Social;
