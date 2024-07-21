// client/src/chat/index.jsx
import { useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";
import MyChats from "../MyChats";
import ChatBox from "../ChatBox";
import { ChatState } from "../../Context/ChatProvider";
import ChatMessages from "../ChatMessages";
import socket from "../../socket"; // Import the socket instance

const ChatPage = () => {
  const { selectedChat, setChats, setSelectedChat } = ChatState();

  useEffect(() => {
    // Listen for new messages
    socket.on("message received", (newMessage) => {
      if (selectedChat && selectedChat._id === newMessage.chat._id) {
        setSelectedChat((prevChat) => ({
          ...prevChat,
          messages: [...prevChat.messages, newMessage],
        }));
      } else {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === newMessage.chat._id
              ? { ...chat, latestMessage: newMessage }
              : chat
          )
        );
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [selectedChat, setChats, setSelectedChat]);

  return (
    <div style={{ width: "100%", height: "89.8vh" }}>
      <Box display="flex" height="100%">
        <Box
          width="30%"
          borderRight="1px solid #000"
          height="100%"
          display="flex"
          flexDirection="column"
        >
          <Box p={4} borderBottom="1px solid #000" flex="none">
            <ChatBox />
          </Box>
          <Box p={4} flex="1" overflowY="auto">
            <MyChats />
          </Box>
        </Box>
        <Box
          width="70%"
          p={4}
          display="flex"
          flexDirection="column"
          height="100%"
        >
          {selectedChat ? (
            <ChatMessages /> // Render the ChatMessages component
          ) : (
            <Text fontSize="xl" color="gray.500">
              Select a chat to start messaging
            </Text>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default ChatPage;
