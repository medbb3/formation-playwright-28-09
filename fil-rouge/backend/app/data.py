"""Données en mémoire de la mini-banque.

Tout est réinitialisable via POST /api/dev/reset : les tests Playwright partent
toujours d'un état connu (règle anti-flaky n°2).
"""
from __future__ import annotations

import copy
from datetime import date, timedelta

# Code MFA fixe en environnement de formation (configurable via MFA_CODE)
import os

MFA_CODE = os.environ.get("MFA_CODE", "123456")

_USERS = [
    {"id": 1, "email": "alice@bank.test", "password": "Alice123!", "name": "Alice Martin", "role": "client"},
    {"id": 2, "email": "bob@bank.test", "password": "Bob123!", "name": "Bob Durand", "role": "client"},
    {"id": 3, "email": "carol@bank.test", "password": "Carol123!", "name": "Carol Petit", "role": "advisor"},
]

_BENEFICIARIES = [
    {"id": 1, "user_id": 1, "name": "Bob Durand", "iban": "FR76 1000 1000 0155 5555 5555 555"},
    {"id": 2, "user_id": 1, "name": "Loyer Agence Immo", "iban": "FR76 2000 2000 0100 0000 0000 123"},
]

_ACCOUNTS = [
    {"id": 1, "user_id": 1, "label": "Compte courant", "iban": "FR76 3000 6000 0112 3456 7890 189", "balance": 2500.00},
    {"id": 2, "user_id": 1, "label": "Livret A", "iban": "FR76 3000 6000 0198 7654 3210 123", "balance": 8000.00},
    {"id": 3, "user_id": 2, "label": "Compte courant", "iban": "FR76 1000 1000 0155 5555 5555 555", "balance": 120.00},
]


def _initial_transactions() -> list[dict]:
    today = date.today()
    return [
        {"id": 1, "account_id": 1, "date": (today - timedelta(days=10)).isoformat(), "label": "Salaire", "amount": 2300.00},
        {"id": 2, "account_id": 1, "date": (today - timedelta(days=7)).isoformat(), "label": "Loyer", "amount": -850.00},
        {"id": 3, "account_id": 1, "date": (today - timedelta(days=3)).isoformat(), "label": "Courses", "amount": -64.30},
        {"id": 4, "account_id": 2, "date": (today - timedelta(days=30)).isoformat(), "label": "Intérêts", "amount": 12.50},
        {"id": 5, "account_id": 3, "date": (today - timedelta(days=2)).isoformat(), "label": "Restaurant", "amount": -45.00},
    ]


class Store:
    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        """Réinitialise tout, sessions comprises (démarrage)."""
        self.sessions: dict[str, int] = {}      # access_token -> user_id
        self.mfa_pending: dict[str, int] = {}   # mfa_token -> user_id
        self.reset_data()

    def reset_data(self) -> None:
        """Réinitialise comptes et opérations en conservant les sessions ouvertes,
        pour que des tests parallèles connectés ne soient pas déconnectés."""
        self.users = copy.deepcopy(_USERS)
        self.accounts = copy.deepcopy(_ACCOUNTS)
        self.beneficiaries = copy.deepcopy(_BENEFICIARIES)
        self.transactions = _initial_transactions()
        self.analytics_events: list[dict] = []

    def next_transaction_id(self) -> int:
        return max((t["id"] for t in self.transactions), default=0) + 1

    def next_beneficiary_id(self) -> int:
        return max((b["id"] for b in self.beneficiaries), default=0) + 1


store = Store()
