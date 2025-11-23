'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Input } from '../../../../../../components/ui/input';
import { ArrowLeft, Plus, Trash2, BookOpen, Save, X } from 'lucide-react';
import { getLessonsByModuleId, createLesson, deleteLesson, getModuleById } from '../../../../../../actions/admin-content';
import { getModuleById as getModule } from '../../../../../../actions/activity';

export default function AdminLessonsPage({ params }) {
  const router = useRouter();
  const { id: moduleId } = params;
  const [lessons, setLessons] = useState([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [loading, setLoading] = useState(true);
  
  // New Lesson State
  const [showNewLesson, setShowNewLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', description: '', order_index: 0 });

  useEffect(() => {
    loadData();
  }, [moduleId]);

  const loadData = async () => {
    setLoading(true);
    // Load Module Info
    const modResult = await getModule(moduleId);
    if (modResult.success) {
      setModuleTitle(modResult.module.title);
    }

    // Load Lessons
    const result = await getLessonsByModuleId(moduleId);
    if (result.success) {
      setLessons(result.lessons || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newLesson.title) return alert('Título é obrigatório');
    
    const result = await createLesson({
      ...newLesson,
      module_id: moduleId
    });

    if (result.success) {
      setNewLesson({ title: '', description: '', order_index: lessons.length + 1 });
      setShowNewLesson(false);
      loadData();
    } else {
      alert('Erro ao criar lição');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Excluir esta lição?')) {
      await deleteLesson(id);
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/admin/modules')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar para Módulos
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Lições</h1>
              <p className="text-gray-500">Módulo: {moduleTitle}</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowNewLesson(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={showNewLesson}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Lição
          </Button>
        </div>

        {showNewLesson && (
          <Card className="mb-6 border-2 border-purple-200">
            <CardHeader>
              <CardTitle>Nova Lição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input 
                  placeholder="Título da Lição" 
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                />
                <Input 
                  placeholder="Descrição" 
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                />
                 <Input 
                  type="number"
                  placeholder="Ordem" 
                  value={newLesson.order_index}
                  onChange={(e) => setNewLesson({...newLesson, order_index: parseInt(e.target.value)})}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setShowNewLesson(false)}>
                    <X className="w-4 h-4 mr-2" /> Cancelar
                  </Button>
                  <Button onClick={handleCreate}>
                    <Save className="w-4 h-4 mr-2" /> Salvar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{lesson.title}</h3>
                    <p className="text-sm text-gray-500">{lesson.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   {/* Link to Activities */}
                   <Button variant="outline" size="sm" onClick={() => router.push(`/admin/modules/${moduleId}/lessons/${lesson.id}/activities`)}>
                      Gerenciar Atividades
                    </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(lesson.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {lessons.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-8">Nenhuma lição encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
