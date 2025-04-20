import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';

export const TravelerChatPage = () => {
  // State: Current user is Traveler, partner is Sender
  const [travelerId, setTravelerId] = useState(null); // Current logged-in user (Traveler)
  const [sender, setSender] = useState(null);       // The chat partner (Sender) { id, name }
  const [activeChatPartner, setActiveChatPartner] = useState(null); // Will hold the 'sender' object
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true); // For loading IDs
  const [loadingMessages, setLoadingMessages] = useState(false); // For loading messages
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Effect 1: Get IDs from localStorage AND SET INITIAL LOADING FALSE
  useEffect(() => {
    let didLoadSuccessfully = false; // Flag to track success
    setInitialLoading(true);
    setError(null);
    console.log("TravelerChatPage: Getting IDs...");

    try { // Wrap the whole process in try/catch for safety
        // Get Current User (Traveler) ID
        const currentTravelerIdString = localStorage.getItem('travelerId');
        if (!currentTravelerIdString) {
          throw new Error("Authentication error: Your Traveler ID not found.");
        }
        const currentTravelerId = parseInt(currentTravelerIdString, 10);
        if (isNaN(currentTravelerId)) {
            throw new Error("Authentication error: Invalid Traveler ID format.");
        }
        console.log("TravelerChatPage: Traveler ID found:", currentTravelerId);
        setTravelerId(currentTravelerId); // Set current user ID

        // Get Chat Partner (Sender) ID
        const partnerSenderIdString = localStorage.getItem('senderId');
        if (!partnerSenderIdString) {
          throw new Error("Chat error: Sender ID to chat with not found in localStorage.");
        }
        const partnerSenderId = parseInt(partnerSenderIdString, 10);
        if (isNaN(partnerSenderId)) {
            throw new Error("Chat error: Invalid Sender ID format.");
        }
        console.log("TravelerChatPage: Sender ID found:", partnerSenderId);

        // Set the chat partner's info (the Sender)
        setSender({
            id: partnerSenderId,
            name: `Sender ${partnerSenderId}` // Placeholder name
        });

        didLoadSuccessfully = true; // Mark success

    } catch (err) {
        console.error("TravelerChatPage: Error getting IDs:", err);
        setError(err.message || "Failed to initialize chat IDs.");
        // Clear potentially partially set state on error
        setTravelerId(null);
        setSender(null);
    } finally {
        // *** THIS IS KEY: Set initial loading false after processing IDs ***
        console.log("TravelerChatPage: Finished processing IDs. Setting initialLoading to false.");
        setInitialLoading(false);
    }

  }, []); // Run only once on mount

  // Effect 2: Fetch Messages when activeChatPartner changes
  useEffect(() => {
    // Fetch only if the current user (traveler) ID is set AND a chat partner (sender) is selected
    if (activeChatPartner && travelerId) {
      setLoadingMessages(true); // Indicate message loading specifically
      setError(null); // Clear previous fetch errors
      setMessages([]); // Clear old messages

      const fetchMessages = async () => {
        console.log(`TravelerChatPage: Fetching messages between ${travelerId} and ${activeChatPartner.id}`);
        try {
          const response = await fetch(
            // Pass travelerId as one user, partner ID as the other
            `http://localhost:8080/api/chats?senderId=${travelerId}&receiverId=${activeChatPartner.id}`
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`TravelerChatPage: Fetch messages failed: ${response.status}`, errorText);
            throw new Error(`Could not load messages (Status: ${response.status})`);
          }

          const data = await response.json();
          console.log("TravelerChatPage: Messages received:", data);
          const formattedMessages = data.map(msg => ({
            id: msg.chatId,
            content: msg.message,
            // isSender is TRUE if the message's senderId matches the CURRENT USER's ID (travelerId)
            isSender: msg.senderId.toString() === travelerId.toString(),
            timestamp: msg.timestamp
          }));
          setMessages(formattedMessages);
        } catch (err) {
          console.error("TravelerChatPage: Error fetching messages:", err);
          setError(err.message || "Failed to load messages. Please try again.");
          setMessages([]); // Ensure messages are empty on error
        } finally {
          console.log("TravelerChatPage: Finished fetching messages.");
          setLoadingMessages(false); // Stop message loading indicator
          // No need to setInitialLoading here anymore
        }
      };

      fetchMessages();

    } else {
       // If no active chat partner, ensure messages are cleared
       setMessages([]);
       setLoadingMessages(false); // Ensure message loading is false
    }
  }, [activeChatPartner, travelerId]); // Re-run fetch when active partner or travelerId changes

  // Handler to select a conversation (selects the Sender)
  const handleSelectConversation = (partner) => {
    console.log("TravelerChatPage: Selecting conversation with sender:", partner);
    if (activeChatPartner?.id !== partner.id) {
        setActiveChatPartner(partner); // Set the Sender as the active partner
    }
  };

  // Send Message Handler (No changes needed here)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatPartner || !travelerId) return;

    const messageContent = newMessage;
    setNewMessage('');

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId, content: messageContent, isSender: true, timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();
    setError(null); // Clear previous send errors

    console.log(`TravelerChatPage: Sending message to ${activeChatPartner.name}: "${messageContent}"`);
    try {
      const response = await fetch('http://localhost:8080/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: travelerId, // Current user (Traveler) is the sender
          receiverId: activeChatPartner.id, // Partner (Sender) is the receiver
          message: messageContent
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`TravelerChatPage: Send message failed: ${response.status}`, errorText);
        throw new Error(`Failed to send message (Status: ${response.status})`);
      }

      const savedMessage = await response.json();
      console.log("TravelerChatPage: Message saved:", savedMessage);

      setMessages(prev => prev.map(msg =>
        msg.id === tempId
          ? {
              id: savedMessage.chatId,
              content: savedMessage.message,
              isSender: savedMessage.senderId.toString() === travelerId.toString(),
              timestamp: savedMessage.timestamp
            }
          : msg
      ));

    } catch (err) {
      console.error("TravelerChatPage: Error sending message:", err);
      setError(err.message || "Failed to send message. Please try again.");
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  // Scroll to Bottom (No changes needed here)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        if (messages.length > 0) {
             scrollToBottom();
        }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // --- Render Logic ---

  // Show initial loading ONLY while the first effect is running
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">Loading chat data...</div>
    );
  }

  // Show critical error if IDs couldn't be loaded correctly
  if (!travelerId || !sender) {
     return (
       <div className="flex items-center justify-center h-screen text-red-600 font-semibold p-4 text-center">
         {error || "Could not initialize chat. Required user IDs missing or invalid."}
       </div>
     );
  }

  // --- Render the main layout ---
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* Left Pane: Shows the Sender */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-300 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold">Chats</h2>
           {/* Display non-critical errors (send/fetch) */}
           {error && (error.includes("Failed to send") || error.includes("Could not load")) && (
             <p className="text-xs text-red-500 mt-1">{error}</p>
           )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {sender && (
            <div
              key={sender.id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                activeChatPartner?.id === sender.id ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleSelectConversation(sender)}
            >
              <div className="flex items-center gap-3">
                 <User className="text-gray-500" size={20}/>
                 <p className="font-medium">{sender.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Chat interface */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
        {activeChatPartner ? (
          <>
            {/* Header */}
            <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10 border-b border-gray-200">
              <User size={20} className="mr-3 text-gray-600" />
              <div>
                <h1 className="font-bold text-lg">{activeChatPartner.name}</h1>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {/* Show message loading indicator */}
               {loadingMessages && (
                    <p className="text-gray-500 text-center mt-8">Loading messages...</p>
               )}
               {/* Show 'no messages' or fetch error */}
               {!loadingMessages && messages.length === 0 && !error?.includes("Could not load") && (
                  <p className="text-gray-500 text-center mt-8">
                      Send a message to start the chat!
                  </p>
               )}
               {!loadingMessages && error?.includes("Could not load") && (
                   <p className="text-red-500 text-center mt-8">
                      Error loading messages. Please try again later.
                   </p>
               )}

              {/* Render messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] md:max-w-[65%] rounded-lg px-3 py-2 shadow ${
                      message.isSender
                        ? 'bg-blue-500 text-white rounded-br-lg' // Message from Traveler (current user)
                        : 'bg-white text-gray-800 rounded-bl-lg' // Message from Sender (partner)
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70 text-right ${message.isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="bg-gray-100 p-3 border-t border-gray-300 sticky bottom-0">
              <div className="flex items-center bg-white rounded-full shadow-sm px-2 py-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border-none bg-transparent rounded-full px-3 py-1.5 focus:outline-none text-sm"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-2 rounded-full ml-1 ${
                    !newMessage.trim()
                      ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1'
                  } transition duration-150 ease-in-out`}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          // Placeholder if Sender hasn't been clicked in left pane
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
             {/* Show ID loading error here if it occurred */}
             {error && (!travelerId || !sender) && (
                 <p className="text-red-500 font-semibold mb-4">{error}</p>
             )}
            <MessageSquare size={48} className="mb-4 opacity-40" />
            <p className="text-lg">Select the chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};