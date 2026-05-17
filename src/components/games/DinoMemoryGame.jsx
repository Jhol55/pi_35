'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Star,
  CheckCircle,
  RotateCcw,
  Heart,
  Home,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildDeck(pairs) {
  const cards = [];
  pairs.forEach((pair) => {
    cards.push({ id: `${pair.key}-a`, pairKey: pair.key, name: pair.name, image: pair.image });
    cards.push({ id: `${pair.key}-b`, pairKey: pair.key, name: pair.name, image: pair.image });
  });
  return shuffleArray(cards);
}

const MEMORY_MOVES_PREFIX = '__memory_moves:';

function parseSavedMoves(selectedItems) {
  if (!Array.isArray(selectedItems)) return null;
  const marker = selectedItems.find(
    (item) => typeof item === 'string' && item.startsWith(MEMORY_MOVES_PREFIX)
  );
  if (!marker) return null;
  const value = Number.parseInt(marker.slice(MEMORY_MOVES_PREFIX.length), 10);
  return Number.isFinite(value) ? value : null;
}

function buildSelectedItems(matchedKeys, attemptCount) {
  return [...matchedKeys, `${MEMORY_MOVES_PREFIX}${attemptCount}`];
}

export function DinoMemoryGame({
  userProfile,
  onNavigate,
  updateUserProfile,
  activity,
  activityConfig,
  existingProgress = null,
  allActivities = [],
  currentActivityIndex = -1,
  onLogout,
}) {
  const pairs = useMemo(
    () => activityConfig.pairs || [],
    [activity?.id, activity?.config]
  );
  const columns = activityConfig.columns || 4;
  const pointsPerPair = activityConfig.pointsPerPair ?? 10;
  const completionBonus = activityConfig.completionBonus ?? 20;
  const flipBackDelayMs = activityConfig.flipBackDelayMs ?? 1800;
  const totalPairs = pairs.length;

  const [cards, setCards] = useState([]);
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedKeys, setMatchedKeys] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [moves, setMoves] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const startTimeRef = useRef(null);
  const flipBackTimerRef = useRef(null);
  const hydratedActivityIdRef = useRef(null);

  const pairsFound = matchedKeys.length;
  const progress = totalPairs > 0 ? Math.round((pairsFound / totalPairs) * 100) : 0;

  const initGame = useCallback(() => {
    setCards(buildDeck(pairs));
    setFlippedIds([]);
    setMatchedKeys([]);
    setIsChecking(false);
    setMoves(0);
    setFeedback('');
    setShowResults(false);
    setScore(0);
    setIsCompleted(false);
    setEarnedBadges([]);
    startTimeRef.current = Date.now();
    hydratedActivityIdRef.current = activity?.id ?? null;
  }, [pairs, activity?.id]);

  useEffect(() => {
    if (!activity?.id || pairs.length === 0) return;

    if (hydratedActivityIdRef.current === activity.id) return;
    hydratedActivityIdRef.current = activity.id;

    if (existingProgress?.completed) {
      const savedMoves = parseSavedMoves(existingProgress.selected_items);
      setCards(buildDeck(pairs));
      setFlippedIds([]);
      setMatchedKeys(pairs.map((p) => p.key));
      setIsChecking(false);
      setMoves(savedMoves ?? 0);
      setFeedback('');
      setShowResults(true);
      setScore(existingProgress.score || existingProgress.best_score || 0);
      setIsCompleted(true);
      setEarnedBadges([]);
      return;
    }

    initGame();
  }, [activity?.id, pairs, existingProgress?.completed, existingProgress?.selected_items, existingProgress?.score, existingProgress?.best_score, initGame]);

  useEffect(() => {
    return () => {
      if (flipBackTimerRef.current) {
        clearTimeout(flipBackTimerRef.current);
      }
    };
  }, []);

  const finishGame = async (finalPairsFound, currentMatchedKeys, attemptCount) => {
    const newScore = finalPairsFound * pointsPerPair + completionBonus;
    const maxScore = totalPairs * pointsPerPair + completionBonus;

    setScore(newScore);
    setMoves(attemptCount);
    setShowResults(true);
    setIsCompleted(true);
    setFeedback('Parabéns! Você encontrou todos os pares!');

    let studyDuration = 0;
    if (startTimeRef.current && userProfile?.id) {
      studyDuration = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000 / 60));
    }

    if (updateUserProfile) {
      try {
        await updateUserProfile({
          points: newScore,
          completed: true,
          maxScore,
          selectedItems: buildSelectedItems(currentMatchedKeys, attemptCount),
          studyDuration,
          onBadgesAwarded: (badges) => setEarnedBadges(badges),
        });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const handleCardClick = (cardId) => {
    if (showResults || isCompleted || isChecking) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || matchedKeys.includes(card.pairKey) || flippedIds.includes(cardId)) {
      return;
    }

    if (flippedIds.length >= 2) return;

    const nextFlipped = [...flippedIds, cardId];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length < 2) return;

    setIsChecking(true);
    const attemptCount = moves + 1;
    setMoves(attemptCount);

    const [firstId, secondId] = nextFlipped;
    const first = cards.find((c) => c.id === firstId);
    const second = cards.find((c) => c.id === secondId);

    if (first?.pairKey === second?.pairKey) {
      const nextMatched = [...matchedKeys, first.pairKey];
      setMatchedKeys(nextMatched);
      setFlippedIds([]);
      setIsChecking(false);
      setFeedback('Muito bem! É um par!');

      if (nextMatched.length === totalPairs) {
        finishGame(nextMatched.length, nextMatched, attemptCount);
      }
    } else {
      setFeedback('Não é o mesmo. Tente de novo.');
      if (flipBackTimerRef.current) {
        clearTimeout(flipBackTimerRef.current);
      }
      flipBackTimerRef.current = setTimeout(() => {
        setFlippedIds([]);
        setIsChecking(false);
        setFeedback('');
        flipBackTimerRef.current = null;
      }, flipBackDelayMs);
    }
  };

  const isCardOpen = (card) =>
    flippedIds.includes(card.id) || matchedKeys.includes(card.pairKey);

  const gridClass = useMemo(() => {
    const colMap = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };
    return colMap[columns] || 'grid-cols-4';
  }, [columns]);

  if (pairs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-gray-600">Configuração do jogo incompleta.</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-auto bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-white border-b border-amber-100 p-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('home')} className="text-gray-600 hover:text-amber-600 px-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-gray-800">{activity?.title || 'Jogo da Memória'}</h1>
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
                <span className="text-sm font-semibold">{userProfile?.points || 0}</span>
              </div>
              <span className="text-xs text-gray-500">Lvl {userProfile?.level || 1}</span>
            </div>
            {onLogout && (
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-600 hover:text-red-600 px-2" title="Sair">
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 py-2 flex flex-col gap-2">
        <Card className="border border-amber-200">
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Progresso da Atividade</span>
              <span className="text-sm font-semibold text-amber-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-gray-200" />
          </CardContent>
        </Card>
        <Card className="border border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-center">
            <p className="text-sm font-semibold text-gray-800">
              {activityConfig.instruction || 'Vire duas cartas e ache os pares iguais'}
            </p>
            {activityConfig.subtitle && (
              <p className="text-xs text-gray-600 mt-1">{activityConfig.subtitle}</p>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-gray-700">
          <span>Pares encontrados: {pairsFound} de {totalPairs}</span>
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>Tentativas: {moves}</span>
            {feedback && !showResults && (
              <span
                role="status"
                className={`font-medium ${
                  feedback.startsWith('Muito bem')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                · {feedback}
              </span>
            )}
          </span>
        </div>
        <div className={`grid ${gridClass} gap-2 mb-2`}>
          {cards.map((card) => {
            const open = isCardOpen(card);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                disabled={showResults || isCompleted || isChecking}
                aria-label={open ? `Carta virada: ${card.name}` : 'Carta fechada'}
                className={`relative aspect-square rounded-xl border-2 overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 flex items-center justify-center ${
                  open
                    ? 'border-green-400 bg-white shadow-md p-0.5'
                    : 'border-amber-300 bg-gradient-to-br from-amber-400 to-orange-400 hover:scale-[1.02]'
                }`}
              >
                {open ? (
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    sizes="(max-width: 640px) 22vw, 140px"
                    className="object-contain"
                  />
                ) : (
                  <span className="text-3xl text-white/90">?</span>
                )}
              </button>
            );
          })}
        </div>
        {allActivities.length > 1 && currentActivityIndex >= 0 && (
          <div className="flex justify-between items-center mb-2">
            <Button variant="outline" onClick={() => onNavigate('previous')} disabled={currentActivityIndex <= 0} size="sm" className="text-xs py-1 px-2">
              <ChevronLeft className="w-3 h-3" /> Anterior
            </Button>
            <span className="text-sm text-gray-600">Atividade {currentActivityIndex + 1} de {allActivities.length}</span>
            <Button variant="outline" onClick={() => onNavigate('next')} disabled={currentActivityIndex >= allActivities.length - 1} size="sm" className="text-xs py-1 px-2">
              Próxima <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        )}
        {showResults && (
          <div className="text-center w-full pb-4">
            <Card className="border border-green-200 bg-green-50 mb-2">
              <CardContent className="p-2">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Heart className="w-4 h-4 text-green-600" />
                  <span className="text-md font-semibold text-green-800">Parabéns! Você encontrou todos os pares!</span>
                </div>
                <p className="text-sm text-green-700 mb-1">Você ganhou {score} pontos!</p>
                {earnedBadges.map((badge, index) => (
                  <Badge key={index} className="bg-yellow-500 text-white text-sm mb-1">{badge.icon || '🏆'} {badge.name}!</Badge>
                ))}
              </CardContent>
            </Card>
            <div className="flex justify-center gap-2 flex-wrap">
              <Button onClick={initGame} variant="outline" size="sm" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                <RotateCcw className="w-3 h-3 mr-1" /> Jogar de novo
              </Button>
              <Button onClick={() => onNavigate('home')} size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Home className="w-4 h-4 mr-1" /> Voltar ao Início
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}