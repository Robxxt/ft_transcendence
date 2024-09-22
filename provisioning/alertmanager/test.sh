#!/bin/sh

sed -i "s/SMTP_SMARTHOST/$SMTP_SMARTHOST/" alertmanager.yaml
sed -i "s/SMTP_FROM/$SMTP_FROM/" alertmanager.yaml
sed -i "s/SMTP_AUTH_PASSWORD/$SMTP_AUTH_PASSWORD/" alertmanager.yaml

alertmanager --config.file=/etc/alertmanager/alertmanager.yaml