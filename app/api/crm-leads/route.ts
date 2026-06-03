import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-dashboard-password");
  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return NextResponse.json({ leads: [], notice: "Supabase not configured." });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("Master CRM UI")
      .select(`
        id,
        owner_name,
        owner_name_spouse,
        email,
        phone,
        phone_2,
        Address,
        mailing_address,
        property_type,
        beds,
        baths,
        sqft,
        lot_sqft,
        year_built,
        pool,
        parking_spaces,
        heating,
        cooling,
        estimated_value,
        estimated_equity,
        mortgage_balance,
        monthly_rent_estimate,
        cltv_pct,
        price_per_sqft,
        is_distressed,
        market_status,
        avg_days_on_market,
        delinquent_amount,
        comp_count,
        avg_comp_sale_price,
        avg_comp_price_per_sqft,
        market_avg_list_price,
        market_avg_sale_price,
        market_avg_dom,
        lien_1_lender,
        lien_1_amount,
        lien_1_date,
        lien_1_type,
        lien_1_loan_type,
        lien_1_term,
        lien_1_borrower,
        lien_2_lender,
        lien_2_amount,
        lien_2_date,
        lien_2_loan_type,
        lien_2_borrower,
        last_sale_date,
        last_sale_price,
        last_sale_seller,
        last_sale_buyer,
        nod_date,
        auction_date,
        auction_bid,
        lead_status,
        lead_source,
        notes,
        county,
        apn,
        zoning,
        occupancy,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ leads: data });
  } catch (err) {
    console.error("CRM leads fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch CRM leads." }, { status: 500 });
  }
}
