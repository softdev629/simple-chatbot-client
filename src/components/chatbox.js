import React, { useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import axios from "axios";

const ChatBox = () => {
  // Hooks
  const [history, setHistory] = useState([
    {
      type: "human",
      text: "Hello!",
    },
    {
      type: "bot",
      text: `Ask me any thing.`,
    },
  ]); // Chat History
  const [prompt, setPrompt] = useState(""); // User Message Input
  const [isAnswered, setIsAnswered] = useState(true); // Answer state
  const chatHistoryRef = useRef(null);
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `ws://localhost:9000/api/chat`
  ); // Websocket Hook

  // Receive Messages
  useEffect(() => {
    if (lastMessage !== null) {
      // Add History
      setHistory((prev) =>
        prev.concat({ type: "bot", text: lastMessage.data })
      );

      setTimeout(() => {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }, 50);
      // Think Stop Flag
      setIsAnswered(true);
    }
  }, [lastMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Before answer, make user not to ask questions
    if (!isAnswered) {
      alert("AI Bot is thinking.");
      return;
    }

    setIsAnswered(false);
    history.push({ type: "human", text: prompt });
    setHistory([...history]);
    setTimeout(() => {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }, 100);
    sendMessage(prompt);
    setPrompt("");
  };

  const ChatItem = (type, message, index) => {
    return (
      <div
        key={index}
        style={
          type == "bot"
            ? { display: "flex", flexDirection: "row" }
            : { display: "flex", flexDirection: "row-reverse" }
        }
      >
        <img
          src={type === "bot" ? "/assets/bot.png" : "/assets/user.png"}
          width={35}
          height={35}
        />
        <div
          style={{ maxWidth: 400 }}
          className={type === "bot" ? "bot_item_content" : "user_item_content"}
        >
          {message}
        </div>
      </div>
    );
  };

  return (
    <div className="chat_container">
      <div className="chat_history" ref={chatHistoryRef}>
        {history.map((item, index) => ChatItem(item.type, item.text, index))}
      </div>
      <form className="message_box" onSubmit={handleSubmit}>
        <input
          className="message-input"
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          disabled={readyState !== ReadyState.OPEN}
        />
        <button
          className="message-btn"
          type="submit"
          disabled={readyState !== ReadyState.OPEN}
        >
          <img width={40} height={40} src="/assets/send.jpg" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
