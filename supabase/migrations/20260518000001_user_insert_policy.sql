CREATE POLICY "Users can insert own profile" ON "user"
  FOR INSERT
  WITH CHECK (auth.uid() = id);
