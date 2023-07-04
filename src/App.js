import './styles.css';
import React from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

class RouletteContext {
  rotateAngle = 0;
  angleChanger = 0;
  segmentAngle = 0;
  numberOfSegments = 0;
  spinStarted = false;
  rouletteNumbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26,
  ];
  result = 0;
  evenBid = 0;
  oddBid = 0;
  win = null;
  gameOver = true;
  double = false;

  constructor() {
    makeAutoObservable(this);
  }

  setRotateAngle = (angle) => {
    this.rotateAngle += angle;
  };
  setWin = (value) => {
    this.win = value;
  };
  setResult = (value) => {
    this.result += value;
  };
  setNumberOfSegments = (value) => {
    this.numberOfSegments = value;
  };
  setSegmentAngle = (value) => {
    this.segmentAngle = value;
  };
  setSpinStarted = (value) => {
    this.spinStarted = value;
  };
  setAngleChanger = (value) => {
    this.angleChanger = value;
  };
  setBids = (bid, style) => {
    if (style === 'double') {
      this[bid] *= 2;
    } else if (style === 'zero') {
      this[bid] = 0;
    } else {
      this[bid] += 1;
    }
  };
  setGameOver = (value) => {
    this.gameOver = value;
  };
  setDouble = () => {
    this.double = !this.double;
  };
}
const rouletteStorage = new RouletteContext();

export const Tableau = observer(({ wheelRef }) => {
  const {
    double,
    setDouble,
    result,
    rouletteNumbers,
    setResult,
    oddBid,
    evenBid,
    setBids,
    spinStarted,
    setSpinStarted,
    rotateAngle,
    setRotateAngle,
    gameOver,
    setGameOver,
    setWin,
    segmentAngle,
    numberOfSegments,
  } = rouletteStorage;

  const handleSpinResult = (sector) => {
    let rouletteNumber = rouletteNumbers[sector];
    // console.log('sector', sector, 'rouletteNumber', rouletteNumber);
    if (oddBid) {
      if (rouletteNumber > 0 && rouletteNumber % 2 === 0) {
        setResult(-oddBid);
        setWin(false);
      } else if (rouletteNumber > 0 && rouletteNumber % 2 !== 0) {
        setResult(oddBid);
        setWin(true);
      } else {
        setResult(-oddBid);
        setWin(false);
      }
    } else if (evenBid) {
      if (rouletteNumber > 0 && rouletteNumber % 2 === 0) {
        setResult(evenBid);
        setWin(true);
      } else if (rouletteNumber > 0 && rouletteNumber % 2 !== 0) {
        setResult(-evenBid);
        setWin(false);
      } else {
        setResult(-evenBid);
        setWin(false);
      }
    }
  };

  const spinHandle = (e) => {
    if (result && (oddBid || evenBid) && e.pressed) {
      let angleC = Math.floor(Math.random() * 14400) - 7200;

      if (Math.abs(angleC) <= 1080) {
        if (angleC < 0) {
          angleC -= 1080;
        } else {
          angleC += 1080;
        }
      }
      let rotateAnglePrev = rotateAngle + angleC;
      setSpinStarted(true);
      wheelRef.current.style.transition = `transform ${Math.abs(angleC)}ms ease-in-out`;
      wheelRef.current.style.transform = `rotate(${rotateAnglePrev}deg)`;
      setWin(null);
      setRotateAngle(angleC);
      const tyty = setTimeout(() => {
        let pureAngle = (rotateAnglePrev % 360) - segmentAngle / 2;
        if (pureAngle < 0) {
          pureAngle = 360 + pureAngle;
        }
        pureAngle = 360 - pureAngle;
        let pureAnglePerSegmentAngle = Math.floor(pureAngle / segmentAngle);
        if (pureAnglePerSegmentAngle > numberOfSegments - 1) {
          handleSpinResult(0);
        } else {
          handleSpinResult(pureAnglePerSegmentAngle);
        }
      }, Math.abs(angleC));
      setSpinStarted(false);
      return () => {
        clearTimeout(tyty);
      };
    }
  };
  return (
    <div className="controls">
      <div
        onClick={() => {
          if (double && evenBid > 0) {
            setBids('evenBid', 'double');
          } else {
            setBids('evenBid', 'plus');
          }
          if (gameOver) setGameOver(false);
          setWin(null);
          if (oddBid) {
            setBids('oddBid', 'zero');
          }
        }}
        className="spin-button"
      >
        {double && evenBid > 0 ? `Even x2` : `Even +1`}
      </div>
      <div
        onClick={() => {
          if (double && oddBid > 0) {
            setBids('oddBid', 'double');
          } else {
            setBids('oddBid', 'plus');
          }
          if (gameOver) setGameOver(false);
          setWin(null);
          if (evenBid) {
            setBids('evenBid', 'zero');
          }
        }}
        className="spin-button"
      >
        {double && oddBid > 0 ? `Odd x2` : `Odd +1`}
      </div>
      <button
        id="spin-button"
        onClick={(e) => {
          e.pressed = true;
          spinHandle(e);
        }}
        disabled={spinStarted}
        className="spin-button"
      >
        Spin
      </button>
      <div
        onClick={() => {
          setResult(100);
          if (gameOver) setGameOver(false);
          setWin(null);
        }}
        className="spin-button"
      >
        Deposit +100
      </div>
      <div
        onClick={() => {
          setDouble();
        }}
        className={`spin-button ${double ? 'spin-button-active' : ''}`}
      >
        x2
      </div>
    </div>
  );
});

