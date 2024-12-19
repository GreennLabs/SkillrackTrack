import React, { useState, useEffect } from 'react';
import './Schedule.css';

const Schedule = ({ initialValues }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [finishDate, setFinishDate] = useState('');
  const [manualTarget, setManualTarget] = useState(false);
  const [targetPoints, setTargetPoints] = useState('');
  const [displayPoints, setDisplayPoints] = useState('');
  const [trackIncrement, setTrackIncrement] = useState(0);

  const [formValues, setFormValues] = useState({
    codeTrack: 0,
    dt: 0,
    dc: 0,
    points: 0,
    requiredPoints: 0,
    codeTest: 0,
  });

  // Initialization of formValues with incoming props
  useEffect(() => {
    if (initialValues) {
      setFormValues({
        ...initialValues,
        requiredPoints: initialValues.requiredPoints || 0,
      });

      setManualTarget(initialValues.requiredPoints === 0);
      setDisplayPoints(initialValues.requiredPoints || 0);
      setTargetPoints(initialValues.requiredPoints || 0);
    }
  }, [initialValues]);

  // Function to validate input
  const validateInputs = () => {
    if (!finishDate) {
      return 'Please enter a finish date!';
    }
    const target = manualTarget ? targetPoints : formValues.requiredPoints;
    if (target <= formValues.points) {
      return `Target points must be greater than current points (${formValues.points})!`;
    }
    return '';
  };

  // Calculate points logic
  const calculatePoints = (tracks, dt, dc, codeTest) => {
    return Math.floor(tracks) * 2 + Math.floor(dt) * 20 + Math.floor(dc) * 2 + Math.floor(codeTest) * 30;
  };

  // Generate Schedule
  const generateSchedule = () => {
    setLoading(true);
    setError('');

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const target = manualTarget ? parseInt(targetPoints) : formValues.requiredPoints;
    const today = new Date();
    const finish = new Date(finishDate);

    const daysToFinish = Math.ceil((finish - today) / (24 * 60 * 60 * 1000));
    if (daysToFinish <= 0) {
      setError('Finish date must be in the future!');
      setLoading(false);
      return;
    }

    let scheduleList = [];
    let { codeTrack, dt, dc, points, codeTest } = formValues;

    const dailyPoints = (target - points) / daysToFinish;
    let trackInc = Math.ceil(dailyPoints / 2);

    for (let i = 0; i < daysToFinish; i++) {
      today.setDate(today.getDate() + 1);
      dt += 1;
      dc += 1;
      codeTrack += trackInc;
      points = calculatePoints(codeTrack, dt, dc, codeTest);

      scheduleList.push({
        date: today.toLocaleDateString(),
        tracks: Math.floor(codeTrack),
        dt,
        dc,
        points: Math.floor(points),
      });

      if (points >= target) break;
    }

    setSchedule(scheduleList);
    setTrackIncrement(trackInc);
    setLoading(false);
  };

  return (
    <div className="schedule-container">
      <h2>Generate Your Schedule</h2>

      {/* Input Form */}
      <div className="form-container">
        <input
          type="date"
          value={finishDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setFinishDate(e.target.value)}
          className="input-field"
        />
        <label>
          <input
            type="checkbox"
            checked={manualTarget}
            onChange={() => setManualTarget(!manualTarget)}
          />
          Manually Set Target Points
        </label>
        {manualTarget && (
          <input
            type="number"
            placeholder="Enter Target Points"
            value={targetPoints}
            onChange={(e) => setTargetPoints(e.target.value)}
            className="input-field"
          />
        )}
        <button onClick={generateSchedule} disabled={loading} className="generate-button">
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Display Schedule */}
      {schedule.length > 0 && (
        <>
          <div className="summary">
            <p><b>Tracks/day</b>: {trackIncrement}</p>
            <p><b>Difficulty</b>: {trackIncrement <= 10 ? 'Easy' : trackIncrement <= 25 ? 'Medium' : 'Hard'}</p>
          </div>

          <table className="schedule-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Tracks</th>
                <th>DT</th>
                <th>DC</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((day, index) => (
                <tr key={index}>
                  <td>{day.date}</td>
                  <td>{day.tracks}</td>
                  <td>{day.dt}</td>
                  <td>{day.dc}</td>
                  <td>{day.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Schedule;
