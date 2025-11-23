'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDisciplines, createDiscipline } from '../../../../actions/discipline';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { GraduationCap, ArrowLeft, Plus, X } from 'lucide-react';

export default function DisciplinesPage() {
  const router = useRouter();
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newDiscipline, setNewDiscipline] = useState({
    name: '',
    code: '',
    workload: '',
    course: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDisciplines();
  }, []);

  const loadDisciplines = async () => {
    setLoading(true);
    const result = await getDisciplines();
    if (result.success) {
      setDisciplines(result.disciplines);
    }
    setLoading(false);
  };

  const handleCreateDiscipline = async (e) => {
    e.preventDefault();
    
    if (!newDiscipline.name || !newDiscipline.code) {
      alert('Nome e Código são obrigatórios');
      return;
    }

    setSaving(true);
    const result = await createDiscipline({
      name: newDiscipline.name,
      code: newDiscipline.code,
      workload: newDiscipline.workload ? parseInt(newDiscipline.workload) : null,
      total_slots: 0,
      course: newDiscipline.course || null
    });

    if (result.success) {
      setShowNewForm(false);
      setNewDiscipline({ name: '', code: '', workload: '', course: '' });
      loadDisciplines();
    } else {
      alert('Erro ao criar disciplina: ' + result.error);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="text-gray-600 hover:text-purple-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Disciplinas</h1>
              <p className="text-gray-600">Gerenciar cursos e matérias</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowNewForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Disciplina
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando disciplinas...</p>
          </div>
        ) : disciplines.length === 0 ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl text-gray-800 mb-2">Nenhuma disciplina encontrada</h3>
              <p className="text-gray-600">Crie disciplinas para começar</p>
              <Button 
                onClick={() => setShowNewForm(true)}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Disciplina
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disciplines.map((discipline) => (
              <Card key={discipline.id} className="border-2 border-gray-200 hover:border-purple-300 transition-all">
                <CardHeader>
                  <CardTitle className="text-gray-800">{discipline.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{discipline.code}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-semibold">Curso:</span> {discipline.course || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Carga Horária:</span> {discipline.workload || 'N/A'} horas
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Vagas:</span>
                      <Badge className={discipline.available_slots > 0 ? 'bg-green-500' : 'bg-red-500'}>
                        {discipline.available_slots} / {discipline.total_slots}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Nova Disciplina */}
        {showNewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Nova Disciplina</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewDiscipline({ name: '', code: '', workload: '', course: '' });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateDiscipline} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={newDiscipline.name}
                      onChange={(e) => setNewDiscipline({...newDiscipline, name: e.target.value})}
                      placeholder="ex: Matemática Básica"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="code">Código *</Label>
                    <Input
                      id="code"
                      value={newDiscipline.code}
                      onChange={(e) => setNewDiscipline({...newDiscipline, code: e.target.value.toUpperCase()})}
                      placeholder="ex: MAT101"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="course">Curso</Label>
                    <Input
                      id="course"
                      value={newDiscipline.course}
                      onChange={(e) => setNewDiscipline({...newDiscipline, course: e.target.value})}
                      placeholder="ex: Engenharia"
                    />
                  </div>

                  <div>
                    <Label htmlFor="workload">Carga Horária</Label>
                    <Input
                      id="workload"
                      type="number"
                      value={newDiscipline.workload}
                      onChange={(e) => setNewDiscipline({...newDiscipline, workload: e.target.value})}
                      placeholder="ex: 60"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowNewForm(false);
                        setNewDiscipline({ name: '', code: '', workload: '', total_slots: '', course: '' });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={saving}
                    >
                      {saving ? 'Salvando...' : 'Criar Disciplina'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

