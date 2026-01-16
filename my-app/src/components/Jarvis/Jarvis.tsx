// import React, { useState, useEffect } from 'react';
// import { useSpeechRecognition, useSpeechSynthesis } from 'react-speech-kit';
// import { processCommand } from '../../api/jarvisAPI';
// import styles from './styles.module.css';
//
// interface Conversation {
//   speaker: 'user' | 'jarvis';
//   text: string;
//   timestamp: Date;
// }
//
// const Jarvis: React.FC = () => {
//   const [conversation, setConversation] = useState<Conversation[]>([]);
//   const [isListening, setIsListening] = useState(false);
//   const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
//
//   const { listen, stop } = useSpeechRecognition({
//     onResult: (result: string) => {
//       handleCommand(result);
//     },
//     onError: () => {
//       setStatus('error');
//       setTimeout(() => setStatus('idle'), 2000);
//     }
//   });
//
//   const { speak, cancel } = useSpeechSynthesis();
//
//   const handleCommand = async (command: string) => {
//     setIsListening(false);
//     stop();
//     setStatus('processing');
//
//     // Add user command to conversation
//     setConversation(prev => [...prev, {
//       speaker: 'user',
//       text: command,
//       timestamp: new Date()
//     }]);
//
//     // Process command
//     const result = await processCommand(command);
//
//     // Speak the response
//     if (result.response) {
//       speak({ text: result.response });
//     }
//
//     // Add Jarvis response to conversation
//     setConversation(prev => [...prev, {
//       speaker: 'jarvis',
//       text: result.response,
//       timestamp: new Date()
//     }]);
//
//     setStatus('idle');
//   };
//
//   const toggleListening = () => {
//     if (isListening) {
//       stop();
//       setIsListening(false);
//       setStatus('idle');
//     } else {
//       listen({ lang: 'en-US' });
//       setIsListening(true);
//       setStatus('listening');
//     }
//   };
//
//   return (
//     <div className={styles.container}>
//       <div className={styles.conversation}>
//         {conversation.map((item, index) => (
//           <div key={index} className={`${styles.message} ${styles[item.speaker]}`}>
//             <div className={styles.header}>
//               <strong>{item.speaker === 'user' ? 'You' : 'JARVIS'}</strong>
//               <span className={styles.time}>
//                 {item.timestamp.toLocaleTimeString()}
//               </span>
//             </div>
//             <p>{item.text}</p>
//           </div>
//         ))}
//       </div>
//
//       <div className={styles.controls}>
//         <button
//           onClick={toggleListening}
//           className={`${styles.button} ${isListening ? styles.listening : ''}`}
//           disabled={status === 'processing'}
//         >
//           {status === 'processing' ? (
//             'Processing...'
//           ) : isListening ? (
//             'Stop Listening'
//           ) : (
//             'Start Listening'
//           )}
//         </button>
//
//         <div className={styles.status}>
//           Status: {status}
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default Jarvis;