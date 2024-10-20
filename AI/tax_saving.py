import json
from datetime import datetime, timedelta


def process_past_sales(past_sales_json):
    past_sales = json.loads(past_sales_json)
    total_ltcg = 0
    total_stcg = 0

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

    return total_ltcg, total_stcg


def process_single_asset(
    asset, current_date, tax_free_ltcg_limit, total_ltcg, ltcg_assets, tax_suggestions
):
    one_year = timedelta(days=365)

    buy_price = asset["buy_price"]
    current_price = asset["current_price"]
    buy_date = datetime.strptime(asset["buy_date"], "%Y-%m-%d")
    total_stocks = asset["total_stocks"]
    profit_per_stock = current_price - buy_price
    asset_type = asset["type"]

    holding_period = current_date - buy_date

    if asset_type == "stock" and profit_per_stock > 0 and holding_period >= one_year:
        total_profit = profit_per_stock * total_stocks
        total_ltcg += total_profit
        ltcg_assets.append((asset, total_profit))

        suggestion = {
            "asset": asset["name"],
            "suggestion": f"Consider selling {total_stocks} units to lock in long-term capital gains (LTCG)",
            "type": "profit",
            "benefit": total_profit,
        }
        tax_suggestions.append(suggestion)

    if profit_per_stock > 0 and asset_type in ["stock", "bond"]:
        total_profit = profit_per_stock * total_stocks
        suggestion = {
            "asset": asset["name"],
            "suggestion": f"Consider donating {total_stocks} units of this appreciated asset to claim Section 80G deduction",
            "type": "taxes",
            "benefit": total_profit,
        }
        tax_suggestions.append(suggestion)

    if total_ltcg > tax_free_ltcg_limit:
        excess_ltcg = total_ltcg - tax_free_ltcg_limit
        best_asset_to_sell = max(ltcg_assets, key=lambda x: x[1])[0]

        tax_suggestions.append(
            {
                "asset": best_asset_to_sell["name"],
                "suggestion": f"Consider selling {total_stocks} units of {best_asset_to_sell['name']} to minimize taxable LTCG. Total excess: {excess_ltcg}",
                "type": "taxes",
                "benefit": excess_ltcg * 0.10,
            }
        )

    return tax_suggestions


def tax_optimization_multiple_assets(portfolio_json, past_sales_json):
    current_date = datetime.now()
    tax_free_ltcg_limit = 100000

    total_ltcg, total_stcg = process_past_sales(past_sales_json)
    tax_suggestions = []
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
            {"name": "Stock A", "buy_price": 100, "current_price": 150, "buy_date": "2022-01-01", "type": "stock", "total_stocks": 10},
            {"name": "Stock B", "buy_price": 200, "current_price": 300, "buy_date": "2021-03-10", "type": "stock", "total_stocks": 5},
            {"name": "Bond C", "buy_price": 1000, "current_price": 1100, "buy_date": "2020-04-15", "type": "bond", "total_stocks": 2}
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

    # Call the function for multiple assets
    multiple_assets_suggestions = tax_optimization_multiple_assets(
        portfolio_json, past_sales_json
    )
    print(multiple_assets_suggestions)


if __name__ == "__main__":
    main()
