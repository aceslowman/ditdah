/* global Tone, ReactDOM, React */
const App = () => {
  let [pauseAfterLine, setPauseAfterLine] = React.useState(0.5);
  let [pauseAfterWord, setPauseAfterWord] = React.useState(0.25);
  let [text, setText] = React.useState();
  let [part, setPart] = React.useState(); // for Tone.js Part

  let [ready, setReady] = React.useState();
  let [isPlaying, setIsPlaying] = React.useState();  
  
  let [midiInputs, setMidiInputs] = React.useState(null);
  let [midiOutputs, setMidiOutputs] = React.useState(null);
  let [activeMidiInput, setActiveMidiInput] = React.useState(null);
  let [activeMidiOutput, setActiveMidiOutput] = React.useState(null);

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
  }, [handleTogglePlay, /*part,*/ setIsPlaying, isPlaying]);

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
  
    /*
    set up midi
  */
  React.useEffect(() => {
    const initMIDI = async () => {
      if (!midiInputs || !midiOutputs) {
        await navigator.requestMIDIAccess().then(access => {
          // Get lists of available MIDI controllers
          let inputs,
            outputs = {};

          for (const input of access.inputs.values()) {
            inputs = {
              ...inputs,
              [input.id]: input
            };
          }

          for (const output of access.outputs.values()) {
            outputs = {
              ...outputs,
              [output.id]: output
            };
          }

          setMidiInputs(inputs);
          setMidiOutputs(outputs);

          setActiveMidiInput(inputs[Object.keys(inputs)[0]]);
          setActiveMidiOutput(outputs[Object.keys(outputs)[0]]);

          access.onstatechange = function(e) {
            // Print information about the (dis)connected MIDI controller
            console.log(e.port.name, e.port.manufacturer, e.port.state);
          };
        });
      }
    };

    initMIDI();
  }, [midiInputs, midiOutputs]);

  // when text changes
  React.useEffect(() => {}, [text]);

  // CENTERS MAININPUT TEXT
  // https://stackoverflow.com/questions/4954252/css-textarea-that-expands-as-you-type-text
  const updateSize = e => {
    let text = e.target.value + String.fromCharCode(event.keyCode);
    e.target.rows = text.split(/\r\n|\r|\n/).length;
  };

  const keyDownUpdateSize = e => {
    if (event.keyCode != 8 && event.keyCode != 46) updateSize(e);
  };

  const keyUpUpdateSize = e => {
    if (event.keyCode == 8 || event.keyCode == 46) updateSize(e);
  };

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

  const restartSynth = () => {
    if (part) part.stop();

    let events = getPartFromText();

    // use an array of objects as long as the object has a "time" attribute
    part = new Tone.Part((time, value) => {
      // the value is an object which contains both the note and the velocity
      synth.triggerAttackRelease(
        value.note,
        "8n",
        // value.duration,
        time,
        value.velocity
      );
    }, events).start(0);

    part.loop = true;
    // make sure loopEnd is the full length of the parts
    // console.log('LOOP END', )
    part.loopEnd =
      events[events.length - 1].time +
      Tone.Time(events[events.length - 1].duration).toSeconds();

    Tone.Transport.start();

    console.log("loopStart", part.loopStart);
    console.log("loopEnd", part.loopEnd);
  }

  const getPartFromText = () =>{
    console.group();
    let isLineEnd,
      isWordEnd = false;

    let partArray = [];
    let iter = 0;

    let qTime = Tone.Time("4n").toSeconds();

    // get part from text
    text.forEach((line, l_i) => {
      line.forEach((word, w_i) => {
        word.split("").forEach((unit, u_i) => {
          let unitTime = qTime * iter;
          let duration = unit === "." ? "8n" : "4n";
          let note = unit === "." ? "C3" : "C4";
          let velocity = unit === "." ? 0.5 : 1.0;

          // scale base time
          // time 1/= 4;

          // hold for end of line
          if (isLineEnd && isWordEnd) {
            console.log("holding at end of line", unit);
            unitTime += pauseAfterLine * qTime;
            // duration = "1m";
          } else if (isWordEnd) {
            // hold for end of word
            console.log("holding at end of word...", unit);
            unitTime += pauseAfterWord * qTime;
          }

          partArray.push({
            time: unitTime,
            duration: "8n",
            // duration: duration,
            note: note,
            velocity: velocity
          });

          iter++;

          // pause needs to apply to the NEXT note after the line or word
          isLineEnd = w_i === line.length - 1;
          isWordEnd = u_i === word.split("").length - 1;
        });
      });
    });

    console.log("partarray", partArray);
    console.groupEnd();

    return partArray;
  }

  const handleTogglePlay = e => {
    if (isPlaying) {
      Tone.Transport.cancel();
      Tone.Transport.stop();
      // part.cancel();
      // part.stop();
      setIsPlaying(false);
    } else {
      Tone.Transport.cancel();
      // part.start();
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const handleTextAreaKeyDown = e => {
    filterUserInput(e);
    keyDownUpdateSize(e);
  };

  const handleTextAreaKeyUp = e => {
    handleMainTextChange(e);
    keyUpUpdateSize(e);
  };

  const handleBPMChange = e => setBPM(parseFloat(e.target.value));
  const handleChangePauseAfterLine = e => setPauseAfterLine(e.target.value);
  const handleChangePauseAfterWord = e => setPauseAfterWord(e.target.value);

  return (
    <React.Fragment>
      <Settings
        onBPMChange={handleBPMChange}
        onChangePauseAfterLine={handleChangePauseAfterLine}
        onChangePauseAfterWord={handleChangePauseAfterWord}
        bpm={bpm}
        pauseAfterLine={pauseAfterLine}
        pauseAfterWord={pauseAfterWord}
      />
      <textarea
        className="MAININPUT"
        placeholder="_"
        onKeyUp={handleTextAreaKeyUp}
        onKeyDown={handleTextAreaKeyDown}
      ></textarea>
    </React.Fragment>
  );
};

const domContainer = document.getElementById("APP");
ReactDOM.render(React.createElement(App), domContainer);
