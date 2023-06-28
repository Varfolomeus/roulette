import "./styles.css";
import React from "react";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";

class RouletteContext {
  rotateAngle = 0;
  angleChanger = 0;
  segmentAngle = 0;
  numberOfSegments = 0;
  spinStarted = false;
  result = 0;
  evenBid = 0;
  oddBid = 0;
  win = null;
  wheelRef = null;
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
  setwheelref = (value) => {
    this.wheelRef = value;
  };
  setAngleChanger = (value) => {
    this.angleChanger = value;
  };
  setBids = (bid, style) => {
    if (style === "double") {
      this[bid] *= 2;
    } else if (style === "zero") {
      this[bid] = 0;
    } else {
      this[bid] += 1;
    }
  };
  setGameOver = (value) => {
    this.gameOver = value;
  };
  setRouletteStyle = (type, value) => {
    this.wheelRef.style[type] = value;
  };
  setDouble = () => {
    this.double = !this.double;
  };
}
const rouletteStorage = new RouletteContext();

export const Tableau = observer(() => {
  const {
    double,
    setDouble,
    result,
    setResult,
    oddBid,
    evenBid,
    setBids,
    spinStarted,
    setSpinStarted,
    angleChanger,
    setAngleChanger,
    rotateAngle,
    setRotateAngle,
    gameOver,
    setGameOver,
    setWin,
    setRouletteStyle
  } = rouletteStorage;
  const spinHandle = (e) => {
    if (result && (oddBid || evenBid) && e.pressed) {
      setAngleChanger(Math.floor(Math.random() * 14400) - 7199);
      setRotateAngle(angleChanger);
      console.log("angleChanger", angleChanger);
      setSpinStarted(true);
      console.log("spinStarted", spinStarted);
      console.log("angleChanger", angleChanger, "spinStarted", spinStarted);
      setRouletteStyle(
        "transition",
        `transform ${Math.abs(angleChanger)}ms ease-in-out`
      );
      setRouletteStyle("transform", `rotate(${rotateAngle}deg) scale(2)`);
    }
  };
  return (
    <div className="tableau">
      <div
        onClick={() => {
          if (double && evenBid > 0) {
            setBids("evenBid", "double");
          } else {
            setBids("evenBid", "plus");
          }
          if (gameOver) setGameOver(false);
          setWin(null);
          if (oddBid) {
            setBids("oddBid", "zero");
          }
        }}
        className="spin-button"
      >
        {double && evenBid > 0 ? `Even x2` : `Even +1`}
      </div>
      <div
        onClick={() => {
          if (double && oddBid > 0) {
            setBids("oddBid", "double");
          } else {
            setBids("oddBid", "plus");
          }
          if (gameOver) setGameOver(false);
          setWin(null);
          if (evenBid) {
            setBids("evenBid", "zero");
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
        className={`spin-button ${double ? "spin-button-active" : ""}`}
      >
        x2
      </div>
    </div>
  );
});

export const Wheel = observer(() => {
  const {
    oddBid,
    evenBid,
    setResult,
    setWin,
    numberOfSegments,
    setNumberOfSegments,
    segmentAngle,
    setSegmentAngle,
    rotateAngle,
    angleChanger,
    spinStarted,
    setSpinStarted,
    wheelRef,
    setwheelref
  } = rouletteStorage;

  const wheelRef1 = React.useRef();
  if (wheelRef1.current) {
    setwheelref(wheelRef1.current);
    // console.log(wheelRef);
  }
  const handleSpinResult = (sector) => {
    console.log("sector", sector);
    if (oddBid) {
      if (sector > 0 && sector % 2 === 0) {
        setResult(-oddBid);
        setWin(false);
      } else if (sector > 0 && sector % 2 !== 0) {
        setResult(oddBid);
        setWin(true);
      } else {
        setResult(-oddBid);
        setWin(false);
      }
    } else if (evenBid) {
      if (sector > 0 && sector % 2 === 0) {
        setResult(evenBid);
        setWin(true);
      } else if (sector > 0 && sector % 2 !== 0) {
        setResult(-evenBid);
        setWin(false);
      } else {
        setResult(-evenBid);
        setWin(false);
      }
    }
  };

  React.useEffect(() => {
    console.log("wheel effect", rotateAngle);
    setWin(null);
    const tyty = setTimeout(() => {
      let pureAngle = (rotateAngle % 360) - segmentAngle / 2;
      if (pureAngle < 0) {
        pureAngle = 360 + pureAngle;
      }
      let pureAnglePerSegmentAngle = Math.floor(pureAngle / segmentAngle);
      if (pureAnglePerSegmentAngle === numberOfSegments - 1) {
        handleSpinResult(0);
      } else {
        handleSpinResult(pureAnglePerSegmentAngle + 1);
      }
    }, Math.abs(angleChanger));
    setSpinStarted(false);
    return () => {
      clearTimeout(tyty);
    };
  }, [spinStarted, rotateAngle]);

  return (
    <div>
      <span className="arrow"></span>
      <div ref={wheelRef1} className="wheel">
        <div className="segment one"> </div>
        <div className="segment two"> </div>
        <div className="segment three"> </div>
        <div className="segment four"> </div>
        <div className="segment five"> </div>
        <div className="segment six"> </div>
        <div className="segment seven"> </div>
        <div className="segment eight"> </div>
        <div className="segment zero"> </div>
      </div>
    </div>
  );
});

const Results = observer(() => {
  // console.log("rouletteStorage", rouletteStorage);
  let {
    gameOver,
    result,
    oddBid,
    evenBid,
    win,
    wheelRef,
    setNumberOfSegments,
    numberOfSegments,
    setSegmentAngle,
    segmentAngle
  } = rouletteStorage;

  React.useEffect(() => {
    console.log("wheelRef", wheelRef);

    if (wheelRef) {
      const uuuu = wheelRef.querySelectorAll(".segment");
      console.log("wheelRef", wheelRef, "uuuu", uuuu.length);

      setNumberOfSegments(9);
      setSegmentAngle(360 / 9);
      console.log(
        "numberOfSegments",
        numberOfSegments,
        "segmentAngle",
        segmentAngle
      );
    }
  }, [numberOfSegments]);
  React.useEffect(() => {
    // console.log("result effect");
    if (!gameOver) {
      // console.log("stored");
      localStorage.setItem("myrouletteresult", JSON.stringify({ result }));
    }
  }, [result, gameOver]);

  return (
    <div className="results-frame">
      {result <= 0 && <span>Внесите депозит, на счету: {result} </span>}
      {result > 0 && <span>Счет: {result}</span>}
      {oddBid > 0 && <span>, ставка на нечет: {oddBid}</span>}
      {evenBid > 0 && <span>, ставка на чет: {evenBid}</span>}
      {result > 0 && evenBid === 0 && oddBid === 0 && (
        <span>, ваша ставка? </span>
      )}
      <span>
        {win === true ? ` - выигрыш 😆` : win === false ? ` - проигрыш 😟` : ``}
      </span>
    </div>
  );
});

export const Container = observer(() => {
  let { result, setResult } = rouletteStorage;

  React.useEffect(() => {
    if (result === 0) {
      const resFromStorage = localStorage.getItem("myrouletteresult");
      if (resFromStorage) {
        setResult(JSON.parse(resFromStorage).result);
      }
    }
  }, []);

  return (
    <>
      <Wheel />
      <Results />
      <Tableau />
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
