import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Play, 
  BookOpen, 
  Headphones, 
  Users, 
  Trophy, 
  Star,
  Heart,
  User,
  LogOut
} from 'lucide-react';

// Icon mapping for modules
const iconMap = {
  'BookOpen': BookOpen,
  'Headphones': Headphones,
  'Heart': Heart,
  'Users': Users,
  'Trophy': Trophy,
  'Star': Star
};

export function HomeScreen({ userProfile, onNavigate, modules = [], loading = false, todayProgress = { activitiesCompleted: 0, studyTimeMinutes: 0 }, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-purple-100 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-gray-800">Olá, {userProfile.name}! 👋</h1>
              <p className="text-gray-600">Que bom te ver aqui hoje!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-semibold">{userProfile.points || 0}</span>
              </div>
              <span className="text-xs text-gray-500">Level {userProfile.level || 1}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('progress')}
              className="text-gray-600 hover:text-purple-600"
              title="Ver Progresso"
            >
              <User className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-gray-600 hover:text-red-600"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Progress Overview */}
        <Card className="mb-4 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-700 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Seu Progresso Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-xl text-blue-600 mb-1">{todayProgress.activitiesCompleted || 0}</div>
                <p className="text-sm text-gray-600">Atividades Concluídas</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-xl text-green-600 mb-1">{todayProgress.studyTimeMinutes || 0} min</div>
                <p className="text-sm text-gray-600">Tempo de Estudo</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <div className="text-center">
                  <div className="text-xl text-purple-600 mb-1 font-bold">Level {userProfile.level || 1}</div>
                  {/* <p className="text-sm text-gray-600 mb-2">Seu Nível</p> */}
                </div>
                {(() => {
                  const currentPoints = userProfile.points || 0;
                  const currentLevel = userProfile.level || 1;
                  const pointsForCurrentLevel = (currentLevel - 1) * 100;
                  const pointsForNextLevel = currentLevel * 100;
                  const pointsInCurrentLevel = currentPoints - pointsForCurrentLevel;
                  const progressPercent = Math.min(100, (pointsInCurrentLevel / 100) * 100);
                  const pointsNeeded = pointsForNextLevel - currentPoints;
                  
                  return (
                    <div className="px-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{pointsInCurrentLevel}/100</span>
                        <span>{pointsNeeded > 0 ? `${pointsNeeded} pts` : 'Max!'}</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Modules */}
        <div className="mb-6">
          <h2 className="text-xl text-gray-800 mb-4">Suas Atividades</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading modules...</p>
            </div>
          ) : modules.length === 0 ? (
            <Card className="border-2 border-gray-200">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl text-gray-800 mb-2">No modules available</h3>
                <p className="text-gray-600">Modules will appear here once they are created</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const Icon = iconMap[module.icon_name] || BookOpen;
                return (
                <Card key={module.id} className="border-2 border-gray-200 hover:border-purple-300 transition-all cursor-pointer hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-800">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progresso</span>
                          <span>{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{module.activities || 0} atividades</span>
                        <Button
                          onClick={() => onNavigate('activity', module.id)}
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continuar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Users className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-green-800 mb-1">Precisa de Ajuda?</h3>
                    <p className="text-sm text-green-700 mb-3">Fale com nossos especialistas</p>
                  </div>
                </div>
                <Button
                    onClick={() => onNavigate('support')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Falar com Especialista
                  </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h3 className="text-yellow-800 mb-1">Suas Conquistas</h3>
                    <p className="text-sm text-yellow-700 mb-3">Veja seu progresso e medalhas</p>                 
                  </div>
                </div>
                <Button
                    onClick={() => onNavigate('progress')}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Ver Conquistas
                  </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
