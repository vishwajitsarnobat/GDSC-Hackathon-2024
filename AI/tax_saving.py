import json
from datetime import datetime, timedelta


def process_past_sales(past_sales_json):
    past_sales = json.loads(past_sales_json)
    total_ltcg = 0
    total_stcg = 0
    tax_suggestions = []

    one_year = timedelta(days=365)

    for sale in past_sales["sales"]:
        sale_date = datetime.strptime(sale["sale_date"], "%Y-%m-%d")
        buy_date = datetime.strptime(sale["buy_date"], "%Y-%m-%d")
        holding_period = sale_date - buy_date
        profit = sale["sale_price"] - sale["buy_price"]
        asset_type = sale["type"]

        if asset_type == "stock" and profit > 0:
            if holding_period >= one_year:
                total_ltcg += profit  # Long-term capital gains
            else:
                total_stcg += profit  # Short-term capital gains

        if profit < 0:
            tax_suggestions.append(
                {
                    "asset": sale["name"],
                    "suggestion": "Losses can be used to offset gains",
                    "type": "taxes",
                    "benefit": abs(profit),  # Full loss can be used for offset
                }
            )

    return total_ltcg, total_stcg, tax_suggestions


def process_single_asset(
    asset, current_date, tax_free_ltcg_limit, total_ltcg, ltcg_assets, tax_suggestions
):
    one_year = timedelta(days=365)

    buy_price = asset["buy_price"]
    current_price = asset["current_price"]
    buy_date = datetime.strptime(asset["buy_date"], "%Y-%m-%d")
    profit = current_price - buy_price
    asset_type = asset["type"]

    holding_period = current_date - buy_date

    if asset_type == "stock" and profit > 0 and holding_period >= one_year:
        total_ltcg += profit
        ltcg_assets.append((asset, profit))

        suggestion = {
            "asset": asset["name"],
            "suggestion": "Consider selling to lock in long-term capital gains (LTCG)",
            "type": "profit",
            "benefit": profit,
        }
        tax_suggestions.append(suggestion)

    if profit > 0 and asset_type in ["stock", "bond"]:
        suggestion = {
            "asset": asset["name"],
            "suggestion": "Consider donating this appreciated asset to claim Section 80G deduction",
            "type": "taxes",
            "benefit": profit,
        }
        tax_suggestions.append(suggestion)

    if total_ltcg > tax_free_ltcg_limit:
        excess_ltcg = total_ltcg - tax_free_ltcg_limit
        best_asset_to_sell = max(ltcg_assets, key=lambda x: x[1])[0]

        tax_suggestions.append(
            {
                "asset": best_asset_to_sell["name"],
                "suggestion": f"Consider selling {best_asset_to_sell['name']} to minimize taxable LTCG. Total excess: {excess_ltcg}",
                "type": "taxes",
                "benefit": excess_ltcg * 0.10,
            }
        )

    return tax_suggestions


def tax_optimization_single_asset(asset_json, past_sales_json):
    current_date = datetime.now()
    tax_free_ltcg_limit = 100000

    total_ltcg, total_stcg, tax_suggestions = process_past_sales(past_sales_json)
    ltcg_assets = []

    asset = json.loads(asset_json)
    tax_suggestions = process_single_asset(
        asset,
        current_date,
        tax_free_ltcg_limit,
        total_ltcg,
        ltcg_assets,
        tax_suggestions,
    )

    return json.dumps(tax_suggestions, indent=4)


def tax_optimization_multiple_assets(portfolio_json, past_sales_json):
    current_date = datetime.now()
    tax_free_ltcg_limit = 100000

    total_ltcg, total_stcg, tax_suggestions = process_past_sales(past_sales_json)
    ltcg_assets = []

    portfolio = json.loads(portfolio_json)
    for asset in portfolio["assets"]:
        tax_suggestions = process_single_asset(
            asset,
            current_date,
            tax_free_ltcg_limit,
            total_ltcg,
            ltcg_assets,
            tax_suggestions,
        )

    return json.dumps(tax_suggestions, indent=4)


def main():
    # Example usage
    portfolio_json = """
    {
        "assets": [
            {"name": "Stock A", "buy_price": 100, "current_price": 150, "buy_date": "2022-01-01", "type": "stock"},
            {"name": "Stock B", "buy_price": 200, "current_price": 300, "buy_date": "2021-03-10", "type": "stock"},
            {"name": "Bond C", "buy_price": 1000, "current_price": 1100, "buy_date": "2020-04-15", "type": "bond"}
        ]
    }
    """

    past_sales_json = """
    {
        "sales": [
            {"name": "Stock X", "buy_price": 100, "sale_price": 120, "buy_date": "2020-01-01", "sale_date": "2021-03-10", "type": "stock"},
            {"name": "Stock Y", "buy_price": 300, "sale_price": 290, "buy_date": "2020-05-01", "sale_date": "2022-06-15", "type": "stock"}
        ]
    }
    """

    # Call the function for a single asset
    single_asset_json = """
    {
        "name": "Stock A", "buy_price": 100, "current_price": 150, "buy_date": "2022-01-01", "type": "stock"
    }
    """
    single_asset_suggestions = tax_optimization_single_asset(
        single_asset_json, past_sales_json
    )
    print(single_asset_suggestions)

    # Call the function for multiple assets
    multiple_assets_suggestions = tax_optimization_multiple_assets(
        portfolio_json, past_sales_json
    )
    print(multiple_assets_suggestions)


if __name__ == "__main__":
    main()
