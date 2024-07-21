// client/src/chat/ChatBox/index.jsx
import React, { useState, useEffect } from "react";
import { Box, Input, VStack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import socket from "../../socket"; // Import the socket instance

const ChatBox = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false); // Track if a search has been performed
  const toast = useToast();
  const { chats, setChats, setSelectedChat } = ChatState();
  const userId = localStorage.getItem("userId"); // Retrieve the current user's ID from local storage

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim() === "") {
        setUsers([]);
        setSearchPerformed(false); // Reset search performed status
        return;
      }

      setLoading(true);
      setSearchPerformed(true); // Set search performed status to true

      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:8080/api/students?search=${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Filter out the current user using the userId from local storage
        const filteredUsers = data.filter((user) => user._id !== userId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch users", error);
        toast({
          title: "Error fetching users.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }

      setLoading(false);
    };

    fetchUsers();
  }, [searchQuery, toast, userId]); // Include userId as a dependency

  const accessChat = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:8080/api/chat",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the chat is already in the list
      if (!chats.find((chat) => chat._id === data._id)) {
        setChats([data, ...chats]); // Add new chat to the list
      }
      setSelectedChat(data);

      // Emit an event to notify the server that a chat has been accessed
      socket.emit("access chat", data._id);
    } catch (error) {
      console.error("Failed to access chat", error);
      toast({
        title: "Error accessing chat.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box position="relative">
      <Input
        placeholder="Search users"
        mb={4}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Box
          maxHeight="150px"
          overflowY="auto"
          position="absolute"
          top="60px"
          width="100%"
          zIndex="1"
          background="white"
          boxShadow="lg"
          borderRadius="md"
        >
          <VStack spacing={4} align="stretch">
            {users.length > 0 ? (
              users.map((user) => (
                <Box
                  key={user._id}
                  p={4}
                  bg="gray.100"
                  borderRadius="md"
                  onClick={() => accessChat(user._id)}
                  cursor="pointer"
                >
                  <Text fontWeight="bold">{user.name}</Text>
                  <Text>Email: {user.email}</Text>
                </Box>
              ))
            ) : (
              searchPerformed && <Text>No users found</Text> // Only show if search has been performed
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default ChatBox;
