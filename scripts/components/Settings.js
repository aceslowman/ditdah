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
              <label>number of bars</label>
              <input
                onChange={props.onNumBarsChange}
                className="numBarsInput"
                type="number"
                step="1"
                value={props.numBars}
              />
            </InputGroup>
            <InputGroup>
              <label>tempo</label>
              <input
                onChange={props.onBPMChange}
                className="tempoInput"
                type="number"
                step="1"
                value={props.bpm}
              />
            </InputGroup>
          </InputRow>
          <button onClick={props.onResetMelody}>reset melody</button>
        </InputPanel>
      </div>
      <div className="toggleSettings" onClick={toggleSettings}></div>
    </div>
  );
};

// <div class="SETTINGS" style="width:0%">
//   <div class="settingsInner">
//     <div>
//       <label>pause after line</label>
//       <input class="pauseLineInput" type="number" step="0.01" value="0.5" />
//     </div>
//     <div>
//       <label>pause after word</label>
//       <input class="pauseWordInput" type="number" step="0.01" value="0.25" />
//     </div>
//     <div>
//       <label>tempo</label>
//       <input class="tempoInput" type="number" step="1" value="120" />
//     </div>
//     <div>
//       <label>
//         loop
//         <input class="loopButton" type="checkbox" />
//       </label>
//     </div>
//     <div>
//       <span class="tickIndicator">tick:</span>
//     </div>
//   </div>
//   <div class="credits">dit(.)dah(/) by aceslowman 2021</div>
//   <div class="toggleSettings"></div>
// </div>;
