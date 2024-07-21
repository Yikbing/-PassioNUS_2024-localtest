import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = document.getElementById("background-music");
    if (isPlaying) {
      audio
        .play()
        .catch((error) => console.log("Failed to play audio:", error));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={styles.music_control}>
      <audio id="background-music" src="/background-music.mp3" loop />
      <button className={styles.play_btn} onClick={handlePlayPause}>
        {isPlaying ? "Pause Music" : "Play Music"}
      </button>
    </div>
  );
};

export default BackgroundMusic;
