#!/usr/bin/env sh
set -e # exit on error

# Variables
export ACCEPTED_NETWORKS=${ACCEPTED_NETWORKS:-"192.168.0.0/16 172.16.0.0/12 10.0.0.0/8"}
export USE_TLS=${USE_TLS:-"no"}
export TLS_VERIFY=${TLS_VERIFY:-"may"}
export TLS_WRAPPERMODE=${TLS_WRAPPERMODE:-"no"}

# Render template and write postfix main config
cat <<- EOF > /etc/postfix/main.cf
	#
	# Just the bare minimal
	#
	# write logs to stdout
	maillog_file = /dev/stdout
	# network bindings
	inet_interfaces = all
	inet_protocols = ipv4
	# general params
	compatibility_level = 3.6
	myhostname = $HOSTNAME
	mynetworks = 127.0.0.0/8 [::1]/128 $ACCEPTED_NETWORKS
	sender_dependent_relayhost_maps = lmdb:/etc/postfix/relay_maps
	# smtp-out params
	smtp_sasl_auth_enable = yes
	smtp_sasl_password_maps = lmdb:/etc/postfix/sasl_passwd
	smtp_sasl_security_options = noanonymous
	smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt
	smtp_tls_security_level = $TLS_VERIFY
	smtp_tls_wrappermode = $TLS_WRAPPERMODE
	smtp_tls_session_cache_database = lmdb:\$data_directory/smtp_scache
	smtp_use_tls = $USE_TLS
	# MAIL FROM restrictions
	smtpd_sender_restrictions = permit_mynetworks, reject
	# RCPT TO restrictions
	smtpd_recipient_restrictions = check_sender_access lmdb:/etc/postfix/sender_access, reject
	# some tweaks
	biff = no
	delay_warning_time = 1h
	mailbox_size_limit = 0
	readme_directory = no
	recipient_delimiter = +
	smtputf8_enable = no
	EOF

# Generate default alias DB
newaliases
postmap /etc/postfix/relay_maps
postmap /etc/postfix/sasl_passwd
postmap /etc/postfix/sender_access

# Launch
rm -f /var/spool/postfix/pid/*.pid
exec postfix -c /etc/postfix start-fg