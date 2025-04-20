import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';

export const SenderChatPage = () => {
  const [senderId, setSenderId] = useState(null);
  const [traveler, setTraveler] = useState(null);
  const [activeChatPartner, setActiveChatPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Effect 1: Get IDs from localStorage
  useEffect(() => {
    setInitialLoading(true);
    setError(null);

    const currentSenderId = localStorage.getItem('userId');
    if (!currentSenderId) {
      setError("Login required: User ID not found.");
      setInitialLoading(false);
      return;
    }
    setSenderId(currentSenderId);

    // *** CORRECTED: Use 'travelerId' key ***
    const travelerIdString = localStorage.getItem('travelerId');
    console.log("String value from localStorage key 'travelerId':", travelerIdString); // Log the correct key

    if (!travelerIdString) {
      // *** CORRECTED: Update error message ***
      setError("Chat error: Traveler ID not found in localStorage (key 'travelerId' is missing or empty).");
      setInitialLoading(false);
      return;
    }

    try {
        const extractedTravelerId = parseInt(travelerIdString, 10);
        console.log("Attempting to parse travelerIdString:", travelerIdString, "Result:", extractedTravelerId);

        if (isNaN(extractedTravelerId)) {
             // *** CORRECTED: Update error message ***
            setError(`Chat error: Invalid Traveler ID format found in localStorage (key 'travelerId' value: "${travelerIdString}").`);
            setInitialLoading(false);
        } else {
            setTraveler({
                id: extractedTravelerId,
                name: `Traveler ${extractedTravelerId}`
            });
        }
    } catch (err) {
         setError("Chat error: Could not process traveler ID.");
         setInitialLoading(false);
    } finally {
        if (!traveler && !error) {
           setInitialLoading(false);
        }
    }
  }, []); // Run only once on mount

  // Effect 2: Fetch Messages when activeChatPartner changes
  useEffect(() => {
    if (activeChatPartner && senderId) {
      setLoadingMessages(true);
      setError(null);
      setMessages([]);

      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/chats?senderId=${senderId}&receiverId=${activeChatPartner.id}`
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Fetch messages failed: ${response.status}`, errorText);
            throw new Error(`Could not load messages (Status: ${response.status})`);
          }

          const data = await response.json();
          const formattedMessages = data.map(msg => ({
            id: msg.chatId,
            content: msg.message,
            isSender: msg.senderId.toString() === senderId.toString(),
            timestamp: msg.timestamp
          }));
          setMessages(formattedMessages);
        } catch (err) {
          console.error("Error fetching messages:", err);
          setError(err.message || "Failed to load messages. Please try again.");
          setMessages([]);
        } finally {
          setLoadingMessages(false);
          setInitialLoading(false);
        }
      };

      fetchMessages();

    } else {
       setMessages([]);
       setLoadingMessages(false);
       if (!initialLoading && senderId && traveler) {
           setInitialLoading(false);
       }
    }
  }, [activeChatPartner, senderId]);

  // Handler to select a conversation
  const handleSelectConversation = (partner) => {
    if (activeChatPartner?.id !== partner.id) {
        setActiveChatPartner(partner);
    }
  };

  // Send Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatPartner || !senderId) return;

    const messageContent = newMessage;
    setNewMessage('');

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      content: messageContent,
      isSender: true,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: parseInt(senderId, 10),
          receiverId: activeChatPartner.id,
          message: messageContent
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Send message failed: ${response.status}`, errorText);
        throw new Error(`Failed to send message (Status: ${response.status})`);
      }

      const savedMessage = await response.json();

      setMessages(prev => prev.map(msg =>
        msg.id === tempId
          ? {
              id: savedMessage.chatId,
              content: savedMessage.message,
              isSender: savedMessage.senderId.toString() === senderId.toString(),
              timestamp: savedMessage.timestamp
            }
          : msg
      ));

    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message. Please try again.");
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  // Scroll to Bottom
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

  if (initialLoading && !activeChatPartner) {
    return (
      <div className="flex items-center justify-center h-screen">Loading chat data...</div>
    );
  }

  if (!senderId || !traveler) {
     return (
       <div className="flex items-center justify-center h-screen text-red-600 font-semibold p-4 text-center">
         {error || "Could not initialize chat. Required data missing or invalid."}
       </div>
     );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* Left Pane */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-300 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold">Chats</h2>
           {error && (error.includes("Failed to send") || error.includes("Could not load")) && (
             <p className="text-xs text-red-500 mt-1">{error}</p>
           )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {traveler && (
            <div
              key={traveler.id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                activeChatPartner?.id === traveler.id ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleSelectConversation(traveler)}
            >
              <div className="flex items-center gap-3">
                 <User className="text-gray-500" size={20}/>
                 <p className="font-medium">{traveler.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane */}
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
               {loadingMessages && (
                    <p className="text-gray-500 text-center mt-8">Loading messages...</p>
               )}
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

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] md:max-w-[65%] rounded-lg px-3 py-2 shadow ${
                      message.isSender
                        ? 'bg-blue-500 text-white rounded-br-lg'
                        : 'bg-white text-gray-800 rounded-bl-lg'
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
          // Placeholder
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
             {error && !traveler && (
                 <p className="text-red-500 font-semibold mb-4">{error}</p>
             )}
            <MessageSquare size={48} className="mb-4 opacity-40" />
            <p className="text-lg">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};