export const revalidate = 86400; // Next.js ISR: Cache response at edge for 24 hours

import { NextResponse } from 'next/server';

// Helper function to fetch from a CPA URL safely with timeout
async function fetchOffersFromApi(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) {
    throw new Error(`CPA API returned status: ${response.status}`);
  }
  return await response.json();
}

export async function GET() {
  // Static Fallback links classified by category/difficulty
  const fallbackStep1 = [
    "https://www.qckclk.com/view.php?id=5543947&pub=3353302"
  ];
  const fallbackStep2 = [
    "https://www.mobilerewards.link/view.php?id=5545408&pub=3353302"
  ];
  const fallbackStep3 = [
    "https://www.linksforyou.com/view.php?id=5545406&pub=3353302",
    "https://www.akamaicdn.org/view.php?id=5543945&pub=3353302"
  ];
  const fallbackStep4 = [
    "https://singingfiles.com/show.php?l=0&u=2533134&id=74437",
    "https://singingfiles.com/show.php?l=0&u=2533134&id=69083",
    "https://singingfiles.com/show.php?l=0&u=2533134&id=74764"
  ];

  try {
    let data: any = null;
    
    // 1. Try primary source: CPALead
    const cpaLeadUrl = process.env.CPALEAD_OFFERS_API || 'https://www.cpalead.com/api/conversions?id=3353302&api_key=7dfcb6e60aeb405882cd2ab25749c466';
    try {
      data = await fetchOffersFromApi(cpaLeadUrl);
    } catch (cpaLeadError) {
      console.warn("[API] CPALead fetch failed. Attempting CPAGrip fallback...", cpaLeadError);
      
      // 2. Fallback source: CPAGrip
      const cpaGripUrl = process.env.CPAGRIP_API_URL;
      if (cpaGripUrl) {
        data = await fetchOffersFromApi(cpaGripUrl);
      } else {
        throw cpaLeadError;
      }
    }

    if (!data) {
      throw new Error("No CPA offer data retrieved");
    }
    
    // CPA networks return offers in different fields (direct list, 'offers', or 'campaigns')
    const rawOffers = Array.isArray(data) ? data : (data.offers || data.campaigns || []);

    const BLACKLIST_IDS = ['5545519'];

    // 2. Filter Active offers & exclude Blacklist IDs
    const activeOffers = rawOffers.filter((offer: any) => {
      const isOfferActive = offer.status !== undefined 
        ? String(offer.status).toLowerCase() === 'active' || offer.status === true
        : true;
      
      if (!isOfferActive) return false;

      // Check ID and URL against blacklist
      const offerId = String(offer.offer_id || offer.id || offer.campaign_id || '');
      const trackingUrl = String(offer.link || offer.url || offer.tracking_url || offer.click_url || '');

      const isBlacklisted = BLACKLIST_IDS.some(id => 
        offerId === id || trackingUrl.includes(`id=${id}`) || trackingUrl.includes(`/${id}`)
      );

      return !isBlacklisted;
    });

    const step1Links: string[] = [];
    const step2Links: string[] = [];
    const step3Links: string[] = [];
    const step4Links: string[] = [];

    // 3. Classify offers into 4 difficulty tiers based on payout or keywords
    activeOffers.forEach((offer: any) => {
      const payout = parseFloat(offer.payout || offer.amount || '0');
      const title = String(offer.title || '').toLowerCase();
      const desc = String(offer.description || '').toLowerCase();
      const trackingUrl = String(offer.link || offer.url || offer.tracking_url || offer.click_url || '');

      if (!trackingUrl.startsWith('http')) return;

      const isCCSubmit = 
        payout >= 4.0 || 
        title.includes('cc') || 
        title.includes('credit card') || 
        title.includes('trial') || 
        title.includes('purchase') || 
        title.includes('subscription') ||
        desc.includes('credit card') ||
        desc.includes('cc submit');

      if (isCCSubmit) {
        step4Links.push(trackingUrl);
      } else if (payout >= 2.0 && payout < 4.0) {
        step3Links.push(trackingUrl); // CPI / Surveys
      } else if (payout >= 0.8 && payout < 2.0) {
        step2Links.push(trackingUrl); // Email / Zip submits
      } else {
        step1Links.push(trackingUrl); // Easy clicks / Captchas
      }
    });

    // 4. Fallback checking and output delivery
    return NextResponse.json({
      step1Links: step1Links.length > 0 ? step1Links : fallbackStep1,
      step2Links: step2Links.length > 0 ? step2Links : fallbackStep2,
      step3Links: step3Links.length > 0 ? step3Links : fallbackStep3,
      step4Links: step4Links.length > 0 ? step4Links : fallbackStep4
    });

  } catch (error: any) {
    console.error('Failed to fetch CPA affiliate links:', error);
    
    return NextResponse.json({
      step1Links: fallbackStep1,
      step2Links: fallbackStep2,
      step3Links: fallbackStep3,
      step4Links: fallbackStep4,
      error: error?.message || 'CPA API Fetch Error'
    });
  }
}
