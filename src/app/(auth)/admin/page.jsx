'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Users, BookOpen, GraduationCap, FileText, Layers } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Estudantes',
      description: 'Gerenciar cadastros de estudantes',
      icon: Users,
      href: '/admin/students',
      color: 'bg-blue-500'
    },
    {
      title: 'Matrículas',
      description: 'Gerenciar matrículas de estudantes',
      icon: BookOpen,
      href: '/admin/enrollments',
      color: 'bg-green-500'
    },
    {
      title: 'Histórico Acadêmico',
      description: 'Visualizar e gerar relatórios acadêmicos',
      icon: FileText,
      href: '/admin/academic-history',
      color: 'bg-purple-500'
    },
    {
      title: 'Disciplinas',
      description: 'Gerenciar cursos e matérias',
      icon: GraduationCap,
      href: '/admin/disciplines',
      color: 'bg-orange-500'
    },
    {
      title: 'Módulos de Aprendizado',
      description: 'Gerenciar conteúdo de aprendizado',
      icon: Layers,
      href: '/admin/modules',
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerenciar o sistema acadêmico</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.href}
                className="border-2 border-gray-200 hover:border-purple-300 transition-all cursor-pointer hover:shadow-lg"
                onClick={() => router.push(item.href)}
              >
                <CardHeader>
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-800">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/home')}
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            Voltar para Início
          </Button>
        </div>
      </div>
    </div>
  );
}
