import os
import requests
import argparse
import logging
import hashlib
import random
import string
import re
from urllib.parse import quote

# ---------- CLI ----------

parser = argparse.ArgumentParser()
parser.add_argument("--dry-run", action="store_true")
parser.add_argument("--no-ranger", action="store_true")
parser.add_argument("--log-file", default=None)
parser.add_argument("--groups", nargs="*", default=[])
args = parser.parse_args()

# ---------- Logging ----------

logger = logging.getLogger("ranger-sync")
logger.setLevel(logging.INFO)

formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")

console = logging.StreamHandler()
console.setFormatter(formatter)
logger.addHandler(console)

if args.log_file:
    fh = logging.FileHandler(args.log_file)
    fh.setFormatter(formatter)
    logger.addHandler(fh)

# ---------- Config ----------

KC_URL = os.environ["KEYCLOAK_URL"]
KC_REALM = os.environ["KEYCLOAK_REALM"]
KC_CLIENT = os.environ["KEYCLOAK_CLIENT_ID"]
KC_SECRET = os.environ["KEYCLOAK_CLIENT_SECRET"]

RANGER_URL = os.environ.get("RANGER_URL", "")
RANGER_USER = os.environ.get("RANGER_USER", "")
RANGER_PASS = os.environ.get("RANGER_PASSWORD", "")

SYSTEM_GROUPS = {"public"}

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# ---------- Utils ----------

def mask(val):
    return hashlib.sha256(val.encode()).hexdigest()[:8] if val else val


import time

def safe_request(method, url, retries=3, timeout=5, **kwargs):
    for attempt in range(1, retries + 1):
        try:
            logger.info(f"{method} {url} (attempt {attempt})")

            r = requests.request(method, url, timeout=timeout, **kwargs)

            if r.status_code not in (200, 201, 204):
                logger.error(f"{method} {url} -> {r.status_code}")
                logger.error(f"Response body: {r.text}")

            return r

        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")

            if attempt == retries:
                raise

            sleep_time = 2 ** attempt
            logger.info(f"Retrying in {sleep_time}s...")
            time.sleep(sleep_time)
# ---------- Keycloak ----------

def get_kc_token():
    r = safe_request(
        "POST",
        f"{KC_URL}/realms/{KC_REALM}/protocol/openid-connect/token",
        data={
            "grant_type": "client_credentials",
            "client_id": KC_CLIENT,
            "client_secret": KC_SECRET,
        },
    )
    r.raise_for_status()
    return r.json()["access_token"]


def kc_get_all(path, token):
    headers = {"Authorization": f"Bearer {token}"}
    result, first = [], 0

    while True:
        r = safe_request(
            "GET",
            f"{KC_URL}/admin/realms/{KC_REALM}/{path}?first={first}&max=100",
            headers=headers,
        )
        r.raise_for_status()

        data = r.json()
        if not data:
            break

        result.extend(data)
        first += 100

    return result


def get_group_members(group_id, token):
    headers = {"Authorization": f"Bearer {token}"}
    r = safe_request(
        "GET",
        f"{KC_URL}/admin/realms/{KC_REALM}/groups/{group_id}/members",
        headers=headers,
    )
    r.raise_for_status()
    return r.json()


def get_filtered_kc_users(token):
    groups = kc_get_all("groups", token)

    if not args.groups:
        return kc_get_all("users", token), groups

    users = {}
    selected_groups = []

    for g in groups:
        if g["name"] not in args.groups:
            continue

        selected_groups.append(g)
        members = get_group_members(g["id"], token)

        for m in members:
            users[m["username"]] = m

    return list(users.values()), selected_groups

# ---------- Ranger ----------

def ranger_request(method, path, json_body=None):
    url = f"{RANGER_URL}{path}"

    if args.dry_run and method in ("POST", "PUT", "DELETE"):
        logger.info(f"[DRY-RUN] {method} {path}")
        return None

    r = safe_request(
        method,
        url,
        auth=(RANGER_USER, RANGER_PASS),
        json=json_body,
        headers={"Content-Type": "application/json"},
    )

    if r is not None and r.status_code not in (200, 201, 204):
        logger.error(f"Response body: {r.text}")
        logger.error(f"Payload: {json_body}")

    return r


def get_all_ranger_users():
    users = []
    start = 0
    size = 200

    while True:
        r = ranger_request("GET", f"/service/xusers/users?startIndex={start}&pageSize={size}")
        if r is None:
            break
        r.raise_for_status()

        data = r.json()
        batch = data.get("vXUsers", [])
        if not batch:
            break

        users.extend(batch)

        if len(batch) < size:
            break

        start += size

    return users


def get_all_ranger_groups():
    r = ranger_request("GET", "/service/xusers/groups")
    if r is None:
        return []
    r.raise_for_status()
    return r.json().get("vXGroups", [])


