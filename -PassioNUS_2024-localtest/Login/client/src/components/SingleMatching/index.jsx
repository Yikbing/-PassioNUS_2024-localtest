import React, { useState } from 'react';
import axios from 'axios';
import styles from "./styles.module.css";

const Matching = () => {
  const [gender, setGender] = useState('no-preference');
  const [match, setMatch] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Retrieve userId from localStorage
    const userId = localStorage.getItem('userId');

    // Check if userId exists
    if (!userId) {
      console.error('No userId found in localStorage');
      return;
    }

    console.log('Submitting form with gender:', gender);

    const url = 'http://localhost:8080/api/matching';
    const data = {
      gender,
      userId // Include userId in the data
    };

    try {
      const response = await axios.post(url, data, { withCredentials: true }); // Include credentials
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
