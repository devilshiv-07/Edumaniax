import prisma from "../../utils/prisma.js";

export const updatePerformance = async (req, res) => {
    const {
        userId, 
        moduleName,            // e.g., "Finance"
        topicName,            // e.g., "budgetExpert" (optional)
        score,
        accuracy,
        avgResponseTimeSec,
        studyTimeMinutes,
        completed,            // boolean: whether user completed the game
    } = req.body;

    if (!userId || !moduleName) {
        return res.status(400).json({ error: 'userId and moduleName are required' });
    }

    try {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // === MODULE PERFORMANCE ===
        const existingModule = await prisma.modulePerformance.findFirst({
            where: { userId, moduleName }
        });

        const moduleUpdate = {
            totalGamesPlayed: (existingModule?.totalGamesPlayed || 0) + 1,
            lastGamePlayedAt: now,
        };

        // Active day check
        const lastActiveStr = existingModule?.lastActiveDate?.toISOString().split('T')[0];
        if (lastActiveStr !== todayStr) {
            moduleUpdate.daysActiveCount = (existingModule?.daysActiveCount || 0) + 1;
            moduleUpdate.lastActiveDate = now;
        }

        // Average score
        const prevCompleted = existingModule?.completedGamesCount || 0;
        const prevAvgScore = existingModule?.averageScorePerGame || 0;
        const prevAccuracy = existingModule?.accuracy || 0;
        const prevAvgTime = existingModule?.avgResponseTimeSec || 0;

        if (typeof score === 'number') {
            const completedCount = completed ? prevCompleted + 1 : prevCompleted;
            moduleUpdate.completedGamesCount = completedCount;
            moduleUpdate.averageScorePerGame =
                (prevAvgScore * prevCompleted + score) / (completedCount || 1);
        }

        if (typeof accuracy === 'number') {
            moduleUpdate.accuracy =
                (prevAccuracy * prevCompleted + accuracy) / (prevCompleted + 1);
        }

        if (typeof avgResponseTimeSec === 'number') {
            moduleUpdate.avgResponseTimeSec =
                (prevAvgTime * prevCompleted + avgResponseTimeSec) / (prevCompleted + 1);
        }

        if (typeof studyTimeMinutes === 'number') {
            moduleUpdate.studyTimeMinutes =
                (existingModule?.studyTimeMinutes || 0) + studyTimeMinutes;
        }

        // Upsert ModulePerformance
        await prisma.modulePerformance.upsert({
            where: { userId_moduleName: { userId, moduleName } }, // composite index
            update: moduleUpdate,
            create: {
                userId,
                moduleName,
                totalGamesPlayed: 1,
                completedGamesCount: completed ? 1 : 0,
                averageScorePerGame: typeof score === 'number' ? score : 0,
                accuracy: typeof accuracy === 'number' ? accuracy : 0,
                avgResponseTimeSec: avgResponseTimeSec || 0,
                studyTimeMinutes: studyTimeMinutes || 0,
                daysActiveCount: 1,
                lastActiveDate: now,
                lastGamePlayedAt: now,
            },
        });

        // === TOPIC PERFORMANCE ===
        // === TOPIC PERFORMANCE ===
        if (topicName) {
            const existingTopic = await prisma.topicPerformance.findFirst({
                where: { userId, moduleName, topicName },
            });

            const prevCompleted = existingTopic?.completedGamesCount || 0;
            const prevAvgScore = existingTopic?.averageScorePerGame || 0;
            const prevAccuracy = existingTopic?.accuracy || 0;

            const completedCount = completed ? prevCompleted + 1 : prevCompleted;

            await prisma.topicPerformance.upsert({
                where: {
                    userId_moduleName_topicName: {
                        userId,
                        moduleName,
                        topicName,
                    },
                },
                update: {
                    completedGamesCount: completedCount,
                    averageScorePerGame: typeof score === 'number'
                        ? (prevAvgScore * prevCompleted + score) / (completedCount || 1)
                        : prevAvgScore,
                    accuracy: typeof accuracy === 'number'
                        ? (prevAccuracy * prevCompleted + accuracy) / (completedCount || 1)
                        : prevAccuracy,
                },
                create: {
                    userId,
                    moduleName,
                    topicName,
                    completedGamesCount: completed ? 1 : 0,
                    averageScorePerGame: typeof score === 'number' ? score : 0,
                    accuracy: typeof accuracy === 'number' ? accuracy : 0,
                },
            });
        }
        res.json({ message: 'Performance updated successfully' });
    } catch (error) {
        console.error('❌ Error updating performance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getUserPerformance = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        const performances = await prisma.modulePerformance.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });

        // Return a map keyed by moduleName for easy client consumption
        const progressMap = {};
        performances.forEach(p => {
            progressMap[p.moduleName] = {
                totalGamesPlayed: p.totalGamesPlayed || 0,
                completedGamesCount: p.completedGamesCount || 0,
                averageScorePerGame: p.averageScorePerGame || 0,
                accuracy: p.accuracy || 0,
                avgResponseTimeSec: p.avgResponseTimeSec || 0,
                studyTimeMinutes: p.studyTimeMinutes || 0,
                daysActiveCount: p.daysActiveCount || 0,
                lastActiveDate: p.lastActiveDate,
                lastGamePlayedAt: p.lastGamePlayedAt,
                updatedAt: p.updatedAt,
            };
        });

        return res.json({ success: true, progress: progressMap });
    } catch (error) {
        console.error('❌ Error fetching user performance:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
