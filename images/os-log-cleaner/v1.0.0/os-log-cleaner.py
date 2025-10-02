import os
from datetime import datetime, timezone
from opensearchpy import OpenSearch
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

CA = '/root/.opensearch/root.crt'
PASS = os.environ.get('os_admin_password')
DAYS_TO_KEEP = os.environ.get('days_to_keep')
HOSTS = [h.strip() for h in os.environ['os_hosts'].split(',') if h.strip()]

conn = OpenSearch(
  HOSTS, 
  http_auth=('admin', PASS),
  use_ssl=True,
  verify_certs=True,
  ca_certs=CA)

print(conn.info())

def get_data_streams(conn, prefix=None):
    resp = conn.transport.perform_request('GET', '/_data_stream')
    streams = resp.get('data_streams', [])
    if prefix:
        streams = [ds for ds in streams if ds['name'].startswith(prefix)]
    return streams


def get_backing_indices(conn, data_stream_name):
    resp = conn.transport.perform_request('GET', f'/_data_stream/{data_stream_name}')
    streams = resp.get('data_streams', [])
    if not streams:
        return []
    return streams[0].get('indices', [])


def get_index_creation_date(conn, index_name):
    resp = conn.transport.perform_request('GET', f'/{index_name}')
    settings = resp.get(index_name, {}).get('settings', {})
    creation_date_ms = int(settings.get('index', {}).get('creation_date', 0))
    if creation_date_ms:
        return datetime.fromtimestamp(creation_date_ms / 1000, tz=timezone.utc)
    return None


def print_old_indices(conn, prefix=None):
    days_to_keep = int(DAYS_TO_KEEP)
    now = datetime.now(timezone.utc)
    streams = get_data_streams(conn, prefix)
    print(f"Найдено дата стримов: {len(streams)}")
    for ds in streams:
        ds_name = ds['name']
        indices = get_backing_indices(conn, ds_name)
        old_indices = []
        for idx in indices:
            idx_name = idx['index_name']
            created = get_index_creation_date(conn, idx_name)
            if created and (now - created).days > days_to_keep:
                old_indices.append((idx_name, created))
        if old_indices:
            print(f"Дата стрим: {ds_name}")
            for idx_name, created in old_indices:
                print(f"  Индекс: {idx_name}, создан: {created}")


def rollover_stream_on_host(ds_name, host, conn):
    try:
        conn.transport.perform_request('POST', f'https://{host}:9200/{ds_name}/_rollover')
    except Exception:
        pass


def rollover_all_streams(conn, prefix=None):
    streams = get_data_streams(conn, prefix)
    total_streams = len(streams)
    from itertools import zip_longest
    done = 0
    for chunk in zip_longest(*[iter(streams)]*len(HOSTS)):
        futures = []
        with ThreadPoolExecutor(max_workers=len(HOSTS)) as executor:
            for ds, host in zip(chunk, HOSTS):
                if ds is not None:
                    ds_name = ds['name']
                    futures.append(executor.submit(rollover_stream_on_host, ds_name, host, conn))
            for future in as_completed(futures):
                future.result()
        done += len([x for x in chunk if x is not None])
        print_progress_bar(done, total_streams, prefix="Rollover дата стримов  ")


def delete_index_on_host(index_name, host, auth, ca):
    url = f"https://{host}:9200/{index_name}"
    try:
        resp = requests.delete(url, auth=auth, verify=ca, timeout=30)
        if resp.status_code != 200:
            if (
                resp.status_code == 400 and
                resp.text and
                "is the write index for data stream" in resp.text and
                "cannot be deleted" in resp.text
            ):
                return
            print(f"\n  Ошибка удаления {index_name} на {host}: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"\n  Ошибка удаления {index_name} на {host}: Exception: {type(e).__name__}: {e}")


def batch_delete_indices(indices, hosts, auth, ca):
    from itertools import zip_longest
    for chunk in zip_longest(*[iter(indices)]*len(hosts)):
        futures = []
        with ThreadPoolExecutor(max_workers=len(hosts)) as executor:
            for idx, host in zip(chunk, hosts):
                if idx is not None:
                    futures.append(executor.submit(delete_index_on_host, idx, host, auth, ca))
            for future in as_completed(futures):
                future.result()


def print_progress_bar(current, total, prefix="", length=30):
    percent = int(100 * current / total) if total else 100
    filled = int(length * current / total) if total else length
    bar = "#" * filled + "-" * (length - filled)
    print(f"\r{prefix} |{bar}| {percent}% ({current}/{total})", end="", flush=True)
    if current == total:
        print()


def delete_old_indices(conn, prefix=None):
    days_to_keep = int(os.environ.get('DAYS_TO_KEEP', 7))
    now = datetime.now(timezone.utc)
    streams = get_data_streams(conn, prefix)
    total_streams = len(streams)
    print(f"Найдено дата стримов: {total_streams}")
    rollover_all_streams(conn, prefix)
    auth = ('admin', PASS)
    ca = CA
    indices_to_delete = []
    for i, ds in enumerate(streams, 1):
        ds_name = ds['name']
        indices = get_backing_indices(conn, ds_name)
        for idx in indices:
            idx_name = idx['index_name']
            created = get_index_creation_date(conn, idx_name)
            if created and (now - created).days > days_to_keep:
                indices_to_delete.append(idx_name)
        print_progress_bar(i, total_streams, prefix="Проверка дата стримов")
    total_indices = len(indices_to_delete)
    print(f"\nИндексов на удаление: {total_indices}")
    from itertools import zip_longest
    deleted = 0
    for chunk in zip_longest(*[iter(indices_to_delete)]*len(HOSTS)):
        futures = []
        with ThreadPoolExecutor(max_workers=len(HOSTS)) as executor:
            for idx, host in zip(chunk, HOSTS):
                if idx is not None:
                    futures.append(executor.submit(delete_index_on_host, idx, host, auth, ca))
            for future in as_completed(futures):
                future.result()
        deleted += len([x for x in chunk if x is not None])
        print_progress_bar(deleted, total_indices, prefix="Удаление индексов   ")
    if total_indices == 0:
        print("Нет индексов для удаления.")

if __name__ == "__main__":
    PREFIX = 'file-d'
    delete_old_indices(conn, PREFIX)