/* global Tone, ReactDOM, React */
const App = () => {
  let [pauseAfterLine, setPauseAfterLine] = React.useState(0.5);
  let [pauseAfterWord, setPauseAfterWord] = React.useState(0.25);
  let [text, setText] = React.useState();
  
  let [ready, setReady] = React.useState();  
  let [isPlaying, setIsPlaying] = React.useState();
  
  let [synth, setSynth] = React.useState();
  let [loop, setLoop] = React.useState(false);
  let [bpm, setBPM] = React.useState(120);

  /*
    set up keybindings
  */
  React.useEffect(() => {
    const keybindings = e => {
      switch (e.keyCode) {
        case 32: // space bar
          handleTogglePlay();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", keybindings, false);
    return () => document.removeEventListener("keydown", keybindings, false);
  }, [handleTogglePlay, sequence, setIsPlaying, isPlaying]);

  /*
    startup audio context
  */
  React.useEffect(() => {
    const startAudioContext = async () => {
      await Tone.start();
      console.log("audio context has started");
      Tone.Transport.bpm.value = parseFloat(bpm);
      setSynth(new Tone.PolySynth().toDestination());
      setReady(true);
    };

    if (!ready) {
      document.addEventListener("click", startAudioContext);
    } else {
      document.removeEventListener("click", startAudioContext);
    }

    return () => {
      document.removeEventListener("click", startAudioContext);
    };
  }, [ready, synth, setSynth]);

  const handleMainTextChange = async e => {
    // parse lines and units
    setText(e.target.value.split(/\r?\n/).map(e => e.split(" ")));
  };

  const filterUserInput = e => {
    if (
      // allowed keys:
      e.keyCode !== 190 && // dot
      e.keyCode !== 191 && // slash
      e.keyCode !== 13 && // new line
      e.keyCode !== 32 && // space
      e.keyCode !== 8 && // backspace
      e.keyCode !== 37 && // left arrow
      e.keyCode !== 38 && // up arrow
      e.keyCode !== 39 && // right arrow
      e.keyCode !== 40 && // down arrow
      e.keyCode !== 16 // shift
    ) {
      e.preventDefault();
    }
  };

  return (
    <React.Fragment>
      <Settings />
      <textarea class="MAININPUT" placeholder="_"></textarea>
    </React.Fragment>
  );
};

const domContainer = document.getElementById("APP");
ReactDOM.render(React.createElement(App), domContainer);

// CENTERS MAININPUT TEXT
// https://stackoverflow.com/questions/4954252/css-textarea-that-expands-as-you-type-text
// function updateSize(e) {
//   let text = e.target.value + String.fromCharCode(event.keyCode);
//   e.target.rows = text.split(/\r\n|\r|\n/).length;
// }

// function keyDownUpdateSize(e) {
//   if (event.keyCode != 8 && event.keyCode != 46) updateSize(e);
// }

// function keyUpUpdateSize(e) {
//   if (event.keyCode == 8 || event.keyCode == 46) updateSize(e);
// }

// document
//   .querySelector(".MAININPUT")
//   .addEventListener("keydown", keyDownUpdateSize);
// document.querySelector(".MAININPUT").addEventListener("keyup", keyUpUpdateSize);

// // <textarea class="MAININPUT" placeholder="_"></textarea>

// l/* global Tone */
// let synth = new Tone.Synth().toDestination();
// let part;

// let state = {
//   pauseAfterLine: 0.5,
//   pauseAfterWord: 0.25,
//   txtArray: ""
// };

// function restartSynth() {
//   if(part) part.stop();

//   let events = getPartFromText();

//   // use an array of objects as long as the object has a "time" attribute
//   part = new Tone.Part((time, value) => {
//     // the value is an object which contains both the note and the velocity
//     synth.triggerAttackRelease(
//       value.note,
//       "8n",
//       // value.duration,
//       time,
//       value.velocity
//     );
//   }, events).start(0);

//   part.loop = true;
//   // make sure loopEnd is the full length of the parts
//   // console.log('LOOP END', )
//   part.loopEnd = events[events.length-1].time + Tone.Time(events[events.length-1].duration).toSeconds()

//   Tone.Transport.start();

//   console.log("loopStart", part.loopStart);
//   console.log("loopEnd", part.loopEnd)
// }

// function getPartFromText() {
//   console.group()
//   let isLineEnd, isWordEnd = false;

//   let partArray = [];
//   let iter = 0;

//   let qTime = Tone.Time("4n").toSeconds();

//   // get part from text
//   state.txtArray.forEach((line, l_i) => {
//     line.forEach((word, w_i) => {
//       word.split("").forEach((unit, u_i) => {
//         let unitTime = qTime * iter;
//         let duration = unit === "." ? "8n" : "4n";
//         let note = unit === "." ? "C3" : "C4";
//         let velocity = unit === "." ? 0.5 : 1.0;

//         // scale base time
//         // time 1/= 4;

//         // hold for end of line
//         if (isLineEnd && isWordEnd) {
//           console.log("holding at end of line", unit);
//           unitTime += state.pauseAfterLine * qTime;
//           // duration = "1m";
//         } else if (isWordEnd) {
//           // hold for end of word
//           console.log("holding at end of word...", unit);
//           unitTime += state.pauseAfterWord * qTime;
//         }

//         partArray.push({
//           time: unitTime,
//           duration: '8n',
//           // duration: duration,
//           note: note,
//           velocity: velocity
//         });

//         iter++;

//         // pause needs to apply to the NEXT note after the line or word
//         isLineEnd = w_i === line.length - 1;
//         isWordEnd = u_i === word.split("").length - 1;
//       });
//     });
//   });

//   console.log("partarray", partArray);
//   console.groupEnd();

//   return partArray;
// }

// function onBPMChange(e) {
//   Tone.Transport.bpm.value = parseFloat(e.target.value);
// }

// document
//   .querySelector(".MAININPUT")
//   .addEventListener("keydown", filterUserInput);

// document
//   .querySelector(".MAININPUT")
//   .addEventListener("keyup", handleMainTextChange);

// document.querySelector(".tempoInput")
//   .addEventListener("change", onBPMChange);

// document.querySelector(".pauseLineInput")
//   .addEventListener("change", handlePauseAfterLine);

// document.querySelector(".pauseWordInput")
//   .addEventListener("change", handlePauseAfterWord);

// document.querySelector("#loopToggle)
//   .addEventListener("onclick", handleLoopToggle);

// function handlePauseAfterLine(e) {
//   state.pauseAfterLine = e.target.value;
//   restartSynth();
// }

// function handlePauseAfterWord(e) {
//   state.pauseAfterWord = e.target.value;
//   restartSynth();
// }

// function handleLoopToggle(e) {

// }
