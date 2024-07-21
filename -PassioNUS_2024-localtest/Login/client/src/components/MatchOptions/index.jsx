import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const MatchOptions = () => {
  const navigate = useNavigate();

  const handleSingleMatch = () => {
    navigate("/match_single");
  };

  const handleGroupMatch = () => {
    navigate("/match_group");
  };

  return (
    <div className={styles.matchOptionsContainer}>
      <h2>Make a new friend today!</h2>
      <button className={styles.matchButton} onClick={handleSingleMatch}>
        Find a new friend
      </button>
      <button className={styles.matchButton} onClick={handleGroupMatch}>
        Join a group
      </button>
    </div>
  );
};

export default MatchOptions;