export const Wheel = observer(({ wheelRef }) => {
  const { rouletteNumbers, numberOfSegments } = rouletteStorage;
  return (
    <div>
      <span className="arrow"></span>
      <div
        ref={wheelRef}
        className="wheel"
        style={{ transition: 'transform 1000ms ease-in-out 0s', transform: 'rotate(0deg)' }}
      >
        {rouletteNumbers.map((num, i) => (
          <div key={`seg${i}`}
            className={`segment ${i === 0 ? 'zero' : i % 2 === 0 ? 'red' : 'black'}`}
            style={{ transform: `translateX(-50%) rotate(${(360 / numberOfSegments) * i}deg)` }}
          >
            <span>{num}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const Results = observer(({ wheelRef }) => {
  let { gameOver, result, oddBid, evenBid, win, setNumberOfSegments, setSegmentAngle } = rouletteStorage;

  React.useEffect(() => {
    if (wheelRef) {
      const numberOfSegments = wheelRef.current.querySelectorAll('.segment').length;
      setNumberOfSegments(numberOfSegments);
      setSegmentAngle(360 / numberOfSegments);
    }
  }, []);
  React.useEffect(() => {
    if (!gameOver) {
      // console.log('stored');
      localStorage.setItem('myrouletteresult', JSON.stringify({ result }));
    }
  }, [result]);

  return (
    <div className="results-frame">
      {result <= 0 && <span>Increase deposit, score: {result} </span>}
      {result > 0 && <span>Score: {result}</span>}
      {oddBid > 0 && <span>, bet on odd: {oddBid}</span>}
      {evenBid > 0 && <span>, bet on even: {evenBid}</span>}
      {result > 0 && evenBid === 0 && oddBid === 0 && <span>, Your bet? </span>}
      <span>{win === true ? ` - wins 😆` : win === false ? ` - not matched 😟` : ``}</span>
    </div>
  );
});

export const Container = observer(() => {
  const wheelRef = React.useRef();

  let { result, setResult } = rouletteStorage;

  React.useEffect(() => {
    if (result === 0) {
      const resFromStorage = localStorage.getItem('myrouletteresult');
      if (resFromStorage) {
        setResult(JSON.parse(resFromStorage).result);
      }
    }
  }, []);

  return (
    <>
      <Wheel wheelRef={wheelRef} />
      <Results wheelRef={wheelRef} />
      <Tableau wheelRef={wheelRef} />
    </>
  );
});

export default function App() {
  return (
    // <React.StrictMode>
    <div className="App">
      <Container />
    </div>
    // </React.StrictMode>
  );
}
