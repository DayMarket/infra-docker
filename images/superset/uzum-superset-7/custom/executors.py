from __future__ import annotations
from enum import Enum
from typing import TYPE_CHECKING, Union

from superset import security_manager
from superset.tasks.exceptions import InvalidExecutorError

if TYPE_CHECKING:
    from superset.typing import User


class ExecutorType(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    FIXED = "fixed"


class FixedExecutor:
    def __init__(self, username: str):
        self.username = username

    def get_executor(self, _) -> User:
        user = security_manager.find_user(username=self.username)
        if not user:
            raise InvalidExecutorError(f"User '{self.username}' not found")
        return user


Executor = Union[ExecutorType, FixedExecutor]
