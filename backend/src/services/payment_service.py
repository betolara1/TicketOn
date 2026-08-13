import stripe
from src.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentService:
    @staticmethod
    def create_payment(amount: float, order_id: int) -> stripe.PaymentIntent:
        return stripe.PaymentIntent.create(
            amount=int(amount * 100),
            currency="brl",
            payment_method="pm_card_visa",
            confirm=True,
            automatic_payment_methods={
                "enabled": True,
                "allow_redirects": "never",
            },
            metadata={"order_id": str(order_id)},
        )
