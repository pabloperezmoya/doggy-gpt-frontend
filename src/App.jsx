import { useState, useEffect, useRef } from 'react'
import { useMediaQuery } from 'react-responsive';

import { ChatList } from './components/ChatList';
import { Conversation } from './components/Conversation';

import './styles/App.scss';

function App() {
  const user_id = '1234';
  
  const urlApi = 'http://192.168.2.100:8000/';

  const [conversation, setConversation] = useState({active: false});
  const [newChat, setNewChat] = useState(false);

  if (!user_id){
    return (
      <div className='App'>
        <h1>Only a few people can acces here</h1>
        <h1>I think you arent part of this people
          <p>&nbsp;</p>
          <p>Sooo, goodbye🦖👋</p>
        </h1>
      </div>
    )
  }

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  // const isDesktop = useMediaQuery('(min-width: 1025px)')

  return (
    <div className='App'>
      <div className='header'>
        <h1 className='header__title'>Doggy GPT🐶</h1>
        {isMobile && conversation?.active == true && (
          <button className='header__button button' onClick={() => setConversation({active:false})}>Back</button>
        )}
      </div>
      
      <div className='layout__container__chatlist'>
        {isMobile && conversation?.active == false && (
          <ChatList
            urlApi={urlApi}
            apiPath='chat/'
            user_id={user_id}
            // conversation={conversation}
            setConversation={setConversation}
            setNewChat={setNewChat}
          />
        )}
        {!isMobile && (
          <ChatList
            urlApi={urlApi}
            apiPath='chat/'
            user_id={user_id}
            // conversation={conversation}
            setConversation={setConversation}
            setNewChat={setNewChat}
          />
        )}
        
        
      </div>
      <div className='layout__container__conversation'>
        {conversation?.active == true && (
            <div className='content--container'>
              <Conversation
                urlApi={urlApi}
                apiPath='chat/get_conversations/'
                chat_id={conversation?.chat_id}
                newChat={newChat}
                />
            </div>
        )}
        {!isMobile && conversation?.active == false && (
          <div className='content--container'>
            <div className="conversation__container">
            <h1>Welcome!</h1>
            <p>Click on "New Chat" start a conversation with OpenAI GPT-3.5 Turbo Model (aka. ChatGPT)</p>
            </div>
          </div>
        )}
      </div>
      
    </div>
  )
}

export default App
