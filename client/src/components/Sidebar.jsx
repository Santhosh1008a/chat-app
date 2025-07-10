import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    searchUsers,
    searchResults,
    addUserToContacts,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [addedIds, setAddedIds] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  useEffect(() => {
    searchUsers(input);
  }, [input]);

  const handleSelect = (user) => {
    setSelectedUser(user);
    setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
  };

  const handleAdd = async (userId) => {
    try {
      await addUserToContacts(userId);
      toast.success('User added to contacts!');
      setAddedIds((prev) => [...prev, userId]);
      setConfirmingId(null);
    } catch (err) {
      toast.error('Something went wrong.');
    }
  };

  const showSearchResults = input.trim() !== '' && searchResults.length > 0;

  return (
    <div className={`bg-[#818582]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? 'max-md:hidden' : ''}`}>
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          {/* Menu dropdown for edit profile + logout */}
          <div className="relative py-2">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
              onClick={() => setMenuOpen((prev) => !prev)}
            />
            {menuOpen && (
              <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100">
                <p
                  onClick={() => {
                    navigate('/profile');
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  Edit profile
                </p>
                <hr className="my-2 border-t border-gray-500" />
                <p
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="search user..."
          />
        </div>
      </div>

      {/* 🔍 Search Results */}
      {showSearchResults ? (
        <div className="flex flex-col gap-2 mt-4">
          {searchResults.map((user, index) => (
            <div key={index} className="flex items-center justify-between bg-[#282142] p-2 rounded-lg cursor-pointer">
              <div className="flex gap-2 items-center">
                <img src={user.profilePic || assets.avatar_icon} className="w-[35px] aspect-square rounded-full" alt="avatar" />
                <div className="flex flex-col">
                  <p className="text-sm">{user.fullName}</p>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </div>
              </div>

              {addedIds.includes(user._id) ? (
                <span className="text-green-400 text-sm font-semibold">✔️ Added</span>
              ) : confirmingId === user._id ? (
                <button className="bg-green-600 text-white text-xs px-2 py-1 rounded" onClick={() => handleAdd(user._id)}>
                  Confirm?
                </button>
              ) : (
                <img
                  src={assets.add_icon}
                  className="w-5 h-5 invert opacity-75 hover:opacity-100"
                  onClick={() => setConfirmingId(user._id)}
                  alt="add"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        // 👥 Contact List
        <div className="flex flex-col">
          {users.map((user, index) => (
            <div
              onClick={() => handleSelect(user)}
              key={index}
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
                selectedUser?._id === user._id ? 'bg-[#282142]/50' : ''
              }`}
            >
              <img src={user?.profilePic || assets.avatar_icon} alt="" className="w-[35px] aspect-[1/1] rounded-full" />
              <div className="flex flex-col leading-5">
                <p>{user.fullName}</p>
                {onlineUsers.includes(user._id) ? (
                  <span className="text-green-400 text-xs">online</span>
                ) : (
                  <span className="text-neutral-400 text-xs">offline</span>
                )}
              </div>
              {unseenMessages[user._id] > 0 && (
                <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                  {unseenMessages[user._id]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;


