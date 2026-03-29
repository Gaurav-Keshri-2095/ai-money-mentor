"""Financial News Agent — Live market intelligence with portfolio relevance matching."""

import logging
from app.agents.base import BaseAgent
from app.utils.constants import SECTOR_KEYWORDS

logger = logging.getLogger(__name__)


def _detect_sectors_from_holdings(funds: list) -> list:
    """Detect which sectors the user is exposed to based on fund names and categories."""
    sectors = set()
    for fund in funds:
        name = fund.get("name", "").lower()
        category = fund.get("category", "").lower()
        combined = name + " " + category

        for sector, keywords in SECTOR_KEYWORDS.items():
            for kw in keywords:
                if kw.lower() in combined:
                    sectors.add(sector)
                    break

    # If we have large cap / bluechip funds, they cover banking, it, energy, fmcg
    for fund in funds:
        cat = fund.get("category", "").lower()
        if "large cap" in cat or "bluechip" in cat or "index" in cat or "nifty" in cat:
            sectors.update(["banking", "it", "energy", "fmcg"])
        elif "mid cap" in cat:
            sectors.update(["banking", "it", "infra"])
        elif "small cap" in cat:
            sectors.update(["it", "pharma", "auto"])
        elif "gilt" in cat or "debt" in cat or "liquid" in cat:
            sectors.add("debt")

    return list(sectors)


def _get_market_news() -> list:
    """Fetch latest financial news. Uses DuckDuckGo search with fallback."""
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.news("India stock market RBI mutual fund", max_results=5))
            return [
                {
                    "title": r.get("title", ""),
                    "body": r.get("body", ""),
                    "url": r.get("url", ""),
                    "source": r.get("source", ""),
                    "date": r.get("date", ""),
                }
                for r in results
            ]
    except Exception as e:
        logger.warning(f"News fetch failed: {e}")
        # Return curated fallback news
        return [
            {
                "title": "RBI Monetary Policy: Repo Rate Decision",
                "body": "The Reserve Bank of India's monetary policy committee is closely watched for repo rate decisions that impact lending rates and bond yields across the economy.",
                "source": "Market Analysis",
                "url": "",
                "date": "",
            },
            {
                "title": "Indian Markets: FII/DII Activity Update",
                "body": "Foreign and domestic institutional investor flows continue to drive market movements in Indian equities, with sectors like banking and IT seeing significant activity.",
                "source": "Market Analysis",
                "url": "",
                "date": "",
            },
        ]


def _match_news_to_portfolio(news_items: list, user_sectors: list) -> list:
    """Match news to user's portfolio sectors using keyword matching."""
    matched = []

    for news in news_items:
        text = (news.get("title", "") + " " + news.get("body", "")).lower()
        affected = []

        for sector in user_sectors:
            keywords = SECTOR_KEYWORDS.get(sector, [])
            for kw in keywords:
                if kw.lower() in text:
                    affected.append(sector)
                    break

        if affected:
            impact = "high" if len(affected) >= 2 else "medium"
            matched.append({
                "headline": news["title"],
                "body": news.get("body", ""),
                "source": news.get("source", ""),
                "impact_level": impact,
                "affected_sectors": list(set(affected)),
                "is_relevant": True,
            })

    return matched


class FinancialNewsAgent(BaseAgent):
    name = "FinancialNewsAgent"
    description = "Fetches market news and matches relevance to user's portfolio."

    def process(self, payload: dict) -> dict:
        """
        Expected payload keys:
            funds: list of user's fund holdings (for sector detection)
        """
        funds = payload.get("funds", [])

        # Detect user's sector exposure
        user_sectors = _detect_sectors_from_holdings(funds)

        # Fetch news
        news_items = _get_market_news()

        # Match to portfolio
        matched_news = _match_news_to_portfolio(news_items, user_sectors)

        # Build news impact for FIRE planner
        news_impact = None
        if matched_news:
            top = matched_news[0]
            news_impact = {
                "headline": top["headline"],
                "relevance": f"This impacts your {', '.join(top['affected_sectors'])} holdings. Monitor your portfolio allocation in these sectors.",
            }

        result = {
            "user_sectors": user_sectors,
            "news_items": news_items[:5],
            "matched_alerts": matched_news,
            "news_impact": news_impact,
        }
        return self._add_provenance(result)
