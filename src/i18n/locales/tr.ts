export const tr = {
	common: {
		appName: "Aylık Finans Takibi",
		processing: "İşleniyor...",
		loading: "Yükleniyor...",
	},
	auth: {
		title: "Aylık Finans Takip",
		subtitle:
			"Gelir ve giderlerini kaydederek ev bütçeni kontrol altında tut.",
		tabs: {
			login: "Giriş Yap",
			register: "Kayıt Ol",
		},
		labels: {
			username: "Kullanıcı Adı",
			password: "Şifre",
			confirmPassword: "Şifre Tekrar",
		},
		placeholders: {
			username: "ornek.kullanici",
			password: "En az 6 karakter",
			confirmPassword: "Şifreni tekrar gir",
		},
		helper: "Verilerin sunucuda saklanır; aynı hesapla farklı cihazlardan erişebilirsin. Kullanıcı adları benzersiz olmalıdır.",
		buttons: {
			login: "Giriş Yap",
			register: "Kayıt Ol",
		},
		errors: {
			usernameRequired: "Kullanıcı adı gerekli.",
			passwordRequired: "Şifre gerekli.",
			passwordMismatch: "Şifreler eşleşmiyor.",
			providerUnavailable: "Auth sağlayıcısı hazır değil.",
			usernameMissing: "Kullanıcı adı zorunludur.",
			passwordTooShort: "Şifre en az 6 karakter olmalı.",
			usernameTaken: "Bu kullanıcı adı zaten kayıtlı.",
			userNotFound: "Kullanıcı bulunamadı.",
			passwordIncorrect: "Şifre hatalı.",
			generic: "Bir hata oluştu.",
			unexpected: "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.",
		},
	},
	dashboard: {
		welcome: "Hoş geldin",
		logout: "Çıkış Yap",
		controls: {
			monthPicker: {
				trigger: "Ay seçim menüsünü aç",
				prev: "Önceki yıl",
				next: "Sonraki yıl",
				current: "Bu ay",
			},
			// (copy controls removed)
		},
		validation: {
			nameRequired: "Lütfen bir ad ekle.",
			amountPositive: "Tutar pozitif bir sayı olmalıdır.",
			countPositive: "Taksit sayısı pozitif bir tam sayı olmalıdır.",

			formIncomplete: "Eksik veya hatalı alanları kontrol et.",
		},
		sections: {
			incomes: {
				title: "Gelirler",
				subtitle: "Maaş, kira ve diğer düzenli gelirlerini gir.",
				labels: {
					name: "Gelir adı",
					amount: "Tutar",
					note: "Not (opsiyonel)",
				},
				placeholders: {
					name: "Gelir adı",
					amount: "Tutar",
					note: "Örn. ödeme açıklaması",
				},
				empty: "Henüz gelir eklenmedi.",
				add: "Ekle",
				remove: "Sil",
				summary: "Toplam gelir: {{amount}}",
				count: "{{count}} kayıt",
			},
			subscriptions: {
				title: "Aylık Tahmini Giderler",
				subtitle:
					"Netflix, Spotify gibi düzenli ödemelerin aylık tahmini tutarlarını gir.",
				labels: {
					name: "Abonelik adı",
					amount: "Tutar",
					note: "Not (opsiyonel)",
				},
				placeholders: {
					name: "Abonelik adı",
					amount: "Tutar",
					note: "Örn. yenileme tarihi",
				},
				empty: "Abonelik eklenmedi.",
				add: "Ekle",
				remove: "Sil",
				perMonth: "{{amount}} / ay",
				summary: "Toplam tahmini aylık gider: {{amount}} / ay",
				count: "{{count}} kayıt",
				hint: "Not: Dönem içi giderler bölümünde abonelikleri ayrıca kaydederseniz çift sayım olur. Sadece bir yerde tutmaya çalışın.",
			},
			installments: {
				title: "Taksitli Alışveriş",
				subtitle: "Toplam tutarı veya aylık ödemeyi belirtebilirsin.",
				labels: {
					name: "Ürün adı",
					mode: "Hesaplama seçeneği",
					totalAmount: "Toplam tutar",
					monthlyAmount: "Aylık ödeme",
					count: "Taksit sayısı",
					countType: "Taksit türü",
					note: "Not (opsiyonel)",
				},
				modes: {
					total: "Toplam + taksit sayısı",
					monthly: "Aylık ödeme + taksit sayısı",
				},
				placeholders: {
					name: "Ürün adı",
					totalAmount: "Toplam tutarı gir",
					monthlyAmount: "Aylık ödemeyi gir",
					count: "Taksit adedi",
					note: "Örn. bankanız",
				},
				helper: "Toplam ve taksit sayısını girersen aylık ödeme otomatik hesaplanır.",
				countOptions: {
					planned: "Toplam taksit",
					remaining: "Kalan taksit",
				},
				preview: {
					helper: "Tahmini ödeme planı",
					total: "Toplam: {{amount}}",
					monthly: "Aylık: {{amount}}",
				},
				save: "Kaydet",
				empty: "Taksitli alışveriş eklenmedi.",
				remove: "Sil",
				perMonth: "{{amount}} / ay",
				remaining: "· {{count}} taksit kaldı",
				planned: "· {{count}} toplam taksit",
				remainingOverTotal: "· {{remaining}}/{{total}} taksit",
				currentOverTotal: "· {{current}}/{{total}} taksit",
				total: "Toplam: {{amount}}",
				summary: "Aylık taksit yükü: {{amount}}",
				count: "{{count}} kayıt",
			},
			periodExpenses: {
				title: "Dönem İçi Giderler",
				subtitle: "Banka kartı, nakit vb. esnek harcamalarını kaydet.",
				labels: {
					name: "Harcama adı",
					amount: "Tutar",
					note: "Not (opsiyonel)",
				},
				placeholders: {
					name: "Harcama adı",
					amount: "Tutar",
					note: "Örn. kategori",
				},
				empty: "Harcama eklenmedi.",
				add: "Ekle",
				remove: "Sil",
				summary: "Toplam dönem içi gider: {{amount}}",
				count: "{{count}} kayıt",
			},
		},
		summary: {
			title: "Aylık Özeti",
			month: "{{month}}",
			income: "Toplam Gelir",
			subscriptions: "Aylık Tahmini Giderler",
			installments: "Taksitler",
			period: "Dönem içi",
			leftover: "Kalan Bütçe",
			estimatedLeftover: "Tahmini Kalan",
			estimatedHelper:
				"Tahmini kalan, dönem içi giderler dahil edilmeden ve aylık tahmini giderler (abonelikler) göz önünde bulundurularak hesaplanır.",
			estimatedHelperCalc:
				"Tahmini kalan şu şekilde hesaplanır: gelir − (abonelikler + taksitler). Dönem içi (tek seferlik) giderler hariç tutulur.",
			expenseRatio: "Gider oranı",
			expenseLegend: "{{expenses}} / {{income}}",
			leftoverPositive: "Kalan bütçe hedefin üzerinde, harika!",
			leftoverNegative:
				"Giderlerin gelirlerini aştı, planını gözden geçir.",
			helper: "Kalan bütçe (abonelikler hariç) pozitif tutmak için dönem içi giderlerinizi ve taksitlerinizi gözden geçirin.",
			helperCalc:
				"Buradaki kalan bütçe abonelikler hariç olarak gösterilir. Hesaplama: gelir − (taksitler + dönem içi giderler).",
		},
		history: {
			title: "Aylık Geçmiş",
			subtitle: "Önceki aylardaki performansını karşılaştır.",
			empty: "Henüz geçmiş veri yok.",
			income: "Gelir: {{amount}}",
			expenses: "Gider: {{amount}}",
			leftover: "Kalan: {{amount}}",
			active: "Aktif",
		},
		tip: {
			title: "İpucu",
			subtitle: "Bütçe planlamanı güçlendirecek öneri.",
			body: "Her ayın başında gelirlerini ekledikten sonra sabit giderlerini (abonelik ve taksit) gir. Kalan tutarı dönem içi harcamalara limit olarak belirle ve tüm giderlerini bu limitte tutmaya çalış.",
		},
		loading: {
			message: "Finans verileri yükleniyor...",
		},
	},
};

export type TrMessages = typeof tr;
