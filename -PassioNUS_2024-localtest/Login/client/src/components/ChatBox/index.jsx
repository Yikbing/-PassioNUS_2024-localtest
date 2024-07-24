import React, { useState, useEffect } from "react";
import { Box, Input, VStack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

export const accessChat = async (
  userId,
  chats,
  setChats,
  setSelectedChat,
  toast
) => {
  console.log("accessChat called with userId:", userId);
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

    console.log("Chat data received:", data);

    // Check if the chat is already in the list
    if (!chats.find((chat) => chat._id === data._id)) {
      setChats([data, ...chats]); // Add new chat to the list
    }
    setSelectedChat(data);
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

const ChatBox = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const toast = useToast();
  const { chats, setChats, setSelectedChat } = ChatState();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim() === "") {
        setUsers([]);
        setSearchPerformed(false);
        return;
      }

      setLoading(true);
      setSearchPerformed(true);

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
  }, [searchQuery, toast, userId]);

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
            {users.length > 0
              ? users.map((user) => (
                  <Box
                    key={user._id}
                    p={4}
                    bg="gray.100"
                    borderRadius="md"
                    onClick={() =>
                      accessChat(
                        user._id,
                        chats,
                        setChats,
                        setSelectedChat,
                        toast
                      )
                    }
                    cursor="pointer"
                  >
                    <Text fontWeight="bold">{user.name}</Text>
                    <Text>Email: {user.email}</Text>
                  </Box>
                ))
              : searchPerformed && <Text>No users found</Text>}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default ChatBox;