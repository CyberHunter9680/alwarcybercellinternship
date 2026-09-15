"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApplicationId = generateApplicationId;
const db_js_1 = require("../config/db.js");
/**
 * Generates a collision-safe, sequential Application ID
 * Format: APCSIP2026-000001
 */
async function generateApplicationId() {
    const PREFIX = 'APCSIP2026-';
    const PAD_LENGTH = 6;
    try {
        // Atomically increment the sequence counter inside a Prisma transaction
        const counter = await db_js_1.prisma.sequenceCounter.upsert({
            where: { id: 'application_counter' },
            update: {
                currentValue: {
                    increment: 1,
                },
            },
            create: {
                id: 'application_counter',
                currentValue: 1,
            },
        });
        const sequenceNumber = counter.currentValue;
        return `${PREFIX}${sequenceNumber.toString().padStart(PAD_LENGTH, '0')}`;
    }
    catch (error) {
        console.warn('⚠️ Sequence counter transaction failed, using fallback ID generation:', error);
        // Fallback: Check total count + 1 and ensure uniqueness
        const count = await db_js_1.prisma.application.count();
        const nextSeq = count + 1;
        const fallbackId = `${PREFIX}${nextSeq.toString().padStart(PAD_LENGTH, '0')}`;
        // Verify fallback does not collide
        const existing = await db_js_1.prisma.application.findUnique({
            where: { applicationId: fallbackId },
        });
        if (existing) {
            // Add random unique suffix if collision exists
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            return `${PREFIX}${nextSeq.toString().padStart(PAD_LENGTH - 2, '0')}${randomSuffix}`;
        }
        return fallbackId;
    }
}
