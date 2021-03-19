/* global Tone, ReactDOM, React */
const MIDILog = props => {
  const [enable, setEnable] = React.useState(false);
  const [log, setLog] = React.useState([]);
  const tail_length = 10; // limit length of log

  React.useEffect(() => {
    if (!enable) return;

    const handleDeviceLog = m => {
      let [noteon, note, velocity] = m.data;
      // noteon: 144(on) or 128(off)
      // pitch: 0-127
      // velocity: 0-127
      log.push({ noteon, note, velocity });
      if (log.length > tail_length) log.shift();
      setLog(log);
    };

    if (props.device) {
      props.device.addEventListener("midimessage", handleDeviceLog);
      return () =>
        props.device.removeEventListener("midimessage", handleDeviceLog);
    }
  }, [props.device, log, setLog, enable]);

  return (
    <div>
      {enable && (
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>noteon</th>
              <th>note</th>
              <th>velocity</th>
            </tr>
          </thead>
          <tbody>
            {log.map((e, i) => {
              return (
                <tr
                  key={i}
                  style={{
                    backgroundColor: i % 2 === 0 ? "#ccc" : "transparent"
                  }}
                >
                  <td>{e.noteon}</td>
                  <td>{e.note}</td>
                  <td>{e.velocity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div>
        <label>enable log:</label>
        <input
          type="checkbox"
          checked={enable}
          onChange={e => setEnable(e.target.checked)}
        />
      </div>
    </div>
  );
};
