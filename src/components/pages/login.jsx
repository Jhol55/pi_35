'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { User, Lock, Heart, Mail, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '../../contexts/UserContext';

export function LoginScreen() {
  const router = useRouter();
  const { login, signUp } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }
    
    // For registration, also need name
    if (!isLogin && !name.trim()) {
      setError('Por favor, digite seu nome');
      setLoading(false);
      return;
    }
    
    try {
      let result;
      if (isLogin) {
        result = await login(email.trim(), password);
      } else {
        result = await signUp(name.trim(), email.trim(), password);
      }

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Success - redirect to questionnaire or home
        router.push('/questionnaire');
      }
    } catch (err) {
      setError(err.message || 'Ocorreu um erro');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Imagem de fundo */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1675635408192-ff9b2ebe5023?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGxlYXJuaW5nJTIwaW5jbHVzaXZlJTIwZWR1Y2F0aW9uJTIwY29sb3JmdWx8ZW58MXx8fHwxNzU3ODc2Njg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Crianças aprendendo de forma inclusiva"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
      </div>

      {/* Lado direito - Texto e Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-full max-w-md">
          {/* Texto da marca - sempre visível */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl text-gray-800 mb-4">AprendeMais</h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Uma plataforma inclusiva de aprendizado criada especialmente para pessoas com TEA
            </p>
          </div>

          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-700">
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {isLogin 
                  ? 'Entre para continuar sua jornada de aprendizado' 
                  : 'Crie sua conta para começar a aprender'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Como você gostaria de ser chamado?
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite seu nome"
                      className="text-lg p-4 border-2 border-purple-200 rounded-xl focus:border-purple-400"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu e-mail"
                    className="text-lg p-4 border-2 border-purple-200 rounded-xl focus:border-purple-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="text-lg p-4 border-2 border-purple-200 rounded-xl focus:border-purple-400"
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white p-4 rounded-xl text-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-600 hover:text-purple-800 underline"
                >
                  {isLogin 
                    ? 'Não tem conta? Crie uma aqui' 
                    : 'Já tem conta? Entre aqui'
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

