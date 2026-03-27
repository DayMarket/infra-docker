import os
import requests
import argparse
import logging
import re
import time
import random
import string


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

def generate_password():
    return "Aa1" + "".join(random.choices(string.ascii_letters + string.digits, k=10))

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
            time.sleep(2 ** attempt)

def is_success(r):
    return r is not None and r.status_code in (200, 201, 204)

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
    result = []
    first = 0

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
    result = []
    first = 0

    while True:
        r = safe_request(
            "GET",
            f"{KC_URL}/admin/realms/{KC_REALM}/groups/{group_id}/members?first={first}&max=100",
            headers=headers,
        )
        r.raise_for_status()

        data = r.json()
        if not data:
            break

        result.extend(data)
        first += 100

    return result

def get_filtered_kc_users(token):
    groups = kc_get_all("groups", token)
    groups_filter = get_groups_from_env()

    if not groups_filter:
        all_users = kc_get_all("users", token)
        logger.info("No group filter provided, all KC users will be managed")
        return all_users, groups

    users = {}
    selected_groups = []

    for g in groups:
        if g["name"] not in groups_filter:
            continue

        selected_groups.append(g)
        members = get_group_members(g["id"], token)

        for m in members:
            users[m["username"]] = m

    logger.info(f"Selected KC groups: {[g['name'] for g in selected_groups]}")
    logger.info(f"Users collected from selected groups: {len(users)}")

    return list(users.values()), selected_groups

# ---------- Ranger ----------

def ranger_request(method, path, json_body=None):
    url = f"{RANGER_URL}{path}"

    if args.dry_run and method in ("POST", "PUT", "DELETE"):
        logger.info(f"[DRY-RUN] {method} {path}")
        if json_body:
            logger.info(f"[DRY-RUN] Payload: {json_body}")
        return None

    return safe_request(
        method,
        url,
        auth=(RANGER_USER, RANGER_PASS),
        json=json_body,
        headers={"Content-Type": "application/json"},
    )

def get_all_ranger_users():
    result = []
    start = 0
    page_size = 100

    while True:
        r = ranger_request(
            "GET",
            f"/service/xusers/users?startIndex={start}&pageSize={page_size}",
        )
        r.raise_for_status()

        data = r.json()
        users = data.get("vXUsers", [])

        if not users:
            break

        result.extend(users)

        if len(users) < page_size:
            break

        start += page_size

    logger.info(f"Total Ranger users fetched: {len(result)}")
    return result

def get_all_ranger_groups():
    result = []
    start = 0
    page_size = 100

    while True:
        r = ranger_request(
            "GET",
            f"/service/xusers/groups?startIndex={start}&pageSize={page_size}",
        )
        r.raise_for_status()

        data = r.json()
        groups = data.get("vXGroups", [])

        if not groups:
            break

        result.extend(groups)

        if len(groups) < page_size:
            break

        start += page_size

    logger.info(f"Total Ranger groups fetched: {len(result)}")
    return result

def get_ranger_group_members():
    r = ranger_request("GET", "/service/xusers/ugsync/groupusers")
    r.raise_for_status()
    data = r.json()
    return {k: set(v or []) for k, v in data.items()}

# ---------- Helpers ----------

def normalize_user(u):
    payload = {
        "name": u["username"],
        "firstName": u.get("firstName") or u["username"],
        "lastName": u.get("lastName") or "",
        "password": generate_password(),
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
    managed_kc_usernames = {u["username"] for u in kc_users}
    logger.info(f"Managed KC users: {len(managed_kc_usernames)}")

    if args.no_ranger:
        return

    ranger_users = get_all_ranger_users()
    ranger_groups = get_all_ranger_groups()

    kc_user_map = {u["username"]: u for u in kc_users}
    ranger_user_map = {u["name"]: u for u in ranger_users}

    if len(managed_kc_usernames) == 0:
        logger.error("No users from selected groups — aborting")
        return

    ranger_usernames = set(ranger_user_map.keys())

    to_create = managed_kc_usernames - ranger_usernames

    to_delete = {
        u for u, obj in ranger_user_map.items()
        if obj.get("userSource") == 1 and u not in managed_kc_usernames
    }

    to_update = set()
    for u in managed_kc_usernames & ranger_usernames:
        kc_norm = normalize_user(kc_user_map[u])
        ranger_obj = ranger_user_map[u]

        if (
                kc_norm.get("firstName") != ranger_obj.get("firstName")
                or kc_norm.get("lastName") != ranger_obj.get("lastName")
                or kc_norm.get("emailAddress") != ranger_obj.get("emailAddress")
        ):
            to_update.add(u)

    logger.info(f"Users to create: {len(to_create)}")
    logger.info(f"Users to update: {len(to_update)}")
    logger.info(f"Users to delete: {len(to_delete)}")

    # CREATE
    for u in to_create:
        ranger_request("POST", "/service/xusers/secure/users", normalize_user(kc_user_map[u]))

    # UPDATE
    for u in to_update:
        obj = ranger_user_map[u]
        payload = normalize_user(kc_user_map[u])
        payload["id"] = obj["id"]

        ranger_request("PUT", f"/service/xusers/secure/users/{obj['id']}", payload)

    # DELETE
    for u in to_delete:
        obj = ranger_user_map[u]
        logger.info(f"Delete user: {u}")

        r = ranger_request(
            "DELETE",
            f"/service/xusers/secure/users/id/{obj['id']}?forceDelete=true",
        )

        if not is_success(r):
            logger.error(f"Failed to delete user {u}")
            logger.error(f"Status: {r.status_code if r else 'no response'}")
            logger.error(f"Response: {r.text if r else 'empty'}")

    # ---------- GROUPS ----------

    kc_group_names = {g["name"] for g in kc_groups}
    ranger_group_map = {g["name"]: g for g in ranger_groups}

    for g in kc_group_names - ranger_group_map.keys():
        ranger_request(
            "POST",
            "/service/xusers/secure/groups",
            {"name": g, "groupSource": 1, "syncSource": "keycloak"},
        )

    for g, obj in ranger_group_map.items():
        if g in SYSTEM_GROUPS:
            continue
        if obj.get("groupSource") != 1:
            continue
        if g not in kc_group_names:
            ranger_request(
                "DELETE",
                f"/service/xusers/secure/groups/id/{obj['id']}?forceDelete=true",
            )

    # ---------- MEMBERSHIP ----------

    ranger_members_map = get_ranger_group_members()

    for g in kc_group_names:
        group_id = next(x["id"] for x in kc_groups if x["name"] == g)

        kc_members = {
            m["username"] for m in get_group_members(group_id, token)
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