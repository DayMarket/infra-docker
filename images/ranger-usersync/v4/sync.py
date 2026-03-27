import os
import requests
import argparse
import logging
import hashlib
import random
import string
import re
from urllib.parse import quote
import time

# ---------- CLI ----------

parser = argparse.ArgumentParser()
parser.add_argument("--dry-run", action="store_true")
parser.add_argument("--no-ranger", action="store_true")
parser.add_argument("--log-file", default=None)
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
            time.sleep(sleep_time)

def get_groups_from_env():
    raw = os.environ.get("RANGER_SYNC_GROUPS", "")
    groups = [g.strip() for g in raw.splitlines() if g.strip()]
    logger.info(f"Groups from env: {groups}")
    return groups

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
    groups_filter = get_groups_from_env()

    if not groups_filter:
        return kc_get_all("users", token), groups

    users = {}
    selected_groups = []

    for g in groups:
        if g["name"] not in groups_filter:
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

    return r

def get_all_ranger_users():
    r = ranger_request("GET", "/service/xusers/users")
    r.raise_for_status()
    return r.json().get("vXUsers", [])

def get_all_ranger_groups():
    r = ranger_request("GET", "/service/xusers/groups")
    r.raise_for_status()
    return r.json().get("vXGroups", [])

def get_ranger_group_members():
    r = ranger_request("GET", "/service/xusers/ugsync/groupusers")
    data = r.json()
    return {k: set(v or []) for k, v in data.items()}

# ---------- Helpers ----------

def generate_password():
    return "Aa1" + "".join(random.choices(string.ascii_letters + string.digits, k=10))

def normalize_user(u):
    payload = {
        "name": u["username"],
        "firstName": u.get("firstName") or u["username"],
        "lastName": u.get("lastName") or "",
        "status": 1,
        "isVisible": 1,
        "userSource": 1,
        "userRoleList": ["ROLE_USER"],
    }

    if EMAIL_RE.match(u.get("email") or ""):
        payload["emailAddress"] = u["email"]

    return payload

# ---------- Main ----------

def main():
    token = get_kc_token()

    kc_users, kc_groups = get_filtered_kc_users(token)

    if args.no_ranger:
        return

    ranger_users = get_all_ranger_users()
    ranger_groups = get_all_ranger_groups()

    kc_user_map = {u["username"]: u for u in kc_users}
    ranger_user_map = {u["name"]: u for u in ranger_users}

    kc_usernames = set(kc_user_map)

    # ---------- USERS ----------

    for u in kc_usernames - ranger_user_map.keys():
        ranger_request("POST", "/service/xusers/secure/users", normalize_user(kc_user_map[u]))

    for u, obj in ranger_user_map.items():
        if obj.get("userSource") != 1:
            continue

        if u not in kc_usernames:
            logger.info(f"Delete user: {u}")

            ranger_request(
                "DELETE",
                f"/service/xusers/secure/users/id/{obj['id']}?forceDelete=true",
            )

    # ---------- GROUPS ----------

    kc_group_names = {g["name"] for g in kc_groups}
    ranger_group_map = {g["name"]: g for g in ranger_groups}

    for g in kc_group_names - ranger_group_map.keys():
        ranger_request(
            "POST",
            "/service/xusers/secure/groups",
            {
                "name": g,
                "groupSource": 1,
                "syncSource": "keycloak",
            },
        )

    for g, obj in ranger_group_map.items():
        if g in SYSTEM_GROUPS:
            continue

        if g not in kc_group_names:
            logger.info(f"Delete group: {g}")

            ranger_request(
                "DELETE",
                f"/service/xusers/secure/groups/id/{obj['id']}?forceDelete=true",
            )

    # ---------- MEMBERSHIP ----------

    ranger_members_map = get_ranger_group_members()

    for g in kc_group_names:
        kc_members = {
            m["username"]
            for m in get_group_members(
                next(x["id"] for x in kc_groups if x["name"] == g), token
            )
        }

        ranger_members = ranger_members_map.get(g, set())

        ranger_request(
            "POST",
            "/service/xusers/ugsync/groupusers",
            [{
                "groupName": g,
                "addUsers": list(kc_members - ranger_members),
                "delUsers": list(ranger_members - kc_members),
            }],
        )

    logger.info("Sync finished")

if __name__ == "__main__":
    main()