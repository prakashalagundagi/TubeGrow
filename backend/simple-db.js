const fs = require('fs').promises;
const path = require('path');

// Simple file-based database
class SimpleDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, 'data.json');
        this.data = {
            users: [],
            videos: [],
            analytics: {}
        };
    }

    async init() {
        try {
            const data = await fs.readFile(this.dbPath, 'utf8');
            this.data = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, create it
            await this.save();
        }
    }

    async save() {
        await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
    }

    // User operations
    async findUserByEmail(email) {
        return this.data.users.find(user => user.email === email);
    }

    async createUser(userData) {
        const user = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString(),
            subscription: 'free',
            usage: {
                dailySearches: 0,
                monthlySearches: 0,
                lastResetDate: new Date().toISOString()
            }
        };
        this.data.users.push(user);
        await this.save();
        return user;
    }

    async updateUser(userId, updateData) {
        const userIndex = this.data.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            this.data.users[userIndex] = { ...this.data.users[userIndex], ...updateData };
            await this.save();
            return this.data.users[userIndex];
        }
        return null;
    }

    // Video operations
    async createVideo(videoData) {
        const video = {
            id: Date.now().toString(),
            ...videoData,
            createdAt: new Date().toISOString()
        };
        this.data.videos.push(video);
        await this.save();
        return video;
    }

    async getUserVideos(userId) {
        return this.data.videos.filter(video => video.userId === userId);
    }

    // Analytics operations
    async getAnalytics(userId) {
        return this.data.analytics[userId] || {
            totalViews: 125432,
            subscribers: 8234,
            avgWatchTime: '4:32',
            revenue: 2456,
            videos: []
        };
    }

    async updateAnalytics(userId, analyticsData) {
        this.data.analytics[userId] = { ...this.data.analytics[userId], ...analyticsData };
        await this.save();
        return this.data.analytics[userId];
    }
}

module.exports = new SimpleDatabase();
