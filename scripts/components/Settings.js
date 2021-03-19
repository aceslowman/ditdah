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
            <InputGroup>
              <label>tempo</label>
              <input
                onChange={props.onBPMChange}
                type="number"
                step="1"
                value={props.bpm}
              />
            </InputGroup>
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
        <div className="credits">
          dit(.)dah(/) by{" "}
          <a href="https://linktr.ee/aceslowman" target="_blank">
            aceslowman
          </a>{" "}
           &nbsp; 2021
        </div>
      </div>
      <div className="toggleSettings" onClick={toggleSettings}></div>
    </div>
  );
};
