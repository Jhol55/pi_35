'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../../components/ui/card';
import { Input } from '../../../../../../../../components/ui/input';
import { Textarea } from '../../../../../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../../../components/ui/select';
import { ArrowLeft, Plus, Trash2, Gamepad2, Save, X } from 'lucide-react';
import { getActivitiesByLessonId, createActivity } from '../../../../../../../../actions/admin-content';

export default function AdminActivitiesPage({ params }) {
  const router = useRouter();
  const { id: moduleId, lessonId } = params;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNew, setShowNew] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    activity_type: 'game',
    config: '{"letter": "A", "instruction": "Select images starting with A"}',
    points_reward: 10,
    order_index: 0
  });

  useEffect(() => {
    loadData();
  }, [lessonId]);

  const loadData = async () => {
    setLoading(true);
    const result = await getActivitiesByLessonId(lessonId);
    if (result.success) {
      setActivities(result.activities || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newActivity.title) return alert('Título é obrigatório');
    
    let parsedConfig = {};
    try {
      parsedConfig = JSON.parse(newActivity.config);
    } catch (e) {
      return alert('Config JSON inválido');
    }

    const result = await createActivity({
      ...newActivity,
      lesson_id: lessonId,
      config: parsedConfig,
      active: true
    });

    if (result.success) {
      setShowNew(false);
      loadData();
    } else {
      alert('Erro ao criar atividade: ' + result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(`/admin/modules/${moduleId}/lessons`)}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar para Lições
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Atividades</h1>
          </div>
          <Button 
            onClick={() => setShowNew(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={showNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Atividade
          </Button>
        </div>

        {showNew && (
          <Card className="mb-6 border-2 border-purple-200">
            <CardHeader>
              <CardTitle>Nova Atividade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input 
                  placeholder="Título" 
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                />
                <Input 
                  placeholder="Descrição" 
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Tipo</label>
                    <Select 
                      value={newActivity.activity_type} 
                      onValueChange={(val) => setNewActivity({...newActivity, activity_type: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="game">Jogo</SelectItem>
                        <SelectItem value="quiz">Questionário</SelectItem>
                        <SelectItem value="exercise">Exercício</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Pontos</label>
                    <Input 
                      type="number"
                      value={newActivity.points_reward}
                      onChange={(e) => setNewActivity({...newActivity, points_reward: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">Config (JSON)</label>
                  <Textarea 
                    value={newActivity.config}
                    onChange={(e) => setNewActivity({...newActivity, config: e.target.value})}
                    className="font-mono text-sm"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: {"{\"letter\": \"A\", \"instruction\": \"Click A\"}"}</p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
                  <Button onClick={handleCreate}>Salvar Atividade</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Gamepad2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{activity.title}</h3>
                    <p className="text-sm text-gray-500">{activity.activity_type} - {activity.points_reward} pts</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push(`/admin/modules/${moduleId}/lessons/${lessonId}/activities/${activity.id}/items`)}
                >
                  Gerenciar Itens
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
