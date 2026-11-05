import json
import os
import sys
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo


TIME_ZONE = ZoneInfo("America/Bogota")


def firebase_request(database_url, auth_token, path, method, payload=None):
    url = f"{database_url.rstrip('/')}/{path}.json"
    if auth_token:
        url = f"{url}?{urlencode({'auth': auth_token})}"

    body = None if payload is None else json.dumps(payload).encode("utf-8")
    request = Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method=method,
    )
    try:
        with urlopen(request, timeout=30) as response:
            response_body = response.read()
            return json.loads(response_body) if response_body else None
    except HTTPError as error:
        print(f"Firebase request failed with HTTP {error.code}.", file=sys.stderr)
        raise SystemExit(1) from None
    except URLError as error:
        print(f"Could not connect to Firebase: {error.reason}", file=sys.stderr)
        raise SystemExit(1) from None


def main():
    database_url = os.environ.get("FIREBASE_DATABASE_URL")
    if not database_url:
        print("FIREBASE_DATABASE_URL is required.", file=sys.stderr)
        return 1

    auth_token = os.environ.get("FIREBASE_DATABASE_AUTH_TOKEN", "")
    today = datetime.now(TIME_ZONE).date()
    records = firebase_request(database_url, auth_token, "registros", "GET") or {}
    if not isinstance(records, dict):
        print("Firebase returned an invalid registros value.", file=sys.stderr)
        return 1

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
