import React, { useEffect } from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";

const MyChats = () => {
  const { chats, setChats, selectedChat, setSelectedChat } = ChatState();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:8080/api/chat", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setChats(data);
      } catch (error) {
        console.error("Failed to load chats", error);
        setChats([]); // Ensure chats is set to an empty array on error
      }
    };

    fetchChats();
  }, [setChats]);

  return (
    <Box mt={4}>
      <Text fontSize="2xl" mb={4}>
        My Chats
      </Text>
      <VStack spacing={4} align="stretch">
        {chats && chats.length > 0 ? (
          chats.map((chat) => (
            <Box
              key={chat._id}
              p={4}
              bg={
                selectedChat && selectedChat._id === chat._id
                  ? "blue.100"
                  : "gray.100"
              } // Highlight the selected chat
              borderRadius="md"
              onClick={() => setSelectedChat(chat)}
              cursor="pointer"
            >
              <Text fontWeight="bold">
                {chat.isGroupChat
                  ? chat.chatName
                  : chat.users.find((u) => u._id !== chat._id).name}
              </Text>
              {chat.latestMessage && (
                <Text mt={1} fontSize="sm" color="gray.500">
                  <strong>{chat.latestMessage.sender.name}: </strong>
                  {chat.latestMessage.content.length > 50
                    ? `${chat.latestMessage.content.substring(0, 50)}...`
                    : chat.latestMessage.content}
                </Text>
              )}
            </Box>
          ))
        ) : (
          <Text>No chats available</Text>
        )}
      </VStack>
    </Box>
  );
};

export default MyChats;
