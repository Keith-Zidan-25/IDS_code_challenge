"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, UserPlus, Hash, User } from 'lucide-react';
import { encryptMessage, decryptMessage } from '@/utils/aes';

interface MessageT {
  id: number;
  sender: string;
  text: string;
  timestamp: number;
}

export default function App() {
  const currentUser = process.env.ACCOUNT_ID;

  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setTopic] = useState<string>();
  const [topicCode, setTopicCode] = useState<string>('');
  const [messageInput, setMessageInput] = useState<string>('');
  const [messages, setMessages] = useState<MessageT[]>();
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);

  const handleDecrypt = async (messages: MessageT[]) => {
    const result = [];
    for (const message of messages) {
      const decryptedMessage = await decryptMessage(message.text);
      const temp = {
        id: message.id,
        sender: message.sender,
        text: decryptedMessage,
        timestamp: message.timestamp
      }

      result.push(temp)
    }

    return result;
  }

  const selectTopic = async (topic: string) => {
    try {
      const response = await fetch(`/api/${topic}/message`);

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const messages = await response.json();
      const decryptedMessages = await handleDecrypt(messages);
      setMessages(decryptedMessages);
      setTopic(topic);
    } catch (error) {
      alert("An Error Occured while fetching messages");
      console.log(error);
    }
  }

  const sendMessage = async () => {
    if (!messageInput || !currentTopic) {
      alert("please enter message or select a topic first");
      return;
    }
    try {
      const encryptedMessage = await encryptMessage(messageInput);
      const response = await fetch(`/api/${currentTopic}/message`, {
        method: "POST",
        body: JSON.stringify(encryptedMessage)
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      selectTopic(currentTopic);
      setMessageInput("");
    } catch (error) {
      alert("An Error Occured while sending message");
      console.log(error);
    }
  }

  const joinTopic = async () => {
    if (!topicCode) {
      alert("please enter topic id");
      return;
    }

    try {
      const response = await fetch(`/api/${topicCode}/join`);

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      setTopics(prev => [...prev, topicCode]);
    } catch (error) {
      alert(`An Error Occured while joining topic ${topicCode}`);
      console.log(error);
    }
  }

  const createTopic = async () => {
    try {
      const response = await fetch("/api/create");

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const topicId = await response.json();
      setTopics(prev => [...prev, topicId]);
      alert(`New Topic created, Topic ID: ${topicId}`);
    } catch (error) {
      alert("An Error Occured while creating the topic");
      console.log(error);
    }
  }
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800 mb-3">Messages</h1>
          <div className="flex gap-2">
            <button
              onClick={() => createTopic()}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
            >
              <Plus size={16} />
              New
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
            >
              <UserPlus size={16} />
              Join
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {topics && topics.map((topic, index) => (
            <div
              key={index}
              onClick={() => selectTopic(topic)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                currentTopic === topic ? 'bg-blue-50' : 'bg-green-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-black truncate">{topic}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {currentTopic ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center">
                <h2 className="font-semibold text-gray-800">{currentTopic}</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages && messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.sender === currentUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {msg.sender !== currentUser && (
                      <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender}</p>
                    )}
                    <p className="text-lg text-green-600">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a Topic to start messaging or Create a new one.
          </div>
        )}
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Join Topic</h2>
            <input
              type="text"
              value={topicCode}
              onChange={(e) => setTopicCode(e.target.value)}
              placeholder="Enter topic id..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={joinTopic}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}