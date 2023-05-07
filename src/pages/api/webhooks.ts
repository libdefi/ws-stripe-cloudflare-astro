import { APIRoute } from "astro";
import Stripe from 'stripe'
const STRIPE_SECRET_API_KEY = import.meta.env.STRIPE_SECRET_API_KEY
const STRIPE_WEBHOOK_SECRET = import.meta.env.STRIPE_WEBHOOK_SECRET

const stripe = new Stripe(STRIPE_SECRET_API_KEY, {
	apiVersion: '2022-11-15'
})
export const get: APIRoute = async (context) => {
    return {
        body: JSON.stringify({
            message: "Hello Astro API"
        })
    }
}

export const post: APIRoute = async (context) => {
    const { request } = context;
    const signature = request.headers.get('stripe-signature');
    try {
        const body = await request.arrayBuffer();
        const event = stripe.webhooks.constructEvent(
          Buffer.from(body),
          signature,
          STRIPE_WEBHOOK_SECRET
        );
        switch (event.type) {
            // 顧客の作成が成功した場合にトリガーされる
            case 'customer.created': {
                const customer = event.data.object
                console.log([
                    `顧客データが作成されました。`,
                    `Email: ${customer.email}`
                ].join('\n'))
                break
            }
            // サブスクリプション作成が成功した時にトリガーされる
            case 'customer.subscription.created': {
                const subscription = event.data.object
                console.log([
                    `新しいサブスクリプション申し込みがありました。`,
                    `開始日: ${subscription.start_date}`,
                    ...subscription.items.data.map(item => `${item.price.active}: ${item.price.unit_amount} * ${item.quantity}`)
                ].join('\n'))
                break
            }
            // トライアル終了の3日前にトリガーされる
            case 'customer.subscription.trial_will_end': {
                const subscription = event.data.object
                console.log([
                    `新しいサブスクリプション申し込みがありました。`,
                    `開始日: ${subscription.start_date}`,
                    `トライアル終了日: ${subscription.trial_end}`,
                    ...subscription.items.data.map(item => `${item.price.active}: ${item.price.unit_amount} * ${item.quantity}`)
                ].join('\n'))
                break
            }
            // サブスクリプション更新の数日前にトリガーされる
            case 'invoice.upcoming': {
                const invoice = event.data.object
                console.log([
                    `サブスクリプションの更新がまもなくです。`,
                    `サブスクリプションID: ${typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id}`,
                    `請求金額: ${invoice.total}`,
                    `請求期限: ${new Date(invoice.period_end * 1000).toISOString()}`,
                    `請求書URL: ${invoice.hosted_invoice_url}`
                ].join('\n'))
                break
            }
            // サブスクリプションの支払いが失敗した場合
            case 'invoice.payment_failed': {
                const invoice = event.data.object
                console.log([
                    `請求書の支払いが失敗しました。`,
                    `請求書番号: ${invoice.number}`,
                    `請求金額: ${invoice.total}`,
                    `請求期限: ${new Date(invoice.period_end * 1000).toISOString()}`,
                    `請求書URL: ${invoice.hosted_invoice_url}`
                ].join('\n'))
            }
            default:
                break
        }

       return {
           body: "ok"
       }
    } catch (err) {
        const errorMessage = `⚠️  Webhook signature verification failed. ${err.+message}`
        console.log(errorMessage);
        return new Response(errorMessage, {
            status: 400
        });
    };
}
