import type en from './en';

export default {
	lang: {
		code: 'pt',
		name: 'Português',
		flagCode: 'br'
	},
	global: {
		price: 'Preço',
		name: 'Nome'
	},
	greetings: {
		good_morning: 'Bom Dia, {{name}}!',
		good_afternoon: 'Boa Tarde, {{name}}!',
		good_evening: 'Boa Noite, {{name}}!',
		good_night: 'Boa Noite, {{name}}!'
	},
	page_names: {
		home: 'Início',
		market: 'Mercado',
		hopium: 'Hopium',
		arcade: 'Arcade',
		leaderboard: 'Placar de Líderes',
		shop: 'Loja',
		achievements: 'Conquistas',
		portfolio: 'Portfólio',
		treemap: 'Treemap',
		create_coin: 'Criar Moeda',
		notifications: 'Notificações',
		about: 'Sobre'
	},
	main: {
		title: 'Bem vindo(a) ao XprismPlay!',
		description: 'Aqui está um panorama do mercado para hoje.',
		market_overview: 'Visão Geral do Mercado'
	},
	coin: {
		'24hchange': 'Mudança em 24h',
		marketcap: 'Capitalização de Mercado',
		volume24h: 'Volume (24h)'
	},
	sign_in: {
		message: ['Você precisa', 'fazer login', 'para jogar.'],
		form: {
			title: 'Faça login em XprismPlay',
			description:
				'Escolha um serviço para logar com. Sua conta será criada imediatamente se não tiver uma.',
			services: {
				google: 'Continuar com Google'
			},
			terms: [
				'Ao continuar, você concorda com nossos',
				'Termos de Serviço',
				'e',
				'Políticas de Privacidade'
			]
		}
	}
} satisfies typeof en;
