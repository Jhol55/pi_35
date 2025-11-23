-- ============================================
-- SEED SQL - Dados iniciais (módulos, lições, atividades, badges)
-- ============================================

-- ============================================
-- MÓDULOS
-- ============================================

INSERT INTO module (code, title, description, icon_name, color, order_index) VALUES
('letters', 'Descobrindo as Letras', 'Aprenda o alfabeto de forma divertida', 'BookOpen', 'bg-blue-500', 1),
('sounds', 'Sons e Palavras', 'Conecte sons com letras', 'Headphones', 'bg-green-500', 2),
('reading', 'Primeiras Palavras', 'Leia suas primeiras palavras', 'Heart', 'bg-purple-500', 3);

-- ============================================
-- LIÇÕES
-- ============================================

-- Lições para módulo "Descobrindo as Letras"
INSERT INTO lesson (module_id, title, description, order_index)
SELECT id, 'Letra A', 'Aprenda sobre a letra A', 1
FROM module WHERE code = 'letters';

INSERT INTO lesson (module_id, title, description, order_index)
SELECT id, 'Letra B', 'Aprenda sobre a letra B', 2
FROM module WHERE code = 'letters';

-- Lições para módulo "Sons e Palavras"
INSERT INTO lesson (module_id, title, description, order_index)
SELECT id, 'Som da Letra M', 'Identifique palavras com o som M', 1
FROM module WHERE code = 'sounds';

INSERT INTO lesson (module_id, title, description, order_index)
SELECT id, 'Som da Letra P', 'Identifique palavras com o som P', 2
FROM module WHERE code = 'sounds';

-- Lições para módulo "Primeiras Palavras"
INSERT INTO lesson (module_id, title, description, order_index)
SELECT id, 'Palavras com 2 letras', 'Aprenda palavras simples com duas letras', 1
FROM module WHERE code = 'reading';

INSERT INTO lesson (module_id, title, description, order_index)
SELECT id, 'Palavras com 3 letras', 'Aprenda palavras simples com três letras', 2
FROM module WHERE code = 'reading';

-- ============================================
-- ATIVIDADES - MÓDULO: DESCOBRINDO AS LETRAS
-- ============================================

-- Atividade: Descubra a Letra A
INSERT INTO activity (lesson_id, title, description, activity_type, config, order_index, points_reward)
SELECT l.id, 'Descubra a Letra A', 'Encontre todas as coisas que começam com A', 'game', 
'{"letter": "A", "instruction": "Clique nas coisas que começam com a letra A"}'::jsonb, 1, 20
FROM lesson l
JOIN module m ON l.module_id = m.id
WHERE m.code = 'letters' AND l.title = 'Letra A';

-- Itens da atividade "Descubra a Letra A"
INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Árvore", "image": "🌳", "starts_with_a": true, "correct": true}'::jsonb, 1
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra A' AND a.title = 'Descubra a Letra A';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Bola", "image": "⚽", "starts_with_a": false, "correct": false}'::jsonb, 2
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra A' AND a.title = 'Descubra a Letra A';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Abelha", "image": "🐝", "starts_with_a": true, "correct": true}'::jsonb, 3
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra A' AND a.title = 'Descubra a Letra A';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Casa", "image": "🏠", "starts_with_a": false, "correct": false}'::jsonb, 4
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra A' AND a.title = 'Descubra a Letra A';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Avião", "image": "✈️", "starts_with_a": true, "correct": true}'::jsonb, 5
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra A' AND a.title = 'Descubra a Letra A';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Gato", "image": "🐱", "starts_with_a": false, "correct": false}'::jsonb, 6
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra A' AND a.title = 'Descubra a Letra A';

-- Atividade: Descubra a Letra B
INSERT INTO activity (lesson_id, title, description, activity_type, config, order_index, points_reward)
SELECT l.id, 'Descubra a Letra B', 'Encontre todas as coisas que começam com B', 'game', 
'{"letter": "B", "instruction": "Clique nas coisas que começam com a letra B"}'::jsonb, 1, 20
FROM lesson l
JOIN module m ON l.module_id = m.id
WHERE m.code = 'letters' AND l.title = 'Letra B';

