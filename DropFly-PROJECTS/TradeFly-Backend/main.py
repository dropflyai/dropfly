"""
TradeFly Backend - FastAPI Server
Real-time trading signal detection with GPT-5 analysis
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import uvicorn

from config import settings

# Configure logging FIRST
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Auto-detect market data provider
if settings.use_yahoo_finance:
    from market_data_yahoo import YahooMarketDataService as MarketDataService
    logger.info("📊 Using Yahoo Finance (FREE, no API keys needed)")
elif settings.polygon_api_key:
    logger.info("📊 Using Polygon.io Market Data")
    # We'll need to create a Polygon wrapper
    from market_data import MarketDataService  # Placeholder
else:
    from market_data import MarketDataService
    logger.info("📊 Using Alpaca Market Data")

from signal_detector import SignalDetector
from ai_analyzer import AIAnalyzer
from supabase_client import SupabaseClient
from news_service import NewsService
from models import TradingSignal, SignalType, SignalQuality

# Global services
market_service = MarketDataService()
news_service = NewsService()  # News & catalyst monitoring
detector = SignalDetector(market_service)
ai_analyzer = AIAnalyzer(market_service, news_service)  # Now includes news analysis
supabase = SupabaseClient()
scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting TradeFly Backend...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Watching tickers: {settings.tickers_list}")
    logger.info(f"Signal check interval: {settings.signal_check_interval}s")

    # Start background scheduler (with async support)
    import asyncio

    def run_scan():
        """Wrapper to run async scan_for_signals in sync context"""
        asyncio.run(scan_for_signals())

    scheduler.add_job(
        func=run_scan,
        trigger=IntervalTrigger(seconds=settings.signal_check_interval),
        id='signal_scanner',
        name='Scan for trading signals',
        replace_existing=True
    )

    # Cleanup old signals every 30 minutes
    scheduler.add_job(
        func=cleanup_old_signals,
        trigger=IntervalTrigger(minutes=30),
        id='cleanup',
        name='Cleanup old signals',
        replace_existing=True
    )

    scheduler.start()
    logger.info("✅ Background scheduler started")

    # Run initial scan (use await since we're already in async context)
    await scan_for_signals()

    yield

    # Shutdown
    logger.info("🛑 Shutting down TradeFly Backend...")
    scheduler.shutdown()
    logger.info("✅ Scheduler stopped")


app = FastAPI(
    title="TradeFly Backend API",
    description="Real-time trading signal detection with GPT-5 AI analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your iOS app domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def scan_for_signals():
    """
    Main signal scanning function - runs on schedule
    Detects patterns and uses GPT-5 to analyze them (now with news)
    """
    try:
        logger.info(f"📊 Scanning {len(settings.tickers_list)} tickers for signals...")

        signals_found = 0

        for ticker in settings.tickers_list:
            # Check if we already have signals for this ticker today
            today_count = supabase.get_signal_count_today(ticker)
            if today_count >= 5:  # Limit to 5 signals per ticker per day
                logger.debug(f"Skipping {ticker} - already has {today_count} signals today")
                continue

            # Detect patterns
            detected_signals = detector.detect_signals(ticker)

            for signal_data in detected_signals:
                # Use GPT-5 to analyze the signal (now includes news)
                logger.info(f"🤖 Analyzing {ticker} - {signal_data['signal_type']}...")
                analysis = await ai_analyzer.analyze_signal(signal_data)

                # Only save HIGH and MEDIUM quality signals
                if analysis.quality in [SignalQuality.HIGH, SignalQuality.MEDIUM]:
                    # Create TradingSignal object
                    data = signal_data['market_data']
                    avg_volume = market_service.get_average_volume(ticker)

                    # Fetch news for this signal (to display in app)
                    stock_news = await news_service.get_stock_news(ticker, hours_back=2)
                    market_news = await news_service.get_market_news(hours_back=4)

                    trading_signal = TradingSignal(
                        ticker=ticker,
                        signal_type=SignalType(signal_data['signal_type']),
                        quality=analysis.quality,
                        timestamp=data.timestamp,
                        current_price=data.price,
                        entry_price=analysis.entry_recommendation,
                        stop_loss=analysis.stop_loss_recommendation,
                        take_profit_1=analysis.take_profit_recommendation,
                        vwap=data.vwap,
                        ema9=data.ema9,
                        ema20=data.ema20,
                        ema50=data.ema50,
                        volume=data.volume,
                        avg_volume=avg_volume if avg_volume > 0 else data.volume,
                        ai_reasoning=analysis.reasoning,
                        confidence_score=analysis.confidence_score,
                        risk_factors=analysis.risk_factors,
                        related_news=stock_news[:3],  # Top 3 most relevant news
                        market_news=market_news[:2],  # Top 2 market-wide news
                        timeframe="1min",
                        is_active=True
                    )

                    # Save to Supabase
                    if supabase.save_signal(trading_signal):
                        signals_found += 1
                        logger.info(f"✅ Saved {analysis.quality.value} signal for {ticker}")
                else:
                    logger.info(f"⚠️  Skipped LOW quality signal for {ticker}")

        # Clean up duplicates
        supabase.delete_duplicate_signals()

        logger.info(f"📈 Scan complete. Found {signals_found} new signals")

    except Exception as e:
        logger.error(f"❌ Error in signal scan: {e}", exc_info=True)


def cleanup_old_signals():
    """Cleanup old signals - runs every 30 minutes"""
    try:
        logger.info("🧹 Cleaning up old signals...")
        supabase.deactivate_old_signals(hours_old=2)
    except Exception as e:
        logger.error(f"Error in cleanup: {e}")


# API Routes

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "TradeFly Backend",
        "version": "1.0.0",
        "environment": settings.environment
    }


@app.get("/signals/active")
async def get_active_signals():
    """Get all active trading signals"""
    try:
        signals = supabase.get_active_signals()
        return {
            "count": len(signals),
            "signals": signals
        }
    except Exception as e:
        logger.error(f"Error fetching signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/signals/scan")
async def trigger_scan():
    """Manually trigger a signal scan"""
    try:
        await scan_for_signals()
        return {"status": "success", "message": "Signal scan triggered"}
    except Exception as e:
        logger.error(f"Error triggering scan: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Test Supabase connection
        active_signals = supabase.get_active_signals()

        # Test market data
        test_data = market_service.get_latest_data(settings.tickers_list[0])

        return {
            "status": "healthy",
            "supabase": "connected",
            "market_data": "connected" if test_data else "unavailable",
            "active_signals": len(active_signals),
            "scheduler": "running" if scheduler.running else "stopped"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
async def get_stats():
    """Get backend statistics"""
    try:
        active_signals = supabase.get_active_signals()

        # Count by quality
        quality_counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
        for signal in active_signals:
            quality_counts[signal['quality']] += 1

        return {
            "total_active_signals": len(active_signals),
            "by_quality": quality_counts,
            "tickers_watched": len(settings.tickers_list),
            "scan_interval": settings.signal_check_interval
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/news/{ticker}")
async def get_ticker_news(ticker: str, hours_back: int = 4):
    """
    Get recent news for a specific ticker
    Used by iOS app to display news in signal detail view
    """
    try:
        news = await news_service.get_stock_news(ticker, hours_back=hours_back)
        sentiment_summary = news_service.create_news_summary(ticker, news)

        return {
            "ticker": ticker,
            "news_count": len(news),
            "news": news,
            "sentiment_summary": sentiment_summary
        }
    except Exception as e:
        logger.error(f"Error fetching news for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/news/market/latest")
async def get_market_news_endpoint(hours_back: int = 6):
    """
    Get recent market-wide news (Fed, CPI, GDP, etc.)
    Used by iOS app to display market context
    """
    try:
        news = await news_service.get_market_news(hours_back=hours_back)
        summary = news_service.create_market_news_summary(news)

        return {
            "news_count": len(news),
            "news": news,
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Error fetching market news: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development",
        log_level=settings.log_level.lower()
    )
