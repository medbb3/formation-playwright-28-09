"""Mini-banque — backend FastAPI de la formation Playwright."""
from __future__ import annotations

import os
import secrets
from datetime import date
from typing import Annotated

from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response
from pydantic import BaseModel, Field

from .data import MFA_CODE, store

app = FastAPI(title="Mini-banque", version="0.1.0")

# Origines autorisées (le front en dev). Surchargeable : CORS_ORIGINS="http://localhost:5173,http://..."
_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Modèles ----------

class LoginIn(BaseModel):
    email: str
    password: str


class MfaIn(BaseModel):
    mfa_token: str
    code: str


class BeneficiaryIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    iban: str = Field(min_length=15, max_length=34)


class AnalyticsEvent(BaseModel):
    event: str
    path: str


class TransferIn(BaseModel):
    from_account_id: int
    to_iban: str = ""
    amount: float = 0
    label: str = ""


class DevUserIn(BaseModel):
    name: str
    email: str
    password: str = "Test123!"
    balance: float = 1000.0
    role: str = "client"


# ---------- Auth ----------

def current_user(authorization: Annotated[str | None, Header()] = None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Authentification requise")
    token = authorization.removeprefix("Bearer ")
    user_id = store.sessions.get(token)
    if user_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session invalide ou expirée")
    return next(u for u in store.users if u["id"] == user_id)


def public_user(u: dict) -> dict:
    return {"id": u["id"], "email": u["email"], "name": u["name"], "role": u["role"]}


@app.post("/api/auth/login")
def login(body: LoginIn):
    user = next((u for u in store.users if u["email"].lower() == body.email.lower()), None)
    if user is None or user["password"] != body.password:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Identifiants incorrects")
    mfa_token = secrets.token_urlsafe(16)
    store.mfa_pending[mfa_token] = user["id"]
    return {"mfa_required": True, "mfa_token": mfa_token}


@app.post("/api/auth/mfa")
def verify_mfa(body: MfaIn):
    user_id = store.mfa_pending.get(body.mfa_token)
    if user_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session MFA expirée, reconnectez-vous")
    if body.code != MFA_CODE:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Code de vérification invalide")
    del store.mfa_pending[body.mfa_token]
    token = secrets.token_urlsafe(24)
    store.sessions[token] = user_id
    user = next(u for u in store.users if u["id"] == user_id)
    return {"access_token": token, "user": public_user(user)}


@app.post("/api/auth/logout", status_code=204)
def logout(authorization: Annotated[str | None, Header()] = None):
    if authorization and authorization.startswith("Bearer "):
        store.sessions.pop(authorization.removeprefix("Bearer "), None)


@app.get("/api/me")
def me(user: Annotated[dict, Depends(current_user)]):
    return public_user(user)


# ---------- Comptes et opérations ----------

def _user_accounts(user: dict) -> list[dict]:
    if user["role"] == "advisor":
        return store.accounts
    return [a for a in store.accounts if a["user_id"] == user["id"]]


def _with_owner(account: dict) -> dict:
    owner = next((u for u in store.users if u["id"] == account["user_id"]), None)
    return {**account, "owner": owner["name"] if owner else "?"}


@app.get("/api/accounts")
def list_accounts(user: Annotated[dict, Depends(current_user)]):
    return [_with_owner(a) for a in _user_accounts(user)]


@app.get("/api/accounts/{account_id}/transactions")
def list_transactions(account_id: int, user: Annotated[dict, Depends(current_user)]):
    if account_id not in {a["id"] for a in _user_accounts(user)}:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Compte introuvable")
    txs = [t for t in store.transactions if t["account_id"] == account_id]
    return sorted(txs, key=lambda t: (t["date"], t["id"]), reverse=True)


@app.get("/api/accounts/{account_id}/statement.csv")
def statement_csv(account_id: int, user: Annotated[dict, Depends(current_user)]):
    """Relevé des opérations au format CSV (séparateur ';', montants à la française)."""
    if account_id not in {a["id"] for a in _user_accounts(user)}:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Compte introuvable")
    txs = sorted(
        (t for t in store.transactions if t["account_id"] == account_id),
        key=lambda t: (t["date"], t["id"]),
        reverse=True,
    )
    lignes = ["date;libelle;montant"]
    lignes += [f"{t['date']};{t['label']};{t['amount']:.2f}".replace(".", ",", 1) for t in txs]
    contenu = "\r\n".join(lignes) + "\r\n"
    return Response(
        content=contenu,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="releve-{account_id}.csv"'},
    )


MAX_IMPORT_BYTES = 100 * 1024


@app.post("/api/beneficiaries/import")
async def import_beneficiaries(
    user: Annotated[dict, Depends(current_user)],
    file: Annotated[UploadFile, File()],
):
    """Import de bénéficiaires depuis un CSV « nom;iban » (en-tête facultatif)."""
    nom_fichier = (file.filename or "").lower()
    if not nom_fichier.endswith(".csv"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Format non supporté (attendu : .csv)")
    contenu = await file.read()
    if len(contenu) > MAX_IMPORT_BYTES:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Fichier trop volumineux (100 Ko maximum)")

    cree, ignore, erreurs = 0, 0, []
    for numero, ligne in enumerate(contenu.decode("utf-8-sig").splitlines(), start=1):
        ligne = ligne.strip()
        if not ligne or ligne.lower().startswith(("nom;", "beneficiaire;")):
            continue
        parts = [p.strip() for p in ligne.split(";")]
        if len(parts) < 2 or len(parts[0]) < 2:
            erreurs.append(f"Ligne {numero} : format attendu « nom;iban »")
            continue
        nom, iban_brut = parts[0], parts[1]
        iban = _normalize_iban(iban_brut)
        if not iban.startswith("FR") or len(iban) != 27:
            erreurs.append(f"Ligne {numero} : IBAN invalide")
            continue
        if any(b["user_id"] == user["id"] and _normalize_iban(b["iban"]) == iban for b in store.beneficiaries):
            ignore += 1
            continue
        store.beneficiaries.append(
            {"id": store.next_beneficiary_id(), "user_id": user["id"], "name": nom, "iban": iban_brut}
        )
        cree += 1
    return {"created": cree, "ignored": ignore, "errors": erreurs}


@app.post("/api/transfers", status_code=201)
def create_transfer(body: TransferIn, user: Annotated[dict, Depends(current_user)]):
    account = next((a for a in _user_accounts(user) if a["id"] == body.from_account_id), None)
    if account is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Compte introuvable")
    # Règles métier, avec des messages lisibles (utilisés par les jeux de données du J3)
    iban = _normalize_iban(body.to_iban)
    if not iban.startswith("FR") or len(iban) != 27:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "IBAN invalide")
    if body.amount <= 0:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Le montant doit être positif")
    if body.amount > 10000:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Le montant dépasse le plafond de 10 000 €")
    if not body.label.strip():
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Le libellé est obligatoire")
    if len(body.label) > 80:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Le libellé dépasse 80 caractères")
    if account["balance"] < body.amount:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Solde insuffisant")

    account["balance"] = round(account["balance"] - body.amount, 2)
    tx = {
        "id": store.next_transaction_id(),
        "account_id": account["id"],
        "date": date.today().isoformat(),
        "label": f"Virement : {body.label}",
        "amount": -body.amount,
    }
    store.transactions.append(tx)

    # Si l'IBAN cible est un compte de la banque, on crédite
    target = next((a for a in store.accounts if a["iban"].replace(" ", "") == body.to_iban.replace(" ", "")), None)
    if target is not None:
        target["balance"] = round(target["balance"] + body.amount, 2)
        store.transactions.append({
            "id": store.next_transaction_id(),
            "account_id": target["id"],
            "date": tx["date"],
            "label": f"Virement reçu : {body.label}",
            "amount": body.amount,
        })
    return {"transfer_id": tx["id"], "new_balance": account["balance"]}


# ---------- Bénéficiaires (CRUD, propres à chaque utilisateur) ----------

def _normalize_iban(iban: str) -> str:
    return iban.replace(" ", "").upper()


def _find_beneficiary(user: dict, beneficiary_id: int) -> dict:
    b = next(
        (b for b in store.beneficiaries if b["id"] == beneficiary_id and b["user_id"] == user["id"]),
        None,
    )
    if b is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Bénéficiaire introuvable")
    return b


@app.get("/api/beneficiaries")
def list_beneficiaries(user: Annotated[dict, Depends(current_user)]):
    return [b for b in store.beneficiaries if b["user_id"] == user["id"]]


@app.post("/api/beneficiaries", status_code=201)
def create_beneficiary(body: BeneficiaryIn, user: Annotated[dict, Depends(current_user)]):
    iban = _normalize_iban(body.iban)
    if not iban.startswith("FR") or len(iban) != 27:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "IBAN invalide (attendu : FR + 25 caractères)")
    if any(b["user_id"] == user["id"] and _normalize_iban(b["iban"]) == iban for b in store.beneficiaries):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Ce bénéficiaire existe déjà")
    b = {"id": store.next_beneficiary_id(), "user_id": user["id"], "name": body.name.strip(), "iban": body.iban.strip()}
    store.beneficiaries.append(b)
    return b


