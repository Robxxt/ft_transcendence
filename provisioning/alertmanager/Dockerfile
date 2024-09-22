FROM prom/alertmanager

WORKDIR /etc/alertmanager/

COPY test.sh alertmanager.yaml . 

ENTRYPOINT ["./test.sh"]