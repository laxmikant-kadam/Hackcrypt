import React, { useState, useRef, useEffect } from 'react';
import { Pause, Mic, MessageSquare, Navigation, Sparkles, BookOpen, Camera, X } from 'lucide-react';

const FacialFeatures = ({ onNavigate }) => {
    // State declarations
    const [isHeaderHovered, setIsHeaderHovered] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // First declare all handler functions
    const handleAddFace = async () => {
        setError(null);
        setShowCamera(true);
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
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please check permissions.");
            setShowCamera(false);
        }
    };

    // Then declare equipmentItems that uses the handler
    const equipmentItems = [
        {
            name: "Start Recognition",
            description: "Start real-time face recognition",
            icon: <Mic className="w-16 h-16" strokeWidth={1} />,
            color: "from-purple-950/40 via-purple-800/20 to-purple-950/40",
            glow: "purple",
            indicators: ['purple', 'blue', 'purple', 'blue'],
            apiEndpoint: "http://127.0.0.1:5000/face_recognition/start"
        },
        {
            name: "Add New Face",
            description: "Register a new face with name",
            icon: <MessageSquare className="w-16 h-16" strokeWidth={1} />,
            color: "from-emerald-950/40 via-emerald-800/20 to-emerald-950/40",
            glow: "emerald",
            indicators: ['green', 'blue', 'green'],
            handler: handleAddFace
        },
        {
            name: "Memory Quiz",
            description: "Test your face memory skills",
            icon: <Navigation className="w-16 h-16" strokeWidth={1} />,
            color: "from-amber-950/40 via-amber-800/20 to-amber-950/40",
            glow: "amber",
            indicators: ['yellow', 'yellow', 'red', 'yellow'],
            apiEndpoint: "http://127.0.0.1:5000/facial_control/quiz"
        },
        {
            name: "List Known Faces",
            description: "View all registered faces",
            icon: <Sparkles className="w-16 h-16" strokeWidth={1} />,
            color: "from-cyan-950/40 via-cyan-800/20 to-cyan-950/40",
            glow: "cyan",
            indicators: ['blue', 'blue', 'blue'],
            apiEndpoint: "http://127.0.0.1:5000/facial_control/list"
        },
        {
            name: "Interactive Reader",
            description: "Dynamic text size adjustment",
            icon: <BookOpen className="w-16 h-16" strokeWidth={1} />,
            color: "from-indigo-950/40 via-indigo-800/20 to-indigo-950/40",
            glow: "indigo",
            indicators: ['blue', 'purple', 'blue'],
            apiEndpoint: "http://127.0.0.1:5000/interactivereading/start"
        }
    ];

    // Clean up camera stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Capture image from video stream
    const captureImage = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.readyState !== 4) {
            setError("Camera not ready. Please try again.");
            return;
        }

        try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            if (!imageData || imageData.length < 1000) {
                throw new Error("Invalid image captured");
            }

            stopCamera();
            promptForName(imageData);
        } catch (err) {
            console.error("Error capturing image:", err);
            setError("Failed to capture image. Please try again.");
            stopCamera();
        }
    };

    // Stop camera stream
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
    };

    // Prompt for name and handle face registration
    const promptForName = async (imageData) => {
        let name = "";
        while (!name.trim()) {
            name = prompt("Enter the person's name (required):");
            if (name === null) return;

            if (!name.trim()) {
                alert("Name cannot be empty. Please try again.");
            }
        }
        await registerFace(imageData, name.trim());
    };

    // Register face with backend
    const registerFace = async (imageData, name) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!imageData.startsWith('data:image/jpeg;base64,')) {
                throw new Error("Invalid image format");
            }

            const base64Data = imageData.split(',')[1];
            if (!base64Data || base64Data.length < 1000) {
                throw new Error("Image data too small");
            }

            const response = await fetch("http://127.0.0.1:5000/add_face", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Data,
                    name: name
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || result.error || 'Failed to add face');
            }

            setSuccess(`Successfully registered ${name}`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || "Failed to register face");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle clicking on feature cards
    const handleClick = async (apiEndpoint, handler) => {
        if (handler) return handler();
        if (!apiEndpoint) {
            alert("Feature not implemented yet");
            return;
        }

        try {
            const method = apiEndpoint.includes('/list') ? 'GET' : 'POST';
            const response = await fetch(apiEndpoint, {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: method === 'POST' ? JSON.stringify({ test: true }) : null
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            if (apiEndpoint.includes('/list')) {
                const facesList = data.faces?.map(face => `• ${face}`).join('\n') || 'No faces registered';
                alert(`Registered Faces:\n\n${facesList}`);
            } else {
                setSuccess(`Operation successful: ${JSON.stringify(data)}`);
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            console.error('API Error:', err);
            setError(`Failed to connect: ${err.message}`);
        }
    };

    // Glow effect colors
    const getGlowColor = (color) => {
        const colors = {
            cyan: 'shadow-[0_0_25px_rgba(6,182,212,0.4)]',
            purple: 'shadow-[0_0_25px_rgba(147,51,234,0.4)]',
            emerald: 'shadow-[0_0_25px_rgba(16,185,129,0.4)]',
            amber: 'shadow-[0_0_25px_rgba(217,119,6,0.4)]',
            red: 'shadow-[0_0_25px_rgba(185,28,28,0.4)]',
            blue: 'shadow-[0_0_25px_rgba(37,99,235,0.4)]',
            indigo: 'shadow-[0_0_25px_rgba(79,70,229,0.4)]'
        };
        return colors[color] || colors.cyan;
    };

    // Text color based on glow
    const getTextColor = (glow) => {
        const colors = {
            cyan: 'text-cyan-300 group-hover:text-cyan-200',
            purple: 'text-purple-300 group-hover:text-purple-200',
            emerald: 'text-emerald-300 group-hover:text-emerald-200',
            amber: 'text-amber-300 group-hover:text-amber-200',
            red: 'text-red-300 group-hover:text-red-200',
            blue: 'text-blue-300 group-hover:text-blue-200',
            indigo: 'text-indigo-300 group-hover:text-indigo-200'
        };
        return colors[glow] || colors.cyan;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center p-8 relative overflow-hidden">
            {/* Error message display */}
            {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg z-50 flex items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-4">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Success message display */}
            {success && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg z-50 flex items-center">
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} className="ml-4">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Enhanced Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
                    <div className="relative max-w-4xl w-full">
                        <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border-2 border-cyan-500/30">
                            {!stream && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-pulse flex flex-col items-center">
                                        <svg className="w-12 h-12 text-cyan-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="mt-2 text-cyan-300">Initializing camera...</span>
                                    </div>
                                </div>
                            )}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover transition-opacity duration-300 ${stream ? 'opacity-100' : 'opacity-0'}`}
                                onCanPlay={() => setError(null)}
                                onError={() => {
                                    setError("Failed to access camera. Please check permissions and try again.");
                                    stopCamera();
                                }}
                            />
                        </div>
                        <canvas ref={canvasRef} className="hidden" />

                        <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center items-center">
                            <button
                                onClick={captureImage}
                                disabled={isLoading || !stream}
                                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    <>
                                        <Camera className="w-5 h-5" />
                                        <span className="font-medium">Capture Face</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={stopCamera}
                                disabled={isLoading}
                                className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                <X className="w-5 h-5" />
                                <span className="font-medium">Cancel</span>
                            </button>
                        </div>

                        <div className="mt-6 text-center text-gray-300 text-sm max-w-md">
                            <p className="mb-2">For best results:</p>
                            <ul className="space-y-1">
                                <li className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Ensure good lighting
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Face the camera directly
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Remove hats or sunglasses
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_2px,transparent_2px),linear-gradient(90deg,rgba(6,182,212,0.02)_2px,transparent_2px)] bg-[size:20px_20px]" />
            </div>

            {/* Back button */}
            <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => onNavigate('BiometricDesktopUI')}
                className="group relative flex items-center gap-3 px-6 py-3 bg-transparent overflow-hidden mb-5"
            >
                <div className="absolute inset-0 bg-cyan-950/50 border border-cyan-500/20 rounded-lg transform transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 rounded-lg">
                    <div className="absolute inset-0 border border-cyan-500/50 rounded-lg transform transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400" />
                    <div className="absolute inset-0 border border-cyan-400/20 rounded-lg blur-sm transform transition-all duration-300 group-hover:scale-110 group-hover:border-cyan-300/40" />
                </div>
                <div className="absolute inset-0 bg-cyan-500/5 rounded-lg blur-xl transform transition-all duration-300 group-hover:bg-cyan-400/20 group-hover:scale-110" />
                <div className="relative flex items-center gap-3">
                    <Pause className="w-5 h-5 text-cyan-400 transform transition-all duration-300 group-hover:text-cyan-300 group-hover:scale-110" />
                    <span className="text-lg font-bold font-mono tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-300">
                        Back
                    </span>
                    <Sparkles className="w-4 h-4 text-cyan-400/70 transform transition-all duration-300 group-hover:text-cyan-300 group-hover:rotate-180" />
                </div>
            </button>

            {/* Header section */}
            <div
                className="text-center mb-16 relative z-10 p-8"
                onMouseEnter={() => setIsHeaderHovered(true)}
                onMouseLeave={() => setIsHeaderHovered(false)}
            >
                <div className={`
                    absolute inset-0 bg-gradient-to-r from-cyan-900/0 via-cyan-900/10 to-cyan-900/0
                    transition-all duration-700 transform
                    ${isHeaderHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-0'}
                `} />
                <div className={`
                    absolute inset-0 border border-cyan-500/20
                    transition-all duration-700
                    ${isHeaderHovered ? 'scale-105 border-cyan-400/40 rounded-2xl' : 'scale-100 rounded-xl'}
                `} />
                <div className="relative inline-block group">
                    <Sparkles
                        className={`
                            absolute -left-12 -top-8 w-8 h-8 text-cyan-400/50
                            transition-all duration-500 transform
                            ${isHeaderHovered ? 'scale-125 rotate-180 text-cyan-300' : 'scale-100 rotate-0'}
                        `}
                    />
                    <Sparkles
                        className={`
                            absolute -right-12 -bottom-8 w-8 h-8 text-cyan-400/50
                            transition-all duration-500 transform
                            ${isHeaderHovered ? 'scale-125 rotate-180 text-cyan-300' : 'scale-100 rotate-0'}
                        `}
                    />
                    <h1 className={`
                        text-6xl font-black bg-clip-text text-transparent
                        bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-400
                        mb-6 font-mono tracking-widest relative
                        transition-all duration-500
                        ${isHeaderHovered ? 'tracking-[0.2em] scale-105' : ''}
                    `}>
                        FACIAL CONTROL
                        <div className={`
                            absolute bottom-0 left-0 w-full h-1
                            bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-500
                            transform origin-left transition-transform duration-500
                            ${isHeaderHovered ? 'scale-x-100' : 'scale-x-0'}
                        `} />
                    </h1>
                    <div className={`
                        absolute -inset-4 bg-cyan-500/20 blur-2xl -z-10
                        transition-all duration-700
                        ${isHeaderHovered ? 'opacity-100 scale-110' : 'opacity-40 scale-100'}
                    `} />
                </div>

                <div className="relative">
                    <p className={`
                        text-lg font-mono tracking-wider font-semibold
                        transition-all duration-500 transform
                        ${isHeaderHovered ? 'text-cyan-300 scale-105' : 'text-cyan-500'}
                    `}>
                        Advanced Facial Features
                    </p>
                    <p className={`
                        text-base font-mono tracking-wider mt-2
                        transition-all duration-500
                        ${isHeaderHovered ? 'text-cyan-400' : 'text-cyan-600'}
                    `}>
                        for seamless facial interaction control
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={`
                                    h-0.5 w-12 bg-cyan-500/30
                                    transition-all duration-500 transform
                                    ${isHeaderHovered ? 'w-16 bg-cyan-400/50' : ''}
                                `}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
                {equipmentItems.map((item, index) => (
                    <div
                        key={index}
                        className="relative transform transition-all duration-500 hover:scale-105"
                        onMouseEnter={() => setHoveredItem(index)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => handleClick(item.apiEndpoint, item.handler)}
                    >
                        <div className={`
                            w-full rounded-xl overflow-hidden
                            border border-gray-800/30
                            bg-black/90 backdrop-blur-lg
                            ${hoveredItem === index ? getGlowColor(item.glow) : ''}
                            transition-all duration-500 group
                        `}>
                            <div className={`
                                h-48 relative flex items-center justify-center
                                bg-gradient-to-br ${item.color}
                                before:absolute before:inset-0
                                before:bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.15),transparent)]
                            `}>
                                <div className={`
                                    transform transition-all duration-500
                                    ${hoveredItem === index ? 'scale-110 rotate-6' : ''}
                                    relative
                                `}>
                                    <div className={`
                                        absolute inset-0 blur-2xl opacity-40
                                        ${getTextColor(item.glow).split(' ')[0].replace('text', 'bg')}
                                    `} />
                                    <div className={`
                                        relative z-10 transition-all duration-500
                                        ${getTextColor(item.glow)}
                                    `}>
                                        {item.icon}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-black/95 relative">
                                <h3 className={`
                                    text-2xl font-bold font-mono mb-2 transition-colors duration-500
                                    ${hoveredItem === index ? getTextColor(item.glow) : 'text-gray-300'}
                                    drop-shadow-[0_0_8px_rgba(6,182,212,0.2)]
                                `}>
                                    {item.name}
                                </h3>
                                <p className="text-gray-400 text-base font-mono mb-4 font-medium tracking-wide">
                                    {item.description}
                                </p>
                                <div className="flex gap-2">
                                    {item.indicators.map((color, iconIndex) => (
                                        <div
                                            key={iconIndex}
                                            className={`
                                                w-6 h-6 rounded-full flex items-center justify-center bg-black/80
                                                border border-gray-800/50
                                                transition-all duration-500
                                                ${hoveredItem === index ? 'scale-110 border-gray-700' : ''}
                                            `}
                                        >
                                            <div className={`
                                                w-2 h-2 rounded-full transition-transform duration-500
                                                ${hoveredItem === index ? 'scale-125' : ''}
                                                ${color === 'red' ? 'bg-red-500' : ''}
                                                ${color === 'green' ? 'bg-green-500' : ''}
                                                ${color === 'yellow' ? 'bg-yellow-500' : ''}
                                                ${color === 'purple' ? 'bg-purple-500' : ''}
                                                ${color === 'blue' ? 'bg-cyan-500' : ''}
                                                ${color === 'cyan' ? 'bg-cyan-500' : ''}
                                                ${color === 'indigo' ? 'bg-indigo-500' : ''}
                                            `} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FacialFeatures;