'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEnrollments } from '../../../../actions/enrollment';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { BookOpen, Plus, ArrowLeft } from 'lucide-react';

export default function EnrollmentsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    setLoading(true);
    const result = await getEnrollments();
    if (result.success) {
      setEnrollments(result.enrollments);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
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
              <h1 className="text-3xl font-bold text-gray-800">Matrículas</h1>
              <p className="text-gray-600">Gerenciar matrículas de estudantes</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/admin/enrollments/new')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Matrícula
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando matrículas...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl text-gray-800 mb-2">Nenhuma matrícula encontrada</h3>
              <p className="text-gray-600 mb-4">Crie uma nova matrícula para começar</p>
              <Button
                onClick={() => router.push('/admin/enrollments/new')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Matrícula
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="border-2 border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">
                        {enrollment.student?.person?.name || 'N/A'}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">
                        {enrollment.discipline?.name || 'N/A'} - {enrollment.discipline?.code || 'N/A'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(enrollment.status)}>
                      {enrollment.status === 'active' ? 'Ativo' : 
                       enrollment.status === 'completed' ? 'Concluído' : 
                       enrollment.status === 'cancelled' ? 'Cancelado' : enrollment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Data de Matrícula:</span>
                      <p className="text-gray-600">
                        {new Date(enrollment.enrollment_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Nota:</span>
                      <p className="text-gray-600">{enrollment.grade || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Número de Matrícula:</span>
                      <p className="text-gray-600">{enrollment.student?.enrollment_number || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Curso:</span>
                      <p className="text-gray-600">{enrollment.discipline?.course || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

