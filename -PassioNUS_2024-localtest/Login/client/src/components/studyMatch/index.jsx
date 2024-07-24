import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";
import { accessChat } from "../ChatBox"; // Import the accessChat function

const ModulesForm = () => {
  const [modules, setModules] = useState([{ name: '' }]);
  const [userId, setUserId] = useState('');
  const [match, setMatch] = useState(null); // State to store matched user details
  const [noMatchMessage, setNoMatchMessage] = useState("");
  const navigate = useNavigate();
  const toast = useToast();
  const { chats, setChats, setSelectedChat } = ChatState();

  const handleModuleChange = (index, event) => {
    const values = [...modules];
    values[index].name = event.target.value;
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
    console.log('Retrieved userId from localStorage:', storedUserId); // Log the retrieved userId
    if (storedUserId) {
      setUserId(storedUserId);
    }

    const url = 'http://localhost:8080/api/studybuddy';
    const data = {
      userId,
      modules // Include userId in the data
    };

    try {
      const response = await axios.post(url, data, { withCredentials: true }); // Include credentials
      setMatch(response.data); // Set match data to state
      console.log('Best match user:', response.data);
      setNoMatchMessage(""); // Clear any existing noMatchMessage
    } catch (error) {
      console.error('Error fetching users:', error);
      setMatch(null); // Clear match state on error
      setNoMatchMessage("No match found"); // Set no match message
    }
  };

  const handleChatRedirect = async () => {
    if (match && match.userId) {
      console.log("Redirecting to chat with user:", match.userId);
      await accessChat(match.userId, chats, setChats, setSelectedChat, toast);
      navigate(`/chat?search=${encodeURIComponent(match.match.name)}`);
    }
  };

  const handleCopyEmail = () => {
    if (match && match.match.email) {
      navigator.clipboard
        .writeText(match.match.email)
        .then(() => {
          alert("Email copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy email:", err);
        });
    }
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

      {noMatchMessage && (
        <div>
          <p>{noMatchMessage}</p>
        </div>
      )}

      {match && (
        <div>
          <h2>Matched User Details</h2>
          <p><strong>Name:</strong> {match.match.name}</p>
          <p><strong>Year of Study:</strong> {match.match.yearOfStudy}</p>
          <p><strong>Faculty:</strong> {match.match.faculty}</p>
          <p><strong>Common Modules:</strong> {match.commonModules.join(', ')}</p>
          <p>
            Email: <a href={`mailto:${match.match.email}`}>{match.match.email}</a>
          </p>
          <button
            onClick={handleCopyEmail}
            className="button"
          >
            Copy Matched User Email
          </button>
          <button
            onClick={handleChatRedirect}
            className="button"
          >
            Go to Chat!
          </button>
        </div>
      )}
    </div>
  );
};

export default ModulesForm;
