# Ranger Usersync (Keycloak → Ranger)

Простой сервис синхронизации пользователей и групп из Keycloak в Apache Ranger.

---

## Что делает

Скрипт:

- читает пользователей из Keycloak (Admin API)
- читает группы и membership
- синхронизирует это состояние в Ranger

Модель работы:

```
Keycloak (source of truth)
        ↓
     sync.py
        ↓
      Ranger
```

---

## Аутентификация

Используется **client_credentials flow (OAuth2)**:

- без пользователей
- через service account в Keycloak
- только read-only доступ

---

## Требования

### Keycloak

Нужно создать client:

- access_type = confidential
- service_accounts_enabled = true

И выдать роли:

```
realm-management:
  - view-users
  - query-groups
```

---

## Переменные окружения

### Обязательные

| Переменная | Описание |
|----------|---------|
| KEYCLOAK_URL | Base URL Keycloak |
| KEYCLOAK_REALM | Realm |
| KEYCLOAK_CLIENT_ID | Client ID (service account) |
| KEYCLOAK_CLIENT_SECRET | Client secret |

---

### Для Ranger

| Переменная | Описание |
|----------|---------|
| RANGER_URL | URL Ranger |
| RANGER_USER | Пользователь Ranger |
| RANGER_PASSWORD | Пароль |

---

## Режимы запуска

### Dry-run (без Ranger)

```
python sync.py --dry-run --no-ranger
```

- не пишет в Ranger
- только читает Keycloak
- полезно для первичной проверки

---

### Dry-run с Ranger

```
python sync.py --dry-run
```

- читает текущее состояние Ranger
- показывает, какие изменения будут применены

---

### Полный sync

```
python sync.py
```

- создаёт пользователей
- обновляет пользователей
- удаляет пользователей (если они были из Keycloak)
- синхронизирует группы

---

## Особенности

### Source of truth

- Keycloak — источник истины
- Ranger — реплика

---

### Удаление пользователей

Удаляются только пользователи, созданные этим скриптом:

```
otherAttributes.source = keycloak
```

Локальные пользователи Ranger не трогаются.

---

### Логирование

- PII (email, username) не логируется
- используется маскирование
- лог можно писать в файл:

```
--log-file sync.log
```

---

### Без Ranger

Можно запускать без Ranger:

```
--no-ranger
```

---

## Пример запуска (Docker)

```
docker run --rm \\
  -e KEYCLOAK_URL=... \\
  -e KEYCLOAK_REALM=... \\
  -e KEYCLOAK_CLIENT_ID=... \\
  -e KEYCLOAK_CLIENT_SECRET=... \\
  ranger-sync:latest \\
  --dry-run --no-ranger
```

---

## Kubernetes

Рекомендуется запускать как **CronJob**:

- периодический sync
- независим от Ranger
- легко масштабируется

---

## Ограничения

- нет поддержки nested groups
- нет partial sync (каждый запуск — reconciliation)
- требует доступа к Keycloak Admin API

---

## Частые ошибки

### 401 Unauthorized

- неправильный client_secret
- client не confidential

---

### 403 Forbidden

- нет ролей:
    - view-users
    - query-groups

---

### Пустые пользователи

- неверный realm
- нет прав

---

## Рекомендации

- использовать отдельный client (ranger-sync)
- хранить секреты в Kubernetes Secret / Vault
- сначала запускать с --dry-run
- запускать через CronJob