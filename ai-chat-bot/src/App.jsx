import React, { useState, useEffect } from 'react'
import ChatBotStart from './components/ChatBotStart'
import ChatBotApp from './components/ChatBotApp'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

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
      const response = await axios.get("http://localhost:8080", {
        withCredentials: false,
        params: { userMessage : message.text }
      })
      
    const newMessageResponse = {
    type: "response",
    text: response.data,
    timestamp: new Date().toLocaleTimeString()
  }   

    const updatedChats = chats.map((chat) => {
      return {...chat, messages: [message, newMessageResponse] }
  })
    setChats(updatedChats)

  } catch (error) {
      console.log(error);
  }
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
