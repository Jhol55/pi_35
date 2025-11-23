'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerStudent } from '../../../../../actions/student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { ArrowLeft } from 'lucide-react';

export default function RegisterStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    cpf_cnpj: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    course: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await registerStudent(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/admin/students');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/students')}
            className="text-gray-600 hover:text-purple-600"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-700">Cadastrar Novo Estudante</CardTitle>
            <CardDescription>Preencha todos os campos obrigatórios para cadastrar um estudante</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-2">Nome Completo *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-200 focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">CPF *</label>
                <Input
                  name="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={handleChange}
                  required
                  placeholder="00000000000"
                  className="border-2 border-gray-200 focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-200 focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Telefone</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border-2 border-gray-200 focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Endereço</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="border-2 border-gray-200 focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Data de Nascimento</label>
                <Input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="border-2 border-gray-200 focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Curso</label>
                <Input
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="border-2 border-gray-200 focus:border-purple-400"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/students')}
                  className="flex-1 border-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Estudante'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

