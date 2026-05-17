-- Módulo separado: Jogo da Memória (dinossauros)

INSERT INTO module (code, title, description, icon_name, color, order_index) VALUES
('memory', 'Jogo da Memória', 'Treine sua memória encontrando pares iguais de forma divertida',
 'Gamepad2', 'bg-amber-500', 4);

INSERT INTO lesson (module_id, title, description, order_index)
SELECT id, 'Dinossauros', 'Encontre os pares de dinossauros iguais', 1
FROM module WHERE code = 'memory';

INSERT INTO activity (lesson_id, title, description, activity_type, config, order_index, points_reward)
SELECT l.id,
  'Jogo da Memória dos Dinossauros',
  'Vire as cartas e encontre os dinossauros iguais',
  'game',
  '{
    "gameType": "memory_match",
    "instruction": "Vire duas cartas por vez. Quando forem iguais, elas ficam abertas. Encontre todos os pares!",
    "subtitle": "Use sua memória para achar os dinossauros iguais",
    "pairs": [
      { "key": "1", "name": "Dino 1", "image": "/dinos/1.png" },
      { "key": "2", "name": "Dino 2", "image": "/dinos/2.png" },
      { "key": "3", "name": "Dino 3", "image": "/dinos/3.png" },
      { "key": "4", "name": "Dino 4", "image": "/dinos/4.png" },
      { "key": "5", "name": "Dino 5", "image": "/dinos/5.png" },
      { "key": "6", "name": "Dino 6", "image": "/dinos/6.png" }
    ],
    "columns": 4,
    "pointsPerPair": 10,
    "completionBonus": 20
  }'::jsonb,
  1,
  80
FROM lesson l
JOIN module m ON l.module_id = m.id
WHERE m.code = 'memory' AND l.title = 'Dinossauros';