-- Itens da atividade "Descubra a Letra B"
INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Bola", "image": "⚽", "starts_with_b": true, "correct": true}'::jsonb, 1
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra B' AND a.title = 'Descubra a Letra B';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Balão", "image": "🎈", "starts_with_b": true, "correct": true}'::jsonb, 2
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra B' AND a.title = 'Descubra a Letra B';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Borboleta", "image": "🦋", "starts_with_b": true, "correct": true}'::jsonb, 3
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra B' AND a.title = 'Descubra a Letra B';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Casa", "image": "🏠", "starts_with_b": false, "correct": false}'::jsonb, 4
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra B' AND a.title = 'Descubra a Letra B';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Banana", "image": "🍌", "starts_with_b": true, "correct": true}'::jsonb, 5
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra B' AND a.title = 'Descubra a Letra B';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Gato", "image": "🐱", "starts_with_b": false, "correct": false}'::jsonb, 6
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Letra B' AND a.title = 'Descubra a Letra B';

-- ============================================
-- ATIVIDADES - MÓDULO: SONS E PALAVRAS
-- ============================================

-- Atividade: Descubra o Som M
INSERT INTO activity (lesson_id, title, description, activity_type, config, order_index, points_reward)
SELECT l.id, 'Descubra o Som M', 'Encontre palavras que têm o som M', 'game', 
'{"letter": "M", "instruction": "Clique nas palavras que têm o som M"}'::jsonb, 1, 20
FROM lesson l
JOIN module m ON l.module_id = m.id
WHERE m.code = 'sounds' AND l.title = 'Som da Letra M';

-- Itens da atividade "Descubra o Som M"
INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Macaco", "image": "🐵", "has_sound": true, "correct": true}'::jsonb, 1
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra M' AND a.title = 'Descubra o Som M';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Mesa", "image": "🪑", "has_sound": true, "correct": true}'::jsonb, 2
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra M' AND a.title = 'Descubra o Som M';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Maçã", "image": "🍎", "has_sound": true, "correct": true}'::jsonb, 3
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra M' AND a.title = 'Descubra o Som M';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Pato", "image": "🦆", "has_sound": false, "correct": false}'::jsonb, 4
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra M' AND a.title = 'Descubra o Som M';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Mão", "image": "✋", "has_sound": true, "correct": true}'::jsonb, 5
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra M' AND a.title = 'Descubra o Som M';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Sol", "image": "☀️", "has_sound": false, "correct": false}'::jsonb, 6
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra M' AND a.title = 'Descubra o Som M';

-- Atividade: Descubra o Som P
INSERT INTO activity (lesson_id, title, description, activity_type, config, order_index, points_reward)
SELECT l.id, 'Descubra o Som P', 'Encontre palavras que têm o som P', 'game', 
'{"letter": "P", "instruction": "Clique nas palavras que têm o som P"}'::jsonb, 1, 20
FROM lesson l
JOIN module m ON l.module_id = m.id
WHERE m.code = 'sounds' AND l.title = 'Som da Letra P';

-- Itens da atividade "Descubra o Som P"
INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Pato", "image": "🦆", "has_sound": true, "correct": true}'::jsonb, 1
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra P' AND a.title = 'Descubra o Som P';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Peixe", "image": "🐟", "has_sound": true, "correct": true}'::jsonb, 2
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra P' AND a.title = 'Descubra o Som P';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Cachorro", "image": "🐕", "has_sound": false, "correct": false}'::jsonb, 3
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra P' AND a.title = 'Descubra o Som P';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Pipoca", "image": "🍿", "has_sound": true, "correct": true}'::jsonb, 4
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra P' AND a.title = 'Descubra o Som P';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Panda", "image": "🐼", "has_sound": true, "correct": true}'::jsonb, 5
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra P' AND a.title = 'Descubra o Som P';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Rato", "image": "🐭", "has_sound": false, "correct": false}'::jsonb, 6
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Som da Letra P' AND a.title = 'Descubra o Som P';

-- ============================================
-- ATIVIDADES - MÓDULO: PRIMEIRAS PALAVRAS
-- ============================================

-- Atividade: Encontre Palavras Curtas (2 letras)
INSERT INTO activity (lesson_id, title, description, activity_type, config, order_index, points_reward)
SELECT l.id, 'Encontre Palavras Curtas', 'Identifique palavras com 2 letras', 'game', 
'{"instruction": "Clique nas palavras que têm apenas 2 letras"}'::jsonb, 1, 20
FROM lesson l
JOIN module m ON l.module_id = m.id
WHERE m.code = 'reading' AND l.title = 'Palavras com 2 letras';