@app.get("/api/beneficiaries/{beneficiary_id}")
def get_beneficiary(beneficiary_id: int, user: Annotated[dict, Depends(current_user)]):
    return _find_beneficiary(user, beneficiary_id)


@app.put("/api/beneficiaries/{beneficiary_id}")
def update_beneficiary(beneficiary_id: int, body: BeneficiaryIn, user: Annotated[dict, Depends(current_user)]):
    b = _find_beneficiary(user, beneficiary_id)
    b["name"] = body.name.strip()
    b["iban"] = body.iban.strip()
    return b


@app.delete("/api/beneficiaries/{beneficiary_id}", status_code=204)
def delete_beneficiary(beneficiary_id: int, user: Annotated[dict, Depends(current_user)]):
    b = _find_beneficiary(user, beneficiary_id)
    store.beneficiaries.remove(b)


# ---------- Cours de change (source "externe" simulée) ----------

@app.get("/api/rates")
def rates():
    """Simule un fournisseur externe : c'est le candidat idéal au mocking côté test."""
    return {"base": "EUR", "date": date.today().isoformat(), "rates": {"USD": 1.08, "GBP": 0.85, "CHF": 0.94}}


# ---------- Télémétrie (à bloquer dans les tests) ----------

@app.post("/api/analytics/event", status_code=202)
def analytics(event: AnalyticsEvent):
    store.analytics_events.append(event.model_dump())
    return {"received": True}


