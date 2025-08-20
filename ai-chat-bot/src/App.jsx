import React, { useState, useEffect, useCallback } from 'react'
import ChatBotStart from './components/ChatBotStart'
import ChatBotApp from './components/ChatBotApp'
import { v4 as uuidv4 } from 'uuid'

const App = () => {

  const [isChatting, setIsChatting] = useState(false)
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)


  useEffect(() => {
  }, [chats])

  const handleStartChat = () => {
    setIsChatting(true);

    if (chats.length === 0) {
      createNewChat()
    }
  }

  const handleGoBack = () => {
    setIsChatting(false);
  }

  const createNewChatWithMessage = (message) => {
   const newChat = {
        id: uuidv4(),
        displayId: `Chat ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}`,
        messages: [message],
      }

      const updatedChats = [newChat, ...chats]
      setChats(updatedChats)
      setActiveChat(newChat.id)
      getResponseFromChatBotWhenNoChat(message, updatedChats)
  }

  const getResponseFromChatBotWhenNoChat = async (message, chats) => {
  try {
      const response = await fetch('http://localhost:8080/stream?' + new URLSearchParams({
        userMessage: message.text
      }), {
        headers : {
          'Access-Control-Allow-Origin':'http://localhost:5173'
        }
   
      }); 

        if (!response.ok) {
          throw new Error(`HTTP error: Status ${response.status}`);
        }

        const reader = response.body.getReader(); 
        const decoder = new TextDecoder('utf-8'); 

        while (true) {
          const { value, done } = await reader.read(); 

          if (done) {
            break;
          }
          const dataNew = decoder.decode(value, { stream: true }); 
          const newMessageResponse = {
          type: "response",
          text: dataNew,
          timestamp: new Date().toLocaleTimeString()
      } 
       updateTheChats(newMessageResponse)
   
    }

  } catch (error) {
      console.log(error);
  }
  }

  const updateTheChats = (newMessageResponse) => {  
      setChats(prevChats => { 
         return prevChats.map((chat) => {
        let messagesin = [...chat.messages];
          if (messagesin.length === 1) {
              const messagesOut = [...messagesin, newMessageResponse]
              return {...chat, messages: messagesOut }
          }  else {
            if(messagesin.length === 2) {
            return {...chat, messages: [{...messagesin[0]}, {...messagesin[1], text: messagesin[1].text + newMessageResponse.text}]}
      }}
   })}
  )
}

  const createNewChat = () => {
       const newChat = {
        id: uuidv4(),
        displayId: `Chat ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}`,
        messages: [],
      }

      const updatedChats = [newChat, ...chats]
      setChats(updatedChats)
      setActiveChat(newChat.id)
  }

  return (
    <div className='container'>
      {
      isChatting ? <ChatBotApp 
      onGoBack={handleGoBack} 
      chats={chats} 
      setChats={setChats}
      activeChat={activeChat}
      setActiveChat={setActiveChat}  
      onNewChat={createNewChat}
      onNewChatWithMessage={createNewChatWithMessage} 
      /> : <ChatBotStart onStartChat={handleStartChat} />
      }
    </div>
  )
}

export default App
