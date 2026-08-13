import random
import time

class PaymentService:
    @staticmethod
    def charge(amount: float, method: str = "credit_card") -> bool:
        time.sleep(0.3) 
        return True  # ou: random.random() > 0.05 para simular 5% de falha