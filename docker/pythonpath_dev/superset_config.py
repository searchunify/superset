# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
# This file is included in the final Docker image and SHOULD be overridden when
# deploying the image to prod. Settings configured here are intended for use in local
# development environments. Also note that superset_config_docker.py is imported
# as a final step as a means to override "defaults" configured here
#
import logging
import os
import sys

from celery.schedules import crontab
from flask_caching.backends.filesystemcache import FileSystemCache

logger = logging.getLogger()

DATABASE_DIALECT = os.getenv("DATABASE_DIALECT")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_PORT = os.getenv("DATABASE_PORT")
DATABASE_DB = os.getenv("DATABASE_DB")

EXAMPLES_USER = os.getenv("EXAMPLES_USER")
EXAMPLES_PASSWORD = os.getenv("EXAMPLES_PASSWORD")
EXAMPLES_HOST = os.getenv("EXAMPLES_HOST")
EXAMPLES_PORT = os.getenv("EXAMPLES_PORT")
EXAMPLES_DB = os.getenv("EXAMPLES_DB")

# The SQLAlchemy connection string.
SQLALCHEMY_DATABASE_URI = (
    f"{DATABASE_DIALECT}://"
    f"{DATABASE_USER}:{DATABASE_PASSWORD}@"
    f"{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_DB}"
)

SQLALCHEMY_EXAMPLES_URI = (
    f"{DATABASE_DIALECT}://"
    f"{EXAMPLES_USER}:{EXAMPLES_PASSWORD}@"
    f"{EXAMPLES_HOST}:{EXAMPLES_PORT}/{EXAMPLES_DB}"
)

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_CELERY_DB = os.getenv("REDIS_CELERY_DB", "0")
REDIS_RESULTS_DB = os.getenv("REDIS_RESULTS_DB", "1")

RESULTS_BACKEND = FileSystemCache("/app/superset_home/sqllab")

CACHE_CONFIG = {
    "CACHE_TYPE": "RedisCache",
    "CACHE_DEFAULT_TIMEOUT": 300,
    "CACHE_KEY_PREFIX": "superset_",
    "CACHE_REDIS_HOST": REDIS_HOST,
    "CACHE_REDIS_PORT": REDIS_PORT,
    "CACHE_REDIS_DB": REDIS_RESULTS_DB,
}
DATA_CACHE_CONFIG = CACHE_CONFIG
THUMBNAIL_CACHE_CONFIG = CACHE_CONFIG

class CeleryConfig:
    broker_url = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_CELERY_DB}"
    imports = (
        "superset.sql_lab",
        "superset.tasks.scheduler",
        "superset.tasks.thumbnails",
        "superset.tasks.cache",
    )
    result_backend = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_RESULTS_DB}"
    worker_prefetch_multiplier = 1
    task_acks_late = False
    beat_schedule = {
        "reports.scheduler": {
            "task": "reports.scheduler",
            "schedule": crontab(minute="*", hour="*"),
        },
        "reports.prune_log": {
            "task": "reports.prune_log",
            "schedule": crontab(minute=10, hour=0),
        },
    }

STATIC_ASSETS_PREFIX = "/su-bi"
CELERY_CONFIG = CeleryConfig
APPLICATION_ROOT = "/su-bi"

FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,
    "ENABLE_TEMPLATE_PROCESSING": True,
    "ALERT_REPORTS": True,
    "ALLOW_ADHOC_SUBQUERY": True,
    "DRILL_TO_DETAIL": True,
    "HORIZONTAL_FILTER_BAR": True
}

# Allow embedding from any origin (or restrict to your domain)
HTTP_HEADERS = {
    "X-Frame-Options": "ALLOWALL"
}
ENABLE_CORS = True

CORS_OPTIONS = {
    "supports_credentials": True,
    "allow_headers": "*",
    "expose_headers": "*",
    "resources": "*",
    "origins": ["http://localhost", "http://localhost:3002", "http://localhost:5000"],
}

HTTP_HEADERS = {
    "X-Frame-Options": "ALLOWALL"
}

GUEST_ROLE_NAME = "Public"

