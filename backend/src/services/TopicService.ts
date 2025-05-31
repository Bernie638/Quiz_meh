import { TopicModel, Topic } from '../models/Topic';

export interface TopicResponse {
  id: string;
  name: string;
  description?: string;
  category: string;
  questionCount: number;
}

export class TopicService {
  static async getAllTopics(): Promise<TopicResponse[]> {
    const topics = await TopicModel.findAll();
    
    return topics.map(topic => ({
      id: topic.slug,
      name: topic.name,
      description: topic.description,
      category: topic.category,
      questionCount: topic.question_count
    }));
  }

  static async getTopicBySlug(slug: string): Promise<TopicResponse | null> {
    const topic = await TopicModel.findBySlug(slug);
    
    if (!topic) {
      return null;
    }

    return {
      id: topic.slug,
      name: topic.name,
      description: topic.description,
      category: topic.category,
      questionCount: topic.question_count
    };
  }

  static async getTopicsWithStats(): Promise<{
    topics: TopicResponse[];
    summary: {
      totalTopics: number;
      totalQuestions: number;
      categories: Record<string, number>;
    };
  }> {
    const topics = await TopicModel.findWithQuestionCounts();
    const stats = await TopicModel.getTopicStats();

    const topicResponses = topics.map(topic => ({
      id: topic.slug,
      name: topic.name,
      description: topic.description,
      category: topic.category,
      questionCount: topic.question_count
    }));

    // Calculate category distribution
    const categories: Record<string, number> = {};
    topics.forEach(topic => {
      categories[topic.category] = (categories[topic.category] || 0) + 1;
    });

    return {
      topics: topicResponses,
      summary: {
        totalTopics: topics.length,
        totalQuestions: Number(stats.total_questions) || 0,
        categories
      }
    };
  }

  static async validateTopicSlugs(slugs: string[]): Promise<{
    valid: string[];
    invalid: string[];
    topicIds: number[];
  }> {
    const topics = await TopicModel.findAll();
    const validSlugs = new Set(topics.map(t => t.slug));
    const slugToId = new Map(topics.map(t => [t.slug, t.id]));

    const valid: string[] = [];
    const invalid: string[] = [];
    const topicIds: number[] = [];

    for (const slug of slugs) {
      if (validSlugs.has(slug)) {
        valid.push(slug);
        const id = slugToId.get(slug);
        if (id) topicIds.push(id);
      } else {
        invalid.push(slug);
      }
    }

    return { valid, invalid, topicIds };
  }
}