def get_ranger_group_members():
    r = ranger_request("GET", "/service/xusers/ugsync/groupusers")
    if r is None:
        return {}

    data = r.json()
    result = {}

    for group_name, users in data.items():
        result[group_name] = set(users or [])

    return result

# ---------- Helpers ----------

def generate_password():
    return "Aa1" + "".join(random.choices(string.ascii_letters + string.digits, k=10))


def derive_first_name(u):
    first = (u.get("firstName") or "").strip()
    if first:
        return first

    email = u.get("email")
    if email and EMAIL_RE.match(email):
        return email.split("@")[0]

    return u["username"]


def normalize_user(u):
    payload = {
        "name": u["username"],
        "firstName": derive_first_name(u),
        "lastName": u.get("lastName") or "",
        "status": 1,
        "isVisible": 1,
        "userSource": 1,
        "userRoleList": ["ROLE_USER"],
        "password": generate_password(),
    }

    if EMAIL_RE.match(u.get("email") or ""):
        payload["emailAddress"] = u["email"]

    return payload


def user_changed(ranger_user, payload):
    return not (
            (ranger_user.get("firstName") or "") == payload.get("firstName", "")
            and (ranger_user.get("lastName") or "") == payload.get("lastName", "")
            and (ranger_user.get("emailAddress") or "") == payload.get("emailAddress", "")
            and ranger_user.get("status") == payload.get("status")
            and ranger_user.get("isVisible") == payload.get("isVisible")
            and set(ranger_user.get("userRoleList") or []) == set(payload.get("userRoleList") or [])
    )

# ---------- Main ----------

def main():
    token = get_kc_token()

    kc_users, kc_groups = get_filtered_kc_users(token)
    logger.info(f"KC groups total: {len(kc_groups)}")
    logger.info(f"KC users selected: {len(kc_users)}")

    if args.groups:
        logger.info(f"Requested groups: {args.groups}")
        logger.info(f"Matched groups: {[g['name'] for g in kc_groups]}")

    if args.no_ranger:
        logger.info("Running without Ranger")
        return

    ranger_users = get_all_ranger_users()
    ranger_groups = get_all_ranger_groups()

    kc_user_map = {u["username"]: u for u in kc_users}
    ranger_user_map = {u["name"]: u for u in ranger_users}

    kc_usernames = set(kc_user_map)
    ranger_usernames = set(ranger_user_map)

    skipped_updates = 0

    # ---------- USERS ----------

    for u in kc_usernames - ranger_usernames:
        ranger_request("POST", "/service/xusers/secure/users", normalize_user(kc_user_map[u]))

    for u in kc_usernames & ranger_usernames:
        payload = normalize_user(kc_user_map[u])
        ranger_user = ranger_user_map[u]

        if not user_changed(ranger_user, payload):
            skipped_updates += 1
            continue

        ranger_request(
            "PUT",
            f"/service/xusers/secure/users/{ranger_user['id']}",
            payload,
        )

    logger.info(f"Skipped user updates: {skipped_updates}")

    for u, obj in ranger_user_map.items():
        if obj.get("userSource") == 1 and u not in kc_usernames:
            logger.info(f"DELETE URL: {RANGER_URL}/service/xusers/secure/users/id/{obj['id']}")
            r = ranger_request("DELETE", f"/service/xusers/secure/users/id/{obj['id']}?forceDelete=true")
            logger.info(f"DELETE STATUS: {r.status_code if r else 'DRY'}")

    # ---------- GROUPS ----------

    kc_group_map = {g["name"]: g for g in kc_groups}
    ranger_group_map = {g["name"]: g for g in ranger_groups}

    kc_group_names = set(kc_group_map)
    ranger_group_names = set(ranger_group_map)

    for g in kc_group_names - ranger_group_names:
        ranger_request("POST", "/service/xusers/secure/groups", {"name": g})

    for g in ranger_group_names - kc_group_names:
        if g in SYSTEM_GROUPS:
            continue
        ranger_request("DELETE", f"/service/xusers/secure/groups/{g}")

    # ---------- MEMBERSHIP ----------

    ranger_members_map = get_ranger_group_members()

    for g in kc_group_names & ranger_group_names:
        kc_members = set(
            m["username"]
            for m in get_group_members(kc_group_map[g]["id"], token)
        )

        ranger_members = ranger_members_map.get(g, set())

        to_add = list(kc_members - ranger_members)
        to_del = list(ranger_members - kc_members)

        if not to_add and not to_del:
            logger.info(f"Skip group (no changes): {g}")
            continue

        logger.info(f"Group {g}: +{len(to_add)} -{len(to_del)} users")

        ranger_request(
            "POST",
            "/service/xusers/ugsync/groupusers",
            [
                {
                    "groupName": g,
                    "addUsers": to_add,
                    "delUsers": to_del,
                }
            ],
        )

    logger.info("Sync finished")


if __name__ == "__main__":
    main()