TALISMAN_ENABLED = True
# Allow embedding in iframes from localhost:8000
TALISMAN_CONFIG = {
    "frame_options": None,  # Disables X-Frame-Options header
    "force_https":False,
    "force_https_permanent": False, # Set to True in production if behind HTTPS

    "content_security_policy": {
        "default-src": ["'self'",  "https://feature-ai.searchunify.com", "https://feature1.searchunify.com", "http://localhost:3000","http://localhost:8083", "http://localhost"],
        "script-src": ["'self'", "https://feature-ai.searchunify.com", "https://feature1.searchunify.com", "http://localhost:3000","http://localhost:8083" ,"http://localhost", "'unsafe-inline'", "'unsafe-eval'"], # 'unsafe-inline' and 'unsafe-eval' are often needed by Superset's UI libraries but reduce security. Strive to remove them if possible by refactoring.
        "style-src": ["'self'", "https://feature-ai.searchunify.com", "https://feature1.searchunify.com", "http://localhost:3000","http://localhost:8083", "'unsafe-inline'"], # 'unsafe-inline' for styles
        "img-src": ["'self'", "data:", "blob:", "https://apachesuperset.gateway.scarf.sh", "https://static.scarf.sh", "https://feature-ai.searchunify.com","http://localhost", "http://localhost:3000","http://localhost:8083"], # 'data:' for inline images, 'blob:' for some chart downloads
        "worker-src": ["'self'", "blob:", "https://feature-ai.searchunify.com", "https://feature1.searchunify.com",  "http://localhost", "http://localhost:3000","http://localhost:8083"], # For web workers used by some libraries
        "connect-src": ["'self'", "https://feature-ai.searchunify.com", "https://feature1.searchunify.com", "http://localhost","http://localhost:3000","http://localhost:8083"], # For API calls
        "frame-src": ["'self'", "http://localhost", "http://localhost:3002", "http://localhost:5000"], # If you embed Superset or allow embedding from Superset
        "frame-ancestors": ["'self'", "http://localhost", "http://localhost:3002", "http://localhost:5000"], # Allow your React app's origin (e.g., http://localhost:3000)
        "object-src": ["'none'", "https://feature-ai.searchunify.com", "https://feature1.searchunify.com", "http://localhost","http://localhost:3000","http://localhost:8083"], # Usually good to keep 'none'
        "font-src": ["'self'", "https://feature-ai.searchunify.com", "https://feature1.searchunify.com", "http://localhost","http://localhost:3000","http://localhost:8083"],
    },
    "content_security_policy_nonce_in": ["script-src"], # Enables use of nonces for scripts
    "session_cookie_secure": False, # Set to True in production if behind HTTPS
    "session_cookie_samesite": "Lax",
}

ALERT_REPORTS_NOTIFICATION_DRY_RUN = True
WEBDRIVER_BASEURL = f"http://superset_app{os.environ.get('SUPERSET_APP_ROOT', '/')}/"  # When using docker compose baseurl should be http://superset_nginx{ENV{BASEPATH}}/  # noqa: E501
# The base URL for the email report hyperlinks.
WEBDRIVER_BASEURL_USER_FRIENDLY = (
    f"http://localhost:8888/{os.environ.get('SUPERSET_APP_ROOT', '/')}/"
)
SQLLAB_CTAS_NO_LIMIT = True

log_level_text = os.getenv("SUPERSET_LOG_LEVEL", "INFO")
LOG_LEVEL = getattr(logging, log_level_text.upper(), logging.INFO)

if os.getenv("CYPRESS_CONFIG") == "true":
    # When running the service as a cypress backend, we need to import the config
    # located @ tests/integration_tests/superset_test_config.py
    base_dir = os.path.dirname(__file__)
    module_folder = os.path.abspath(
        os.path.join(base_dir, "../../tests/integration_tests/")
    )
    sys.path.insert(0, module_folder)
    from superset_test_config import *  # noqa

    sys.path.pop(0)

#
# Optionally import superset_config_docker.py (which will have been included on
# the PYTHONPATH) in order to allow for local settings to be overridden
#
try:
    import superset_config_docker
    from superset_config_docker import *  # noqa

    logger.info(
        f"Loaded your Docker configuration at " f"[{superset_config_docker.__file__}]"
    )
except ImportError:
    logger.info("Using default Docker config...")
