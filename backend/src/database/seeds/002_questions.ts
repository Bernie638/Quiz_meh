import { Knex } from 'knex';
import * as fs from 'fs';
import * as path from 'path';

interface ExtractedQuestion {
  id: number;
  topic: string;
  page: number;
  questionStem: {
    text: string;
    formatting: any;
    multiline: boolean;
  };
  givenInformation: {
    hasTable: boolean;
    columns: string[];
    rows: string[][];
    rawText: string[];
  };
  answerChoices: {
    hasHeaders: boolean;
    format: string;
    choices: Array<{
      letter: string;
      text: string;
      formatting: any;
      multiline: boolean;
    }>;
  };
  correctAnswer: string;
  images: Array<{
    filename: string;
    page: number;
    position: string;
  }>;
  rawContent?: string[];
}

interface ExtractedData {
  questions: ExtractedQuestion[];
  topics: string[];
  total_questions: number;
  extraction_metadata: any;
}

// Topic name to slug mapping
const TOPIC_MAPPING: Record<string, string> = {
  'Basic Energy Concepts': 'basic-energy-concepts',
  'Bkrs, Rlys, and Disconnects': 'breakers-relays-disconnects',
  'Control Rods': 'control-rods',
  'Controllers and Positioners': 'controllers-positioners',
  'Core Thermal Limits': 'core-thermal-limits',
  'Demins and Ion Exchange': 'demins-ion-exchange',
  'Fluid Statics and Dynamics': 'fluid-statics-dynamics',
  'Heat Exchangers': 'heat-exchangers',
  'Heat Transfer': 'heat-transfer',
  'Motors and Generators': 'motors-generators',
  'Neutron Life Cycle': 'neutron-life-cycle',
  'Neutrons': 'neutrons',
  'Pumps': 'pumps',
  'Reactivity Coefficients': 'reactivity-coefficients',
  'Reactor Kinetics and Neutron Sources': 'reactor-kinetics-neutron-sources',
  'Reactor Operational Physics': 'reactor-operational-physics',
  'Sensors and Detectors': 'sensors-detectors',
  'Thermal Hydraulics': 'thermal-hydraulics',
  'Thermodynamic Cycles': 'thermodynamic-cycles',
  'Thermodynamic Processes': 'thermodynamic-processes',
  'Thermodynamic Units and Properties': 'thermodynamic-units-properties',
  'Valves': 'valves'
};

export async function seed(knex: Knex): Promise<void> {
  console.log('🔄 Loading question data...');
  
  // Delete existing questions
  await knex('questions').del();
  
  // Load extracted question data
  const dataPath = path.join(__dirname, '../../../data/questions.json');
  
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Question data file not found at: ${dataPath}`);
  }
  
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const extractedData: ExtractedData = JSON.parse(rawData);
  
  console.log(`📊 Found ${extractedData.questions.length} questions to import`);
  
  // Get topic ID mapping
  const topics = await knex('topics').select('id', 'slug', 'name');
  const topicIdMap: Record<string, number> = {};
  
  for (const topic of topics) {
    topicIdMap[topic.slug] = topic.id;
  }
  
  // Convert extracted questions to database format
  const questionsToInsert = [];
  let processedCount = 0;
  
  for (const extractedQuestion of extractedData.questions) {
    try {
      // Find topic ID
      const topicSlug = TOPIC_MAPPING[extractedQuestion.topic];
      const topicId = topicIdMap[topicSlug];
      
      if (!topicId) {
        console.warn(`⚠️  Unknown topic: ${extractedQuestion.topic} for question ${extractedQuestion.id}`);
        continue;
      }
      
      // Validate question has required fields
      if (!extractedQuestion.questionStem?.text || 
          !extractedQuestion.answerChoices?.choices || 
          extractedQuestion.answerChoices.choices.length !== 4 ||
          !extractedQuestion.correctAnswer) {
        console.warn(`⚠️  Invalid question data for question ${extractedQuestion.id}`);
        continue;
      }
      
      const questionData = {
        original_id: extractedQuestion.id,
        topic_id: topicId,
        page_number: extractedQuestion.page,
        question_text: extractedQuestion.questionStem.text,
        question_formatting: JSON.stringify(extractedQuestion.questionStem.formatting || {}),
        question_multiline: extractedQuestion.questionStem.multiline || false,
        has_given_info: extractedQuestion.givenInformation?.rawText?.length > 0 || false,
        given_info_table: JSON.stringify({
          hasTable: extractedQuestion.givenInformation?.hasTable || false,
          columns: extractedQuestion.givenInformation?.columns || [],
          rows: extractedQuestion.givenInformation?.rows || []
        }),
        given_info_raw: JSON.stringify(extractedQuestion.givenInformation?.rawText || []),
        choices: JSON.stringify(extractedQuestion.answerChoices.choices),
        correct_answer: extractedQuestion.correctAnswer,
        images: JSON.stringify(extractedQuestion.images || []),
        raw_content: JSON.stringify(extractedQuestion.rawContent || [])
      };
      
      questionsToInsert.push(questionData);
      processedCount++;
      
      if (processedCount % 100 === 0) {
        console.log(`📝 Processed ${processedCount} questions...`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing question ${extractedQuestion.id}:`, error);
    }
  }
  
  console.log(`💾 Inserting ${questionsToInsert.length} questions into database...`);
  
  // Insert questions in batches
  const batchSize = 500;
  for (let i = 0; i < questionsToInsert.length; i += batchSize) {
    const batch = questionsToInsert.slice(i, i + batchSize);
    await knex('questions').insert(batch);
    console.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(questionsToInsert.length / batchSize)}`);
  }
  
  console.log(`✅ Successfully imported ${questionsToInsert.length} questions`);
  
  // Update topic question counts
  console.log('🔄 Updating topic question counts...');
  
  for (const topic of topics) {
    const count = await knex('questions')
      .where({ topic_id: topic.id })
      .count('* as count')
      .first();
    
    await knex('topics')
      .where({ id: topic.id })
      .update({ question_count: count?.count || 0 });
  }
  
  console.log('✅ Topic question counts updated');
  
  // Generate summary
  const summary = await knex('questions')
    .select('topics.name as topic_name')
    .count('questions.id as question_count')
    .join('topics', 'questions.topic_id', 'topics.id')
    .groupBy('topics.id', 'topics.name')
    .orderBy('topics.name');
  
  console.log('\n📊 Import Summary:');
  console.log('==================');
  for (const item of summary) {
    console.log(`${item.topic_name}: ${item.question_count} questions`);
  }
  
  const totalQuestions = summary.reduce((sum, item) => sum + Number(item.question_count), 0);
  console.log(`\nTotal: ${totalQuestions} questions imported`);
}