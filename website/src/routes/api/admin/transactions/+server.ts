import { auth } from '$lib/auth';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { transaction, coin, user } from '$lib/server/db/schema';
import { eq, desc, asc, and, or, ilike, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { hasFlag } from '$lib/data/flags';

export const GET: RequestHandler = async ({ request, url }) => {
	const authSession = await auth.api.getSession({
		headers: request.headers
	});

	if (!authSession?.user) {
		throw error(401, 'Not authenticated');
	}
	const [currentUser] = await db
		.select({ flags: user.flags })
		.from(user)
		.where(eq(user.id, Number(authSession.user.id)))
		.limit(1);
	if (!hasFlag(currentUser.flags ?? 0n, 'IS_ADMIN', 'IS_HEAD_ADMIN'))
		throw error(403, 'Admin access required');

	const searchQuery = (url.searchParams.get('search') || '').trim();
	const typeFilter = url.searchParams.get('type') || 'all';
	const sortBy = url.searchParams.get('sortBy') || 'timestamp';
	const sortOrder = url.searchParams.get('sortOrder') || 'desc';

	// Validate page parameter
	const pageParam = url.searchParams.get('page') || '1';
	const page = parseInt(pageParam);
	if (isNaN(page) || page < 1) {
		throw error(400, 'Invalid page parameter');
	}

	// Validate limit parameter
	const limitParam = url.searchParams.get('limit') || '20';
	const parsedLimit = parseInt(limitParam);
	const limit = isNaN(parsedLimit) ? 20 : Math.min(Math.max(parsedLimit, 1), 50);
	const recipientUser = alias(user, 'recipientUser');

	const senderUser = alias(user, 'senderUser');
	const traderUser = alias(user, 'traderUser');

	const searchTerms = searchQuery.split(/\s+/).filter(Boolean);
	const userTermIndex = searchTerms.findIndex((term) => term.toLowerCase().startsWith('user:'));
	let actorUsernameFilter: string | null = null;
	let actorUserIdFilter: number | null = null;

	if (userTermIndex !== -1) {
		const rawActor = searchTerms[userTermIndex].slice(5).trim();
		const normalizedActor = rawActor.startsWith('@') ? rawActor.slice(1) : rawActor;
		if (normalizedActor) {
			if (/^\d+$/.test(normalizedActor)) {
				actorUserIdFilter = Number(normalizedActor);
			} else {
				actorUsernameFilter = normalizedActor;
			}
		}
		searchTerms.splice(userTermIndex, 1);
	}

	const coinSearchTerm = searchTerms.join(' ').trim();

	const conditions = [];

	if (coinSearchTerm) {
		conditions.push(
			or(ilike(coin.name, `%${coinSearchTerm}%`), ilike(coin.symbol, `%${coinSearchTerm}%`))!
		);
	}

	if (actorUserIdFilter !== null) {
		conditions.push(
			or(
				eq(transaction.userId, actorUserIdFilter),
				eq(transaction.senderUserId, actorUserIdFilter),
				eq(transaction.recipientUserId, actorUserIdFilter)
			)!
		);
	}

	if (actorUsernameFilter) {
		conditions.push(
			or(
				ilike(traderUser.username, actorUsernameFilter),
				ilike(senderUser.username, actorUsernameFilter),
				ilike(recipientUser.username, actorUsernameFilter)
			)!
		);
	}

	if (typeFilter !== 'all') {
		const validTypes = ['BUY', 'SELL', 'BURN', 'TRANSFER_IN', 'TRANSFER_OUT'] as const;
		if (validTypes.includes(typeFilter as any)) {
			conditions.push(eq(transaction.type, typeFilter as (typeof validTypes)[number]));
		} else {
			throw error(400, `Invalid type parameter. Allowed: ${validTypes.join(', ')}`);
		}
	}

	const whereConditions = conditions.length === 1 ? conditions[0] : and(...conditions);

	let sortColumn;
	switch (sortBy) {
		case 'totalBaseCurrencyAmount':
			sortColumn = transaction.totalBaseCurrencyAmount;
			break;
		case 'quantity':
			sortColumn = transaction.quantity;
			break;
		case 'pricePerCoin':
			sortColumn = transaction.pricePerCoin;
			break;
		default:
			sortColumn = transaction.timestamp;
	}

	const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
	const [{ count }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(transaction)
		.innerJoin(coin, eq(transaction.coinId, coin.id))
		.leftJoin(recipientUser, eq(transaction.recipientUserId, recipientUser.id))
		.leftJoin(senderUser, eq(transaction.senderUserId, senderUser.id))
		.leftJoin(traderUser, eq(transaction.userId, traderUser.id))
		.where(whereConditions);

	const transactions = await db
		.select({
			id: transaction.id,
			userId: transaction.userId,
			type: transaction.type,
			quantity: transaction.quantity,
			pricePerCoin: transaction.pricePerCoin,
			totalBaseCurrencyAmount: transaction.totalBaseCurrencyAmount,
			timestamp: transaction.timestamp,
			recipientUserId: transaction.recipientUserId,
			senderUserId: transaction.senderUserId,
			note: transaction.note,
			coin: {
				id: coin.id,
				name: coin.name,
				symbol: coin.symbol,
				icon: coin.icon
			},
			recipientUser: {
				id: recipientUser.id,
				username: recipientUser.username
			},
			senderUser: {
				id: senderUser.id,
				username: senderUser.username
			},
			traderUser: {
				id: traderUser.id,
				username: traderUser.username
			}
		})
		.from(transaction)
		.innerJoin(coin, eq(transaction.coinId, coin.id))
		.leftJoin(recipientUser, eq(transaction.recipientUserId, recipientUser.id))
		.leftJoin(senderUser, eq(transaction.senderUserId, senderUser.id))
		.leftJoin(traderUser, eq(transaction.userId, traderUser.id))
		.where(whereConditions)
		.orderBy(orderBy)
		.limit(limit)
		.offset((page - 1) * limit);

	const formattedTransactions = transactions.map((tx) => {
		const isTransfer = tx.type.startsWith('TRANSFER_');
		const isIncoming = tx.type === 'TRANSFER_IN';
		const isCoinTransfer = Number(tx.quantity) > 0;

		let actualSenderUsername: string | null = null;
		let actualRecipientUsername: string | null = null;

		if (isTransfer) {
			actualSenderUsername = tx.senderUser?.username ?? null;
			actualRecipientUsername = tx.recipientUser?.username ?? null;
		} else if (tx.type === 'BUY') {
			actualSenderUsername = '-';
			actualRecipientUsername = tx.traderUser?.username ?? null;
		} else if (tx.type === 'SELL' || tx.type === 'BURN') {
			actualSenderUsername = tx.traderUser?.username ?? null;
			actualRecipientUsername = '-';
		}

		return {
			...tx,
			quantity: Number(tx.quantity),
			pricePerCoin: Number(tx.pricePerCoin),
			totalBaseCurrencyAmount: Number(tx.totalBaseCurrencyAmount),
			note: tx.note ?? null,
			isIncoming,
			isCoinTransfer,
			traderUsername: tx.traderUser?.username ?? null,
			recipient: actualRecipientUsername,
			sender: actualSenderUsername,
			transferInfo: isTransfer
				? {
						isTransfer: true,
						isIncoming,
						isCoinTransfer,
						otherUser: isIncoming
							? tx.senderUser
								? { id: tx.senderUser.id, username: actualSenderUsername }
								: null
							: tx.recipientUser
								? { id: tx.recipientUser.id, username: actualRecipientUsername }
								: null
					}
				: null
		};
	});

	return json({
		transactions: formattedTransactions,
		total: count,
		page,
		limit
	});
};
