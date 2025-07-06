
-- Fix the trigger that's causing the "updated_at" field error
-- The training_data table doesn't have updated_at column, so we should use changed_at

CREATE OR REPLACE FUNCTION public.create_training_data_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert history record for the old version when updating
  IF TG_OP = 'UPDATE' AND (OLD.question != NEW.question OR OLD.answer != NEW.answer) THEN
    INSERT INTO public.training_data_history (
      training_data_id,
      version,
      question,
      answer,
      change_reason,
      changed_by,
      changed_at
    ) VALUES (
      OLD.id,
      OLD.version,
      OLD.question,
      OLD.answer,
      NEW.change_reason,
      NEW.changed_by,
      OLD.changed_at  -- Use changed_at instead of updated_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_create_training_data_history ON public.training_data;
CREATE TRIGGER trigger_create_training_data_history
  BEFORE UPDATE ON public.training_data
  FOR EACH ROW
  EXECUTE FUNCTION public.create_training_data_history();
