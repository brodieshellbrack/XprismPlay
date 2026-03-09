import { db } from '$lib/server/db';
import { adminLog } from '$lib/server/db/schema';
import { redis } from '$lib/server/redis';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export type AdminAction = 'BAN' | 'UNBAN' | 'PROMO_CREATE' | 'PROMO_DELETE';

export async function writeAdminLog(
    adminId: number,
    action: AdminAction,
    targetUserId: number | null,
    details: string | null
) {
    try {
        const [entry] = await db.insert(adminLog).values({
            adminId,
            action,
            targetUserId: targetUserId ?? null,
            details: details ?? null,
        }).returning();

        // Fetch admin and target usernames for the broadcast
        const [adminUser] = await db
            .select({ id: user.id, username: user.username })
            .from(user)
            .where(eq(user.id, adminId))
            .limit(1);

        let targetUser = null;
        if (targetUserId) {
            const [t] = await db
                .select({ id: user.id, username: user.username })
                .from(user)
                .where(eq(user.id, targetUserId))
                .limit(1);
            targetUser = t ?? null;
        }

        const payload = {
            type: 'admin_log',
            data: {
                id: entry.id,
                action,
                adminId,
                adminUsername: adminUser?.username ?? 'Unknown',
                targetUserId: targetUserId ?? null,
                targetUsername: targetUser?.username ?? null,
                details: details ?? null,
                createdAt: entry.createdAt.getTime(),
            }
        };

        await redis.publish('admin:logs', JSON.stringify(payload));
    } catch (e) {
        // Non-fatal — don't let logging failures break the actual action
        console.error('Failed to write admin log:', e);
    }
}
