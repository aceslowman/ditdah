/* global Tone, ReactDOM, React */
const InputPanel = props => (
  <div
    style={{
      display: "flex",
      margin: "5px 0px",
      width: "100%",
      flexFlow: "column",
      border: "1px groove #602500",
      padding: "10px"
    }}
  >
    <h3 style={{ margin: "0px 0px 8px 0px" }}>{props.title}</h3>
    {props.children}
  </div>
);

const InputGroup = props => (
  <div
    style={{
      display: "flex",
      flexFlow: "column",
      alignSelf: "flex-end",
      width: "48%"
    }}
  >
    {props.children}
  </div>
);

const InputRow = props => (
  <div
    style={{
      display: "flex",
      flexFlow: "row",
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: "5px"
    }}
  >
    {props.children}
  </div>
);

const Settings = props => {
  let [expanded, setExpanded] = React.useState();

  let style = {
    width: "0%"
  };

  // SETTINGS TOGGLE
  function toggleSettings() {
    setExpanded(prev => !prev);
  }

  return (
    <div className="SETTINGS" style={{ width: expanded ? "300px" : "0%" }}>
      <div className="settingsInner">
        <InputPanel title="basic">
          <InputRow>            

              <label>tempo</label>
              <input
                onChange={props.onBPMChange}
                type="number"
                step="1"
                value={props.bpm}
              />
          </InputRow>
          <button onClick={props.onResetMelody}>reset melody</button>
        </InputPanel>
        <InputPanel title="articulation">
          <InputRow>            
          <InputGroup>
              <label>pause between lines</label>
              <input
                onChange={props.onChangePauseAfterLine}
                type="number"
                step="0.1"
                value={props.pauseAfterLine}
              />
            </InputGroup>
          <InputGroup>
              <label>pause between words</label>
              <input
                onChange={props.onChangePauseAfterWord}
                type="number"
                step="0.1"
                value={props.pauseAfterWord}
              />
            </InputGroup>
          </InputRow>
        </InputPanel>
        <InputPanel title="MIDI">
          <InputRow>
            <label htmlFor="midiinputs">Midi Input</label>
            <select
              name="midiinputs"
              value={props.activeMidiInput ? props.activeMidiInput.id : ""}
              onChange={props.onMidiInputChange}
            >
              <option>select an input</option>
              {props.midiInputs &&
                Object.keys(props.midiInputs).map(e => {
                  return (
                    <option key={e} value={props.midiInputs[e].id}>
                      {props.midiInputs[e].name}
                    </option>
                  );
                })}
            </select>
          </InputRow>

          <MIDILog device={props.activeMidiInput} />
          <InputRow>
            <label htmlFor="midioutputs">Midi Output</label>
            <select
              name="midioutputs"
              value={props.activeMidiOutput ? props.activeMidiOutput.id : ""}
              onChange={props.onMidiOutputChange}
            >
              <option>select an output</option>
              {props.midiOutputs &&
                Object.keys(props.midiOutputs).map(e => {
                  return (
                    <option key={e} value={props.midiOutputs[e].id}>
                      {props.midiOutputs[e].name}
                    </option>
                  );
                })}
            </select>
          </InputRow>
          <MIDILog device={props.activeMidiOutput} />
        </InputPanel>
        <InputPanel title="playback">
          <InputRow>
            <InputGroup>
              <label>
                loop
                <input
                  onChange={props.onToggleLoop}
                  checked={props.loop}
                  type="checkbox"
                />
              </label>
            </InputGroup>
            <InputGroup>
              <label>
                sound
                <input
                  onChange={props.onToggleSoundOn}
                  checked={props.soundOn}
                  type="checkbox"
                />
              </label>
            </InputGroup>
          </InputRow>
          <button
            onClick={props.onTogglePlay}
            style={{
              color: props.isPlaying ? "#fff" : "#602500",
              backgroundColor: props.isPlaying ? "#602500" : "#fff"
            }}
          >
            {props.isPlaying ? "stop" : "play"}
          </button>
        </InputPanel>
        <div className="credits">
          <a href="https://github.com/aceslowman/ditdah" target="_blank">
            <strong>dit(.)dah(/)</strong>           
          </a>
          &nbsp;by&nbsp;
          <a href="https://linktr.ee/aceslowman" target="_blank">
            aceslowman
          </a>
        </div>
      </div>
      <div className="toggleSettings" onClick={toggleSettings}></div>
    </div>
  );
};
