import json
import os
import sys
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo


TIME_ZONE = ZoneInfo("America/Bogota")


def read_json_response(request, timeout=30):
    with urlopen(request, timeout=timeout) as response:
        body = response.read()
        return json.loads(body) if body else None


def firebase_request(database_url, auth_token, path, method, payload=None):
    url = f"{database_url.rstrip('/')}/{path}.json?{urlencode({'auth': auth_token})}"
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    request = Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method=method,
    )
    try:
        return read_json_response(request)
    except HTTPError as error:
        print(f"Firebase Realtime Database request failed with HTTP {error.code}.", file=sys.stderr)
        raise SystemExit(1) from None
    except URLError as error:
        print(f"Could not connect to Firebase Realtime Database: {error.reason}", file=sys.stderr)
        raise SystemExit(1) from None


def sign_in(api_key, email, password):
    url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
    request = Request(
        f"{url}?{urlencode({'key': api_key})}",
        data=json.dumps({
            "email": email,
            "password": password,
            "returnSecureToken": True,
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        result = read_json_response(request)
    except HTTPError as error:
        print(f"Firebase Authentication failed with HTTP {error.code}.", file=sys.stderr)
        raise SystemExit(1) from None
    except URLError as error:
        print(f"Could not connect to Firebase Authentication: {error.reason}", file=sys.stderr)
        raise SystemExit(1) from None

    token = result.get("idToken") if isinstance(result, dict) else None
    if not token:
        print("Firebase Authentication returned no ID token.", file=sys.stderr)
        raise SystemExit(1)
    return token


def main():
    database_url = os.environ.get("FIREBASE_DATABASE_URL")
    api_key = os.environ.get("FIREBASE_WEB_API_KEY")
    email = os.environ.get("FIREBASE_AUTOMATION_EMAIL")
    password = os.environ.get("FIREBASE_AUTOMATION_PASSWORD")
    missing = [
        name for name, value in (
            ("FIREBASE_DATABASE_URL", database_url),
            ("FIREBASE_WEB_API_KEY", api_key),
            ("FIREBASE_AUTOMATION_EMAIL", email),
            ("FIREBASE_AUTOMATION_PASSWORD", password),
        ) if not value
    ]
    if missing:
        print(f"Required environment variables are missing: {', '.join(missing)}.", file=sys.stderr)
        return 1

    auth_token = sign_in(api_key, email, password)
    records = firebase_request(database_url, auth_token, "registros", "GET") or {}
    if not isinstance(records, dict):
        print("Firebase returned an invalid registros value.", file=sys.stderr)
        return 1

    today = datetime.now(TIME_ZONE).date()
    generated = 0
    invalid_dates = 0
    for record_id, record in records.items():
        if not isinstance(record, dict) or record.get("generado") is True:
            continue

        raw_date = record.get("fecha")
        try:
            if not isinstance(raw_date, str):
                raise ValueError
            record_date = datetime.strptime(raw_date, "%d-%m-%Y").date()
        except ValueError:
            print(f"Skipping record {record_id}: invalid or missing date.", file=sys.stderr)
            invalid_dates += 1
            continue

        if record_date < today:
            donas = record.get("donas")
            if not isinstance(donas, dict):
                donas = {}
            donas_filtradas = {
                name: quantity for name, quantity in donas.items() if quantity != 0
            }
            firebase_request(
                database_url,
                auth_token,
                f"registros/{quote(record_id, safe='')}",
                "PATCH",
                {"generado": True, "donas": donas_filtradas},
            )
            generated += 1

    print(f"Generated {generated} past record(s) ({TIME_ZONE.key}).")
    if invalid_dates:
        print(f"{invalid_dates} editable record(s) need a valid date before they can be generated.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
