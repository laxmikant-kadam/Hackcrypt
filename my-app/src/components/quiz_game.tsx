import React, { useState, useEffect } from 'react';

const MemoryLaneQuiz = () => {
  const [quizData, setQuizData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [category, setCategory] = useState('picture');
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(null);

  // Fetch questions from Flask backend based on category and difficulty
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/questions?category=${category}&difficulty=${difficulty}`);
        const data = await response.json();
        setQuizData(data);
        setLoading(false);
        setCurrentQuestion(0);
        setShowScore(false);
        setScore(0);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [category, difficulty]);

  // Handle answer selection
  const handleAnswerClick = (isCorrect) => {
    clearTimeout(timer);

    if (isCorrect) {
      setScore(score + 1);
      setFeedback({
        type: 'success',
        message: 'Well done! That\'s correct!'
      });
    } else {
      setFeedback({
        type: 'error',
        message: `That's not quite right. The correct answer was: ${quizData[currentQuestion].correctAnswer}`
      });
    }

    // Show feedback for 2 seconds before moving to next question
    const nextQuestionTimer = setTimeout(() => {
      setFeedback(null);
      const nextQuestion = currentQuestion + 1;

      if (nextQuestion < quizData.length) {
        setCurrentQuestion(nextQuestion);
      } else {
        setShowScore(true);
        // Send score to backend
        recordScore();
      }
    }, 2000);

    setTimer(nextQuestionTimer);
  };

  // Record score in backend
  const recordScore = async () => {
    try {
      await fetch('/api/record-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score,
          category,
          difficulty,
          total: quizData.length
        }),
      });
    } catch (error) {
      console.error('Error recording score:', error);
    }
  };

  // Reset game
  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
  };

  // Change category
  const changeCategory = (newCategory) => {
    setCategory(newCategory);
  };

  // Change difficulty
  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl text-gray-500">
        Loading questions...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans text-gray-800 bg-gray-50 rounded-2xl shadow-lg">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">Memory Lane Quiz</h1>

      {/* Game Settings - Visible when showing score or first starting */}
      {(showScore || quizData.length === 0) && (
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Choose Category:</h3>
            <div className="flex flex-wrap gap-3">
              <button
                className={`px-4 py-3 rounded-lg text-lg transition-colors ${
                  category === 'picture'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => changeCategory('picture')}
              >
                Picture Recognition
              </button>
              <button
                className={`px-4 py-3 rounded-lg text-lg transition-colors ${
                  category === 'word'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => changeCategory('word')}
              >
                Word Association
              </button>
              <button
                className={`px-4 py-3 rounded-lg text-lg transition-colors ${
                  category === 'sequence'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => changeCategory('sequence')}
              >
                Sequential Memory
              </button>
              <button
                className={`px-4 py-3 rounded-lg text-lg transition-colors ${
                  category === 'reminiscence'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => changeCategory('reminiscence')}
              >
                Reminiscence
              </button>
              <button
                className={`px-4 py-3 rounded-lg text-lg transition-colors ${
                  category === 'daily'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => changeCategory('daily')}
              >
                Daily Living
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Choose Difficulty:</h3>
            <div className="flex flex-wrap gap-3">
              <button
                className={`px-6 py-3 rounded-lg text-lg transition-colors ${
                  difficulty === 'easy'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => changeDifficulty('easy')}
              >
                Easy
              </button>
              <button
                className={`px-6 py-3 rounded-lg text-lg transition-colors ${
                  difficulty === 'medium'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => changeDifficulty('medium')}
              >
                Medium
              </button>
              <button
                className={`px-6 py-3 rounded-lg text-lg transition-colors ${
                  difficulty === 'hard'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => changeDifficulty('hard')}
              >
                Challenging
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Score Section */}
      {showScore ? (
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
          <p className="text-2xl text-gray-700 mb-6">You scored {score} out of {quizData.length}</p>
          <div className="text-xl mb-8 text-green-600">
            {score === quizData.length && "Perfect score! Excellent job!"}
            {score >= quizData.length * 0.7 && score < quizData.length && "Great job! You're doing very well!"}
            {score >= quizData.length * 0.4 && score < quizData.length * 0.7 && "Good effort! Keep practicing!"}
            {score < quizData.length * 0.4 && "Nice try! Let's practice some more."}
          </div>
          <button
            className="bg-green-500 hover:bg-green-600 text-white text-xl py-4 px-8 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
            onClick={restartQuiz}
          >
            Play Again
          </button>
        </div>
      ) : (
        <>
          {quizData.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-lg text-gray-500 mb-4">
                <span>Question {currentQuestion + 1}</span>/{quizData.length}
              </div>

              <div className="text-2xl font-bold mb-6 text-gray-800">
                {quizData[currentQuestion].questionText}
              </div>

              {/* Show image if it's a picture question */}
              {quizData[currentQuestion].imageUrl && (
                <div className="flex justify-center my-6">
                  <img
                    src={quizData[currentQuestion].imageUrl}
                    alt="Quiz question"
                    className="max-h-64 rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}

              {/* Show sequence if it's a sequence memory question */}
              {quizData[currentQuestion].sequence && (
                <div className="flex justify-center gap-4 my-6">
                  {quizData[currentQuestion].sequence.map((item, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-xl text-white shadow"
                      style={{ backgroundColor: item }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {quizData[currentQuestion].answerOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerClick(option.isCorrect)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-3 rounded-xl text-xl transition-colors flex flex-col items-center min-h-24 justify-center focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  >
                    {/* Show image for answer if available */}
                    {option.imageUrl && (
                      <img
                        src={option.imageUrl}
                        alt={option.answerText || "Answer option"}
                        className="max-h-32 max-w-full rounded mb-2"
                      />
                    )}
                    {/* Show text answer if available */}
                    {option.answerText && (
                      <span>{option.answerText}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Feedback message */}
              {feedback && (
                <div
                  className={`mt-6 p-4 rounded-lg text-center text-lg ${
                    feedback.type === 'success'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {feedback.message}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemoryLaneQuiz;