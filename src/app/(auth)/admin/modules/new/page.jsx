'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Input } from '../../../../../components/ui/input';
import { Textarea } from '../../../../../components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { createModule } from '../../../../../actions/admin-content';
import { getDisciplines } from '../../../../../actions/discipline';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';

export default function NewModulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [disciplines, setDisciplines] = useState([]);
  const [loadingDisciplines, setLoadingDisciplines] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    order_index: 0,
    discipline_id: ''
  });

  // Load disciplines on mount
  useEffect(() => {
    loadDisciplines();
  }, []);

  const loadDisciplines = async () => {
    setLoadingDisciplines(true);
    const result = await getDisciplines();
    if (result.success) {
      setDisciplines(result.disciplines || []);
    }
    setLoadingDisciplines(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.title || !formData.code) {
      alert('Título e Código são obrigatórios');
      setLoading(false);
      return;
    }

    if (!formData.discipline_id) {
      alert('Selecione uma disciplina');
      setLoading(false);
      return;
    }

    const result = await createModule(formData);
    if (result.success) {
      router.push('/admin/modules');
    } else {
      alert('Erro ao criar módulo: ' + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push('/admin/modules')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 ml-2">Novo Módulo de Aprendizado</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Título</label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="ex: Alfabeto"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Código</label>
                <Input 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="ex: ALFABETO"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Disciplina *</label>
                {loadingDisciplines ? (
                  <p className="text-sm text-gray-500">Carregando disciplinas...</p>
                ) : (
                  <Select 
                    value={formData.discipline_id} 
                    onValueChange={(val) => setFormData({...formData, discipline_id: val})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplines.length === 0 ? (
                        <SelectItem value="" disabled>Nenhuma disciplina disponível</SelectItem>
                      ) : (
                        disciplines.map((discipline) => (
                          <SelectItem key={discipline.id} value={discipline.id}>
                            {discipline.name} ({discipline.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-gray-500 mt-1">* Obrigatório: Selecione a disciplina associada a este módulo</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Ordem</label>
                <Input 
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Descrição</label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva o que os alunos aprenderão..."
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Criar Módulo'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
