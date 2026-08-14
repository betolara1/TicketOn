def test_register_and_login_user(client):
    """Testa o cadastro e login de um novo usuário"""
    # 1. Cadastro
    user_payload = {
        "name": "Roberto Lara",
        "email": "roberto@hotmail.com",
        "password": "SenhaForte@123",
        "role": "CUSTOMER"
    }
    response_register = client.post("/api/v1/auth/register", json=user_payload)
    assert response_register.status_code == 201
    data = response_register.json()
    assert data["email"] == "roberto@hotmail.com"
    assert "id" in data

    # 2. Login com as credenciais cadastradas
    login_data = {
        "username": "roberto@hotmail.com",
        "password": "SenhaForte@123"
    }
    response_login = client.post("/api/v1/auth/login", data=login_data)
    assert response_login.status_code == 200
    token_data = response_login.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
