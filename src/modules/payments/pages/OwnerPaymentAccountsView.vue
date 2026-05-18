<script setup>
import { computed, onMounted, ref } from 'vue';

import AppButton from '@/shared/components/AppButton.vue';

const loading = ref(true);
const error = ref(null);
const paymentStatus = ref({
    isComplete: true,
    missingFields: [],
    lastUpdated: null,
});

const accountSections = [
    {
        key: 'bank',
        title: 'Bank Account',
        description: 'Receive payouts directly to your bank account.',
        fields: ['Bank name', 'Account holder', 'Account number', 'Currency'],
        tone: 'bank',
    },
    {
        key: 'khqr',
        title: 'KHQR',
        description: 'Accept local transfers using KHQR payment rails.',
        fields: ['Merchant name', 'Merchant code', 'QR reference', 'Settlement account'],
        tone: 'khqr',
    },
    {
        key: 'payout',
        title: 'Payout Settings',
        description: 'Control when and how earnings are released.',
        fields: ['Payout schedule', 'Minimum threshold', 'Auto payout', 'Notification email'],
        tone: 'payout',
    },
];

const missingLabels = computed(() => {
    const mapping = {
        tax_information: 'Tax information',
        identity_verification: 'Identity verification',
        bank_account_number: 'Bank account number',
        payout_method: 'Payout method',
        khqr_merchant_code: 'KHQR merchant code',
    };

    return (paymentStatus.value.missingFields || []).map((field) => mapping[field] || field.replaceAll('_', ' '));
});

const readinessTone = computed(() => (paymentStatus.value.isComplete ? 'ready' : 'warning'));

const formatDate = (value) => {
    if (!value) return 'Not available';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed);
};

const formattedLastUpdated = computed(() => formatDate(paymentStatus.value.lastUpdated));

const fetchPaymentStatus = async () => {
    loading.value = true;
    error.value = null;

    try {
        const response = await fetch('/data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        paymentStatus.value = data.paymentStatus || paymentStatus.value;
    } catch (fetchError) {
        error.value = 'Failed to load payment account status. Please verify data.json placement.';
        console.error('OwnerPaymentAccountsView fetch error:', fetchError);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchPaymentStatus);
</script>

<template>
    <div class="payment-page mt-25">
        <header class="payment-page__header">
            <div>
                <p class="payment-page__eyebrow">Owner tools</p>
                <h1 class="text-3xl font-semibold text-(--color-text)">Payment Accounts</h1>
                <p class="payment-page__subtitle">Manage your bank, KHQR, and payout account details here.</p>
            </div>

            <AppButton to="/owner/payment-accounts/setup" variant="primary" size="md">
                Set up payment details
            </AppButton>
        </header>

        <section v-if="loading" class="state-card">
            <div class="loader"></div>
            <p>Loading payment account status...</p>
        </section>

        <section v-else-if="error" class="state-card state-card--error">
            <p>{{ error }}</p>
            <AppButton type="button" variant="primary" size="md" @click="fetchPaymentStatus">
                Retry
            </AppButton>
        </section>

        <template v-else>
            <section class="status-banner" :class="`status-banner--${readinessTone}`">
                <div>
                    <p class="status-banner__label">Account status</p>
                    <h2 class="status-banner__title">
                        {{ paymentStatus.isComplete ? 'Payment setup complete' : 'Action required' }}
                    </h2>
                    <p class="status-banner__text">
                        {{ paymentStatus.isComplete
                            ? 'Your payout setup is ready to receive earnings.'
                            : 'Complete the missing items below to activate payouts.' }}
                    </p>
                </div>

                <div class="status-banner__meta">
                    <span class="status-pill">{{ paymentStatus.isComplete ? 'Ready' : 'Incomplete' }}</span>
                    <span class="status-banner__date">Last updated: {{ formattedLastUpdated }}</span>
                </div>
            </section>

            <section v-if="missingLabels.length" class="missing-card">
                <h3 class="section-title">Missing items</h3>
                <ul class="missing-list">
                    <li v-for="item in missingLabels" :key="item">{{ item }}</li>
                </ul>
            </section>

            <section class="account-grid">
                <article v-for="section in accountSections" :key="section.key" class="account-card">
                    <div class="account-card__header">
                        <div>
                            <p class="account-card__eyebrow">{{ section.key }}</p>
                            <h3 class="account-card__title">{{ section.title }}</h3>
                        </div>

                        <span class="account-card__tone" :class="`account-card__tone--${section.tone}`">{{ section.title
                            }}</span>
                    </div>

                    <p class="account-card__description">{{ section.description }}</p>

                    <ul class="field-list">
                        <li v-for="field in section.fields" :key="field">
                            <span>{{ field }}</span>
                            <strong>Not configured</strong>
                        </li>
                    </ul>

                    <AppButton type="button" variant="primary" size="sm">
                        Configure {{ section.title }}
                    </AppButton>
                </article>
            </section>
        </template>
    </div>
</template>

<style scoped>
.payment-page {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    color: var(--color-text);
}

.payment-page__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
}

.payment-page__eyebrow {
    margin: 0 0 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-muted);
    font-size: 0.72rem;
}

.payment-page__subtitle {
    margin: 0.35rem 0 0;
    color: var(--color-muted);
    max-width: 60ch;
}

.state-card {
    min-height: 16rem;
    display: grid;
    place-items: center;
    gap: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background: var(--color-surface);
}

.state-card--error {
    color: var(--color-danger);
    padding: 2rem;
}

.loader {
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    border: 3px solid rgba(55, 138, 221, 0.15);
    border-top-color: var(--color-primary);
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.status-banner {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    padding: 1.25rem;
    border-radius: 20px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
}

.status-banner--ready {
    background: rgba(29, 158, 117, 0.08);
}

.status-banner--warning {
    background: rgba(239, 159, 39, 0.1);
}

.status-banner__label,
.account-card__eyebrow,
.section-title {
    margin: 0;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.72rem;
}

.status-banner__title,
.account-card__title,
.section-title {
    margin: 0.2rem 0 0;
}

.status-banner__text {
    margin: 0.35rem 0 0;
    color: var(--color-muted);
}

.status-banner__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
    text-align: right;
}

.status-pill,
.account-card__tone {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
}

.status-pill {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
}

.status-banner__date {
    color: var(--color-muted);
    font-size: 0.85rem;
}

.missing-card,
.account-card {
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    padding: 1.1rem;
}

.missing-list {
    margin: 0.75rem 0 0;
    padding-left: 1.2rem;
    color: var(--color-text);
}

.account-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
}

.account-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.account-card__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
}

.account-card__tone {
    background: var(--color-primary-soft);
    border: 1px solid var(--color-border);
}

.account-card__tone--bank {
    color: var(--color-primary);
}

.account-card__tone--khqr {
    color: var(--color-primary);
}

.account-card__tone--payout {
    background: var(--color-success-soft);
    color: var(--color-success);
    border: 1px solid var(--color-success);
}

.account-card__description {
    margin: 0;
    color: var(--color-muted);
}

.field-list {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    margin: 0;
    padding: 0;
    list-style: none;
}

.field-list li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.9rem;
}

.field-list li:last-child {
    border-bottom: 0;
    padding-bottom: 0;
}

.field-list strong {
    color: var(--color-muted);
    font-weight: 600;
}

@media (max-width: 900px) {
    .account-grid {
        grid-template-columns: 1fr;
    }

    .payment-page__header,
    .status-banner {
        flex-direction: column;
    }

    .status-banner__meta {
        align-items: flex-start;
        text-align: left;
    }
}
</style>