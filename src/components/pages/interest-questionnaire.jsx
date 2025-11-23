import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Star, Music, Palette, Book, Gamepad2, Camera, Puzzle, Heart } from 'lucide-react';

const interests = [
  { id: 'animals', name: 'Animais', icon: Heart, color: 'bg-pink-100 text-pink-600' },
  { id: 'music', name: 'Música', icon: Music, color: 'bg-blue-100 text-blue-600' },
  { id: 'art', name: 'Arte e Desenho', icon: Palette, color: 'bg-purple-100 text-purple-600' },
  { id: 'stories', name: 'Histórias', icon: Book, color: 'bg-green-100 text-green-600' },
  { id: 'games', name: 'Jogos', icon: Gamepad2, color: 'bg-orange-100 text-orange-600' },
  { id: 'photos', name: 'Fotos', icon: Camera, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'puzzles', name: 'Quebra-cabeças', icon: Puzzle, color: 'bg-red-100 text-red-600' },
  { id: 'stars', name: 'Estrelas e Espaço', icon: Star, color: 'bg-indigo-100 text-indigo-600' }
];

export function InterestQuestionnaire({ onComplete, setUserProfile }) {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [learningStyle, setLearningStyle] = useState(null);
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const selectLearningStyle = (style) => {
    setLearningStyle(style);
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save both interests and learning style
      setUserProfile({ 
        interests: selectedInterests,
        learning_style: learningStyle
      });
      onComplete('home');
    }
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl text-gray-800">Vamos te conhecer melhor!</h1>
            <span className="text-sm text-gray-600">Passo {step} de {totalSteps}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <Card className="border-2 border-purple-200 shadow-lg">
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-purple-700">Do que você mais gosta?</CardTitle>
                <CardDescription className="text-gray-600">
                  Escolha suas coisas favoritas para personalizarmos suas atividades
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {interests.map((interest) => {
                    const Icon = interest.icon;
                    const isSelected = selectedInterests.includes(interest.id);
                    
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`
                          p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105
                          ${isSelected 
                            ? 'border-purple-400 bg-purple-50 shadow-md' 
                            : 'border-gray-200 hover:border-purple-300'
                          }
                        `}
                      >
                        <div className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${interest.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-700">{interest.name}</p>
                        {isSelected && (
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-2 mx-auto">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-purple-700">Como você prefere aprender?</CardTitle>
                <CardDescription className="text-gray-600">
                  Escolha o jeito que você se sente mais confortável
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4 mb-6">
                  <button
                    onClick={() => selectLearningStyle('self-paced')}
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 hover:scale-105 text-left ${
                      learningStyle === 'self-paced'
                        ? 'border-green-400 bg-green-100 shadow-md'
                        : 'border-green-200 bg-green-50 hover:border-green-300'
                    }`}
                  >
                    <h3 className="text-green-700 mb-2 font-semibold">🐢 No meu ritmo</h3>
                    <p className="text-sm text-gray-600">Posso ir devagar e repetir quantas vezes quiser</p>
                    {learningStyle === 'self-paced' && (
                      <div className="mt-2 flex items-center justify-end">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => selectLearningStyle('game-based')}
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 hover:scale-105 text-left ${
                      learningStyle === 'game-based'
                        ? 'border-blue-400 bg-blue-100 shadow-md'
                        : 'border-blue-200 bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <h3 className="text-blue-700 mb-2 font-semibold">🎮 Com jogos e diversão</h3>
                    <p className="text-sm text-gray-600">Aprender brincando é mais gostoso</p>
                    {learningStyle === 'game-based' && (
                      <div className="mt-2 flex items-center justify-end">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => selectLearningStyle('challenge-based')}
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 hover:scale-105 text-left ${
                      learningStyle === 'challenge-based'
                        ? 'border-purple-400 bg-purple-100 shadow-md'
                        : 'border-purple-200 bg-purple-50 hover:border-purple-300'
                    }`}
                  >
                    <h3 className="text-purple-700 mb-2 font-semibold">🏆 Com desafios e recompensas</h3>
                    <p className="text-sm text-gray-600">Gosto de ganhar pontos e conquistas</p>
                    {learningStyle === 'challenge-based' && (
                      <div className="mt-2 flex items-center justify-end">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </CardContent>
            </>
          )}

          <div className="p-6 border-t">
            <div className="flex justify-between">
              {step > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  Voltar
                </Button>
              )}
              
              <Button 
                onClick={handleNext}
                disabled={
                  (step === 1 && selectedInterests.length === 0) ||
                  (step === 2 && !learningStyle)
                }
                className="ml-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                {step === totalSteps ? 'Começar a aprender!' : 'Próximo'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}