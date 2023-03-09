// Render de la lista de chats
import { useEffect, useState } from "react";

import axios from 'axios';
// import useSWR, { mutate } from "swr";
import useSWR from "swr";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/ChatList.scss'
import { CircleLoadingAnimation } from './LoadingAnimation';

const fetchChatList = (url) => axios.get(url).then((res) => res.data);

export function ChatList({
  urlApi, 
  apiPath, 
  user_id, 
  setConversation, 
  newChat,
  setNewChat
}){
  apiPath = apiPath + user_id;
  const [chats, setChats] = useState(null);
  const { data, error, mutate } = useSWR(urlApi + apiPath, fetchChatList);
  const [selected, setSelected] = useState(null);
  

  useEffect(() => {
    if (data) {
      setChats(data)
    }
  }, [data])


  
  const refreshChatList = () => {
    mutate();
  }
  
  const createNewChat = () => {
    setNewChat(true);
    const listchats = chats;
    listchats.unshift({chat_title: 'New Chat', _id: "newchat"})
    setChats(listchats)
    setSelected("newchat")
    setConversation({chat_id: null, chat_title: 'New Chat', active: true});
    axios.post(urlApi + 'chat/create_chat/', {
      user_id: user_id,
      chat_title: 'New Chat'
    }).then((res) => {
      setSelected(res.data.chat_id)
      refreshChatList()
      setConversation({chat_id: res.data.chat_id, chat_title: 'New Chat', active: true});
      setNewChat(false);
    })
  }
  
  const openChat = (chat_id, chat_title) => {
    setSelected(chat_id)
    // setToggle(prev => !prev);
    setConversation({chat_id: chat_id, chat_title: chat_title, active: true});
  }
  
  const deleteChat = (chat_id) => {
    console.log("Deleting chat: ", chat_id)
    setChats( prev => prev.filter(chat => chat._id !== chat_id) )
    // Update delete to API
    //axios.delete(urlApi + 'chat/delete_chat/' + chat_id)
  }

  return(
    <div className="aside__container">
      {/* {!data && !error && <div>Loading...</div>} */}
      {!data && !error && <CircleLoadingAnimation/>}

      {error && <div>Failed to load</div> && console.log(error)}
      
      <button 
        className="aside__newbutton"
        onClick={createNewChat}
      >New Chat</button>
      <div className='aside__chatlist'>
        {chats?.map((chat) => (
          <div 
            key={chat._id}
            className={`chat__item` + (selected === chat._id ? ' chatselected' : '')}
            onClick={() => openChat(chat._id, chat.chat_title)}
            >
            
            <h3 className="chat__title">{chat.chat_title}</h3>
            
            <div className="chat__button__container">
              <button
                className="button button--edit"
                onClick={() => console.log("Clicked edit button")}
              ><EditIcon style={{ fontSize: 20 }}/>
              </button>
                
              <button
                className="button button--delete"
                // onClick={() => deleteChat(chat._id)}
                onClick={() => console.log("Clicked delete button")}
              ><DeleteIcon style={{ fontSize: 20 }}/>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}