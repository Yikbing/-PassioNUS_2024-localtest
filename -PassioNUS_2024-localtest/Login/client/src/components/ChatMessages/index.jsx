// client/src/chat/ChatMessages/index.jsx
import React, { useEffect, useState, useRef } from "react";
import { Box, Text, Input, Button, VStack, HStack } from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import socket from "../../socket"; // Import the socket instance

const ChatMessages = () => {
  const { selectedChat } = ChatState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      // Join the chat room
      socket.emit("join chat", selectedChat._id);
    }

    return () => {
      if (selectedChat) {
        // Leave the chat room
        socket.emit("leave chat", selectedChat._id);
      }
    };
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:8080/api/message/${selectedChat._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (newMessage.trim()) {
      try {
        const { data } = await axios.post(
          "http://localhost:8080/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNewMessage("");
        setMessages((prevMessages) => [...prevMessages, data]);
        socket.emit("send message", data); // Emit the message to the server
        scrollToBottom();
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" width="100%">
      <Box flex="1" overflowY="auto" p={4} bg="gray.50">
        <VStack spacing={4} align="stretch">
          {messages.map((message) => (
            <HStack
              key={message._id}
              alignSelf={message.sender._id === userId ? "flex-end" : "flex-start"}
              bg={message.sender._id === userId ? "blue.100" : "green.100"}
              borderRadius="lg"
              p={3}
              maxWidth="70%"
            >
              <Text>{message.content}</Text>
            </HStack>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>
      <Box mt={2} p={4} bg="white">
        <form onSubmit={sendMessage}>
          <HStack>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <Button type="submit" colorScheme="blue">
              Send
            </Button>
          </HStack>
        </form>
      </Box>
    </Box>
  );
};

export default ChatMessages;
