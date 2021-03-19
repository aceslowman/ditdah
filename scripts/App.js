/* global Tone, ReactDOM, React */
const App = () => {
  let [pauseAfterLine, setPauseAfterLine] = React.useState(0.5);
  let [pauseAfterWord, setPauseAfterWord] = React.useState(0.25);
  let [text, setText] = React.useState([[" "]]);
  let [part, setPart] = React.useState(); // for Tone.js Part

  let [ready, setReady] = React.useState();
  let [isPlaying, setIsPlaying] = React.useState();

  let [midiInputs, setMidiInputs] = React.useState(null);
  let [midiOutputs, setMidiOutputs] = React.useState(null);
  let [activeMidiInput, setActiveMidiInput] = React.useState(null);
  let [activeMidiOutput, setActiveMidiOutput] = React.useState(null);

  let [soundOn, setSoundOn] = React.useState(true);
  let [synth, setSynth] = React.useState();
  let [loop, setLoop] = React.useState(true);
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
  }, [handleTogglePlay, part, setIsPlaying, isPlaying]);

  /*
    startup audio context
  */
  React.useEffect(() => {
    const startAudioContext = async () => {
      await Tone.start();
      console.log("audio context has started");
      Tone.Transport.bpm.value = parseFloat(bpm);
      setSynth(new Tone.Synth().toDestination());
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
  }, [ready, setReady, synth, setSynth]);

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

  /*
    when text changes
  */
  React.useEffect(() => {
    const getPartFromText = () => {
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
              // duration: "8n",
              duration: duration,
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

      return partArray;
    };

    if (ready) {
      const callback = (time, value) => {
//         how do I send out of a specific channel?
        activeMidiOutput.send([128, Tone.Frequency(value.note).toMidi(), value.velocity * 127]);
        if (soundOn) synth.triggerAttackRelease(value.note, "8n", time, value.velocity);
      };

      let events = getPartFromText();

      console.log("events", events);

      if (part) {
        part.clear();

        events.forEach((e,i) => {
          part.at(e.time, e)
        })
        
        part.callback = callback;
        part.loop = loop ? true : 1;
        // part.loopEnd = "1m";
        part.start(0);
      } else {
        console.log("setting up a part");
        let newPart = new Tone.Part(callback, events);
        newPart.loop = loop ? true : 1;
        // newPart.loopEnd = "1m";
        // newPart.loopEnd =
        //   events[events.length - 1].time +
        //   Tone.Time(events[events.length - 1].duration).toSeconds();
        newPart.start(0);
        setPart(newPart);
        console.log("part.value", newPart.value);
      }

      Tone.Transport.start();
    }
  }, [
    text,
    part,
    setPart,
    loop,
    soundOn,
    activeMidiOutput,
    pauseAfterLine,
    pauseAfterWord,
    synth
  ]);

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

  const handleTogglePlay = e => {
    if (isPlaying) {
      // Tone.Transport.cancel();
      // Tone.Transport.stop();
      // part.cancel();
      // part.stop();
      setIsPlaying(false);
    } else {
      // Tone.Transport.cancel();
      // part.start(0);
      // Tone.Transport.start();
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
  const handleToggleSoundOn = e => setSoundOn(prev => !prev);
  const handleMidiInputChange = e =>
    setActiveMidiInput(midiInputs[e.target.value]);
  const handleMidiOutputChange = e =>
    setActiveMidiOutput(midiOutputs[e.target.value]);

  const handleLoopToggle = e => {
    setLoop(prev => !prev);
  };

  return (
    <React.Fragment>
      <Settings
        onTogglePlay={handleTogglePlay}
        onMidiInputChange={handleMidiInputChange}
        onMidiOutputChange={handleMidiOutputChange}
        onToggleLoop={handleLoopToggle}
        onBPMChange={handleBPMChange}
        onChangePauseAfterLine={handleChangePauseAfterLine}
        onChangePauseAfterWord={handleChangePauseAfterWord}
        bpm={bpm}
        pauseAfterLine={pauseAfterLine}
        pauseAfterWord={pauseAfterWord}
        midiInputs={midiInputs}
        midiOutputs={midiOutputs}
        activeMidiInput={activeMidiInput}
        activeMidiOutput={activeMidiOutput}
        onToggleSoundOn={handleToggleSoundOn}
        soundOn={soundOn}
        isPlaying={isPlaying}
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
