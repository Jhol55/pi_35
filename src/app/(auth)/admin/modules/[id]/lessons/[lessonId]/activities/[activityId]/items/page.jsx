'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../../../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../../../../components/ui/card';
import { Input } from '../../../../../../../../../../components/ui/input';
import { Textarea } from '../../../../../../../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../../../../../components/ui/select';
import { ArrowLeft, Plus, Trash2, Save, X, List } from 'lucide-react';
import { createClient } from '../../../../../../../../../../lib/supabase/client';

export default function AdminActivityItemsPage({ params }) {
  const router = useRouter();
  const { id: moduleId, lessonId, activityId } = params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [showNew, setShowNew] = useState(false);
  const [newItem, setNewItem] = useState({
    item_type: 'item',
    content: '{"name": "Apple", "image": "🍎", "correct": true}',
    order_index: 0
  });

  useEffect(() => {
    loadData();
  }, [activityId]);

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_item')
      .select('*')
      .eq('activity_id', activityId)
      .order('order_index', { ascending: true });

    if (!error) {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    let parsedContent = {};
    try {
      parsedContent = JSON.parse(newItem.content);
    } catch (e) {
      return alert('Conteúdo JSON inválido');
    }

    const { error } = await supabase
      .from('activity_item')
      .insert({
        activity_id: activityId,
        item_type: newItem.item_type,
        content: parsedContent,
        order_index: newItem.order_index
      });

    if (!error) {
      setShowNew(false);
      loadData();
    } else {
      alert('Erro ao criar item: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Deletar este item?')) {
      const { error } = await supabase.from('activity_item').delete().eq('id', id);
      if (!error) loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(`/admin/modules/${moduleId}/lessons/${lessonId}/activities`)}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar para Atividades
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Itens da Atividade</h1>
          </div>
          <Button 
            onClick={() => setShowNew(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={showNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </div>

        {showNew && (
          <Card className="mb-6 border-2 border-purple-200">
            <CardHeader>
              <CardTitle>Novo Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Tipo</label>
                    <Select 
                      value={newItem.item_type} 
                      onValueChange={(val) => setNewItem({...newItem, item_type: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="item">Item</SelectItem>
                        <SelectItem value="question">Question</SelectItem>
                        <SelectItem value="option">Option</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Ordem</label>
                    <Input 
                      type="number"
                      value={newItem.order_index}
                      onChange={(e) => setNewItem({...newItem, order_index: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                    <label className="text-sm text-gray-600 block mb-1">Conteúdo (JSON)</label>
                  <Textarea 
                    value={newItem.content}
                    onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                    className="font-mono text-sm"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: {"{\"name\": \"Apple\", \"image\": \"🍎\", \"correct\": true}"}</p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
                  <Button onClick={handleCreate}>Salvar Item</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <List className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.item_type}</h3>
                    <pre className="text-xs text-gray-500 bg-gray-100 p-1 rounded mt-1">
                      {JSON.stringify(item.content)}
                    </pre>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