-- Itens da atividade "Encontre Palavras Curtas"
INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Pé", "image": "🦶", "letter_count": 2, "correct": true}'::jsonb, 1
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 2 letras' AND a.title = 'Encontre Palavras Curtas';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Mão", "image": "✋", "letter_count": 3, "correct": false}'::jsonb, 2
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 2 letras' AND a.title = 'Encontre Palavras Curtas';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Dó", "image": "🎵", "letter_count": 2, "correct": true}'::jsonb, 3
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 2 letras' AND a.title = 'Encontre Palavras Curtas';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Sol", "image": "☀️", "letter_count": 3, "correct": false}'::jsonb, 4
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 2 letras' AND a.title = 'Encontre Palavras Curtas';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Só", "image": "1️⃣", "letter_count": 2, "correct": true}'::jsonb, 5
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 2 letras' AND a.title = 'Encontre Palavras Curtas';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Casa", "image": "🏠", "letter_count": 4, "correct": false}'::jsonb, 6
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 2 letras' AND a.title = 'Encontre Palavras Curtas';

-- Atividade: Palavras de 3 Letras
INSERT INTO activity (lesson_id, title, description, activity_type, config, order_index, points_reward)
SELECT l.id, 'Palavras de 3 Letras', 'Identifique palavras com 3 letras', 'game', 
'{"instruction": "Clique nas palavras que têm exatamente 3 letras"}'::jsonb, 1, 20
FROM lesson l
JOIN module m ON l.module_id = m.id
WHERE m.code = 'reading' AND l.title = 'Palavras com 3 letras';

-- Itens da atividade "Palavras de 3 Letras"
INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Sol", "image": "☀️", "letter_count": 3, "correct": true}'::jsonb, 1
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 3 letras' AND a.title = 'Palavras de 3 Letras';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Lua", "image": "🌙", "letter_count": 3, "correct": true}'::jsonb, 2
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 3 letras' AND a.title = 'Palavras de 3 Letras';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Mão", "image": "✋", "letter_count": 3, "correct": true}'::jsonb, 3
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 3 letras' AND a.title = 'Palavras de 3 Letras';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Bola", "image": "⚽", "letter_count": 4, "correct": false}'::jsonb, 4
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 3 letras' AND a.title = 'Palavras de 3 Letras';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Luz", "image": "💡", "letter_count": 3, "correct": true}'::jsonb, 5
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 3 letras' AND a.title = 'Palavras de 3 Letras';

INSERT INTO activity_item (activity_id, item_type, content, order_index)
SELECT a.id, 'item', 
'{"name": "Flor", "image": "🌸", "letter_count": 4, "correct": false}'::jsonb, 6
FROM activity a
JOIN lesson l ON a.lesson_id = l.id
WHERE l.title = 'Palavras com 3 letras' AND a.title = 'Palavras de 3 Letras';

-- ============================================
-- BADGES
-- ============================================

-- Badges iniciais
INSERT INTO badge (code, name, description, icon, criteria) VALUES
('letter-a-master', 'Mestre da Letra A', 'Completou a atividade da letra A com sucesso', '🏆', '{"min_score": 20, "activity_title": "Descubra a Letra A"}'::jsonb),
('letter-b-master', 'Mestre da Letra B', 'Completou a atividade da letra B com sucesso', '🏆', '{"min_score": 20, "activity_title": "Descubra a Letra B"}'::jsonb),
('sound-m-master', 'Mestre do Som M', 'Completou a atividade do som M com sucesso', '🎵', '{"min_score": 20, "activity_title": "Descubra o Som M"}'::jsonb),
('sound-p-master', 'Mestre do Som P', 'Completou a atividade do som P com sucesso', '🎵', '{"min_score": 20, "activity_title": "Descubra o Som P"}'::jsonb),
('words-2-master', 'Mestre das Palavras Curtas', 'Completou a atividade de palavras com 2 letras', '📖', '{"min_score": 20, "activity_title": "Encontre Palavras Curtas"}'::jsonb),
('words-3-master', 'Mestre das Palavras de 3 Letras', 'Completou a atividade de palavras com 3 letras', '📖', '{"min_score": 20, "activity_title": "Palavras de 3 Letras"}'::jsonb),
('first-activity', 'Primeira Atividade', 'Completou sua primeira atividade', '⭐', '{"activities_completed": 1}'::jsonb),
('module-complete', 'Módulo Completo', 'Completou um módulo inteiro', '🎓', '{"module_progress": 100}'::jsonb);

