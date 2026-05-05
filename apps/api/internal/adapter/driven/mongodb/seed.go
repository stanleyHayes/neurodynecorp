package mongodb

import (
	"context"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/pkg/logger"
)

func SeedQuestions(ctx context.Context, repo *QuestionRepository, log *logger.Logger) error {
	existing, _ := repo.GetAll(ctx)
	if len(existing) > 0 {
		log.Info().Int("count", len(existing)).Msg("questions already seeded, skipping")
		return nil
	}

	questions := []*entity.Question{
		// General questions (always shown)
		{ID: "q1", Text: "What are you building?", Type: entity.QuestionTypeMultiChoice, Options: []string{"Web App", "Mobile App", "AI System", "Blockchain Platform"}, Required: true, Order: 1, Category: "general", HelpText: "Select the primary type of your project"},
		{ID: "q2", Text: "Give us a brief description of your project", Type: entity.QuestionTypeFreeText, Required: true, Order: 2, Category: "general", HelpText: "Describe your idea in a few sentences"},
		{ID: "q3", Text: "Who are the main user roles in your system?", Type: entity.QuestionTypeFreeText, Required: true, Order: 3, Category: "general", HelpText: "e.g., Admin, Customer, Vendor, Manager"},
		{ID: "q4", Text: "What third-party integrations do you need?", Type: entity.QuestionTypeFreeText, Required: false, Order: 4, Category: "general", HelpText: "e.g., Stripe, Google Maps, Twilio, Salesforce"},
		{ID: "q5", Text: "Do you have any design preferences or references?", Type: entity.QuestionTypeFreeText, Required: false, Order: 5, Category: "general", HelpText: "Links to designs you like, brand guidelines, etc."},
		{ID: "q6", Text: "Do you have any existing documents or wireframes?", Type: entity.QuestionTypeBoolean, Required: false, Order: 6, Category: "general"},

		// Mobile-specific questions
		{ID: "q_mobile_platform", Text: "Which platforms do you need?", Type: entity.QuestionTypeMultiChoice, Options: []string{"iOS", "Android", "Both"}, Required: true, Order: 10, Category: "mobile", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "Mobile App"}, HelpText: "Select all target platforms"},
		{ID: "q_mobile_auth", Text: "Is authentication required?", Type: entity.QuestionTypeBoolean, Required: true, Order: 11, Category: "mobile", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "Mobile App"}},
		{ID: "q_mobile_push", Text: "Do you need push notifications?", Type: entity.QuestionTypeBoolean, Required: true, Order: 12, Category: "mobile", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "Mobile App"}},
		{ID: "q_mobile_offline", Text: "Do you need offline capability?", Type: entity.QuestionTypeBoolean, Required: true, Order: 13, Category: "mobile", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "Mobile App"}},

		// AI-specific questions
		{ID: "q_ai_type", Text: "What type of AI system?", Type: entity.QuestionTypeDropdown, Options: []string{"Prediction", "NLP", "Computer Vision"}, Required: true, Order: 10, Category: "ai", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "AI System"}, HelpText: "Select the primary AI capability"},
		{ID: "q_ai_dataset", Text: "Do you have a dataset available?", Type: entity.QuestionTypeBoolean, Required: true, Order: 11, Category: "ai", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "AI System"}},
		{ID: "q_ai_training", Text: "Is custom model training required?", Type: entity.QuestionTypeBoolean, Required: true, Order: 12, Category: "ai", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "AI System"}},

		// Web App-specific questions
		{ID: "q_web_auth", Text: "What authentication method do you prefer?", Type: entity.QuestionTypeDropdown, Options: []string{"Email/Password", "Social Login (Google, GitHub)", "SSO/SAML", "Multi-factor"}, Required: true, Order: 10, Category: "web", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "Web App"}},
		{ID: "q_web_realtime", Text: "Do you need real-time features (chat, notifications, live updates)?", Type: entity.QuestionTypeBoolean, Required: true, Order: 11, Category: "web", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "Web App"}},

		// Blockchain-specific questions
		{ID: "q_blockchain_chain", Text: "Which blockchain network?", Type: entity.QuestionTypeDropdown, Options: []string{"Ethereum", "Solana", "Polygon", "Other"}, Required: true, Order: 10, Category: "blockchain", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "Blockchain Platform"}},
		{ID: "q_blockchain_smart", Text: "Do you need smart contracts?", Type: entity.QuestionTypeBoolean, Required: true, Order: 11, Category: "blockchain", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "Blockchain Platform"}},
		{ID: "q_blockchain_token", Text: "Is tokenomics/token creation needed?", Type: entity.QuestionTypeBoolean, Required: false, Order: 12, Category: "blockchain", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "Blockchain Platform"}},

		// Budget and timeline (always shown, at the end)
		{ID: "q_budget", Text: "What is your budget range?", Type: entity.QuestionTypeBudgetSelect, Options: []string{"$10,000 - $25,000", "$25,000 - $50,000", "$50,000 - $100,000", "$100,000 - $250,000", "$250,000+"}, Required: true, Order: 90, Category: "budget"},
		{ID: "q_timeline", Text: "What is your preferred timeline?", Type: entity.QuestionTypeTimelineSelect, Options: []string{"1-2 months", "2-4 months", "4-6 months", "6-12 months", "12+ months"}, Required: true, Order: 91, Category: "budget"},
		{ID: "q_urgency", Text: "How urgent is this project?", Type: entity.QuestionTypeDropdown, Options: []string{"Not urgent - flexible timeline", "Moderate - within the quarter", "Urgent - ASAP", "Critical - has a hard deadline"}, Required: true, Order: 92, Category: "budget"},
	}

	for _, q := range questions {
		if err := repo.Upsert(ctx, q); err != nil {
			log.Error().Err(err).Str("question_id", q.ID).Msg("failed to seed question")
			return err
		}
	}

	log.Info().Int("count", len(questions)).Msg("questionnaire questions seeded")
	return nil
}
