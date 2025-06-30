
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    console.log('Processing content:', content.substring(0, 100) + '...');

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

    // Get default OpenAI API key from database
    const { data: openAIApiKey, error: keyError } = await supabase.rpc('get_default_api_key');

    if (keyError) {
      console.error('Error fetching default API key:', keyError);
      throw new Error('Failed to retrieve default API key from database');
    }

    if (!openAIApiKey) {
      console.error('Default API key not found in database');
      throw new Error('Default API key not configured. Please set a default API key in the API Keys management page.');
    }

    console.log('Retrieved default API key from database');

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
              - Generate multiple relevant question-answer pairs
              - Extract all URLs mentioned in the document
              - Create a concise but descriptive title
              - Ensure questions are clear and answers are comprehensive`
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
      await supabase.rpc('log_default_api_key_usage', {
        _endpoint: 'chat/completions',
        _success: openAIResponse.ok
      });

    } catch (fetchError) {
      console.error('OpenAI API fetch error:', fetchError);
      openAIError = fetchError.message;
      
      // Log API usage - error case
      await supabase.rpc('log_default_api_key_usage', {
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
      await supabase.rpc('log_default_api_key_usage', {
        _endpoint: 'chat/completions',
        _success: false,
        _error_message: `HTTP ${openAIResponse.status}: ${errorText}`
      });
      
      // Handle specific error types
      if (openAIResponse.status === 429) {
        throw new Error('OpenAI quota exceeded. Please check your OpenAI billing and usage limits at https://platform.openai.com/account/billing');
      } else if (openAIResponse.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your default API key configuration in the API Keys management page.');
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

      console.log(`Created ${trainingData.length} Q&A pairs`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        document_id: trainingDoc.id,
        title: parsedData.title,
        qa_count: parsedData.qa_pairs?.length || 0,
        source_links: parsedData.source_links || []
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
