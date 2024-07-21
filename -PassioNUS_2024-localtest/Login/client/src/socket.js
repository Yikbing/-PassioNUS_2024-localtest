// client/src/socket.js
import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:8080"; // Your server endpoint
const socket = io(ENDPOINT);

export default socket;
