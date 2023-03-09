// Render de la lista de chats
import { useEffect, useState, useRef, useLayoutEffect } from "react";

import SendIcon from '@mui/icons-material/Send';

import ReactMarkdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism'

import axios from 'axios';
// import useSWR, { mutate } from "swr";
import useSWR from "swr";
import { CircleLoadingAnimation, LoadingAnimation } from "./LoadingAnimation";
import '../styles/Conversation.scss'


function RenderMarkdown({children}) {
  return (
    <ReactMarkdown
    children={children}
    components={{
      code({node, inline, className, children, ...props}) {
        const match = /language-(\w+)/.exec(className || '')
        return !inline && match ? (
          <SyntaxHighlighter
            children={String(children).replace(/\n$/, '')}
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            {...props}
          />
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        )
      }
    }}
  />
  );
}




const fetchConversations = (url) => axios.get(url).then((res) => res.data);

export function Conversation({
  urlApi, 
  apiPath, 
  chat_id, 
  newChat,
}){
  apiPath = apiPath + chat_id;
  const [conversations, setConversations] = useState(null);
  const [userInput, setUserInput] = useState('');
  const { data, error, mutate } = useSWR(urlApi + apiPath, fetchConversations);
  const convesation_listRef = useRef(null);
  const [waitingResponse, setWaitingResponse] = useState(false);
  const [errorMaxToken, setErrorMaxToken] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  
  useEffect(() => {
    // if (!newChat){
      setConversations(data)
    // }
  }, [data])

  useEffect(() => {
    if (newChat){
      setConversations(null)
      setShowInfo(true);
    }
  }, [newChat])

  useEffect(() => { // SCROLL TO BOTTOM
    if (convesation_listRef != null){
      convesation_listRef.current.scrollTop = convesation_listRef.current.scrollHeight;
    }
  }, [conversations?.content])


  const handleSendText = async () => {
    setWaitingResponse(true)
    const cleanInput = userInput.trim();
    setUserInput('')

    if (conversations?.content){
      setConversations(prev => ({
        ...prev,
        content: [...prev.content, {role: "user", content: cleanInput}]
      }))
    } else{
      setConversations(prev => ({
        ...prev,
        content: [{role: "user", content: cleanInput}]
      }))
    }
    

    const evtSource = new EventSource(urlApi + 'chat/completion/' + chat_id + '/' + encodeURIComponent(cleanInput));
    evtSource.addEventListener("error", function(event) {
      console.log('Error: ', event)
      evtSource.close();
      setWaitingResponse(false)
      setErrorMaxToken(true);
      setUserInput('Max token reached. Create a new chat.');
    })

    evtSource.addEventListener("end", function(event) {
        console.log('Handling end....')
        evtSource.close();
        setWaitingResponse(false)
      });
    let idx = 0;
    evtSource.addEventListener("message", function(event) {
        // Logic to handle data
        if (event?.data){
          // console.log(event.data)
          // setTemporalText(prev => prev + event.data)
          setWaitingResponse(false)
          if (idx==0){
            setConversations(prev => ({
              ...prev,
              content: [...prev.content, {role: "assistant", content: event.data}]
            }))
            idx += 1;
          }else{
            setConversations(prev => ({
              ...prev,
              content: [...prev.content.slice(0, -1), {role: "assistant", content: prev.content[prev.content.length - 1].content + event.data}]
            }))
          }
        }
    });
  }



  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.shiftKey) {
      return setUserInput(prev => prev + '\n');
    }
    
    if (event.key === 'Enter') {
      return handleSendText();
    }
  }

  return (
    <>
      <div className="conversation__container">
        {/* <h2 className="conversation__title">{chat_title}</h2> */}


        {!conversations && showInfo && (
          <div className="conversation__info">
            <h3 className="conversation__info__title">Ask me about anything🦖</h3>
            <p className="conversation__info__p">Our chat is limited (by the OpenAI API) to 4096 tokens🪨⛏️</p>
          </div>
        ) }
        
        {!conversations?.content && !error && typeof(conversations) != "string"  && <CircleLoadingAnimation/>}

        <div className="conversation__list" ref={convesation_listRef}>
          {conversations?.content?.map((conversation, idx) => {
            if (conversation.role == "user"){
              return (
                <div className="conversation__message__container user" key={idx}>
                  <div className="conversation__message__content"><RenderMarkdown>{conversation.content}</RenderMarkdown></div>
                </div>
              )
            }
            else{
              return (
                <div className="conversation__message__container assistant" key={idx}>
                  <div className="conversation__message__content"><RenderMarkdown>{conversation.content}</RenderMarkdown></div>
                </div>
              )
            }
          })}
          {waitingResponse==true && <div className="conversation__message__container assistant"><LoadingAnimation/></div>}
        </div>
      </div>
      
      <div className="userinput__container">
        {errorMaxToken ? (
          <>
            <input 
            className="userinput__input disabled"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            type="text"
            disabled
            />
            <button
              className="userinput__button button disabled"
              // onClick={() => handleSend()}
              onClick={handleSendText}
              disabled
            ><SendIcon/></button>
          </>
        ):(
          <>
            <input 
              className="userinput__input"
              type="text" 
              value={userInput}
              onKeyDown={handleKeyDown}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your question here...✍"
              />
            <button
              className="userinput__button button"
              // onClick={() => handleSend()}
              onClick={handleSendText}
            ><SendIcon/></button>
          </>
        )}
      </div>
      

    </>
  )
}