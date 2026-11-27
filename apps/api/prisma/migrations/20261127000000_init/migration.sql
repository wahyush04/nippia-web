-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'CONTENT_PARTNER', 'HOST_OPERATOR', 'EVENT_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "LiveEventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'WAITING_ROOM', 'COUNTDOWN', 'LIVE', 'FINALIZING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LiveEventVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "LiveEventType" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionOrderStatus" AS ENUM ('PENDING', 'PAID', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PartnerCommissionStatus" AS ENUM ('EARNED', 'PAID_OUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LiveRegistrationStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'CANCELLED', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "LiveSessionStatus" AS ENUM ('WAITING', 'READY', 'IN_PROGRESS', 'SUBMITTED', 'TIME_EXPIRED', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "LiveConnectionStatus" AS ENUM ('OFFLINE', 'ONLINE', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "LiveReviewPolicy" AS ENUM ('IMMEDIATE', 'DELAYED', 'DISABLED');

-- CreateEnum
CREATE TYPE "SubjectCode" AS ENUM ('TWK', 'TIU', 'TKP');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PracticeMode" AS ENUM ('PRACTICE', 'EXAM');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MasteryLevel" AS ENUM ('MASTERED', 'GOOD', 'DEVELOPING', 'NEEDS_IMPROVEMENT', 'INSUFFICIENT_DATA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "googleEmail" TEXT,
    "avatarUrl" TEXT,
    "authProvider" TEXT NOT NULL DEFAULT 'LOCAL',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "targetAgency" TEXT,
    "experienceLevel" TEXT,
    "targetExamDate" TIMESTAMP(3),
    "dailyStudyMinutes" INTEGER NOT NULL DEFAULT 45,
    "targetScore" INTEGER NOT NULL DEFAULT 380,
    "confidenceTwk" INTEGER NOT NULL DEFAULT 3,
    "confidenceTiu" INTEGER NOT NULL DEFAULT 3,
    "confidenceTkp" INTEGER NOT NULL DEFAULT 3,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "levelName" TEXT NOT NULL DEFAULT 'Pemula',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyTwkTarget" INTEGER NOT NULL DEFAULT 10,
    "dailyTiuTarget" INTEGER NOT NULL DEFAULT 10,
    "dailyTkpTarget" INTEGER NOT NULL DEFAULT 10,
    "preferredStudyDays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
    "isLeaderboardPublic" BOOLEAN NOT NULL DEFAULT true,
    "showQuickTricks" BOOLEAN NOT NULL DEFAULT true,
    "disabilityExtraTime" BOOLEAN NOT NULL DEFAULT false,
    "emailReminders" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "code" "SubjectCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtopics" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "subtopics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "packageCode" TEXT NOT NULL DEFAULT 'PAKET_1',
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "subtopicId" TEXT,
    "questionType" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'MEDIUM',
    "stem" TEXT NOT NULL,
    "visualSpec" JSONB,
    "explanation" TEXT NOT NULL,
    "conceptSummary" TEXT,
    "stepByStep" JSONB,
    "whyOthersWrong" JSONB,
    "quickTrick" TEXT,
    "commonMistakes" TEXT,
    "studyTip" TEXT,
    "status" "QuestionStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionKey" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "scoreValue" INTEGER NOT NULL DEFAULT 0,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "optionFeedback" TEXT,
    "visualSpec" JSONB,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_references" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "question_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_versions" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changedBy" TEXT,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scoring_configurations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "isOfficialStyle" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "sourceReference" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 100,
    "disabilityMins" INTEGER NOT NULL DEFAULT 130,
    "twkQuestionCount" INTEGER NOT NULL DEFAULT 30,
    "tiuQuestionCount" INTEGER NOT NULL DEFAULT 35,
    "tkpQuestionCount" INTEGER NOT NULL DEFAULT 45,
    "twkCorrectPoints" INTEGER NOT NULL DEFAULT 5,
    "twkWrongPoints" INTEGER NOT NULL DEFAULT 0,
    "tiuCorrectPoints" INTEGER NOT NULL DEFAULT 5,
    "tiuWrongPoints" INTEGER NOT NULL DEFAULT 0,
    "tkpMinPoints" INTEGER NOT NULL DEFAULT 1,
    "tkpMaxPoints" INTEGER NOT NULL DEFAULT 5,
    "unansweredPoints" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scoring_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passing_grade_configurations" (
    "id" TEXT NOT NULL,
    "scoringConfigId" TEXT NOT NULL,
    "formationType" TEXT NOT NULL DEFAULT 'UMUM',
    "year" INTEGER NOT NULL,
    "twkThreshold" INTEGER NOT NULL DEFAULT 65,
    "tiuThreshold" INTEGER NOT NULL DEFAULT 80,
    "tkpThreshold" INTEGER NOT NULL DEFAULT 166,
    "totalThreshold" INTEGER,
    "sourceDocument" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passing_grade_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "mode" "PracticeMode" NOT NULL DEFAULT 'PRACTICE',
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "title" TEXT NOT NULL,
    "topicId" TEXT,
    "subjectCode" "SubjectCode",
    "campaignUnit" INTEGER,
    "questionIds" TEXT[],
    "totalQuestions" INTEGER NOT NULL,
    "answeredCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "earnedScore" INTEGER NOT NULL DEFAULT 0,
    "maxScore" INTEGER NOT NULL DEFAULT 0,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "timeLimitSec" INTEGER,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_unit_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectCode" "SubjectCode" NOT NULL,
    "unitNumber" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "bestCorrect" INTEGER NOT NULL DEFAULT 0,
    "bestAccuracy" INTEGER NOT NULL DEFAULT 0,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "lastSessionId" TEXT,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_unit_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_answers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedKey" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "scoreEarned" INTEGER NOT NULL DEFAULT 0,
    "maxScore" INTEGER NOT NULL DEFAULT 5,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examination_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scoringConfigId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isOfficialStyle" BOOLEAN NOT NULL DEFAULT true,
    "formationType" TEXT NOT NULL DEFAULT 'UMUM',
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "questionIds" TEXT[],
    "durationSec" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "submissionToken" TEXT,
    "twkScore" INTEGER NOT NULL DEFAULT 0,
    "tiuScore" INTEGER NOT NULL DEFAULT 0,
    "tkpScore" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "twkPassed" BOOLEAN,
    "tiuPassed" BOOLEAN,
    "tkpPassed" BOOLEAN,
    "overallPassed" BOOLEAN,
    "twkMaxScore" INTEGER NOT NULL DEFAULT 150,
    "tiuMaxScore" INTEGER NOT NULL DEFAULT 175,
    "tkpMaxScore" INTEGER NOT NULL DEFAULT 225,
    "totalMaxScore" INTEGER NOT NULL DEFAULT 550,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "scoringSnapshot" JSONB,

    CONSTRAINT "examination_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examination_answers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "selectedKey" TEXT,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "scoreEarned" INTEGER NOT NULL DEFAULT 0,
    "maxScore" INTEGER NOT NULL DEFAULT 5,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examination_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "targetCount" INTEGER NOT NULL,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "twkTarget" INTEGER NOT NULL DEFAULT 10,
    "tiuTarget" INTEGER NOT NULL DEFAULT 10,
    "tkpTarget" INTEGER NOT NULL DEFAULT 10,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "studyTimeSec" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "simulationsDone" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectCode" "SubjectCode" NOT NULL,
    "totalAnswered" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "maxPossibleScore" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSec" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_mastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "accuracyPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgTimeSec" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "masteryLevel" "MasteryLevel" NOT NULL DEFAULT 'INSUFFICIENT_DATA',
    "lastPracticedAt" TIMESTAMP(3),
    "nextReviewDueAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_mastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_notebooks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "lastSelectedKey" TEXT,
    "wrongCount" INTEGER NOT NULL DEFAULT 1,
    "reviewStage" INTEGER NOT NULL DEFAULT 0,
    "isMastered" BOOLEAN NOT NULL DEFAULT false,
    "personalNote" TEXT,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextReviewAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "error_notebooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetExamDate" TIMESTAMP(3),
    "dailyMinutes" INTEGER NOT NULL DEFAULT 45,
    "targetScore" INTEGER NOT NULL DEFAULT 380,
    "preferredDays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plan_tasks" (
    "id" TEXT NOT NULL,
    "studyPlanId" TEXT NOT NULL,
    "scheduledDate" TEXT NOT NULL,
    "dayLabel" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "subjectCode" "SubjectCode",
    "topicSlug" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL DEFAULT 10,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "study_plan_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_materials" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "contentMd" TEXT NOT NULL,
    "keyPoints" JSONB,
    "formulas" JSONB,
    "readMinutes" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "hint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "isMastered" BOOLEAN NOT NULL DEFAULT false,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "category" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_xp_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "refId" TEXT,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_xp_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TEXT,
    "historyDates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Sesi Tutor AI SKD',
    "contextId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "citations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "hostName" TEXT NOT NULL DEFAULT 'Tim Akademik Nippia',
    "eventStatus" "LiveEventStatus" NOT NULL DEFAULT 'DRAFT',
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "pausedAt" TIMESTAMP(3),
    "totalPausedSeconds" INTEGER NOT NULL DEFAULT 0,
    "registrationStartAt" TIMESTAMP(3) NOT NULL,
    "registrationEndAt" TIMESTAMP(3) NOT NULL,
    "scheduledStartAt" TIMESTAMP(3) NOT NULL,
    "actualStartAt" TIMESTAMP(3),
    "deadlineAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 6000,
    "maxParticipants" INTEGER NOT NULL DEFAULT 1000,
    "visibility" "LiveEventVisibility" NOT NULL DEFAULT 'PUBLIC',
    "eventType" "LiveEventType" NOT NULL DEFAULT 'FREE',
    "packageCode" TEXT NOT NULL DEFAULT 'ALL',
    "twkCount" INTEGER NOT NULL DEFAULT 30,
    "tiuCount" INTEGER NOT NULL DEFAULT 35,
    "tkpCount" INTEGER NOT NULL DEFAULT 45,
    "difficultyMix" TEXT NOT NULL DEFAULT 'BALANCED',
    "scoringConfigId" TEXT,
    "randomizeOptions" BOOLEAN NOT NULL DEFAULT true,
    "leaderboardPublished" BOOLEAN NOT NULL DEFAULT false,
    "reviewPolicy" "LiveReviewPolicy" NOT NULL DEFAULT 'IMMEDIATE',
    "reviewUnlockAt" TIMESTAMP(3),
    "rulesMd" TEXT,
    "eligibilityText" TEXT,
    "faqJson" JSONB,
    "snapshotFrozenAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_event_registrations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registrationStatus" "LiveRegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "readyAt" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "disqualifiedReason" TEXT,

    CONSTRAINT "live_event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_event_question_sets" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionOrder" INTEGER NOT NULL,
    "subject" "SubjectCode" NOT NULL,
    "topic" TEXT NOT NULL,
    "questionSnapshot" JSONB NOT NULL,
    "scoringSnapshot" JSONB NOT NULL,

    CONSTRAINT "live_event_question_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_event_sessions" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionStatus" "LiveSessionStatus" NOT NULL DEFAULT 'WAITING',
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "completionReason" TEXT,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectionStatus" "LiveConnectionStatus" NOT NULL DEFAULT 'OFFLINE',
    "optionSeed" TEXT,
    "optionOrderMap" JSONB,
    "reconnectCount" INTEGER NOT NULL DEFAULT 0,
    "visibilityViolations" INTEGER NOT NULL DEFAULT 0,
    "submissionToken" TEXT,

    CONSTRAINT "live_event_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_event_answers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "answerRevision" INTEGER NOT NULL DEFAULT 1,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scoreAwarded" INTEGER,
    "isCorrect" BOOLEAN,

    CONSTRAINT "live_event_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_event_results" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "twkScore" INTEGER NOT NULL,
    "tiuScore" INTEGER NOT NULL,
    "tkpScore" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 550,
    "twkCorrect" INTEGER NOT NULL DEFAULT 0,
    "twkWrong" INTEGER NOT NULL DEFAULT 0,
    "twkUnanswered" INTEGER NOT NULL DEFAULT 0,
    "tiuCorrect" INTEGER NOT NULL DEFAULT 0,
    "tiuWrong" INTEGER NOT NULL DEFAULT 0,
    "tiuUnanswered" INTEGER NOT NULL DEFAULT 0,
    "tkpAnswered" INTEGER NOT NULL DEFAULT 0,
    "tkpUnanswered" INTEGER NOT NULL DEFAULT 0,
    "overallPassed" BOOLEAN,
    "completionTimeSeconds" INTEGER NOT NULL,
    "topicBreakdown" JSONB,
    "difficultyBreakdown" JSONB,
    "finalizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ranking" INTEGER,
    "percentile" DOUBLE PRECISION,

    CONSTRAINT "live_event_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_event_announcements" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_event_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_event_notifications" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'DELIVERED',
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "live_event_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_event_audit_logs" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_event_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_leaderboard_snapshots" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rankingData" JSONB NOT NULL,
    "totalParticipants" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "highestScore" INTEGER NOT NULL DEFAULT 0,
    "lowestScore" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_leaderboard_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceIdr" INTEGER NOT NULL,
    "originalIdr" INTEGER,
    "durationDays" INTEGER NOT NULL DEFAULT 30,
    "features" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'ORDER',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_orders" (
    "id" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amountIdr" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'QRIS',
    "status" "SubscriptionOrderStatus" NOT NULL DEFAULT 'PENDING',
    "snapToken" TEXT,
    "snapRedirectUrl" TEXT,
    "gatewayTransactionId" TEXT,
    "gatewayStatus" TEXT,
    "gatewayRawPayload" JSONB,
    "paymentProofNote" TEXT,
    "paidAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "voucherId" TEXT,
    "voucherCode" TEXT,
    "discountIdr" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "subscription_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_vouchers" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountIdr" INTEGER NOT NULL DEFAULT 4000,
    "commissionIdr" INTEGER NOT NULL DEFAULT 5000,
    "newUsersOnly" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_commissions" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "buyerUserId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderAmountIdr" INTEGER NOT NULL,
    "discountGivenIdr" INTEGER NOT NULL,
    "commissionIdr" INTEGER NOT NULL,
    "status" "PartnerCommissionStatus" NOT NULL DEFAULT 'EARNED',
    "payoutNote" TEXT,
    "paidOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE INDEX "topics_subjectId_idx" ON "topics"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "subtopics_topicId_name_key" ON "subtopics"("topicId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "questions_code_key" ON "questions"("code");

-- CreateIndex
CREATE INDEX "questions_subjectId_topicId_difficulty_status_idx" ON "questions"("subjectId", "topicId", "difficulty", "status");

-- CreateIndex
CREATE INDEX "questions_packageCode_idx" ON "questions"("packageCode");

-- CreateIndex
CREATE INDEX "question_options_questionId_idx" ON "question_options"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "question_options_questionId_optionKey_key" ON "question_options"("questionId", "optionKey");

-- CreateIndex
CREATE INDEX "question_references_questionId_idx" ON "question_references"("questionId");

-- CreateIndex
CREATE INDEX "question_versions_questionId_idx" ON "question_versions"("questionId");

-- CreateIndex
CREATE INDEX "scoring_configurations_isActive_year_idx" ON "scoring_configurations"("isActive", "year");

-- CreateIndex
CREATE INDEX "passing_grade_configurations_scoringConfigId_formationType_idx" ON "passing_grade_configurations"("scoringConfigId", "formationType");

-- CreateIndex
CREATE INDEX "practice_sessions_userId_status_startedAt_idx" ON "practice_sessions"("userId", "status", "startedAt");

-- CreateIndex
CREATE INDEX "practice_sessions_userId_sessionType_subjectCode_campaignUn_idx" ON "practice_sessions"("userId", "sessionType", "subjectCode", "campaignUnit");

-- CreateIndex
CREATE INDEX "campaign_unit_progress_userId_subjectCode_idx" ON "campaign_unit_progress"("userId", "subjectCode");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_unit_progress_userId_subjectCode_unitNumber_key" ON "campaign_unit_progress"("userId", "subjectCode", "unitNumber");

-- CreateIndex
CREATE INDEX "practice_answers_userId_questionId_idx" ON "practice_answers"("userId", "questionId");

-- CreateIndex
CREATE INDEX "practice_answers_userId_answeredAt_idx" ON "practice_answers"("userId", "answeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "practice_answers_sessionId_questionId_key" ON "practice_answers"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "examination_sessions_submissionToken_key" ON "examination_sessions"("submissionToken");

-- CreateIndex
CREATE INDEX "examination_sessions_userId_status_startedAt_idx" ON "examination_sessions"("userId", "status", "startedAt");

-- CreateIndex
CREATE INDEX "examination_answers_sessionId_orderIndex_idx" ON "examination_answers"("sessionId", "orderIndex");

-- CreateIndex
CREATE INDEX "examination_answers_userId_questionId_idx" ON "examination_answers"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "examination_answers_sessionId_questionId_key" ON "examination_answers"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_goals_userId_date_key" ON "daily_goals"("userId", "date");

-- CreateIndex
CREATE INDEX "daily_activities_userId_date_idx" ON "daily_activities"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activities_userId_date_key" ON "daily_activities"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "learning_progress_userId_subjectCode_key" ON "learning_progress"("userId", "subjectCode");

-- CreateIndex
CREATE INDEX "topic_mastery_userId_masteryLevel_idx" ON "topic_mastery"("userId", "masteryLevel");

-- CreateIndex
CREATE UNIQUE INDEX "topic_mastery_userId_topicId_key" ON "topic_mastery"("userId", "topicId");

-- CreateIndex
CREATE INDEX "error_notebooks_userId_isMastered_nextReviewAt_idx" ON "error_notebooks"("userId", "isMastered", "nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "error_notebooks_userId_questionId_key" ON "error_notebooks"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_questionId_key" ON "bookmarks"("userId", "questionId");

-- CreateIndex
CREATE INDEX "study_plans_userId_isActive_idx" ON "study_plans"("userId", "isActive");

-- CreateIndex
CREATE INDEX "study_plan_tasks_studyPlanId_scheduledDate_idx" ON "study_plan_tasks"("studyPlanId", "scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "study_materials_slug_key" ON "study_materials"("slug");

-- CreateIndex
CREATE INDEX "study_materials_subjectId_topicId_idx" ON "study_materials"("subjectId", "topicId");

-- CreateIndex
CREATE INDEX "flashcards_topicId_idx" ON "flashcards"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_progress_userId_flashcardId_key" ON "flashcard_progress"("userId", "flashcardId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "user_xp_transactions_userId_createdAt_idx" ON "user_xp_transactions"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_xp_transactions_userId_source_refId_key" ON "user_xp_transactions"("userId", "source", "refId");

-- CreateIndex
CREATE UNIQUE INDEX "user_streaks_userId_key" ON "user_streaks"("userId");

-- CreateIndex
CREATE INDEX "leaderboard_snapshots_periodKey_rank_idx" ON "leaderboard_snapshots"("periodKey", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_snapshots_userId_periodKey_key" ON "leaderboard_snapshots"("userId", "periodKey");

-- CreateIndex
CREATE INDEX "ai_conversations_userId_updatedAt_idx" ON "ai_conversations"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ai_messages_conversationId_createdAt_idx" ON "ai_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "content_reports_status_createdAt_idx" ON "content_reports"("status", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entity_createdAt_idx" ON "audit_logs"("entity", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "live_events_slug_key" ON "live_events"("slug");

-- CreateIndex
CREATE INDEX "live_events_eventStatus_scheduledStartAt_idx" ON "live_events"("eventStatus", "scheduledStartAt");

-- CreateIndex
CREATE INDEX "live_events_visibility_eventType_idx" ON "live_events"("visibility", "eventType");

-- CreateIndex
CREATE INDEX "live_event_registrations_eventId_registrationStatus_idx" ON "live_event_registrations"("eventId", "registrationStatus");

-- CreateIndex
CREATE INDEX "live_event_registrations_userId_registrationStatus_idx" ON "live_event_registrations"("userId", "registrationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "live_event_registrations_eventId_userId_key" ON "live_event_registrations"("eventId", "userId");

-- CreateIndex
CREATE INDEX "live_event_question_sets_eventId_subject_idx" ON "live_event_question_sets"("eventId", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "live_event_question_sets_eventId_questionOrder_key" ON "live_event_question_sets"("eventId", "questionOrder");

-- CreateIndex
CREATE UNIQUE INDEX "live_event_question_sets_eventId_questionId_key" ON "live_event_question_sets"("eventId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "live_event_sessions_submissionToken_key" ON "live_event_sessions"("submissionToken");

-- CreateIndex
CREATE INDEX "live_event_sessions_eventId_sessionStatus_idx" ON "live_event_sessions"("eventId", "sessionStatus");

-- CreateIndex
CREATE INDEX "live_event_sessions_eventId_connectionStatus_idx" ON "live_event_sessions"("eventId", "connectionStatus");

-- CreateIndex
CREATE UNIQUE INDEX "live_event_sessions_eventId_userId_key" ON "live_event_sessions"("eventId", "userId");

-- CreateIndex
CREATE INDEX "live_event_answers_sessionId_answeredAt_idx" ON "live_event_answers"("sessionId", "answeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "live_event_answers_sessionId_questionId_key" ON "live_event_answers"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "live_event_results_sessionId_key" ON "live_event_results"("sessionId");

-- CreateIndex
CREATE INDEX "live_event_results_eventId_totalScore_completionTimeSeconds_idx" ON "live_event_results"("eventId", "totalScore", "completionTimeSeconds");

-- CreateIndex
CREATE UNIQUE INDEX "live_event_results_eventId_userId_key" ON "live_event_results"("eventId", "userId");

-- CreateIndex
CREATE INDEX "live_event_announcements_eventId_createdAt_idx" ON "live_event_announcements"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "live_event_notifications_userId_deliveredAt_idx" ON "live_event_notifications"("userId", "deliveredAt");

-- CreateIndex
CREATE UNIQUE INDEX "live_event_notifications_eventId_userId_notificationType_key" ON "live_event_notifications"("eventId", "userId", "notificationType");

-- CreateIndex
CREATE INDEX "live_event_audit_logs_eventId_createdAt_idx" ON "live_event_audit_logs"("eventId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "event_leaderboard_snapshots_eventId_key" ON "event_leaderboard_snapshots"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE INDEX "user_subscriptions_userId_status_expiresAt_idx" ON "user_subscriptions"("userId", "status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_orders_orderCode_key" ON "subscription_orders"("orderCode");

-- CreateIndex
CREATE INDEX "subscription_orders_userId_createdAt_idx" ON "subscription_orders"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "subscription_orders_status_createdAt_idx" ON "subscription_orders"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "partner_vouchers_ownerId_key" ON "partner_vouchers"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "partner_vouchers_code_key" ON "partner_vouchers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "partner_commissions_orderId_key" ON "partner_commissions"("orderId");

-- CreateIndex
CREATE INDEX "partner_commissions_partnerId_status_createdAt_idx" ON "partner_commissions"("partnerId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtopics" ADD CONSTRAINT "subtopics_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "subtopics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_references" ADD CONSTRAINT "question_references_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passing_grade_configurations" ADD CONSTRAINT "passing_grade_configurations_scoringConfigId_fkey" FOREIGN KEY ("scoringConfigId") REFERENCES "scoring_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_unit_progress" ADD CONSTRAINT "campaign_unit_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "practice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_sessions" ADD CONSTRAINT "examination_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_sessions" ADD CONSTRAINT "examination_sessions_scoringConfigId_fkey" FOREIGN KEY ("scoringConfigId") REFERENCES "scoring_configurations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_answers" ADD CONSTRAINT "examination_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "examination_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_answers" ADD CONSTRAINT "examination_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_answers" ADD CONSTRAINT "examination_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_goals" ADD CONSTRAINT "daily_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_activities" ADD CONSTRAINT "daily_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_mastery" ADD CONSTRAINT "topic_mastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_mastery" ADD CONSTRAINT "topic_mastery_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_notebooks" ADD CONSTRAINT "error_notebooks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_notebooks" ADD CONSTRAINT "error_notebooks_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plan_tasks" ADD CONSTRAINT "study_plan_tasks_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_materials" ADD CONSTRAINT "study_materials_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_materials" ADD CONSTRAINT "study_materials_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_progress" ADD CONSTRAINT "flashcard_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_progress" ADD CONSTRAINT "flashcard_progress_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_xp_transactions" ADD CONSTRAINT "user_xp_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_events" ADD CONSTRAINT "live_events_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_events" ADD CONSTRAINT "live_events_scoringConfigId_fkey" FOREIGN KEY ("scoringConfigId") REFERENCES "scoring_configurations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_registrations" ADD CONSTRAINT "live_event_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "live_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_registrations" ADD CONSTRAINT "live_event_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_question_sets" ADD CONSTRAINT "live_event_question_sets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "live_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_question_sets" ADD CONSTRAINT "live_event_question_sets_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_sessions" ADD CONSTRAINT "live_event_sessions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "live_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_sessions" ADD CONSTRAINT "live_event_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_answers" ADD CONSTRAINT "live_event_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "live_event_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_results" ADD CONSTRAINT "live_event_results_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "live_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_results" ADD CONSTRAINT "live_event_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_results" ADD CONSTRAINT "live_event_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "live_event_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_announcements" ADD CONSTRAINT "live_event_announcements_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "live_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_announcements" ADD CONSTRAINT "live_event_announcements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_notifications" ADD CONSTRAINT "live_event_notifications_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "live_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_notifications" ADD CONSTRAINT "live_event_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_audit_logs" ADD CONSTRAINT "live_event_audit_logs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "live_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_audit_logs" ADD CONSTRAINT "live_event_audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_leaderboard_snapshots" ADD CONSTRAINT "event_leaderboard_snapshots_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "live_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "user_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "partner_vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_vouchers" ADD CONSTRAINT "partner_vouchers_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commissions" ADD CONSTRAINT "partner_commissions_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "partner_vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commissions" ADD CONSTRAINT "partner_commissions_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commissions" ADD CONSTRAINT "partner_commissions_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commissions" ADD CONSTRAINT "partner_commissions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "subscription_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

