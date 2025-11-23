import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Trophy, 
  Star, 
  Target, 
  Award, 
  TrendingUp,
  Calendar,
  LogOut
} from 'lucide-react';

export function ProgressScreen({ userProfile, modules, badges = [], onNavigate, onLogout }) {
  // Calculate stats
  const totalPoints = userProfile.points || 0;
  const currentLevel = userProfile.level || 1;
  
  // Calculate completion stats
  const totalModules = modules.length;
  const completedModules = modules.filter(m => m.progress >= 100).length;
  const overallProgress = totalModules > 0 
    ? Math.round((modules.reduce((acc, m) => acc + (m.progress || 0), 0) / totalModules)) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-purple-100 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate('home')}
              className="text-gray-600 hover:text-purple-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            
            <div>
              <h1 className="text-xl text-gray-800">Meu Progresso</h1>
              <p className="text-gray-600">Veja o quanto você já aprendeu!</p>
            </div>
          </div>
          
          {onLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-gray-600 hover:text-red-600"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3 text-yellow-600">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-yellow-700">{currentLevel}</h3>
              <p className="text-yellow-800">Nível Atual</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 text-purple-600">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-purple-700">{totalPoints}</h3>
              <p className="text-purple-800">Pontos Totais</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-green-700">{overallProgress}%</h3>
              <p className="text-green-800">Progresso Geral</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badges Section */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Award className="w-5 h-5 text-purple-500" />
                Minhas Conquistas
              </CardTitle>
              <CardDescription>Medalhas que você ganhou</CardDescription>
            </CardHeader>
            <CardContent>
              {badges.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {badges.map((badge, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                      <div className="text-3xl mb-2">{badge.icon || '🏅'}</div>
                      <span className="text-xs font-medium text-gray-600">{badge.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Continue fazendo atividades para ganhar medalhas!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Module Progress Section */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Progresso por Módulo
              </CardTitle>
              <CardDescription>Como você está indo em cada fase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.map((module) => (
                <div key={module.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">{module.title}</span>
                    <span className="text-gray-500">{module.progress || 0}%</span>
                  </div>
                  <Progress value={module.progress || 0} className="h-2" />
                </div>
              ))}
              {modules.length === 0 && (
                <p className="text-center text-gray-500 py-4">Nenhum módulo iniciado ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Placeholder since we don't fetch this yet */}
        <Card className="mt-6 border-2 border-gray-200">
           <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Calendar className="w-5 h-5 text-orange-500" />
                Próximos Passos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-orange-800">Continue de onde parou</h4>
                  <p className="text-sm text-orange-700">Você está indo muito bem! Que tal fazer mais uma atividade?</p>
                </div>
                <Button 
                  onClick={() => onNavigate('activity')}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
