'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudents } from '../../../../../actions/student';
import { getDisciplines } from '../../../../../actions/discipline';
import { enrollStudent } from '../../../../../actions/enrollment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NewEnrollmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [studentsResult, disciplinesResult] = await Promise.all([
      getStudents(),
      getDisciplines()
    ]);

    if (studentsResult.success) {
      setStudents(studentsResult.students);
    }
    if (disciplinesResult.success) {
      setDisciplines(disciplinesResult.disciplines.filter(d => d.available_slots > 0));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!selectedStudent) {
      setError('Por favor, selecione um estudante');
      setLoading(false);
      return;
    }

    if (selectedDisciplines.length === 0) {
      setError('Por favor, selecione pelo menos uma disciplina');
      setLoading(false);
      return;
    }

    const result = await enrollStudent(selectedStudent, selectedDisciplines);

    if (result.error) {
      setError(result.error);
    } else if (result.errors && result.errors.length > 0) {
      setError(`Algumas matrículas falharam: ${result.errors.map(e => e.error).join(', ')}`);
      if (result.enrollments && result.enrollments.length > 0) {
        setSuccess(`${result.enrollments.length} matrícula(s) criada(s) com sucesso`);
      }
    } else {
      setSuccess('Matrículas criadas com sucesso!');
      setTimeout(() => {
        router.push('/admin/enrollments');
      }, 1500);
    }

    setLoading(false);
  };

  const toggleDiscipline = (disciplineId) => {
    setSelectedDisciplines(prev =>
      prev.includes(disciplineId)
        ? prev.filter(id => id !== disciplineId)
        : [...prev, disciplineId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/enrollments')}
            className="text-gray-600 hover:text-purple-600"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-700">Nova Matrícula</CardTitle>
            <CardDescription>Matricular um estudante em uma ou mais disciplinas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-700">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Selecionar Estudante *</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  required
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-400"
                >
                  <option value="">Escolha um estudante...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.person?.name} - {student.enrollment_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Selecionar Disciplinas *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2 border-2 border-gray-200 rounded-lg">
                  {disciplines.map((discipline) => (
                    <div
                      key={discipline.id}
                      onClick={() => toggleDiscipline(discipline.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedDisciplines.includes(discipline.id)
                          ? 'border-purple-400 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{discipline.name}</p>
                          <p className="text-sm text-gray-600">{discipline.code}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {discipline.available_slots} vagas disponíveis
                          </p>
                        </div>
                        {selectedDisciplines.includes(discipline.id) && (
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedDisciplines.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedDisciplines.length} disciplina(s) selecionada(s)
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/enrollments')}
                  className="flex-1 border-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                >
                  {loading ? 'Matriculando...' : 'Criar Matrícula'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

