# Postfix

This is postfix support relay_maps to route email through different smtp servers.

Create relay_maps file and mount it to the /etc/postfix/relay_maps

```BASH
@psbmarket.su  [smtp.server.example.com]:587

@kazanexpress.tech [ke.smtp.server.com]:25

@* [default.smtp.server.com]:25
```

---

> If mail-from contain @kazanexpress.tech - postfix server using relay ke.smtp.server.com

---

Next create sasl_passwd file and mount it to the /etc/postfix/sasl_passwd

```BASH
[smtp.server.example.com]:587 login:password

[ke.smtp.server.com]:25 login:password

[default.smtp.server.com]:25 login:password
```

Next create sender_access file and mount it to the /etc/postfix/sender_access

```BASH
myfriend@example.com    OK
junk@spam.com           REJECT
marketing@              REJECT
theboss@                OK
deals.marketing.com     REJECT
somedomain.com          OK
```

> Black/Whitelist for senders matching the 'MAIL FROM' field.
