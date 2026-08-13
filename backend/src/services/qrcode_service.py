import hmac
import hashlib
import base64
import io
import qrcode

from src.core.config import settings


def _sign(ticket_code: str) -> str:
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        ticket_code.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature


def build_qr_payload(ticket_code: str) -> str:
    signature = _sign(ticket_code)
    return f"{ticket_code}.{signature}"


def verify_qr_payload(payload: str) -> str | None:
    if "." not in payload:
        return None
    ticket_code, signature = payload.rsplit(".", 1)
    expected = _sign(ticket_code)
    if hmac.compare_digest(expected, signature):
        return ticket_code
    return None


def generate_qr_image_base64(payload: str) -> str:
    img = qrcode.make(payload)
    buffer = io.BytesIO()
    # pyrefly: ignore [unexpected-keyword]
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode()