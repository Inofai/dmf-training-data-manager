
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to detect language from text
function detectLanguage(text: string): string {
  // Simple language detection based on character patterns
  const cleanText = text.toLowerCase().replace(/[^\p{L}\s]/gu, '');
  
  // Check for common patterns
  if (/[\u4e00-\u9fff]/.test(text)) return 'Chinese';
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'Japanese';
  if (/[\uac00-\ud7af]/.test(text)) return 'Korean';
  if (/[\u0600-\u06ff]/.test(text)) return 'Arabic';
  if (/[\u0400-\u04ff]/.test(text)) return 'Russian';
  if (/[\u0370-\u03ff]/.test(text)) return 'Greek';
  if (/[\u0590-\u05ff]/.test(text)) return 'Hebrew';
  
  // Common words detection for European languages
  const commonWords = {
    Spanish: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'una'],
    French: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se'],
    German: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als'],
    Italian: ['il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'con', 'del', 'da', 'le', 'al', 'dei', 'delle', 'nel', 'sulla', 'una', 'nella', 'gli'],
    Portuguese: ['o', 'de', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos']
  };
  
  for (const [language, words] of Object.entries(commonWords)) {
    const matchCount = words.filter(word => cleanText.includes(` ${word} `) || cleanText.startsWith(`${word} `) || cleanText.endsWith(` ${word}`)).length;
    if (matchCount >= 3) return language;
  }
  
  return 'English'; // Default fallback
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    console.log('Processing content:', content.substring(0, 100) + '...');

    // Detect the language of the input content
    const detectedLanguage = detectLanguage(content);
    console.log('Detected language:', detectedLanguage);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(jwt);
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Processing content for user:', user.id);

    // Get OpenAI API key from database using the original function
    const { data: openAIApiKey, error: keyError } = await supabase.rpc('get_api_key_by_name', {
      _key_name: 'OPENAI_API_KEY'
    });

    if (keyError) {
      console.error('Error fetching OpenAI API key:', keyError);
      throw new Error('Failed to retrieve OpenAI API key from database');
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not found in database');
      throw new Error('OpenAI API key not configured. Please add an API key with name "OPENAI_API_KEY" in the API Keys management page.');
    }

    console.log('Retrieved OpenAI API key from database');

    // Create language-specific system prompt
    const languageInstructions = detectedLanguage === 'English' 
      ? 'Generate questions and answers in English.'
      : `Generate questions and answers in ${detectedLanguage}. The questions and answers must be in the same language as the input document (${detectedLanguage}).`;

    // Call OpenAI to extract structured data
    let openAIResponse;
    let openAIError = null;
    
    try {
      openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert at extracting training data from documents. 
              
              Given a document, extract:
              1. A descriptive title for the document
              2. Any source links mentioned in the document (as an array)
              3. Question-answer pairs that would be useful for training an AI model
              
              IMPORTANT: ${languageInstructions}
              
              Return your response as a JSON object with this exact structure:
              {
                "title": "Document title here",
                "source_links": ["url1", "url2"],
                "qa_pairs": [
                  {
                    "question": "Question here?",
                    "answer": "Answer here"
                  }
                ]
              }
              
              Make sure to:
              - Generate multiple relevant question-answer pairs in the same language as the input
              - Extract all URLs mentioned in the document
              - Create a concise but descriptive title
              - Ensure questions are clear and answers are comprehensive
              - Maintain the original language throughout (detected as: ${detectedLanguage})`
            },
            {
              role: 'user',
              content: `Please extract training data from this document:\n\n${content}`
            }
          ],
          temperature: 0.1,
        }),
      });

      // Log API usage - success case
      await supabase.rpc('log_api_key_usage', {
        _key_name: 'OPENAI_API_KEY',
        _endpoint: 'chat/completions',
        _success: openAIResponse.ok
      });

    } catch (fetchError) {
      console.error('OpenAI API fetch error:', fetchError);
      openAIError = fetchError.message;
      
      // Log API usage - error case
      await supabase.rpc('log_api_key_usage', {
        _key_name: 'OPENAI_API_KEY',
        _endpoint: 'chat/completions',
        _success: false,
        _error_message: fetchError.message
      });
      
      throw fetchError;
    }

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      
      // Log API usage - API error case
      await supabase.rpc('log_api_key_usage', {
        _key_name: 'OPENAI_API_KEY',
        _endpoint: 'chat/completions',
        _success: false,
        _error_message: `HTTP ${openAIResponse.status}: ${errorText}`
      });
      
      // Handle specific error types
      if (openAIResponse.status === 429) {
        throw new Error('OpenAI quota exceeded. Please check your OpenAI billing and usage limits at https://platform.openai.com/account/billing');
      } else if (openAIResponse.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key configuration in the API Keys management page.');
      } else {
        throw new Error(`OpenAI API error (${openAIResponse.status}): ${errorText}`);
      }
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response:', openAIData);

    const extractedContent = openAIData.choices[0].message.content;
    console.log('Extracted content:', extractedContent);

    // Parse the JSON response from OpenAI
    let parsedData;
    try {
      parsedData = JSON.parse(extractedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse extracted data from OpenAI response');
    }

    // Insert the training document
    const { data: trainingDoc, error: docError } = await supabase
      .from('training_documents')
      .insert({
        title: parsedData.title,
        original_content: content,
        source_links: parsedData.source_links || [],
        submitter_id: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (docError) {
      console.error('Error inserting training document:', docError);
      throw docError;
    }

    console.log('Created training document:', trainingDoc.id);

    // Insert the training data (Q&A pairs)
    if (parsedData.qa_pairs && parsedData.qa_pairs.length > 0) {
      const trainingDataInserts = parsedData.qa_pairs.map((qa: any) => ({
        training_document_id: trainingDoc.id,
        question: qa.question,
        answer: qa.answer
      }));

      const { data: trainingData, error: dataError } = await supabase
        .from('training_data')
        .insert(trainingDataInserts)
        .select();

      if (dataError) {
        console.error('Error inserting training data:', dataError);
        throw dataError;
      }

      console.log(`Created ${trainingData.length} Q&A pairs in ${detectedLanguage}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        document_id: trainingDoc.id,
        title: parsedData.title,
        qa_count: parsedData.qa_pairs?.length || 0,
        source_links: parsedData.source_links || [],
        language: detectedLanguage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in process-training-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
