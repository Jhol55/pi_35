'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Plus, Edit, Trash2, ArrowLeft, Layers } from 'lucide-react';
import { getModulesAdmin, deleteModule } from '../../../../actions/admin-content';

export default function AdminModulesPage() {
  const router = useRouter();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    const result = await getModulesAdmin();
    if (result.success) {
      setModules(result.modules || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este módulo?')) {
      const result = await deleteModule(id);
      if (result.success) {
        loadModules();
      } else {
        alert('Erro ao excluir módulo');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/admin')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Layers className="w-6 h-6" />
              Módulos de Aprendizado
            </h1>
          </div>
          <Button 
            onClick={() => router.push('/admin/modules/new')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Módulo
          </Button>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid gap-4">
            {modules.length === 0 && (
               <p className="text-gray-500">Nenhum módulo encontrado. Crie um para começar.</p>
            )}
            {modules.map((module) => (
              <Card key={module.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${module.color || 'bg-gray-100'}`}>
                      <Layers className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <p className="text-sm text-gray-500">{module.description}</p>
                      {module.discipline && (
                        <p className="text-xs text-purple-600 mt-1">
                          Disciplina: {module.discipline.name} ({module.discipline.code})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Future: Link to edit module or manage lessons */}
                    <Button variant="outline" size="sm" onClick={() => router.push(`/admin/modules/${module.id}/lessons`)}>
                      Gerenciar Lições
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(module.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
