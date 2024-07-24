import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ModulesForm = () => {
  const [modules, setModules] = useState([{ name: '' }]);
  const [message, setMessage] = useState(''); // State to store the message
  const [showRedirectButton, setShowRedirectButton] = useState(false); // State to control redirect button visibility
  const navigate = useNavigate(); // Initialize useNavigate

  // Convert input to uppercase
  const handleModuleChange = (index, event) => {
    const values = [...modules];
    values[index].name = event.target.value.toUpperCase(); // Convert to uppercase
    setModules(values);
  };

  const handleAddModule = () => {
    setModules([...modules, { name: '' }]);
  };

  const handleRemoveModule = (index) => {
    const values = [...modules];
    values.splice(index, 1);
    setModules(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const storedUserId = localStorage.getItem('userId');

    const url = 'http://localhost:8080/api/moduleform';
    const data = {
      userId: storedUserId,
      modules // Include userId in the data
    };

    try {
      const response = await axios.post(url, data, { withCredentials: true });
      // Set success message and show redirect button
      setMessage('Modules logged successfully!');
      setShowRedirectButton(true);
    } catch (error) {
      // Set error message
      setMessage('Error saving modules.');
      setShowRedirectButton(false); // Ensure the button is hidden on error
    }
  };

  // Redirect function
  const handleRedirect = () => {
    navigate('/match_group'); // Replace with the desired path
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {modules.map((module, index) => (
          <div key={index}>
            <label htmlFor={`module-${index}`}>Module {index + 1}:</label>
            <input
              type="text"
              id={`module-${index}`}
              placeholder={`Module ${index + 1}`}
              value={module.name}
              onChange={(event) => handleModuleChange(index, event)}
              required
            />
            <button type="button" onClick={() => handleRemoveModule(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddModule}>
          Add Module
        </button>
        <button type="submit">Submit</button>
      </form>
      {/* Display message */}
      {message && <p>{message}</p>}
      {/* Show redirect button if modules were logged successfully */}
      {showRedirectButton && (
        <button onClick={handleRedirect}>
          Go to Another Page
        </button>
      )}
    </div>
  );
};

export default ModulesForm;
