import React, { useState } from 'react';
import axios from 'axios';
import styles from "./styles.module.css";

const Matching = ({ currentUserId }) => {
  const [gender, setGender] = useState('no-preference');
  const [match, setMatch] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log('Submitting form with gender:', gender, 'and userId:', currentUserId);

    const url = '/api/matching';
    const data = {
      gender,
      userId: currentUserId
    };

    try {
      const response = await axios.post(url, data);
      setMatch(response.data);
      console.log('Best match user:', response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMatch(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Gender Preference:
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="no-preference">No Preference</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <button type="submit">Match</button>
      </form>
      {match && (
        <div>
          <h2>Best Match:</h2>
          <p>{JSON.stringify(match)}</p>
        </div>
      )}
    </div>
  );
};

export default Matching;
