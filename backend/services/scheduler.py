"""
Campaign Scheduler — Automatic Campaign Close

Uses APScheduler to check for expired campaigns and trigger the selection engine.
Runs every 60 seconds.
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timezone

from database import db
from services.selection_engine import process_campaign_close
from services.blockchain_service import distribute_payments

scheduler = AsyncIOScheduler()


async def check_expired_campaigns():
    """Check for campaigns that have passed their end date and process them."""
    try:
        now = datetime.now(timezone.utc)

        # Find all ACTIVE campaigns past their end date
        expired = await db.campaign.find_many(
            where={
                "status": "ACTIVE",
                "endDate": {"lte": now},
            }
        )

        for campaign in expired:
            try:
                print(f"[Scheduler] Processing campaign close: {campaign.id}")

                # 1. Mark as CLOSED (processing)
                await db.campaign.update(
                    where={"id": campaign.id},
                    data={"status": "CLOSED"},
                )

                # 2. Run selection engine
                payload = await process_campaign_close(campaign.id)

                # 3. Send to smart contract
                try:
                    tx_hash = await distribute_payments(payload)
                    print(f"[Scheduler] Campaign {campaign.id} finalized. TX: {tx_hash}")

                    # 4. Mark as FINALIZED
                    await db.campaign.update(
                        where={"id": campaign.id},
                        data={
                            "status": "FINALIZED",
                            "txHash": tx_hash,
                        },
                    )
                except Exception as blockchain_error:
                    print(
                        f"[Scheduler] Blockchain error for {campaign.id}: {blockchain_error}"
                    )
                    # Revert to ACTIVE so it can be retried
                    await db.campaign.update(
                        where={"id": campaign.id},
                        data={"status": "ACTIVE"},
                    )

            except Exception as e:
                print(f"[Scheduler] Error processing campaign {campaign.id}: {e}")

    except Exception as e:
        print(f"[Scheduler] Error checking expired campaigns: {e}")


def start_scheduler():
    """Start the campaign check scheduler."""
    scheduler.add_job(check_expired_campaigns, "interval", seconds=60)
    scheduler.start()
    print("[Scheduler] Campaign scheduler started (checking every 60s)")


def shutdown_scheduler():
    """Shutdown the scheduler."""
    scheduler.shutdown()
    print("[Scheduler] Campaign scheduler stopped")
