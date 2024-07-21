import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const InterestsForm = () => {
  const [data, setData] = useState({
    Sports: false,
    Music: false,
    Art: false,
    Cooking: false,
    Volunteering: false,
    Video_Games: false,
    Dance: false,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const url = "http://localhost:8080/api/interests";
      const res = await axios.post(url, { ...data, userId });
      console.log("Interests saved successfully:", res.data);
      navigate("/home");
      window.location.reload();
    } catch (error) {
      console.error("Error submitting interests:", error);
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  return (
    <div className={styles.profile_interests_container}>
      <h2 className={styles.title}>Select Your Interests</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.form_group}>
          <label className={styles.form_group_label}>
            <span>Sports</span>
            <input
              type="checkbox"
              name="Sports"
              checked={data.Sports}
              onChange={handleChange}
              className={styles.checkbox_input}
            />
          </label>
        </div>
        <div className={styles.form_group}>
          <label className={styles.form_group_label}>
            <span>Music</span>
            <input
              type="checkbox"
              name="Music"
              checked={data.Music}
              onChange={handleChange}
              className={styles.checkbox_input}
            />
          </label>
        </div>
        <div className={styles.form_group}>
          <label className={styles.form_group_label}>
            <span>Art</span>
            <input
              type="checkbox"
              name="Art"
              checked={data.Art}
              onChange={handleChange}
              className={styles.checkbox_input}
            />
          </label>
        </div>
        <div className={styles.form_group}>
          <label className={styles.form_group_label}>
            <span>Cooking</span>
            <input
              type="checkbox"
              name="Cooking"
              checked={data.Cooking}
              onChange={handleChange}
              className={styles.checkbox_input}
            />
          </label>
        </div>
        <div className={styles.form_group}>
          <label className={styles.form_group_label}>
            <span>Volunteering</span>
            <input
              type="checkbox"
              name="Volunteering"
              checked={data.Volunteering}
              onChange={handleChange}
              className={styles.checkbox_input}
            />
          </label>
        </div>
        <div className={styles.form_group}>
          <label className={styles.form_group_label}>
            <span>Video Games</span>
            <input
              type="checkbox"
              name="Video_Games"
              checked={data.Video_Games}
              onChange={handleChange}
              className={styles.checkbox_input}
            />
          </label>
        </div>
        <div className={styles.form_group}>
          <label className={styles.form_group_label}>
            <span>Dance</span>
            <input
              type="checkbox"
              name="Dance"
              checked={data.Dance}
              onChange={handleChange}
              className={styles.checkbox_input}
            />
          </label>
        </div>
        {error && <div className={styles.error_msg}>{error}</div>}
        <button type="submit" className={styles.submit_btn}>
          Submit Interests
        </button>
      </form>
    </div>
  );
};

export default InterestsForm;
