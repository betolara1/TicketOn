from src.services.qrcode_service import build_qr_payload, verify_qr_payload
from src.routers.events_routers import get_row_label

def test_generate_row_labels():
    """Testa se o gerador de fileiras nunca gera letras minúsculas"""
    assert get_row_label(0) == "A"
    assert get_row_label(25) == "Z"
    assert get_row_label(26) == "AA"
    assert get_row_label(27) == "AB"

def test_qr_code_signature_and_verification():
    """Testa se o QR code assinado com HMAC é gerado e validado com sucesso"""
    ticket_code = "ticket-uuid-12345"
    payload = build_qr_payload(ticket_code)
    
    # Deve conter o código e a assinatura separados por ponto
    assert "." in payload
    
    # Deve validar com sucesso
    verified_code = verify_qr_payload(payload)
    assert verified_code == ticket_code

def test_tampered_qr_code_fails():
    """Testa se um QR code forjado/alterado é rejeitado"""
    fake_payload = "ticket-uuid-12345.assinatura_falsificada_123"
    verified_code = verify_qr_payload(fake_payload)
    assert verified_code is None
