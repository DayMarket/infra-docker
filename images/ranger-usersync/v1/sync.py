import os
import requests
import argparse
import logging
import hashlib

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

# ---------- Utils ----------

def mask(val):
    if not val:
        return val
    return hashlib.sha256(val.encode()).hexdigest()[:8]


def safe_request(method, url, **kwargs):
    try:
        r = requests.request(method, url, **kwargs)
        if r.status_code not in (200, 201):
            logger.error(f"{method} {url} -> {r.status_code}")
        return r
    except Exception:
        logger.exception(f"Request failed: {method} {url}")
        raise


# ---------- Keycloak ----------

def get_kc_token():
    logger.info("Auth: client_credentials")

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
        url = f"{KC_URL}/admin/realms/{KC_REALM}/{path}?first={first}&max=100"
        r = safe_request("GET", url, headers=headers)
        r.raise_for_status()

        data = r.json()
        if not data:
            break

        result.extend(data)
        first += 100

    return result


def get_kc_users(token):
    return kc_get_all("users", token)


def get_kc_groups(token):
    return kc_get_all("groups", token)


def get_group_members(group_id, token):
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{KC_URL}/admin/realms/{KC_REALM}/groups/{group_id}/members"
    r = safe_request("GET", url, headers=headers)
    r.raise_for_status()
    return r.json()


# ---------- Ranger ----------

def ranger_request(method, path, json=None):
    if args.no_ranger:
        return None

    url = f"{RANGER_URL}{path}"

    if args.dry_run and method in ("POST", "PUT", "DELETE"):
        logger.info(f"[DRY-RUN] {method} {path}")
        return None

    return safe_request(
        method,
        url,
        auth=(RANGER_USER, RANGER_PASS),
        json=json,
    )


def get_ranger_users():
    if args.no_ranger:
        logger.info("Skipping Ranger users fetch")
        return []
    r = ranger_request("GET", "/service/xusers/users")
    return r.json()


def get_ranger_groups():
    if args.no_ranger:
        logger.info("Skipping Ranger groups fetch")
        return []
    r = ranger_request("GET", "/service/xusers/groups")
    return r.json()


# ---------- Sync ----------

def normalize_user(u):
    return {
        "name": u["username"],
        "firstName": u.get("firstName", ""),
        "lastName": u.get("lastName", ""),
        "emailAddress": u.get("email", ""),
        "status": 1,
        "isVisible": 1,
        "userRoleList": ["ROLE_USER"],
        "otherAttributes": {"source": "keycloak"},
    }


def main():
    logger.info("Starting sync")

    token = get_kc_token()

    kc_users = get_kc_users(token)
    kc_groups = get_kc_groups(token)

    logger.info(f"KC users: {len(kc_users)}")
    logger.info(f"KC groups: {len(kc_groups)}")



    if args.no_ranger:
        logger.info("Running without Ranger (debug mode)")
        return

    ranger_users = get_ranger_users()
    ranger_groups = get_ranger_groups()

    kc_user_map = {u["username"]: u for u in kc_users}
    ranger_user_map = {u["name"]: u for u in ranger_users}

    kc_group_map = {g["name"]: g for g in kc_groups}
    ranger_group_map = {g["name"]: g for g in ranger_groups}

    # USERS

    for username, u in kc_user_map.items():
        payload = normalize_user(u)

        if username in ranger_user_map:
            logger.info(f"Update user: {mask(username)}")
            ranger_request("PUT", f"/service/xusers/users/{username}", json=payload)
        else:
            logger.info(f"Create user: {mask(username)}")
            ranger_request("POST", "/service/xusers/users", json=payload)

    for username, u in ranger_user_map.items():
        attrs = u.get("otherAttributes", {})
        if attrs.get("source") == "keycloak" and username not in kc_user_map:
            logger.warning(f"Delete user: {mask(username)}")
            ranger_request("DELETE", f"/service/xusers/users/{username}")

    # GROUPS

    for gname in kc_group_map:
        if gname not in ranger_group_map:
            logger.info(f"Create group: {mask(gname)}")
            ranger_request("POST", "/service/xusers/groups", json={"name": gname})

    for gname in ranger_group_map:
        if gname not in kc_group_map:
            logger.warning(f"Delete group: {mask(gname)}")
            ranger_request("DELETE", f"/service/xusers/groups/{gname}")

    # MEMBERSHIP

    for g in kc_groups:
        members = get_group_members(g["id"], token)
        usernames = [m["username"] for m in members]

        logger.info(f"Sync group: {mask(g['name'])} size={len(usernames)}")

        payload = {
            "name": g["name"],
            "userList": usernames,
        }

        ranger_request("PUT", f"/service/xusers/groups/{g['name']}", json=payload)

    logger.info("Sync finished")


if __name__ == "__main__":
    main()