import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Volume2, 
  Star, 
  CheckCircle, 
  RotateCcw,
  Heart,
  Home,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { DinoMemoryGame } from '../games/DinoMemoryGame';

export function ActivityScreen({ 
  userProfile, 
  onNavigate, 
  updateUserProfile, 
  activity, 
  existingProgress = null,
  allActivities = [],
  currentActivityIndex = -1,
  onLogout
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const activityIdRef = React.useRef(activity?.id);
  const startTimeRef = useRef(null);
  const studyTimeIntervalRef = useRef(null);
  const activityConfig = activity?.config ? (typeof activity.config === 'string' ? JSON.parse(activity.config) : activity.config) : {};
  const activityItems = activity?.items || [];
  useEffect(() => {
    if (activity?.id && activityIdRef.current !== activity.id) {
      activityIdRef.current = activity.id;
      if (existingProgress?.completed) {
        setIsCompleted(true);
        setShowResults(true);
        setScore(existingProgress.score || existingProgress.best_score || 0);
        setProgress(100);
        setEarnedBadges([]);
        if (existingProgress.selected_items && Array.isArray(existingProgress.selected_items)) {
          setSelectedItems(existingProgress.selected_items);
        }
      } else {
        setIsCompleted(false);
        setSelectedItems([]);
        setShowResults(false);
        setScore(0);
        setProgress(0);
        setEarnedBadges([]);
      }
    } else if (existingProgress?.completed && activity?.id === activityIdRef.current) {
      // Update if existingProgress changes
      setIsCompleted(true);
      setShowResults(true);
      setScore(existingProgress.score || existingProgress.best_score || 0);
      if (existingProgress.selected_items && Array.isArray(existingProgress.selected_items)) {
        setSelectedItems(existingProgress.selected_items);
      }
    }
  }, [activity?.id, existingProgress]);

  useEffect(() => {
    if (activity?.id && userProfile?.id) {
      startTimeRef.current = Date.now();
      return () => {
        if (studyTimeIntervalRef.current) {
          clearInterval(studyTimeIntervalRef.current);
        }
      };
    }
  }, [activity?.id, userProfile?.id]);
  const correctAnswers = activityItems
    .filter(item => {
      const content = item.content ? (typeof item.content === 'string' ? JSON.parse(item.content) : item.content) : {};
      return content.correct === true || content.starts_with_a === true || content.is_correct === true;
    })
    .map(item => item.id);

  const handleItemClick = (itemId) => {
    if (showResults || isCompleted) return;
    
    setSelectedItems(prev => {
      const newSelected = prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      const correctSelectedCount = newSelected.filter(id => correctAnswers.includes(id)).length;
      const totalCorrectItems = correctAnswers.length;
      const progressPercentage = totalCorrectItems > 0 
        ? Math.round((correctSelectedCount / totalCorrectItems) * 100)
        : 0;
      setProgress(progressPercentage);
      
      return newSelected;
    });
  };

  const checkAnswers = async () => {
    const correctSelections = selectedItems.filter(id => correctAnswers.includes(id));
    const incorrectSelections = selectedItems.filter(id => !correctAnswers.includes(id));
    
    const newScore = Math.max(0, (correctSelections.length * 10) - (incorrectSelections.length * 5));
    const maxScore = activityItems.length * 10;
    const completed = newScore >= (maxScore * 0.5) || selectedItems.length > 0;
    
    setScore(newScore);
    setShowResults(true);
    setProgress(100);
    let studyDuration = 0;
    if (startTimeRef.current && userProfile?.id) {
      studyDuration = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000 / 60));
    }
    if (updateUserProfile) {
      try {
        await updateUserProfile({ 
          points: newScore,
          completed: completed,
          maxScore: maxScore,
          selectedItems: selectedItems,
          studyDuration: studyDuration,
          onBadgesAwarded: (badges) => {
            // Update state with earned badges
            setEarnedBadges(badges);
          }
        });
        setIsCompleted(completed);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const resetGame = () => {
    setSelectedItems([]);
    setShowResults(false);
    setScore(0);
    setProgress(0);
    setEarnedBadges([]);
    setIsCompleted(false);
    if (startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  };

  const playSound = (text) => {
    // Use Web Speech API if available, otherwise fallback to config audio
    const textToSpeak = text || activityConfig.letter || activityConfig.audio_text;
    
    if ('speechSynthesis' in window && textToSpeak) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pt-BR'; // Set language to Portuguese
      utterance.rate = 0.8; // Slightly slower for learning
      window.speechSynthesis.speak(utterance);
    } else if (activityConfig.audio_url) {
      const audio = new Audio(activityConfig.audio_url);
      audio.play().catch(e => console.error("Audio play failed", e));
    }
  };

  if (activityConfig.gameType === 'memory_match') {
    return (
      <DinoMemoryGame
        userProfile={userProfile}
        onNavigate={onNavigate}
        updateUserProfile={updateUserProfile}
        activity={activity}
        activityConfig={activityConfig}
        existingProgress={existingProgress}
        allActivities={allActivities}
        currentActivityIndex={currentActivityIndex}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="h-screen overflow-auto bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 p-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className="text-gray-600 hover:text-purple-600 px-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-gray-800">{activity?.title || 'Atividade'}</h1>
                {isCompleted && (
                  <Badge className="bg-green-500 text-white text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completada
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600">{activity?.description || ''}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold">{userProfile.points || 0}</span>
              </div>
              <span className="text-xs text-gray-500">Lvl {userProfile.level || 1}</span>
            </div>
            
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-gray-600 hover:text-red-600 px-2"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 py-2 flex flex-col gap-2">
        {/* Progress Bar */}
        <Card className="mb-2 border border-purple-200">
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Progresso da Atividade</span>
              <span className="text-sm font-semibold text-purple-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-gray-200" />
          </CardContent>
        </Card>

        {/* Activity Display */}
        {(activityConfig.letter || activityConfig.instruction) && (
          <Card className="mb-2 border border-blue-200 bg-blue-50">
            <CardContent className="p-3 text-center">
              {activityConfig.letter && (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-5xl text-blue-600 mb-1">{activityConfig.letter}</div>
                    <Button
                      onClick={() => playSound(activityConfig.letter)}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5"
                    >
                      <Volume2 className="w-3 h-3 mr-1" />
                      Ouvir o som da letra
                    </Button>
                  </div>
                </>
              )}
              <p className="text-sm font-semibold text-gray-600">{activityConfig.instruction || 'Selecione os itens corretos'}</p>
            </CardContent>
          </Card>
        )}

        {/* Game Items */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {activityItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">Nenhum item encontrado nesta atividade</p>
            </div>
          ) : (
            activityItems.map((item) => {
              const content = item.content ? (typeof item.content === 'string' ? JSON.parse(item.content) : item.content) : {};
              const isSelected = selectedItems.includes(item.id);
              const isCorrect = content.correct === true || content.starts_with_a === true || content.is_correct === true;
              const showFeedback = showResults;
            
            let cardStyle = "border-2 cursor-pointer transition-all hover:scale-105 ";
            
            if (showFeedback) {
              if (isSelected && isCorrect) {
                cardStyle += "border-green-400 bg-green-50 shadow-lg";
              } else if (isSelected && !isCorrect) {
                cardStyle += "border-red-400 bg-red-50 shadow-lg";
              } else if (!isSelected && isCorrect) {
                cardStyle += "border-orange-400 bg-orange-50";
              } else {
                cardStyle += "border-gray-200";
              }
            } else {
              cardStyle += isSelected 
                ? "border-purple-400 bg-purple-50 shadow-lg" 
                : "border-gray-200 hover:border-purple-300";
            }

            return (
              <Card 
                key={item.id} 
                className={cardStyle}
                onClick={() => handleItemClick(item.id)}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-4xl mb-1">{content.image || content.emoji || '📝'}</div>
                  <h3 className="text-sm text-gray-800 mb-1">{content.name || content.text || 'Item'}</h3>
                  
                  {showFeedback && (
                    <div className="flex justify-center">
                      {isSelected && isCorrect && (
                        <Badge className="bg-green-500 text-white text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Correto!
                        </Badge>
                      )}
                      {isSelected && !isCorrect && (
                        <Badge className="bg-red-500 text-white text-xs">
                          ❌ Ops!
                        </Badge>
                      )}
                      {!isSelected && isCorrect && (
                        <Badge className="bg-orange-500 text-white text-xs">
                          💡 Era esta!
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {isSelected && !showFeedback && (
                    <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
            })
          )}
        </div>

        {/* Navigation between activities */}
        {allActivities.length > 1 && currentActivityIndex >= 0 && !showResults && (
          <div className="flex justify-between items-center mb-2">
            <Button
              variant="outline"
              onClick={() => onNavigate('previous')}
              disabled={currentActivityIndex <= 0}
              size="sm"
              className="flex items-center gap-1 text-xs py-1 px-2"
            >
              <ChevronLeft className="w-3 h-3" />
              Anterior
            </Button>
            
            <div className="text-sm text-gray-600">
              Atividade {currentActivityIndex + 1} de {allActivities.length}
            </div>
            
            <Button
              variant="outline"
              onClick={() => onNavigate('next')}
              disabled={currentActivityIndex >= allActivities.length - 1}
              size="sm"
              className="flex items-center gap-1 text-xs py-1 px-2"
            >
              Próxima
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        {/* Navigation when results are shown */}
        {allActivities.length > 1 && currentActivityIndex >= 0 && showResults && (
          <div className="flex justify-between items-center mb-2">
            <Button
              variant="outline"
              onClick={() => onNavigate('previous')}
              disabled={currentActivityIndex <= 0}
              size="sm"
              className="flex items-center gap-1 text-xs py-1 px-2"
            >
              <ChevronLeft className="w-3 h-3" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-2">
              {isCompleted && (
                <Button
                  onClick={resetGame}
                  variant="outline"
                  size="sm"
                  className="border-purple-500 text-purple-600 hover:bg-purple-50 text-xs py-1 px-2 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Tentar Novamente
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => onNavigate('next')}
                disabled={currentActivityIndex >= allActivities.length - 1}
                size="sm"
                className="flex items-center gap-1 text-xs py-1 px-2"
              >
                Próxima
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-2">
          {!showResults ? (
            <Button
              onClick={checkAnswers}
              disabled={selectedItems.length === 0 || isCompleted}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-xs px-4 py-1.5"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Verificar Respostas
            </Button>
          ) : (
            <div className="text-center">
              {allActivities.length > 1 && currentActivityIndex >= 0 && (
                <div className="mb-2">
                  <div className="text-sm text-gray-600">
                    Atividade {currentActivityIndex + 1} de {allActivities.length}
                  </div>
                </div>
              )}
              
              <Card className="border border-green-200 bg-green-50 mb-2">
                <CardContent className="p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className="w-4 h-4 text-green-600" />
                    <span className="text-md font-semibold text-green-800">Parabéns!</span>
                  </div>
                  <p className="text-sm text-green-700 mb-1">Você ganhou {score} pontos!</p>
                  {earnedBadges.length > 0 && earnedBadges.map((badge, index) => (
                    <Badge key={index} className="bg-yellow-500 text-white text-sm mb-1">
                      {badge.icon || '🏆'} {badge.name}!
                    </Badge>
                  ))}
                </CardContent>
              </Card>
              
              {currentActivityIndex >= 0 && currentActivityIndex >= allActivities.length - 1 && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => onNavigate('home')}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    Voltar ao Início
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