# ---------- Contenu embarqué (iframe) ----------

LEGAL_HTML = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Conditions du virement</title>
<style>body{font-family:system-ui;margin:16px;font-size:14px;color:#222}</style></head>
<body>
<h2>Conditions du virement</h2>
<p>Les virements vers un compte externe sont exécutés sous 1 jour ouvré.
Tout virement est irrévocable une fois validé.</p>
<label><input type="checkbox" id="accept"> J'accepte les conditions</label>
<script>
  document.getElementById('accept').addEventListener('change', (e) => {
    window.parent.postMessage({ type: 'legal-accepted', accepted: e.target.checked }, '*');
  });
</script>
</body></html>"""


@app.get("/legal", response_class=HTMLResponse)
def legal():
    return LEGAL_HTML


# ---------- Outils de test ----------

@app.post("/api/dev/users", status_code=201)
def create_dev_user(body: DevUserIn):
    """Crée un utilisateur de test avec un compte courant. Réservé à l'environnement de formation
    (stratégie d'isolation n°3 : un utilisateur par worker)."""
    if any(u["email"].lower() == body.email.lower() for u in store.users):
        raise HTTPException(status.HTTP_409_CONFLICT, "E-mail déjà utilisé")
    user_id = max(u["id"] for u in store.users) + 1
    account_id = max(a["id"] for a in store.accounts) + 1
    user = {"id": user_id, "email": body.email, "password": body.password, "name": body.name, "role": body.role}
    store.users.append(user)
    iban = f"FR76 0000 {user_id:04d} 0000 0000 0000 {account_id % 1000:03d}"
    account = {"id": account_id, "user_id": user_id, "label": "Compte courant", "iban": iban, "balance": body.balance}
    store.accounts.append(account)
    return {"user": public_user(user), "account": account, "password": body.password}


@app.delete("/api/dev/users/{user_id}", status_code=204)
def delete_dev_user(user_id: int):
    """Supprime un utilisateur de test et tout ce qui lui appartient."""
    if user_id <= 3:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Utilisateurs de référence non supprimables")
    store.users = [u for u in store.users if u["id"] != user_id]
    account_ids = {a["id"] for a in store.accounts if a["user_id"] == user_id}
    store.accounts = [a for a in store.accounts if a["user_id"] != user_id]
    store.transactions = [t for t in store.transactions if t["account_id"] not in account_ids]
    store.beneficiaries = [b for b in store.beneficiaries if b["user_id"] != user_id]
    store.sessions = {t: uid for t, uid in store.sessions.items() if uid != user_id}


@app.post("/api/dev/reset", status_code=204)
def reset():
    """Remet comptes et opérations à l'état initial (les sessions sont conservées).
    Réservé à l'environnement de formation."""
    store.reset_data()


@app.get("/api/health")
def health():
    return {"status": "ok"}
