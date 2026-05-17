-- ============================================
-- SCHEMA SQL - Criação de todas as tabelas
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS ACADÊMICAS
-- ============================================

-- Person table
CREATE TABLE person (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cpf_cnpj TEXT UNIQUE NOT NULL,
    address TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student table
CREATE TABLE student (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID UNIQUE NOT NULL REFERENCES person(id) ON DELETE CASCADE,
    enrollment_number TEXT UNIQUE NOT NULL,
    course TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher table
CREATE TABLE teacher (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID UNIQUE NOT NULL REFERENCES person(id) ON DELETE CASCADE,
    subject TEXT,
    salary DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Institution table
CREATE TABLE institution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    education_level TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Person-Institution relationship
CREATE TABLE person_institution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institution(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(person_id, institution_id)
);

-- Discipline table
CREATE TABLE discipline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    workload INTEGER,
    total_slots INTEGER DEFAULT 0,
    available_slots INTEGER DEFAULT 0,
    course TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollment table
CREATE TABLE enrollment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
    discipline_id UUID NOT NULL REFERENCES discipline(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    grade DECIMAL(5, 2),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, discipline_id)
);

-- Prerequisite table
CREATE TABLE prerequisite (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discipline_id UUID NOT NULL REFERENCES discipline(id) ON DELETE CASCADE,
    required_discipline_id UUID NOT NULL REFERENCES discipline(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic History table
CREATE TABLE academic_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
    discipline_id UUID NOT NULL REFERENCES discipline(id) ON DELETE CASCADE,
    final_grade DECIMAL(5, 2),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('approved', 'failed', 'in_progress')),
    period TEXT,
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DO APRENDEMais
-- ============================================

-- User table (unified for both academic and learning platform)
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES person(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'student', 'teacher', 'guardian', 'learner')),
    active BOOLEAN DEFAULT TRUE,
    -- AprendeMais/Learning platform specific fields
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges JSONB DEFAULT '[]'::jsonb,
    interests JSONB DEFAULT '[]'::jsonb,
    learning_style TEXT CHECK (learning_style IN ('self-paced', 'game-based', 'challenge-based')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module table (AprendeMais)
CREATE TABLE module (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    color TEXT,
    order_index INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    discipline_id UUID REFERENCES discipline(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson table
CREATE TABLE lesson (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES module(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity table
CREATE TABLE activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('game', 'quiz', 'exercise', 'interactive')),
    config JSONB DEFAULT '{}'::jsonb,
    order_index INTEGER DEFAULT 0,
    points_reward INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Item table
CREATE TABLE activity_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('question', 'option', 'item')),
    content JSONB NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Progress table
CREATE TABLE user_activity_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    max_score INTEGER,
    progress_percentage INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    selected_items JSONB DEFAULT '[]'::jsonb,
    best_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_id)
);

-- User Module Progress table
CREATE TABLE user_module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES module(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    total_activities INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Badge table
CREATE TABLE badge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    criteria JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badge table
CREATE TABLE user_badge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badge(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Activity Discipline Link table (optional)
CREATE TABLE activity_discipline_link (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    discipline_id UUID NOT NULL REFERENCES discipline(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_id, discipline_id)
);

-- Support Message table
CREATE TABLE support_message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Session table
CREATE TABLE study_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activity(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_student_person_id ON student(person_id);
CREATE INDEX idx_teacher_person_id ON teacher(person_id);
CREATE INDEX idx_enrollment_student_id ON enrollment(student_id);
CREATE INDEX idx_enrollment_discipline_id ON enrollment(discipline_id);
CREATE INDEX idx_academic_history_student_id ON academic_history(student_id);
CREATE INDEX idx_activity_lesson_id ON activity(lesson_id);
CREATE INDEX idx_lesson_module_id ON lesson(module_id);
CREATE INDEX idx_user_activity_progress_user_id ON user_activity_progress(user_id);
CREATE INDEX idx_user_activity_progress_activity_id ON user_activity_progress(activity_id);
CREATE INDEX idx_user_module_progress_user_id ON user_module_progress(user_id);
CREATE INDEX idx_user_activity_progress_completed ON user_activity_progress(completed, completed_at);
CREATE INDEX idx_user_activity_progress_best_score ON user_activity_progress(best_score);
CREATE INDEX idx_module_discipline_id ON module(discipline_id);
CREATE INDEX idx_study_session_user_id ON study_session(user_id);
CREATE INDEX idx_study_session_activity_id ON study_session(activity_id);
CREATE INDEX idx_study_session_started_at ON study_session(started_at);
CREATE INDEX idx_study_session_user_date ON study_session(user_id, started_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badge ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE module ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_session ENABLE ROW LEVEL SECURITY;

-- User table policies
CREATE POLICY "Users can read own data" ON "user"
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON "user"
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Service role full access" ON "user"
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- User Activity Progress policies
CREATE POLICY "Users can read own activity progress" ON user_activity_progress
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity progress" ON user_activity_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity progress" ON user_activity_progress
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access activity progress" ON user_activity_progress
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- User Module Progress policies
CREATE POLICY "Users can read own module progress" ON user_module_progress
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own module progress" ON user_module_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own module progress" ON user_module_progress
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access module progress" ON user_module_progress
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- User Badge policies
CREATE POLICY "Users can read own badges" ON user_badge
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badge
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access user badges" ON user_badge
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Activity policies (public read)
CREATE POLICY "Anyone can read activities" ON activity
    FOR SELECT
    USING (true);

CREATE POLICY "Service role full access activities" ON activity
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Activity Item policies (public read)
CREATE POLICY "Anyone can read activity items" ON activity_item
    FOR SELECT
    USING (true);

CREATE POLICY "Service role full access activity items" ON activity_item
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Module policies (public read)
CREATE POLICY "Anyone can read modules" ON module
    FOR SELECT
    USING (true);

CREATE POLICY "Service role full access modules" ON module
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Lesson policies (public read)
CREATE POLICY "Anyone can read lessons" ON lesson
    FOR SELECT
    USING (true);

CREATE POLICY "Service role full access lessons" ON lesson
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Badge policies (public read)
CREATE POLICY "Anyone can read badges" ON badge
    FOR SELECT
    USING (true);

CREATE POLICY "Service role full access badges" ON badge
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Study Session policies
CREATE POLICY "Users can read own study sessions" ON study_session
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON study_session
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions" ON study_session
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access study sessions" ON study_session
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON COLUMN user_activity_progress.selected_items IS 'Array of activity_item IDs that the user selected in this attempt';
COMMENT ON COLUMN user_activity_progress.best_score IS 'Best score achieved by the user for this activity';
COMMENT ON COLUMN module.discipline_id IS 'Discipline associated with this learning module';
COMMENT ON TABLE study_session IS 'Tracks study sessions to calculate real study time';

