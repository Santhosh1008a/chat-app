import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [searchResults, setSearchResults] = useState([]);

  const { socket, axios } = useContext(AuthContext);

  // ✅ Get users already added to contacts
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Search users by username (starts with)
  const searchUsers = async (query) => {
    try {
      if (!query || query.trim() === "") return setSearchResults([]);
      const { data } = await axios.get(`/api/users/search?username=${query}`);
      if (data.success) {
        setSearchResults(data.users);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Add user to contacts
  const addUserToContacts = async (userIdToAdd) => {
    try {
      const { data } = await axios.post("/api/users/add", { userIdToAdd });
      if (data.success) {
        toast.success(data.message);
        await getUsers();
        setSearchResults([]); // clear suggestions after adding
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Get all messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Send message
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Real-time new message handling
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    setSelectedUser,
    getUsers,
    getMessages,
    sendMessage,
    unseenMessages,
    setUnseenMessages,
    searchUsers,
    searchResults,
    addUserToContacts,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

