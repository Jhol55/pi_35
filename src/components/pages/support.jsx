import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { sendSupportMessage } from '../../actions/support';
import { 
  ArrowLeft, 
  MessageCircle, 
  Video, 
  Phone, 
  Mail,
  Clock,
  User,
  Heart,
  BookOpen,
  HelpCircle,
  Send
} from 'lucide-react';

const specialists = [
  {
    id: 1,
    name: 'Dra. Maria Silva',
    specialty: 'Psicopedagoga Especialista em TEA',
    avatar: '👩‍⚕️',
    rating: 5,
    available: true,
    nextSlot: '14:30'
  },
  {
    id: 2,
    name: 'Prof. João Santos',
    specialty: 'Especialista em Alfabetização Inclusiva',
    avatar: '👨‍🏫',
    rating: 5,
    available: false,
    nextSlot: '16:00'
  },
  {
    id: 3,
    name: 'Dra. Ana Costa',
    specialty: 'Fonoaudióloga Infantil',
    avatar: '👩‍💼',
    rating: 5,
    available: true,
    nextSlot: '15:15'
  }
];

const faqItems = [
  {
    question: 'Como posso ajudar meu filho em casa?',
    answer: 'Crie uma rotina consistente, use reforço positivo e pratique as atividades da plataforma junto com ele.'
  },
  {
    question: 'Qual é o tempo ideal de estudo?',
    answer: 'Recomendamos sessões de 15-20 minutos, respeitando sempre o ritmo e interesse da criança.'
  },
  {
    question: 'Como adaptar as atividades?',
    answer: 'Todas as atividades podem ser pausadas, repetidas e adaptadas conforme a necessidade individual.'
  }
];

export function SupportScreen({ onNavigate, userProfile }) {
  const [selectedTab, setSelectedTab] = useState('specialists');
  const [messageText, setMessageText] = useState('');
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (messageText.trim() && name.trim() && email.trim()) {
      setSending(true);
      const result = await sendSupportMessage({
        name,
        email,
        message: messageText,
        userId: userProfile?.id
      });

      if (result.success) {
        alert('Mensagem enviada! Nossa equipe entrará em contato em breve.');
        setMessageText('');
        if (!userProfile) {
          setName('');
          setEmail('');
        }
      } else {
        alert('Erro ao enviar mensagem. Tente novamente.');
      }
      setSending(false);
    } else {
      alert('Por favor, preencha todos os campos.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-purple-100 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate('home')}
            className="text-gray-600 hover:text-purple-600"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          
          <div>
            <h1 className="text-xl text-gray-800">Suporte Pedagógico</h1>
            <p className="text-gray-600">Estamos aqui para ajudar você e sua família</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedTab === 'specialists' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('specialists')}
            className={selectedTab === 'specialists' 
              ? 'bg-purple-500 hover:bg-purple-600 text-white' 
              : 'border-purple-300 text-purple-600 hover:bg-purple-50'
            }
          >
            <User className="w-4 h-4 mr-2" />
            Especialistas
          </Button>
          
          <Button
            variant={selectedTab === 'faq' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('faq')}
            className={selectedTab === 'faq' 
              ? 'bg-purple-500 hover:bg-purple-600 text-white' 
              : 'border-purple-300 text-purple-600 hover:bg-purple-50'
            }
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Perguntas Frequentes
          </Button>
          
          <Button
            variant={selectedTab === 'contact' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('contact')}
            className={selectedTab === 'contact' 
              ? 'bg-purple-500 hover:bg-purple-600 text-white' 
              : 'border-purple-300 text-purple-600 hover:bg-purple-50'
            }
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contato
          </Button>
        </div>

        {/* Specialists Tab */}
        {selectedTab === 'specialists' && (
          <div className="space-y-6">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Nossa Equipe Especializada
                </CardTitle>
                <CardDescription className="text-green-700">
                  Profissionais especializados em educação inclusiva e TEA
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4">
              {specialists.map((specialist) => (
                <Card key={specialist.id} className="border-2 border-gray-200 hover:border-purple-300 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{specialist.avatar}</div>
                        <div>
                          <h3 className="text-lg text-gray-800">{specialist.name}</h3>
                          <p className="text-gray-600">{specialist.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(specialist.rating)].map((_, i) => (
                                <span key={i} className="text-yellow-400">⭐</span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">({specialist.rating}.0)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {specialist.available ? (
                          <Badge className="bg-green-500 text-white mb-2">
                            🟢 Disponível
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-500 text-white mb-2">
                            🟡 Ocupado
                          </Badge>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Clock className="w-4 h-4" />
                          Próximo horário: {specialist.nextSlot}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={!specialist.available}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Video
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {selectedTab === 'faq' && (
          <div className="space-y-4">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Perguntas Frequentes
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Respostas para as dúvidas mais comuns
                </CardDescription>
              </CardHeader>
            </Card>

            {faqItems.map((item, index) => (
              <Card key={index} className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-base">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.answer}</p>
                </CardContent>
              </Card>
            ))}

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <p className="text-purple-700 mb-3">Não encontrou sua resposta?</p>
                <Button
                  onClick={() => setSelectedTab('contact')}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Fale Conosco
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact Tab */}
        {selectedTab === 'contact' && (
          <div className="space-y-6">
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Entre em Contato
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Nossa equipe responde em até 2 horas durante o horário comercial
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-700 mb-2 block">Nome</label>
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="border-2 border-gray-200 focus:border-purple-400"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-700 mb-2 block">E-mail</label>
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="border-2 border-gray-200 focus:border-purple-400"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-700 mb-2 block">Mensagem</label>
                    <Textarea 
                      placeholder="Como podemos ajudar você?"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="border-2 border-gray-200 focus:border-purple-400 min-h-[120px]"
                    />
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !messageText.trim() || !name.trim() || !email.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sending ? 'Enviando...' : 'Enviar Mensagem'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-blue-200 text-center">
                <CardContent className="p-4">
                  <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-blue-800 mb-1">Telefone</h3>
                  <p className="text-gray-600">(11) 9999-9999</p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-green-200 text-center">
                <CardContent className="p-4">
                  <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-green-800 mb-1">E-mail</h3>
                  <p className="text-gray-600">suporte@aprendemais.com</p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-purple-200 text-center">
                <CardContent className="p-4">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-purple-800 mb-1">Horário</h3>
                  <p className="text-gray-600">Seg-Sex 8h-18h</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
