'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudents } from '../../../../actions/student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, ArrowLeft } from 'lucide-react';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const result = await getStudents();
    if (result.success) {
      setStudents(result.students);
    }
    setLoading(false);
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
              <h1 className="text-3xl font-bold text-gray-800">Estudantes</h1>
              <p className="text-gray-600">Gerenciar cadastros de estudantes</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/admin/students/register')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Cadastrar Estudante
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando estudantes...</p>
          </div>
        ) : students.length === 0 ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl text-gray-800 mb-2">Nenhum estudante cadastrado</h3>
              <p className="text-gray-600 mb-4">Comece cadastrando um novo estudante</p>
              <Button
                onClick={() => router.push('/admin/students/register')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Cadastrar Primeiro Estudante
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card key={student.id} className="border-2 border-gray-200 hover:border-purple-300 transition-all">
                <CardHeader>
                  <CardTitle className="text-gray-800">{student.person?.name || 'N/A'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-semibold">Matrícula:</span> {student.enrollment_number}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Curso:</span> {student.course || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Email:</span> {student.person?.email || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">CPF:</span> {student.person?.cpf_cnpj || 'N/A'}
                    </p>
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

