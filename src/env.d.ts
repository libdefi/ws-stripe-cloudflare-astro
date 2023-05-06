interface ImportMetaEnv {
    readonly PUBLIC_STRIPE_PUBLISHABLE_API_KEY: string;
    readonly PUBLIC_STRIPE_PRICING_TABLE_ID: string;
    readonly PUBLIC_STIPE_CUSTOMER_PORTAL_URL: string;
    // その他の環境変数...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  