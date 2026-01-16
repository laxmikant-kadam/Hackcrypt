import React, { useState, useRef, useEffect } from 'react';
import { Mic, Camera, Check, X, ArrowLeft, BookOpen, HelpCircle } from 'lucide-react';

const AlzheimerFacialRecognition = ({ onNavigateBack }) => {
    // State for different modes
    const [mode, setMode] = useState('menu'); // 'menu', 'quiz', 'addFace', 'memoryBook'
    const [quizData, setQuizData] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [memoryBook, setMemoryBook] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Video and canvas refs for adding faces
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);

    // Colors and styling
    const primaryColor = 'bg-blue-600';
    const secondaryColor = 'bg-amber-500';
    const textColor = 'text-blue-800';
    const lightBg = 'bg-blue-50';

    // Load memory book on component mount
    useEffect(() => {
        fetchMemoryBook();
    }, []);

    const fetchMemoryBook = async () => {
        try {
            const response = await fetch('http://localhost:5000/facial_control/list');
            const data = await response.json();
            if (data.faces) {
                setMemoryBook(data.faces);
            }
        } catch (error) {
            console.error("Error loading memory book:", error);
        }
    };

    const startQuiz = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/facial_control/quiz');
            const data = await response.json();
            if (data.quiz) {
                setQuizData(data.quiz);
                setMode('quiz');
                setUserAnswer('');
                setFeedback(null);
            }
        } catch (error) {
            console.error("Error starting quiz:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkAnswer = async () => {
        if (!userAnswer.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/facial_control/check_answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answer: userAnswer,
                    correct_answer: quizData.answer
                })
            });
            const data = await response.json();
            setFeedback(data);

            // After 3 seconds, show another quiz or return to menu
            setTimeout(() => {
                if (data.simple_feedback === 'Correct') {
                    startQuiz(); // New quiz after correct answer
                }
            }, 3000);
        } catch (error) {
            console.error("Error checking answer:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceAnswer = async () => {
        setIsListening(true);
        try {
            const response = await fetch('http://localhost:5000/facial_control/voice_answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correct_answer: quizData.answer
                })
            });
            const data = await response.json();
            setFeedback(data);

            if (data.correct_answer) {
                setUserAnswer(data.correct_answer);
            }

            // After 5 seconds, show another quiz
            setTimeout(() => {
                if (data.simple_feedback === 'Correct') {
                    startQuiz();
                }
            }, 5000);
        } catch (error) {
            console.error("Error with voice answer:", error);
        } finally {
            setIsListening(false);
        }
    };

    // Face addition functions
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setMode('addFace');
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const captureFace = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stop camera
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        // Prompt for name
        setMode('nameFace');
    };

    const saveFace = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const name = prompt("Who is this person? (Enter their name):");
        if (!name) {
            setMode('menu');
            return;
        }

        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('image', blob, `${name}.jpg`);
            formData.append('name', name);

            try {
                const response = await fetch('http://localhost:5000/add_face', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    alert(`${name} has been added to your memory book!`);
                    fetchMemoryBook();
                }
            } catch (error) {
                console.error("Error saving face:", error);
                alert("Couldn't save this person. Please try again.");
            } finally {
                setMode('menu');
            }
        }, 'image/jpeg', 0.8);
    };

    // Clean up camera on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Main menu component
    const MenuScreen = () => (
        <div className={`p-8 ${lightBg} rounded-2xl shadow-lg max-w-md mx-auto`}>
            <h1 className={`text-3xl font-bold ${textColor} mb-6 text-center`}>Memory Helper</h1>

            <div className="space-y-4">
                <button
                    onClick={startQuiz}
                    className={`w-full ${primaryColor} text-white py-4 rounded-xl flex items-center justify-center gap-2 text-xl`}
                    disabled={isLoading}
                >
                    <HelpCircle size={24} />
                    {isLoading ? "Loading..." : "Memory Quiz"}
                </button>

                <button
                    onClick={startCamera}
                    className={`w-full ${secondaryColor} text-white py-4 rounded-xl flex items-center justify-center gap-2 text-xl`}
                >
                    <Camera size={24} />
                    Add New Person
                </button>

                <button
                    onClick={() => setMode('memoryBook')}
                    className={`w-full bg-green-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-xl`}
                >
                    <BookOpen size={24} />
                    My Memory Book
                </button>
            </div>
        </div>
    );

    // Quiz screen component
    const QuizScreen = () => (
        <div className={`p-6 ${lightBg} rounded-2xl shadow-lg max-w-md mx-auto`}>
            <button
                onClick={() => setMode('menu')}
                className={`${textColor} flex items-center gap-1 mb-4`}
            >
                <ArrowLeft size={20} /> Back
            </button>

            {quizData && (
                <div className="text-center">
                    <h2 className={`text-2xl font-bold ${textColor} mb-4`}>Who is this?</h2>

                    <div className="mb-6 bg-white p-2 rounded-lg shadow-inner">
                        <img
                            src={`http://localhost:5000${quizData.image}`}
                            alt="Person to recognize"
                            className="w-full h-64 object-contain mx-auto"
                        />
                    </div>

                    {!feedback ? (
                        <>
                            <input
                                type="text"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Enter the name..."
                                className="w-full p-4 border-2 border-blue-300 rounded-lg text-xl mb-4"
                            />

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={checkAnswer}
                                    className={`${primaryColor} text-white py-3 px-6 rounded-lg flex items-center gap-2`}
                                    disabled={isLoading || !userAnswer.trim()}
                                >
                                    <Check size={20} />
                                    {isLoading ? "Checking..." : "Submit"}
                                </button>

                                <button
                                    onClick={handleVoiceAnswer}
                                    className={`bg-purple-600 text-white py-3 px-6 rounded-lg flex items-center gap-2`}
                                    disabled={isListening}
                                >
                                    <Mic size={20} />
                                    {isListening ? "Listening..." : "Say Name"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={`p-4 rounded-lg ${feedback.simple_feedback === 'Correct' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            <p className="text-xl font-bold mb-2">
                                {feedback.simple_feedback === 'Correct' ? '✓ Correct!' : 'Try Again'}
                            </p>
                            {feedback.correct_answer && (
                                <p className="text-lg">This is <strong>{feedback.correct_answer}</strong></p>
                            )}
                            <p className="mt-2">{feedback.message}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Add face screen component
    const AddFaceScreen = () => (
        <div className={`p-6 ${lightBg} rounded-2xl shadow-lg max-w-md mx-auto`}>
            <button
                onClick={() => {
                    if (stream) stream.getTracks().forEach(track => track.stop());
                    setMode('menu');
                }}
                className={`${textColor} flex items-center gap-1 mb-4`}
            >
                <ArrowLeft size={20} /> Back
            </button>

            <h2 className={`text-2xl font-bold ${textColor} mb-4 text-center`}>Add New Person</h2>

            {mode === 'addFace' && (
                <>
                    <div className="bg-black rounded-lg overflow-hidden mb-4">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-64 object-cover"
                        />
                    </div>

                    <button
                        onClick={captureFace}
                        className={`w-full ${primaryColor} text-white py-3 rounded-lg flex items-center justify-center gap-2`}
                    >
                        <Camera size={20} />
                        Take Photo
                    </button>
                </>
            )}

            {mode === 'nameFace' && (
                <>
                    <div className="bg-white p-2 rounded-lg shadow-inner mb-4">
                        <canvas
                            ref={canvasRef}
                            className="w-full h-64 object-contain mx-auto"
                        />
                    </div>

                    <button
                        onClick={saveFace}
                        className={`w-full ${primaryColor} text-white py-3 rounded-lg flex items-center justify-center gap-2`}
                    >
                        <Check size={20} />
                        Save to Memory Book
                    </button>
                </>
            )}

            <p className="text-sm text-gray-600 mt-4 text-center">
                Tip: Make sure the person's face is clearly visible and well-lit.
            </p>
        </div>
    );

    // Memory book screen component
    const MemoryBookScreen = () => (
        <div className={`p-6 ${lightBg} rounded-2xl shadow-lg max-w-md mx-auto`}>
            <button
                onClick={() => setMode('menu')}
                className={`${textColor} flex items-center gap-1 mb-4`}
            >
                <ArrowLeft size={20} /> Back
            </button>

            <h2 className={`text-2xl font-bold ${textColor} mb-6 text-center`}>My Memory Book</h2>

            {memoryBook.length === 0 ? (
                <p className="text-center text-gray-600">Your memory book is empty. Add some people to get started.</p>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {memoryBook.map((person, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg shadow text-center">
                            <img
                                src={`http://localhost:5000${person.image}`}
                                alt={person.name}
                                className="w-full h-32 object-cover rounded mb-2"
                            />
                            <p className="font-bold text-blue-800">{person.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-100 to-blue-50">
            {mode === 'menu' && <MenuScreen />}
            {mode === 'quiz' && <QuizScreen />}
            {mode === 'addFace' && <AddFaceScreen />}
            {mode === 'nameFace' && <AddFaceScreen />}
            {mode === 'memoryBook' && <MemoryBookScreen />}
        </div>
    );
};

export default AlzheimerFacialRecognition;