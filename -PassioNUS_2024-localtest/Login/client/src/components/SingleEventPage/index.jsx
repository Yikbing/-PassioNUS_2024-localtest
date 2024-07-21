import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const SingleEventPage = () => {
  const [postInfo, setPostInfo] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId"); // Get userId from localStorage

  useEffect(() => {
    fetch(`http://localhost:8080/api/events/${id}`).then((response) => {
      response.json().then((data) => {
        setPostInfo(data);
      });
    });
  }, [id]);

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  if (!postInfo) return "Loading...";

  const handleBack = () => {
    navigate("/events");
  };

  const handleEdit = () => {
    navigate(`/edit_event/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonsContainer}>
        <button onClick={handleBack} className={styles.backButton}>
          Back
        </button>
        {postInfo.userId === userId && (
          <button onClick={handleEdit} className={styles.editButton}>
            Edit Post
          </button>
        )}
      </div>
      <div className={styles.image}>
        <img
          src={`http://localhost:8080/${postInfo.cover}`}
          alt={postInfo.title}
        />
      </div>
      <h1 className={styles.header}>{postInfo.title}</h1>
      <p className={styles.summary}>{postInfo.summary}</p>
      <p className={styles.venue}>{postInfo.venue}</p>
      <p className={styles.date}>{formatDate(postInfo.date)}</p>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: postInfo.content }}
      ></div>
    </div>
  );
};

export default SingleEventPage;
