import React from 'react'
import './ChatBotStart.css'

const ChatBotStart = ({onStartChat}) => {
  return (
    <div className='start-page'>
      <button onClick={onStartChat} className='start-page-btn'>Chat AI</button>
    </div>
  )
}

export default ChatBotStart
