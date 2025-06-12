from flask_babel import lazy_gettext as _

from superset.exceptions import SupersetException


class ExecutorNotFoundError(SupersetException):
    message = _("Scheduled task executor not found")

class InvalidExecutorError(SupersetException):
    message = _("Invalid executor type")
