import { Helmet } from 'react-helmet-async';

const Analytics = () => (
  <Helmet>
    {/* Google Analytics */}
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script>
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID');
      `}
    </script>
    
    {/* Google Search Console Verification */}
    <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
  </Helmet>
);

export default Analytics;

