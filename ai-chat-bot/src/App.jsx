import React, { useState, useEffect } from 'react'
import ChatBotStart from './components/ChatBotStart'
import ChatBotApp from './components/ChatBotApp'
import { v4 as uuidv4 } from 'uuid'

const App = () => {

  const [isChatting, setIsChatting] = useState(false)
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [responseApi, setResponseApi] = useState([{text:'', type:'response'}])


  useEffect(() => {
  }, [chats])

  useEffect(() => {
    console.log("howmanytimes")
    console.log(responseApi)
    addMessageToCurrentChat(responseApi, chats)
  }, [responseApi])

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
  

  const getResponseFromChatWhenChatExists = async (message, updatedChatter) => {
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
  
      setResponseApi((prevResponseApi) => {
        console.log(prevResponseApi[0].text + newMessageResponse.text + "waht")
        return ([{type:'reponse', timestamp: new Date().toLocaleTimeString(), text: prevResponseApi[0].text + newMessageResponse.text }])
    })
  }

  } catch (error) {
      console.log(error);
  }
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


  const addMessageToCurrentChat = (message, updatedChats) => {
        const updatedChatter = updatedChats.map((chat) => {
          if (chat.id === activeChat) {
        let messagesin = [...chat.messages];
             if (message.type === 'prompt') {
                 console.log(message.text, "text1");
              console.log("1")
              const messagesOut = [...messagesin, message]
              return {...chat, messages: messagesOut }
          } else {
            // if (message.type === 'response') {
              console.log(messagesin.length + "length")
              console.log("2")
                 console.log(message[0].text, "text2");
                 
            return {...chat, messages: [{...messagesin[0]}, {type:'response', text: message[0].text, timestamp: new Date().toLocaleTimeString() }]}
            }
    } else {
      return chat
    }
  })
  
  if (message.type === 'prompt') {
    // see what chats is here
    updateTheChatsDirect(updatedChatter)
    console.log("is a 1 here")
    getResponseFromChatWhenChatExists(message, updatedChatter)
  } else {

    console.log("is a 2 coming here")
    updateTheChatsDirect(updatedChatter)
  }

    }

    const updateTheChatsDirect = (updatedChatter) => {
      setChats((prevChats) => {
        return updatedChatter
  })
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
      onCurrentChatWithMessage={addMessageToCurrentChat} 
      /> : <ChatBotStart onStartChat={handleStartChat} />
      }
    </div>
  )
}

export default App
