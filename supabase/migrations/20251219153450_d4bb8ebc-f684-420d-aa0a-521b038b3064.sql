-- Drop existing insecure policies
DROP POLICY IF EXISTS "Nutritionists can upload their own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Nutritionists can view their own attachments" ON storage.objects;

-- Create secure INSERT policy: only allow uploads to folders matching user's nutritionist ID
CREATE POLICY "Nutritionists can upload to their own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-attachments'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT n.id::text 
    FROM nutritionists n
    WHERE n.user_id = auth.uid()
  )
);

-- Create secure SELECT policy: only allow viewing files in own folder or admin access
CREATE POLICY "Users can view their own ticket attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'ticket-attachments'
  AND auth.uid() IS NOT NULL
  AND (
    -- User owns the folder (matches their nutritionist ID)
    (storage.foldername(name))[1] IN (
      SELECT n.id::text 
      FROM nutritionists n
      WHERE n.user_id = auth.uid()
    )
    -- OR user is admin
    OR is_current_user_admin() = true
  )
);

-- Create DELETE policy for cleanup
CREATE POLICY "Users can delete their own ticket attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'ticket-attachments'
  AND auth.uid() IS NOT NULL
  AND (
    -- User owns the folder
    (storage.foldername(name))[1] IN (
      SELECT n.id::text 
      FROM nutritionists n
      WHERE n.user_id = auth.uid()
    )
    -- OR user is admin
    OR is_current_user_admin() = true
  )
);