// import React, { useState, useEffect } from 'react';
// import { useSpeechRecognition, useSpeechSynthesis } from 'react-speech-kit';
// import { processCommand } from "../../api/jarvisAPI";
//
// interface JarvisAssistantProps {
//   onClose: () => void;
// }
//
// const JarvisAssistant: React.FC<JarvisAssistantProps> = ({ onClose }) => {
//   const [command, setCommand] = useState('');
//   const [conversation, setConversation] = useState<Array<{ speaker: string; text: string }>>([]);
//   const [isListening, setIsListening] = useState(false);
//
//   const { listen, stop } = useSpeechRecognition({
//     onResult: (result: string) => {
//       setCommand(result);
//       handleCommand(result);
//     },
//   });
//
//   const { speak } = useSpeechSynthesis();
//
//   // Function to speak and update the conversation
//   const speakMessage = (msg: string, speaker: "jarvis" | "user") => {
//     speak({ text: msg });
//     setConversation(prev => [...prev, { speaker, text: msg }]);
//   };
//
//   // Startup sequence (runs only once)
//   useEffect(() => {
//     const greetings = [
//       "Initializing JARVIS",
//       "All systems operational",
//       "I am online and ready"
//     ];
//
//     greetings.forEach((msg, i) => {
//       setTimeout(() => speakMessage(msg, "jarvis"), i * 1500);
//     });
//   }, []); // Empty dependency array ensures this runs only once
//
//   const handleCommand = async (cmd: string) => {
//     setIsListening(false);
//     stop();
//
//     // Add user command to conversation
//     setConversation(prev => [...prev, { speaker: 'user', text: cmd }]);
//
//     try {
//       const result = await processCommand(cmd);
//       speakMessage(result.response, "jarvis");
//     } catch (error) {
//       speakMessage("I couldn't process that command.", "jarvis");
//     }
//   };
//
//   const toggleListening = () => {
//     if (isListening) {
//       stop();
//       setIsListening(false);
//     } else {
//       listen();
//       setIsListening(true);
//     }
//   };
//
//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex-shrink-0 p-4 border-b border-purple-500/20">
//         <h2 className="text-xl font-bold text-purple-300">JARVIS Assistant</h2>
//       </div>
//
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {conversation.map((item, index) => (
//           <div key={index} className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
//             <div className={`max-w-[80%] rounded-lg p-3 ${item.speaker === 'user' ? 'bg-purple-600' : 'bg-gray-700'}`}>
//               <p className="text-sm">{item.text}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//
//       <div className="flex-shrink-0 p-4 border-t border-purple-500/20">
//         <div className="flex items-center justify-center space-x-4">
//           <button
//             onClick={toggleListening}
//             className={`px-6 py-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-purple-600'} text-white transition-colors`}
//           >
//             {isListening ? 'Stop Listening' : 'Start Listening'}
//           </button>
//           <span className="text-sm text-gray-400">
//             {isListening ? 'Listening...' : 'Press to speak'}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default JarvisAssistant;
