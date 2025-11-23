'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudents } from '../../../../actions/student';
import { getAcademicHistory, generateAcademicHistoryPDF } from '../../../../actions/academic-history';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { FileText, ArrowLeft, Download } from 'lucide-react';

export default function AcademicHistoryPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const result = await getStudents();
    if (result.success) {
      setStudents(result.students);
    }
  };

  const loadHistory = async (studentId) => {
    setLoading(true);
    const result = await getAcademicHistory(studentId);
    if (result.success) {
      setHistory(result.history);
    }
    setLoading(false);
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
    if (studentId) {
      loadHistory(studentId);
    } else {
      setHistory([]);
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedStudent) return;

    const result = await generateAcademicHistoryPDF(selectedStudent);
    if (result.success) {
      // In a real implementation, you would generate and download the PDF here
      alert('PDF generation would be implemented here. Data ready for PDF generation.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'in_progress':
        return 'bg-yellow-500';
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
              <h1 className="text-3xl font-bold text-gray-800">Histórico Acadêmico</h1>
              <p className="text-gray-600">Visualizar e gerar relatórios acadêmicos</p>
            </div>
          </div>
        </div>

        <Card className="border-2 border-gray-200 mb-6">
          <CardHeader>
            <CardTitle>Selecionar Estudante</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedStudent}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-400"
            >
              <option value="">Escolha um estudante...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.person?.name} - {student.enrollment_number}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {selectedStudent && (
          <div className="mb-4">
            <Button
              onClick={handleGeneratePDF}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              <Download className="w-5 h-5 mr-2" />
              Gerar PDF
            </Button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando histórico...</p>
          </div>
        ) : history.length === 0 && selectedStudent ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl text-gray-800 mb-2">Nenhum histórico acadêmico encontrado</h3>
              <p className="text-gray-600">Este estudante ainda não possui registros acadêmicos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <Card key={record.id} className="border-2 border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">
                        {record.discipline?.name || 'N/A'}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">
                        {record.discipline?.code || 'N/A'} - {record.year} - {record.period}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {record.final_grade !== null && (
                        <span className="text-lg font-semibold text-gray-800">
                          Nota: {record.final_grade}
                        </span>
                      )}
                      <Badge className={getStatusColor(record.status)}>
                        {record.status === 'approved' ? 'Aprovado' : 
                         record.status === 'failed' ? 'Reprovado' : 
                         record.status === 'in_progress' ? 'Em Andamento' : record.status}
                      </Badge>
                    </div>
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

